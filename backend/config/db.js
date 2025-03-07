const sqlite3 = require("sqlite3").verbose();

function initializeDatabase(dbPath = "./database.db") {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
    } else {
      console.log("Connected to SQLite database.");
    }
  });

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT CHECK(role IN ('user', 'admin')) DEFAULT 'user',
          credits INTEGER DEFAULT 20,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

    db.run(`CREATE TABLE IF NOT EXISTS scans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

    db.run(`CREATE TABLE IF NOT EXISTS credit_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          requested_credits INTEGER NOT NULL,
          status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
          requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

    db.run(`CREATE TABLE IF NOT EXISTS store (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        filetype TEXT NOT NULL,
        file_data BLOB NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  });

  return db;
}
const db = initializeDatabase();
module.exports = db;
