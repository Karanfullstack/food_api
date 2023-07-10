import express from "express";
import {APP_PORT, DB_URL} from "./config";
import routes from "./routes";
import errorHandler from "./middlewares/errorHandler"; // custom error *
import connectDB from "./config/db";
import path from "path";
connectDB();

const app = express();
global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({extended: false})); 
app.use(express.json());
app.use("/api", routes);

app.use(errorHandler);
app.listen(APP_PORT, () =>
  console.log(`Listening on port ${APP_PORT}.`.bgYellow)
);
