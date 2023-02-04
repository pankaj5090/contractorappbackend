const express = require("express");
const router = express.Router();
const Work = require("../models/Work");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

//with this request an work will be created.
router.post(
  "/add",
  [
    //all the validation here
    body("newWork.name", "Name should be minimum 3 characters long").isLength({
      min: 3,
    }),
    //all the validation here
    body("newWork.allottedDate", "Please enter Allotment Date").isLength({
      min: 10,
    }),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      var newWork = req.body.newWork;
      let work = await Work.findOne({
        name: newWork.name,
      });
      var errorList = [""];
      if (work) {
        errorList.push("Work is already exists");
        return res.status(400).json({ errorlist: errorList });
      }
      work = await Work.create({
        name: newWork.name,
        division: newWork.division,
        allottedDate: newWork.allottedDate,
        fdrBankGuaranteeNo: newWork.fdrBankGuaranteeNo,
        guaranteeAmount: newWork.guaranteeAmount,
        estimatedCost: newWork.estimatedCost,
        contractorCost: newWork.contractorCost,
        acceptedCost: newWork.acceptedCost,
        percentageTender: newWork.percentageTender,
        timeAllowed: newWork.timeAllowed,
        createdDate: Date.now(),
        updatedDate: Date.now(),
      });
      res.json(work);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Something went wrong");
    }
  }
);
//with this request all work will be returned where isDeleted=false
router.get("/get", async (req, resp) => {
  try {
    let works = await Work.find({ isDeleted: false });
    resp.json(works);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

router.post("/update", async (req, resp) => {
  try {
    var newWork = req.body.newWork;
    const updateWork = {
      _id: newWork.id,
      name: newWork.name,
      division: newWork.division,
      allottedDate: newWork.allottedDate,
      fdrBankGuaranteeNo: newWork.fdrBankGuaranteeNo,
      guaranteeAmount: newWork.guaranteeAmount,
      estimatedCost: newWork.estimatedCost,
      contractorCost: newWork.contractorCost,
      acceptedCost: newWork.acceptedCost,
      percentageTender: newWork.percentageTender,
      timeAllowed: newWork.timeAllowed,
      updatedDate: Date.now(),
    };
    let work = await Work.findByIdAndUpdate(
      newWork.id,
      {
        $set: updateWork,
      },
      { new: true }
    );
    if (!work) {
      resp.status(404).send("Work not found");
    }
    resp.json(work);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

//with this request isDeleted will be set to true for an work- soft delete
router.post("/delete/:id", async (req, resp) => {
  try {
    let work = await Work.findByIdAndUpdate(
      req.params.id,
      {
        $set: { isDeleted: true },
      },
      { new: true }
    );
    if (!work) {
      resp.status(404).send("Work not found");
    }
    resp.json(work);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

//with this request isDeleted will be set to true for multiple works- soft delete
router.post("/deleteMany", async (req, resp) => {
  try {
    const deletedw = await Work.updateMany(
      { _id: { $in: req.body.ids } },
      { $set: { isDeleted: true } }
    );
    if (!deletedw) {
      resp.status(404).send("Work not found");
    }
    resp.json(deletedw);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

router.delete("/:id", async (req, resp) => {
  try {
    let work = await Work.findByIdAndDelete(req.params.id);
    if (!work) {
      resp.json({ Success: "Work not found" });
    }
    resp.json({ Success: "Work has been deleted", work: work });
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

//add employees to existing work
router.post("/employeeadd", async (req, resp) => {
  try {
    var workId = req.body.workId;
    var employees = req.body.employees;
    var dateFrom = req.body.dateFrom;
    var dateTo = req.body.dateTo;
    var addedEmployees = [];
    for (let i = 0; i < employees.length; i++) {
      let employee = {
        id: employees[i],
        dateFrom: dateFrom,
        dateTo: dateTo,
      };
      addedEmployees.push(employee);
    }
    Work.findByIdAndUpdate(
      workId,
      { $addToSet: { employees: addedEmployees } },
      { safe: true, upsert: true },
      function (err, model) {
        if (err) {
          console.log(err);
          return resp.send(err);
        }
        return resp.json(model);
      }
    );
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

//delete one employee from existing work
router.post("/employeedelete", async (req, resp) => {
  try {
    let empWork = await Work.findOneAndUpdate(
      { _id: req.body.workId },
      { $pull: { employees: { id: req.body.empId } } },
      { safe: true, multi: false }
    );
    if (!empWork) {
      resp.status(404).send("employee is not aligned to this work");
    }
    resp.json(empWork);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

//update dateFrom and dateTo
router.post("/employeeupdate", async (req, resp) => {
  try {
    const workId = req.body.workId;
    const employeeId = req.body.employeeId;
    const updateWork = await Work.findOneAndUpdate(
      { _id: workId, "employees.id": employeeId },
      {
        $set: {
          "employees.$.dateFrom": req.body.dateFrom,
          "employees.$.dateTo": req.body.dateTo,
        },
      }
    );
    if (!updateWork) {
      resp.status(404).send("employee is not aligned to this work");
    }
    resp.json(updateWork);
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Something went wrong");
  }
});

module.exports = router;
