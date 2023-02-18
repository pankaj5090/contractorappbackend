const connectMongo = require("./db");
const express = require("express");
var cors = require("cors");
const { aadharPath, passBookPath, fdrPath, appPort } = require("./config");

connectMongo();
const app = express();
const port = appPort;

app.use(cors());
app.use(express.json());
console.log(aadharPath);

app.use("/api/employee", require("./routes/employee"));
app.use("/api/work", require("./routes/work"));
app.use("/api/image", require("./routes/image"));

app.use("/api/aadhar/images", express.static(`${aadharPath}`));
app.use("/api/passbook/images", express.static(`${passBookPath}`));
app.use("/api/fdr/images", express.static(`${fdrPath}`));

app.listen(port, () => {
  console.log(`Contractor app listening on port ${port}`);
});
