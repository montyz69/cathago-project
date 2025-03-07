const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const resetCredits = require("./config/cronJobs");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cors = require("cors");
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

//starting the cron job to reset credits
resetCredits(); 

//routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/admin", adminRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
