const express = require("express");
const router = express.Router();
const Work = require("../models/Work");
const Employee = require("../models/Employee");
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
      fdrBankName: newWork.fdrBankName,
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
    let works = await Work.find({
      "employees.id": { $in: employees },
      isDeleted: false,
    });
    let emps = await Employee.find({
      _id: { $in: employees },
      isDeleted: false,
    });

    const empObj = new Map();
    if (emps && emps.length > 0) {
      emps.map((emp) => {
        empObj.set(emp._id.toString(), emp);
      });
    }

    const workEmpObj = new Map();
    if (works && works.length > 0) {
      works.map((work) => {
        if (work.employees && work.employees.length > 0) {
          work.employees.map((wemp) => {
            var emp = empObj.get(wemp.id.toString());
            if (emp) {
              let workEmp = {
                id: wemp.id,
                workName: work.name,
                division: work.division,
                empName: emp.name,
                aadhar: emp.aadharCardNumber,
                dateFrom: wemp.dateFrom.toISOString(),
                dateTo: wemp.dateTo.toISOString(),
              };
              var workEmpList = workEmpObj.get(emp.id);
              if (workEmpList) {
                workEmpList.push(workEmp);
                workEmpObj.set(emp.id, workEmpList);
              } else {
                var newWorkEmpList = [workEmp];
                workEmpObj.set(emp.id, newWorkEmpList);
              }
            }
          });
        }
      });
    }
    var empFoundDetailsList = [];
    for (let i = 0; i < employees.length; i++) {
      var workEmpList = workEmpObj.get(employees[i]);
      if (workEmpList && workEmpList.length > 0) {
        var empFound = false;
        for (var j = 0; j < workEmpList.length; j++) {
          var empDateFrom = formatDate(workEmpList[j].dateFrom);
          var empDateTo = formatDate(workEmpList[j].dateTo);
          if (
            (new Date(dateFrom) >= new Date(empDateFrom) &&
              new Date(dateFrom) <= new Date(empDateTo)) ||
            (new Date(dateTo) >= new Date(empDateFrom) &&
              new Date(dateTo) <= new Date(empDateTo))
          ) {
            empFound = true;
            empDetails = {
              id: workEmpList[j].id,
              workName: workEmpList[j].workName,
              division: workEmpList[j].division,
              empName: workEmpList[j].empName,
              aadhar: workEmpList[j].aadhar,
              dateFrom: formatDate(workEmpList[j].dateFrom),
              dateTo: formatDate(workEmpList[j].dateTo),
            };
            empFoundDetailsList.push(empDetails);
          }
        }
        if (!empFound) {
          let employee = {
            id: employees[i],
            dateFrom: dateFrom,
            dateTo: dateTo,
            createdDate: Date.now(),
            updatedDate: Date.now(),
          };
          addedEmployees.push(employee);
        }
      } else {
        let employee = {
          id: employees[i],
          dateFrom: dateFrom,
          dateTo: dateTo,
          createdDate: Date.now(),
          updatedDate: Date.now(),
        };
        addedEmployees.push(employee);
      }
    }
    if (empFoundDetailsList && empFoundDetailsList.length > 0) {
      return resp.status(999).send({ employeeFound: empFoundDetailsList });
    } else {
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
    }
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
      { $pull: { employees: { _id: req.body.empId } } },
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
    const empIdWithWork = req.body.empIdWithWork;
    let works = await Work.find({
      "employees.id": employeeId,
      "employees._id": { $ne: empIdWithWork },
      isDeleted: false,
    });
    if (works && works.length > 0) {
      var abort = false;
      for (let i = 0; i < works.length && !abort; i++) {
        if (works[i].employees && works[i].employees.length > 0) {
          for (let j = 0; j < works[i].employees.length && !abort; j++) {
            var empDateFrom = formatDate(
              works[i].employees[j].dateFrom.toISOString()
            );
            var empDateTo = formatDate(
              works[i].employees[j].dateTo.toISOString()
            );
            if (
              works[i].employees[j].id.equals(employeeId) &&
              !works[i].employees[j]._id.equals(empIdWithWork) &&
              ((new Date(req.body.dateFrom) >= new Date(empDateFrom) &&
                new Date(req.body.dateFrom) <= new Date(empDateTo)) ||
                (new Date(req.body.dateTo) >= new Date(empDateFrom) &&
                  new Date(req.body.dateTo) <= new Date(empDateTo)))
            ) {
              return resp.status(999).send({
                errorlist: [
                  "Employee already working in some work for this time period.",
                ],
              });
              abort = true;
            }
          }
        }
      }
    }
    const updateWork = await Work.findOneAndUpdate(
      { _id: workId, "employees.id": employeeId, isDeleted: false },
      {
        $set: {
          "employees.$.dateFrom": req.body.dateFrom,
          "employees.$.dateTo": req.body.dateTo,
          "employees.$.updatedDate": Date.now(),
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
const formatDate = (stringDate) => {
  if (stringDate) {
    return stringDate.substring(0, stringDate.indexOf("T"));
  }
};

module.exports = router;
