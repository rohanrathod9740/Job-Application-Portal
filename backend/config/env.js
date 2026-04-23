const dotenv = require("dotenv");

dotenv.config();

const requiredVars = ["MONGO_URI", "JWT_SECRET"];

for (const variable of requiredVars) {
    if (!process.env[variable]) {
        throw new Error(`Missing required environment variable: ${variable}`);
    }
}

module.exports = {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};
