const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

const authMiddleware = async(req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "No token, access denied" });
        }

        // Remove "Bearer "
        const cleanToken = token.split(" ")[1];

        const decoded = jwt.verify(cleanToken, env.jwtSecret);

        // Attach user to request
        req.user = await User.findById(decoded.id).select("-password");

        next();

    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
