const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

exports.getAdminOverview = async(req, res) => {
    try {
        const [users, jobs, applications] = await Promise.all([
            User.find().select("-password").sort({ createdAt: -1 }),
            Job.find()
                .populate("createdBy", "name email companyName role isApproved")
                .sort({ createdAt: -1 }),
            Application.find()
                .populate("jobId", "title company location workMode isOpen")
                .populate("userId", "name email role isApproved")
                .sort({ createdAt: -1 })
        ]);

        const recruiterCount = users.filter((user) => user.role === "recruiter").length;
        const candidateCount = users.filter((user) => user.role === "user").length;
        const pendingRecruiters = users.filter(
            (user) => user.role === "recruiter" && !user.isApproved
        ).length;

        res.json({
            stats: {
                totalUsers: users.length,
                candidates: candidateCount,
                recruiters: recruiterCount,
                pendingRecruiters,
                jobs: jobs.length,
                openJobs: jobs.filter((job) => job.isOpen).length,
                applications: applications.length,
            },
            users,
            jobs,
            applications,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsers = async(req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRecruiterApproval = async(req, res) => {
    try {
        const { userId } = req.params;
        const { isApproved } = req.body;

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "recruiter") {
            return res.status(400).json({ message: "Approval is only available for recruiters" });
        }

        user.isApproved = Boolean(isApproved);
        await user.save();

        res.json({
            message: user.isApproved ? "Recruiter approved" : "Recruiter access revoked",
            user,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async(req, res) => {
    try {
        const { userId } = req.params;

        if (req.user._id.toString() === userId) {
            return res.status(400).json({ message: "You cannot delete your own admin account" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const jobs = await Job.find({ createdBy: user._id }, "_id");
        const jobIds = jobs.map((job) => job._id);

        await Promise.all([
            Application.deleteMany({
                $or: [
                    { userId: user._id },
                    { jobId: { $in: jobIds } },
                ],
            }),
            Job.deleteMany({ createdBy: user._id }),
            User.findByIdAndDelete(userId),
        ]);

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getJobs = async(req, res) => {
    try {
        const jobs = await Job.find()
            .populate("createdBy", "name email companyName role isApproved")
            .sort({ createdAt: -1 });

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteJob = async(req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        await Promise.all([
            Application.deleteMany({ jobId }),
            Job.findByIdAndDelete(jobId),
        ]);

        res.json({ message: "Job removed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getApplications = async(req, res) => {
    try {
        const applications = await Application.find()
            .populate("jobId", "title company location workMode isOpen")
            .populate("userId", "name email role isApproved")
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
