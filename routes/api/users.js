import express, { response } from "express";
const router = express.Router();
import { app } from "../../firebase.js";
import {
  getDatabase,
  push,
  ref,
  set,
  update,
  remove,
  onValue,
} from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import jwt from "jsonwebtoken";

const auth = getAuth();
const database = getDatabase(app);
const userCollections = "users/";
const userRef = ref(database, userCollections);
let secretKey = "qasdfwerlWERAdfadf";

//get all users
router.get("/", verifyToken, (req, res) => {
  onValue(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const userList = [];
        snapshot.forEach((data) => {
          userList.push({ id: data.key, ...data.val() });
        });
        console.log(userList);
        res.json(userList);
      } else {
        res.status(404).send({ error: "User database is Empty" });
      }
    },
    {
      onlyOnce: true,
    }
  );
});

//get single user
router.get("/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  onValue(
    ref(database, userCollections + id),
    (snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        res.json(snapshot.val());
      } else {
        res
          .status(404)
          .send({ error: "user does not exit with given id:" + id });
      }
    },
    {
      onlyOnce: true,
    }
  );
});

//add new user
router.post("/", verifyToken, (req, res) => {
  const user = req.body;
  let errorString = "";

  if (!user.name) errorString += "name not provided, ";
  if (!user.email) errorString += "email not provided, ";
  if (!user.age) errorString += "age not provided";

  if (!errorString) {
    set(push(userRef), user)
      .then(() => res.send({ message: "User Added Successfully" }))
      .catch((error) => {
        console.log(error);
        res.status(500).send({ error: error.message });
      });
  } else {
    res.status(400).send({ error: errorString });
  }
});

//update user
router.put("/:id", verifyToken, (req, res) => {
  const user = req.body;
  const id = req.params.id;

  update(ref(database, userCollections + id), user)
    .then(() => res.send({ message: "User Updated Successfully" }))
    .catch((error) => {
      console.log(err);
      res.status(500).send({ error: error.message });
    });
});

//delete user
router.delete("/:id", verifyToken, (req, res) => {
  const id = req.params.id;

  remove(ref(database, userCollections + id))
    .then(() => res.send({ message: "User Deleted Successfully" }))
    .catch((error) => {
      console.log(err);
      res.status(500).send({ error: error.message });
    });
});

//register user
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
        secretKey = userCredential.user.accessToken;
        console.log(secretKey);

        jwt.sign(
          { email, password },
          secretKey,
          { expiresIn: "300s" },
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

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const token = bearerHeader.split(" ")[1];
    jwt.verify(token, secretKey, (error, authData) => {
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
