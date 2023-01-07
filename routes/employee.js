const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { body, validationResult } = require("express-validator");

router.post(
  "/",
  [
    //all the validation here
    body("name", "Name should be minimum 3 characters long").isLength({
      min: 3,
    }),
    body(
      "aadharCardNumber",
      "Aadhar Card should be minimum 10 characters long"
    ).isLength({ min: 10 }),
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
        aadharCardNumber: req.body.aadharCardNumber,
        accountNumber: req.body.accountNumber,
        esicNumber: req.body.esicNumber,
        epfNumber: req.body.epfNumber,
        ifscCode: req.body.ifscCode,
        birthDate: req.body.birthDate,
      });
      res.json(employee);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Something went wrong");
    }
  }
);

module.exports = router;
