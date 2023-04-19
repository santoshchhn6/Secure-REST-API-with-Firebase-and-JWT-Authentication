import express from "express";
import cors from "cors";
import users_api from "./routes/api/users.js";

const app = express();

//middleware
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

//user api routes
app.use("/api/users/", users_api);

const port = 3000;
app.listen(port, () => console.log(`server listening on port:${port}`));
