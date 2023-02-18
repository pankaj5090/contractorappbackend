const mongoose = require("mongoose");
const { Schema } = mongoose;

const WorkSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  division: {
    type: String,
    required: true,
    unique: true,
  },
  allottedDate: {
    type: Date,
    required: true,
  },
  fdrBankGuaranteeNo: {
    type: String,
  },
  fdrBankName: {
    type: String,
  },
  guaranteeAmount: {
    type: Number,
  },
  estimatedCost: {
    type: Number,
  },
  contractorCost: {
    type: Number,
  },
  acceptedCost: {
    type: Number,
  },
  percentageTender: {
    type: String,
  },
  timeAllowed: {
    type: String,
  },
  origFdrFile: {
    type: String,
  },
  fdrFile: {
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
  employees: [
    {
      id: mongoose.ObjectId,
      dateFrom: Date,
      dateTo: Date,
      createdDate: Date,
      updatedDate: Date,
    },
  ],
});
const work = mongoose.model("work", WorkSchema);
work.createIndexes;
module.exports = work;
