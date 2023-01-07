const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

connectMongo().catch((err) => console.log(err));

async function connectMongo() {
  await mongoose.connect("mongodb://127.0.0.1:27017/contractorapp");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

module.exports = connectMongo;
