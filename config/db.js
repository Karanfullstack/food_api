import mongoose from "mongoose";
import {DB_URL} from "../config";
import colors from "colors";

const connectDB = () => {
  mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
  });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "Databse connection error".bgRed));
  db.once("open", () => {
    console.log("Databse is connected sucessfully".bgGreen);
  });
};
export default connectDB;
