const { sessionStorage } = require("../utils/utils.js");
function isLoggedIn(req, res, next) {
  const token = req.headers.authorization;
  if (!token || !sessionStorage[token]) {
    return res.status(401).send("Unauthorized: Please log in");
  }

  req.username = sessionStorage[token].username;
  req.userId = sessionStorage[token].userId;
  req.isAdmin = sessionStorage[token].isAdmin;
  next();
}

// Middleware: Check if user is an admin
function isAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).send("Forbidden: Admin access required");
  }
  next();
}

module.exports = {
  isLoggedIn,
  isAdmin,
};
