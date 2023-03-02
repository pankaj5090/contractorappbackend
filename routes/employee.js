const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const Work = require("../models/Work");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
let path = require("path");
const fs = require("fs");
const { aadharPath, passBookPath } = require("../config");

//use of multer to upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "aadharFile") {
      req.origAadharFile = file.originalname;
      cb(null, aadharPath);
    } else if (file.fieldname === "passBookFile") {
      req.origPassBookFile = file.originalname;
      cb(null, passBookPath);
    }
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  console.log(file.mimetype);
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    //req.fileValidationError = "Only jpeg|jpg|png|pdf file type are allowed!";
    cb(new Error("Only jpeg|jpg|png file type are allowed!"), false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 3000000,
  },
  fileFilter,
}).fields([
  {
    name: "aadharFile",
    maxCount: 1,
  },
  {
    name: "passBookFile",
    maxCount: 1,
  },
]);

const validateEmp = [
  //all the validation here
  body("name", "Name should be minimum 3 characters long ! ").isLength({
    min: 3,
  }),
  body("aadhar", "Aadhar Card should be 12 characters long ! ").isLength({
    min: 12,
    max: 12,
  }),
  body(
    "account",
    "Account Number should be minimum 3 and max 20 characters long ! "
  ).isLength({ min: 3, max: 20 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      deleteFiles(req);

      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
function deleteFiles(req) {
  if (req.files && req.files.aadharFile && req.files.aadharFile[0]) {
    const aadharFilePath = req.files.aadharFile[0].path;
    console.log(aadharFilePath);
    fs.unlink(aadharFilePath, (err) => {
      if (err) {
        console.log(`error on removing files: ${aadharFilePath}`);
      }
      console.log(`successfully deleted ${aadharFilePath}`);
    });
  }
  if (req.files && req.files.passBookFile && req.files.passBookFile[0]) {
    const passBookFilePath = req.files.passBookFile[0].path;
    fs.unlink(passBookFilePath, (err) => {
      if (err) {
        console.log(`error on removing files: ${passBookFilePath}`);
      }
      console.log(`successfully deleted ${passBookFilePath}`);
    });
  }
}

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(`error on removing files: ${filePath}`);
    }
    console.log(`successfully deleted ${filePath}`);
  });
}

//with this request an employee will be created.
router.post(
  "/add",
  upload,
  validateEmp,
  async (req, res) => {
    if (req.fileValidationError) {
      console.log("error in file upload");
    }
    try {
      let employee = await Employee.findOne({
        aadharCardNumber: req.body.aadhar,
        isDeleted: false,
      });
      var errorList = [];
      if (employee) {
        errorList.push("Aadhar Card Number is already exists");
        deleteFiles(req);
        return res.status(400).json({ errorlist: errorList });
      }
      //check for account
      let employeeAccount = await Employee.findOne({
        accountNumber: req.body.account,
        isDeleted: false,
      });
      if (employeeAccount) {
        errorList.push("Account  Number is already exists");
        deleteFiles(req);
        return res.status(400).json({ errorlist: errorList });
      }

      var aadharFilePath = "";
      var passBookFilePath = "";
      if (req.files && req.files.aadharFile && req.files.aadharFile[0]) {
        aadharFilePath = req.files.aadharFile[0].filename;
      }
      if (req.files && req.files.passBookFile && req.files.passBookFile[0]) {
        passBookFilePath = req.files.passBookFile[0].filename;
      }
      employee = await Employee.create({
        name: req.body.name,
        aadharCardNumber: req.body.aadhar,
        accountNumber: req.body.account,
        esicNumber: req.body.esic,
        epfNumber: req.body.epf,
        ifscCode: req.body.ifsc,
        sex: req.body.sex,
        birthDate: req.body.birthdate,
        origAadharFile: req.origAadharFile,
        aadharFile: aadharFilePath,
        origPassBookFile: req.origPassBookFile,
        passBookFile: passBookFilePath,
        createdDate: Date.now(),
        updatedDate: Date.now(),
      });
      res.json(employee);
    } catch (error) {
      console.error(error.message);
      deleteFiles(req);
      res.status(500).send("Something went wrong");
    }
  },
  function (err, req, res, next) {
    //File upload encountered an error as returned by multer
    console.log("multer error come");
    res.status(400).json({ multerError: err.message });
  }
);

//with this request all employees will be returned where isDeleted=false
router.get("/get", async (req, resp) => {
  try {
    let employees = await Employee.find({ isDeleted: false });
    resp.json(employees);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

router.post(
  "/update",
  upload,
  validateEmp,
  async (req, res) => {
    if (req.fileValidationError) {
      console.log("error in file upload");
    }
    try {
      let employeeFound = await Employee.findOne({
        _id: req.body.id,
        isDeleted: false,
      });
      var aadharFilePath = "";
      var passBookFilePath = "";
      var origAadharFile = "";
      var origPassBookFile = "";
      if (req.files && req.files.aadharFile && req.files.aadharFile[0]) {
        aadharFilePath = req.files.aadharFile[0].filename;
        origAadharFile = req.origAadharFile;
        deleteFile(aadharPath + employeeFound.aadharFile);
      } else {
        aadharFilePath = employeeFound.aadharFile;
        origAadharFile = employeeFound.origAadharFile;
      }
      if (req.files && req.files.passBookFile && req.files.passBookFile[0]) {
        passBookFilePath = req.files.passBookFile[0].filename;
        origPassBookFile = req.origPassBookFile;
        deleteFile(passBookPath + employeeFound.passBookFile);
      } else {
        passBookFilePath = employeeFound.passBookFile;
        origPassBookFile = employeeFound.origPassBookFile;
      }
      let employee = await Employee.findByIdAndUpdate(
        req.body.id,
        {
          $set: {
            name: req.body.name,
            aadharCardNumber: req.body.aadhar,
            accountNumber: req.body.account,
            esicNumber: req.body.esic,
            epfNumber: req.body.epf,
            ifscCode: req.body.ifsc,
            sex: req.body.sex,
            birthDate: req.body.birthdate,
            origAadharFile: req.origAadharFile,
            aadharFile: aadharFilePath,
            origPassBookFile: req.origPassBookFile,
            passBookFile: passBookFilePath,
            updatedDate: Date.now(),
          },
        },
        { new: true }
      );
      if (!employee) {
        res.status(404).send("Employee not found");
        deleteFiles(req);
      }
      res.json(employee);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Something went wrong");
      deleteFiles(req);
    }
  },
  function (err, req, res, next) {
    //File upload encountered an error as returned by multer
    console.log("multer error come");
    res.status(400).json({ multerError: err.message });
  }
);

//with this request isDeleted will be set to true for an employee- soft delete
router.post("/delete/:id", async (req, resp) => {
  try {
    let works = await Work.find({ isDeleted: false });
    if (works && works.length > 0) {
      var abort = false;
      works.map((work) => {
        if (work.employees && work.employees.length > 0 && !abort) {
          work.employees.map((wemp) => {
            if (!abort && wemp.id.equals(req.params.id)) {
              abort = true;
            }
          });
        }
      });
      if (abort) {
        return resp.status(999).json({
          errorlist: [
            "Can not delete employee because employee is working in a work",
          ],
        });
      }
    }

    let empForFileDelete = await Employee.findById(req.params.id);
    let employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        $set: { isDeleted: true },
      },
      { new: true }
    );
    if (!employee) {
      resp.status(404).send("Employee not found");
    }
    if (empForFileDelete) {
      if (empForFileDelete.aadharFile) {
        const pathAadharFile = aadharPath + empForFileDelete.aadharFile;
        console.log(pathAadharFile);
        deleteFile(pathAadharFile);
      }
      if (empForFileDelete.passBookFile) {
        const pathPassBookFile = passBookPath + empForFileDelete.passBookFile;
        console.log(pathPassBookFile);
        deleteFile(pathPassBookFile);
      }
    }
    resp.json(employee);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

//with this request isDeleted will be set to true for multiple employees- soft delete
router.post("/deleteMany", async (req, resp) => {
  try {
    let works = await Work.find({ isDeleted: false });
    const employeesToDelete = req.body.ids;
    if (works && works.length > 0) {
      var abort = false;
      works.forEach((work) => {
        if (work.employees && work.employees.length > 0 && !abort) {
          work.employees.forEach((wemp) => {
            if (!abort) {
              employeesToDelete.forEach((empToDelete) => {
                if (wemp.id.equals(empToDelete)) {
                  abort = true;
                }
              });
            }
          });
        }
      });
      if (abort) {
        return resp.status(999).json({
          errorlist: [
            "Can not delete employees because some employees are working in a work",
          ],
        });
      }
    }
    let empsForFileDelete = await Employee.find({
      _id: { $in: employeesToDelete },
    });
    const deletedEmps = await Employee.updateMany(
      { _id: { $in: employeesToDelete } },
      { $set: { isDeleted: true } }
    );
    if (!deletedEmps) {
      resp.status(404).send("Employee not found");
    }
    if (empsForFileDelete) {
      empsForFileDelete.forEach((empForFileDelete) => {
        if (empForFileDelete.aadharFile) {
          const pathAadharFile = aadharPath + empForFileDelete.aadharFile;
          console.log(pathAadharFile);
          deleteFile(pathAadharFile);
        }
        if (empForFileDelete.passBookFile) {
          const pathPassBookFile = passBookPath + empForFileDelete.passBookFile;
          console.log(pathPassBookFile);
          deleteFile(pathPassBookFile);
        }
      });
    }
    resp.json(deletedEmps);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

router.delete("/:id", async (req, resp) => {
  try {
    let employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      resp.json({ Success: "Employee not found" });
    }
    resp.json({ Success: "Employee has been deleted", employee: employee });
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

module.exports = router;
