const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const Work = require("../models/Work");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

//with this request an employee will be created.
router.post(
  "/add",
  [
    //all the validation here
    body("name", "Name should be minimum 3 characters long").isLength({
      min: 3,
    }),
    body("aadhar", "Aadhar Card should be 12 characters long").isLength({
      min: 12,
      max: 12,
    }),
    body(
      "account",
      "Account Number should be minimum 3 and max 20 characters long"
    ).isLength({ min: 3, max: 20 }),
  ],

  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let employee = await Employee.findOne({
        aadharCardNumber: req.body.aadhar,
      });
      var errorList = [""];
      if (employee) {
        errorList.push("Aadhar Card Number is already exists");
        return res.status(400).json({ errorlist: errorList });
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
        createdDate: Date.now(),
        updatedDate: Date.now(),
      });
      res.json(employee);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Something went wrong");
    }
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

router.post("/update", async (req, resp) => {
  try {
    const { id, name, aadhar, account, esic, epf, ifsc, sex, birthdate } =
      req.body;
    const newEmployee = {
      _id: id,
      name: name,
      aadharCardNumber: aadhar,
      accountNumber: account,
      esicNumber: esic,
      epfNumber: epf,
      ifscCode: ifsc,
      sex: sex,
      birthDate: birthdate,
      updatedDate: Date.now(),
    };
    console.log(newEmployee);
    let employee = await Employee.findByIdAndUpdate(
      id,
      {
        $set: newEmployee,
      },
      { new: true }
    );
    if (!employee) {
      resp.status(404).send("Employee not found");
    }
    resp.json(employee);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

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
    resp.json(employee);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

//with this request isDeleted will be set to true for multiple employees- soft delete
router.post("/deleteMany", async (req, resp) => {
  try {
    const deletedEmps = await Employee.updateMany(
      { _id: { $in: req.body.ids } },
      { $set: { isDeleted: true } }
    );
    if (!deletedEmps) {
      resp.status(404).send("Employee not found");
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
