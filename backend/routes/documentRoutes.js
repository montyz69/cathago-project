const express = require("express");
const multer = require("multer");
const { uploadDocument, downloadDocument } = require("../controllers/documentController");
const { scanAndMatchDocument } = require("../controllers/documentController");
const { isLoggedIn } = require("../middleware/authMiddleware");

const router = express.Router();
const storage = multer.diskStorage({
  destination: "./uploads/", // Save files in /uploads directory
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});
const upload = multer({ storage });

// Route for document upload
router.post("/scan", isLoggedIn,upload.single("uploadedFile"), scanAndMatchDocument);
router.post("/download", isLoggedIn, downloadDocument);

module.exports = router;
