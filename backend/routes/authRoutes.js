const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController.js");
const { isLoggedIn } = require("../middleware/authMiddleware.js");

const router = express.Router();

//register user
router.post("/register", registerUser);

//login user
router.post("/login", loginUser);

//logout user
router.post("/logout", isLoggedIn, logoutUser);

module.exports = router;
