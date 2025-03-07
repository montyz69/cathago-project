const cron = require("node-cron");
const db = require("./db");

const resetCredits = () => {
  cron.schedule("0 0 * * *", () => {
    db.run(`UPDATE users SET credits = 20 WHERE credits < 20`, [], (err) => {
      if (err) console.error("Error resetting credits:", err.message);
      else console.log("Credits reset at midnight.");
    });
  });
};

module.exports = resetCredits;
