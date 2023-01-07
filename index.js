const connectMongo = require("./db");
const express = require("express");

connectMongo();
const app = express();
const port = 5000;

app.use(express.json());

app.use("/api/employee", require("./routes/employee"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
