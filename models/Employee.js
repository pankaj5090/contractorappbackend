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
    type: Number,
  },
  esicNumber: {
    type: String,
  },
  epfNumber: {
    type: String,
  },
  ifscCode: {
    type: String,
  },
  birthDate: {
    type: Date,
    default: Date.now,
  },
});
const employee = mongoose.model("employee", EmployeeSchema);
employee.createIndexes;
module.exports = employee;
