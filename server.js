import express from "express";
import cors from "cors";
import users_api from "./routes/api/users.js";
import auth_api from "./routes/api/auth.js";
import products_api from "./routes/api/products.js";

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//api routes
app.use("/api/users/", users_api);
app.use("/api/users/", auth_api);
app.use("/api/products/", products_api);

// Error handling middleware function
app.use(function (req, res, next) {
  const error = new Error("Invalid request");
  error.status = 400;
  next(error);
});

// Final error handling middleware function
app.use(function (error, req, res, next) {
  res.status(error.status || 500);
  res.send({
    error: {
      message: error.message,
    },
  });
});

const port = 3000;
app.listen(port, () => console.log(`server listening on port:${port}`));
