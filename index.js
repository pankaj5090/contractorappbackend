const connectMongo = require("./db");
const express = require("express");
var cors = require("cors");

const app = express();
const port = 5000;

connectMongo();

app.use(cors());
app.use(express.json());

app.use("/api/employee", require("./routes/employee"));

app.listen(port, () => {
  console.log(`Contractor app listening on port ${port}`);
});
