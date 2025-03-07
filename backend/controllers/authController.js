const {
  caesarCipherEncrypt,
  caesarCipherDecrypt,
  generateToken,
  sessionStorage,
} = require("../utils/utils");
const db = require("../config/db");

// Register User
const registerUser = (req, res) => {
  const { username, password, role } = req.body;
  const hashedPass = caesarCipherEncrypt(password, 13);

  db.run(
    `INSERT INTO users (username, password, role, credits) VALUES (?, ?, ?, ?)`,
    [username, hashedPass, role || "user", 20],
    function (err) {
      if (err) return res.status(400).send("Username already exists");
      res.send("User registered successfully");
    }
  );
};

// Login User
const loginUser = (req, res) => {
  const { username, password } = req.body;

  db.get(
    `SELECT id, username, password, role FROM users WHERE username = ?`,
    [username],
    (err, user) => {
      if (err || !user || caesarCipherDecrypt(user.password, 13) !== password) {
        return res.status(401).send("Invalid username or password");
      }

      // Generate session token
      const token = generateToken();
      sessionStorage[token] = {
        username: user.username,
        userId: user.id,
        isAdmin: user.role === "admin",
      };

      res.json({
        message: "Login successful!",
        token,
        isAdmin: user.role === "admin",
      });
    }
  );
};

// Logout User
const logoutUser = (req, res) => {
  const token = req.headers.authorization;
  delete sessionStorage[token];
  res.send("Logged out successfully");
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
