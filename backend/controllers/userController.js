const db = require("../config/db");

//get profile
const getProfile = (req, res) => {
  db.get(
    `SELECT id, username, role, credits FROM users WHERE id = ?`,
    [req.userId],
    (err, user) => {
      if (err || !user) return res.status(400).send("User not found");
      res.json(user);
    }
  );
};

//credit requests by user
const requestCredits = (req, res) => {
  const { requestedCredits } = req.body;

  db.run(
    `INSERT INTO credit_requests (user_id, requested_credits) VALUES (?, ?)`,
    [req.userId, requestedCredits],
    function (err) {
      if (err) return res.status(500).send("Error requesting credits");
      res.json({
        "message": "Credits requested successfully",
      });
    }
  );
};

const getStore = (req, res) => {
  db.all(
    `SELECT id, filename, filetype, file_data FROM store`,
    [],
    (err, files) => {
      if (err) {
        console.error("Error fetching files:", err);
        return res.status(500).json({ message: "Error retrieving files" });
      }

      // Convert BLOB to Base64 (to safely send in JSON)
      const filesWithBase64 = files.map((file) => ({
        id: file.id,
        filename: file.filename,
        filetype: file.filetype,
        file_data: file.file_data.toString("base64"), // Convert binary to Base64
      }));

      res.json(filesWithBase64);
    }
  );
};

module.exports = {
  getProfile,
  requestCredits,
  getStore,
};
