import express from "express";
const router = express.Router();
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import jwt from "jsonwebtoken";

const auth = getAuth();

//user register
router.post("/register", function (req, res) {
  const { email, password } = req.body;

  if (email && password) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        res.send({ message: "User registered successfully" });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send({ error: error.message });
      });
  } else {
    res.status(400).send({ error: "Please provide email and password" });
  }
});

//user login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // const userToken = userCredential.user.accessToken;
        // console.log(userToken);

        jwt.sign(
          { email, password },
          process.env.JWT_SECRETE_KEY,
          { expiresIn: "1d" },
          (error, token) => {
            if (error) res.send({ error });
            else {
              res
                .status(200)
                .send({ message: "User logged in successfully.", token });
            }
          }
        );
      })
      .catch((error) => {
        res.status(400).send({ error: error.message });
      });
  } else {
    res.status(400).send({ error: "Please provide email and password" });
  }
});

export function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const token = bearerHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRETE_KEY, (error, authData) => {
      if (error) res.status(400).send({ error: "token is not valid" });
      else {
        console.log({ authData });
        next();
      }
    });
  } else {
    res.status(400).send({ error: "token is not provided" });
  }
}

export default router;
