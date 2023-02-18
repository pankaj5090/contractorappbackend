const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  aadharPath: process.env.aadharPath,
  passBookPath: process.env.passBookPath,
  fdrPath: process.env.fdrPath,
  appPort: process.env.appPort,
};
