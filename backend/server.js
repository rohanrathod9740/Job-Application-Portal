const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const env = require("./config/env");
const seedAdmin = require("./config/seedAdmin");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
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

const startServer = async() => {
    await connectDB();
    await seedAdmin();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
});
