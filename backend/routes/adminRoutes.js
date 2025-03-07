const express = require("express");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware.js");
const {
  getallUsers,
  getLogs,
  getCreditRequests,
  approveCreditRequest,
  addStore,
  getStore,
  getTopUsers,
  deleteStore,
  getScansPerDay,
} = require("../controllers/adminController.js");

const router = express.Router();

// Fetch all users
router.get("/users", isLoggedIn, isAdmin, getallUsers);

// Fetch all credit requests (Admin Only)
router.get("/requests", isLoggedIn, isAdmin, getCreditRequests);

// Approve/Deny Credit Requests (Admin Only)
router.post("/approve", isLoggedIn, isAdmin, approveCreditRequest);

//Add files in storer
router.post("/addstore", isLoggedIn, isAdmin, addStore);

router.post("/deleteStore", isLoggedIn, isAdmin, deleteStore);



router.get("/topusers", isLoggedIn, isAdmin, getTopUsers);

router.get("/scansperday", isLoggedIn, isAdmin, getScansPerDay);

module.exports = router;
