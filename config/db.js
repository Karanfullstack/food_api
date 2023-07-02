import mongoose from "mongoose";
import {DB_URL} from "../config";

const connectDB = () => {
  mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
  });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "Databse connection error"));
  db.once("open", () => {
    console.log("Databse is connected");
  });
};
export default connectDB;
