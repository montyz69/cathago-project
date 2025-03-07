const express = require("express");
const {
  getProfile,
  requestCredits,
} = require("../controllers/userController.js");
const { getStore } = require("../controllers/userController.js");
const { isLoggedIn } = require("../middleware/authMiddleware.js");

const router = express.Router();

//get profile
router.get("/profile", isLoggedIn, getProfile);

//credit requests by user
router.post("/credits/request", isLoggedIn, requestCredits);

//get files in store
router.get("/getstore", isLoggedIn, getStore);

module.exports = router;
