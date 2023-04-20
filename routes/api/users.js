import express from "express";
const router = express.Router();
import { database } from "../../firebase.js";
import { push, ref, set, update, remove, onValue } from "firebase/database";
import { verifyToken } from "./auth.js";

const userCollections = "users/";
const userRef = ref(database, userCollections);

//get all users
router.get("/", (req, res) => {
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
router.get("/:id", (req, res) => {
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

export default router;
