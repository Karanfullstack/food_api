import express from "express";
import {APP_PORT} from "./config";
import routes from "./routes";
import errorHandler from "./middlewares/errorHandler"; // Validation

const app = express();
app.use(express.json());
app.use("/api", routes);

app.use(errorHandler); // Validation Handling
app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT}.`));
