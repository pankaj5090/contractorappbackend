const mongoose = require("mongoose");
const { Schema } = mongoose;

const EmployeeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  aadharCardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  ifscCode: {
    type: String,
  },
  esicNumber: {
    type: String,
  },
  epfNumber: {
    type: String,
  },
  sex: {
    type: String,
  },
  birthDate: {
    type: Date,
  },
  origAadharFile: {
    type: String,
  },
  aadharFile: {
    type: String,
  },
  origPassBookFile: {
    type: String,
  },
  passBookFile: {
    type: String,
  },
  createdDate: {
    type: Date,
  },
  updatedDate: {
    type: Date,
    default: Date.now(),
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});
const employee = mongoose.model("employee", EmployeeSchema);
employee.createIndexes;
module.exports = employee;
