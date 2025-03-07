const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Multer configuration for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//get all users
const getallUsers = async (req, res) => {
  db.all(`SELECT id, username, role, credits FROM users`, [], (err, users) => {
    if (err) return res.status(500).send("Error fetching users");
    res.json(users);
  });
};

// Fetch all credit requests (Admin Only)
const getCreditRequests = (req, res) => {
  db.all(
    `SELECT cr.id, cr.user_id, u.username, cr.requested_credits, cr.status, cr.requested_at 
     FROM credit_requests cr
     JOIN users u ON cr.user_id = u.id`,
    [],
    (err, requests) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching credit requests" });
      }
      res.json(requests);
    }
  );
};

// Approve/Deny Credit Requests (Admin Only)
const approveCreditRequest = (req, res) => {
  const { requestId, status } = req.body;

  if (!["approved", "rejected"].includes(status))
    return res.status(400).json({ message: "Invalid status" });

  if (status === "rejected") {
    db.run(`DELETE FROM credit_requests WHERE id = ?`, [requestId]);
    return res.json({ message: `Credit request ${status}` });
  }

  db.run(
    `UPDATE credit_requests SET status = ? WHERE id = ?`,
    [status, requestId],
    function (err) {
      if (err)
        return res
          .status(500)
          .json({ message: "Error updating request status" });

      if (status === "approved") {
        db.get(
          `SELECT user_id, requested_credits FROM credit_requests WHERE id = ?`,
          [requestId],
          (err, request) => {
            if (err || !request)
              return res
                .status(400)
                .json({ message: "Credit request not found" });

            db.run(
              `UPDATE users SET credits = credits + ? WHERE id = ?`,
              [request.requested_credits, request.user_id],
              function (err) {
                if (err)
                  return res
                    .status(500)
                    .json({ message: "Error updating user credits" });
                res.json({
                  message: `Credit request approved, added ${request.requested_credits} credits to user.`,
                });
              }
            );
            db.run(`DELETE FROM credit_requests WHERE id = ?`, [requestId]);
          }
        );
      } else {
        db.run(`DELETE FROM credit_requests WHERE id = ?`, [requestId]);
        res.json({ message: `Credit request ${status}` });
      }
    }
  );
};

//add file in store
const addStore = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ message: "File upload failed" });

    const { originalname, mimetype, buffer } = req.file;
    const filetype = path.extname(originalname).substring(1);

    if (!["pdf", "docx", "txt", "pptx", "xlsx"].includes(filetype)) {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    db.run(
      `INSERT INTO store (filename, filetype, file_data) VALUES (?, ?, ?)`,
      [originalname, filetype, buffer],
      function (err) {
        if (err) {
          console.error("Error inserting file:", err);
          return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "File stored successfully", fileId: this.lastID });
      }
    );
  });
};

const deleteStore = (req, res) => {
  const { id } = req.body;
  db.run(`DELETE FROM store WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "File deleted successfully" });
  });
};

//get files from store


function getTopUsers(req, res) {
  db.all(
    `SELECT u.id, u.username, COUNT(s.id) as scan_count, u.credits
     FROM users u
     LEFT JOIN scans s ON u.id = s.user_id
     GROUP BY u.id
     ORDER BY scan_count DESC, u.credits DESC
     LIMIT 10;`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
}

function getScansPerDay(req, res) {
  const { date } = req.query;
  let query = `
        SELECT 
    users.id, 
    users.username, 
    DATE(scans.scan_date) AS scan_date, 
    COUNT(*) AS scan_count
FROM scans
JOIN users ON scans.user_id = users.id
WHERE DATE(scans.scan_date) = COALESCE(?, DATE('now'))
GROUP BY users.id, users.username, DATE(scans.scan_date)
ORDER BY scan_date DESC;
    `;

  db.all(query, [date || null], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
}

module.exports = {
  getallUsers,
  getCreditRequests,
  approveCreditRequest,
  addStore,
  getTopUsers,
  deleteStore,
  getScansPerDay,
};
