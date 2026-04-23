const bcrypt = require("bcryptjs");
const env = require("./env");
const User = require("../models/User");

const seedAdmin = async() => {
    if (!env.adminEmail || !env.adminPassword) {
        return;
    }

    const existingAdmin = await User.findOne({ email: env.adminEmail });
    const password = await bcrypt.hash(env.adminPassword, 10);

    if (existingAdmin) {
        existingAdmin.name = env.adminName;
        existingAdmin.role = "admin";
        existingAdmin.isApproved = true;
        existingAdmin.password = password;
        await existingAdmin.save();
        return;
    }

    await User.create({
        name: env.adminName,
        email: env.adminEmail,
        password,
        role: "admin",
        isApproved: true,
    });
};

module.exports = seedAdmin;
