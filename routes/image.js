const express = require("express");
const router = express.Router();

const fs = require("fs");
const aadharPath = "C:/contractor_app/images/aadhar/";
const passBookPath = "C:/contractor_app/images/passbook/";

router.get("/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const readStream = fs.createReadStream(aadharPath + imageName);
  readStream.pipe(res);
});
module.exports = router;
