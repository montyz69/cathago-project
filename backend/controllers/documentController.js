const fs = require("fs");
const db = require("../config/db");
const { extractTextFromFile } = require("../services/textExtractionService");
const { generateEmbedding } = require("../services/embeddingService");
const { cosineSimilarity } = require("../services/similarityService");
const { Blob } = require("buffer"); 
const pdfParser = require("pdf-parse");


const getFileExtension = (mimetype) => {
  if (!mimetype.includes("/")) return "unknown"; 
  return mimetype.split("/")[1].split("+")[0];
};

const scanAndMatchDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { originalname, path, mimetype } = req.file;
    const fileType = getFileExtension(mimetype);
    const fileBuffer = fs.readFileSync(path);
    const userId = req.userId;

    try {
      const user = await new Promise((resolve, reject) => {
        db.get(`SELECT credits FROM users WHERE id = ?`, [userId], (err, user) => {
          if (err) {
            reject(new Error("Error fetching user credits."));
          } else {
            resolve(user);
          }
        });
      });

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.credits < 1) {
        return res.status(406).json({ message: "Insufficient credits." });
      }
      else {

        await new Promise((resolve, reject) => {
          db.run(
              "INSERT INTO scans (user_id, scan_date) VALUES (?,?)", 
              [userId, new Date().toISOString()],  // Ensure correct format
              (err) => {
                  if (err) reject(new Error("Failed to insert scan record."));
                  else resolve();
              }
          );
      });
        await new Promise((resolve, reject) => {
          db.run("UPDATE users SET credits = credits - 1 WHERE id = ?", [userId], (err) => {
            if (err) reject(new Error("Failed to deduct credits."));
            else resolve();
          });
        })
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ message: err.message });
    }

    let uploadedText = await extractTextFromFile(fileBuffer, fileType);
    if (!uploadedText.trim()) {
      return res.status(400).json({ message: "Uploaded document contains no readable text." });
    }

    const uploadedEmbedding = await generateEmbedding(uploadedText);
    if (!uploadedEmbedding) {
      return res.status(500).json({ message: "Failed to generate embedding for uploaded document." });
    }

    try {
      const storedFiles = await new Promise((resolve, reject) => {
        db.all(`SELECT id, filename, file_data, filetype FROM store`, [], (err, rows) => {
          if (err) {
            reject(new Error("Error retrieving stored files."));
          } else {
            resolve(rows);
          }
        });
      });

      if (!storedFiles || storedFiles.length === 0) {
        return res.status(404).json({ message: "No stored documents found." });
      }

      let similarities = [];

      for (const { id, filename, file_data, filetype } of storedFiles) {
        try {
          const storedBuffer = Buffer.from(file_data);
          let storedText = "";

          if (filetype === "application/pdf") {
            const pdfData = await pdfParser(storedBuffer);
            storedText = pdfData.text;
          } else {
            const storedBlob = new Blob([storedBuffer], { type: filetype });
            storedText = await extractTextFromFile(storedBlob, filetype);
          }

          if (!storedText.trim()) continue;

          const storedEmbedding = await generateEmbedding(storedText);
          if (!storedEmbedding) continue;

          const similarity = cosineSimilarity(uploadedEmbedding, storedEmbedding);
          similarities.push({ id, filename, file_data, similarity });
        } catch (fileError) {
          console.error(`Error processing stored file (ID: ${id}):`, fileError);
        }
      }

      const highMatches = similarities.filter((doc) => doc.similarity >= 0.9);
      const validMatches = similarities.filter((doc) => doc.similarity >= 0.5);

      if (validMatches.length === 0) {
        return res.status(404).json({ message: "No matching documents found." });
      }

      if (highMatches.length > 0) {
        return res.status(200).json({ matchingDocuments: highMatches });
      }

      return res.status(200).json({ message: "No documents found" });

    } catch (dbError) {
      console.error(dbError.message);
      return res.status(500).json({ message: dbError.message });
    }

  } catch (error) {
    console.error("Error scanning document:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const { id } = req.body;

    // Fetch the file from the database
    db.get(
      `SELECT file_data, filetype, filename FROM store WHERE id = ?`,
      [id],
      async (err, file) => {
        if (err) {
          console.error("Error fetching the file:", err);
          return res.status(500).json({ message: "Error retrieving file" });
        }

        if (!file) {
          return res.status(404).json({ message: "File not found." });
        }

        // Convert file data from Buffer to binary response
        res.setHeader("Content-Type", file.filetype);
        res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
        res.send(file.file_data);
      }
    );
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { scanAndMatchDocument , downloadDocument};
