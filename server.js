import express from "express";
import {APP_PORT, DB_URL} from "./config";
import routes from "./routes";
import errorHandler from "./middlewares/errorHandler"; // custom error *
import connectDB from './config/db';

connectDB();
const app = express();
app.use(express.json());
app.use("/api", routes);

app.use(errorHandler);
app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT}.`.bgYellow));
