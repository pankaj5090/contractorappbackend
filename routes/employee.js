const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { body, validationResult } = require("express-validator");

//with this request an employee will be created.
router.post(
  "/",
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
        aadharCardNumber: req.body.aadharCardNumber,
      });
      if (employee) {
        return res
          .status(400)
          .json({ error: "Aadhar Card Number is already exists" });
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
      });
      res.json(employee);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Something went wrong");
    }
  }
);

router.get("/", async (req, resp) => {
  try {
    let employee = await Employee.find();
    resp.json(employee);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

router.put("/:id", async (req, resp) => {
  try {
    const {
      name,
      aadharCardNumber,
      accountNumber,
      esicNumber,
      epfNumber,
      ifscCode,
      birthDate,
    } = req.body;
    const newEmployee = {};
    if (name) {
      newEmployee.name = name;
    }
    if (aadharCardNumber) {
      newEmployee.aadharCardNumber = aadharCardNumber;
    }
    if (accountNumber) {
      newEmployee.accountNumber = accountNumber;
    }
    if (esicNumber) {
      newEmployee.esicNumber = esicNumber;
    }
    if (epfNumber) {
      newEmployee.epfNumber = epfNumber;
    }
    if (ifscCode) {
      newEmployee.ifscCode = ifscCode;
    }
    if (sex) {
      newEmployee.sex = sex;
    }
    let employee = await Employee.findByIdAndUpdate(
      req.params.id,
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
