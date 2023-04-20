import express from "express";
import cors from "cors";
import users_api from "./routes/api/users.js";
import auth_api from "./routes/api/auth.js";
import products_api from "./routes/api/products.js";

const app = express();

//middleware
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

//user api routes
app.use("/api/users/", users_api);
app.use("/api/auth/", auth_api);
app.use("/api/products/", products_api);

const port = 3000;
app.listen(port, () => console.log(`server listening on port:${port}`));
