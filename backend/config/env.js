const dotenv = require("dotenv");

dotenv.config();

const requiredVars = ["MONGO_URI", "JWT_SECRET"];
const placeholderMarkers = ["<username>", "<password>", "<cluster-url>", "<database-name>"];

for (const variable of requiredVars) {
    if (!process.env[variable]) {
        throw new Error(`Missing required environment variable: ${variable}`);
    }
}

if (placeholderMarkers.some((marker) => process.env.MONGO_URI.includes(marker))) {
    throw new Error(
        "MONGO_URI is still using placeholder values. Set a real MongoDB Atlas connection string in your deployment environment."
    );
}

module.exports = {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    adminName: process.env.ADMIN_NAME || "Platform Admin",
    adminEmail: process.env.ADMIN_EMAIL || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
};
