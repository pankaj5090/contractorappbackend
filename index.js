const connectMongo = require("./db");
const express = require("express");
var cors = require("cors");

connectMongo();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/employee", require("./routes/employee"));
app.use("/api/work", require("./routes/work"));

app.listen(port, () => {
  console.log(`Contractor app listening on port ${port}`);
});
