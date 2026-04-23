const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

// REGISTER
exports.register = async(req, res) => {
    try {
        const { name, email, password, role, companyName, companyEmail } = req.body;
        const normalizedRole = role === "recruiter" ? "recruiter" : "user";

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Validate recruiter registration
        if (normalizedRole === "recruiter") {
            if (!companyName || !companyEmail) {
                return res.status(400).json({ message: "Company details required for recruiter registration" });
            }
            // Check if company email is already registered
            const existingRecruiter = await User.findOne({ companyEmail });
            if (existingRecruiter) {
                return res.status(400).json({ message: "Company already registered" });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword,
            role: normalizedRole,
            companyName: normalizedRole === "recruiter" ? companyName : "",
            companyEmail: normalizedRole === "recruiter" ? companyEmail : "",
            isApproved: true
        });

        await user.save();

        res.status(201).json({
            message: normalizedRole === "recruiter"
                ? "Recruiter account created successfully"
                : "User registered successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN
exports.login = async(req, res) => {
    try {
        const { email, password, role } = req.body;
        const requestedRole =
            role === "recruiter" ? "recruiter" : role === "user" ? "user" : null;

        if (!requestedRole) {
            return res.status(400).json({ message: "Role is required for login" });
        }

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (user.role !== requestedRole) {
            return res.status(403).json({
                message: `This account is registered as a ${user.role}.`
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create token
        const token = jwt.sign({ 
            id: user._id, 
            name: user.name, 
            role: user.role,
            email: user.email 
        },
            env.jwtSecret, { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email,
                isApproved: user.isApproved
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET CURRENT USER
exports.getCurrentUser = async(req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
