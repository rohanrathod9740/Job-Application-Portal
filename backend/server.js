const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("API is running...");
});
app.get("/test-user", authMiddleware, (req, res) => {
    res.json({ message: "User authenticated", user: req.user });
});

app.get("/test-recruiter", authMiddleware, roleMiddleware(["recruiter"]), (req, res) => {
    res.json({ message: "Recruiter only access" });
});

const PORT = env.port;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
