const Job = require("../models/Job");
const Application = require("../models/Application");

// CREATE JOB (Recruiter only)
exports.createJob = async(req, res) => {
    try {
        const {
            title,
            description,
            company,
            location,
            workMode,
            salary,
            experienceLevel,
            jobType,
            skillsRequired,
            responsibilities
        } = req.body;

        const safeSalary = {
            min: Number.isFinite(Number(salary?.min)) ? Number(salary.min) : 0,
            max: Number.isFinite(Number(salary?.max)) ? Number(salary.max) : 0
        };

        const job = new Job({
            title,
            description,
            company,
            location: location || "Bangalore",
            workMode: ["Remote", "Hybrid", "On-site"].includes(workMode) ? workMode : "On-site",
            salary: safeSalary,
            experienceLevel: experienceLevel || "Mid Level",
            jobType: jobType || "Full-time",
            skillsRequired: skillsRequired || [],
            responsibilities: responsibilities || [],
            createdBy: req.user._id
        });

        await job.save();

        res.status(201).json({ message: "Job created", job });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ALL JOBS
exports.getJobs = async(req, res) => {
    try {
        const jobs = await Job.find({ isOpen: true }).populate("createdBy", "name email company");

        res.json(jobs);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET RECRUITER'S JOBS
exports.getRecruiterJobs = async(req, res) => {
    try {
        const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

        res.json(jobs);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE JOB (Recruiter only)
exports.updateJob = async(req, res) => {
    try {
        const { jobId } = req.params;
        const {
            title,
            description,
            location,
            workMode,
            salary,
            experienceLevel,
            jobType,
            skillsRequired,
            responsibilities,
            isOpen
        } = req.body;

        let job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        job.title = title || job.title;
        job.description = description || job.description;
        job.location = location || job.location;
        job.workMode = ["Remote", "Hybrid", "On-site"].includes(workMode) ? workMode : job.workMode;
        job.salary = salary ? {
            min: Number.isFinite(Number(salary?.min)) ? Number(salary.min) : 0,
            max: Number.isFinite(Number(salary?.max)) ? Number(salary.max) : 0
        } : job.salary;
        job.experienceLevel = experienceLevel || job.experienceLevel;
        job.jobType = jobType || job.jobType;
        job.skillsRequired = skillsRequired || job.skillsRequired;
        job.responsibilities = responsibilities || job.responsibilities;
        if (isOpen !== undefined) job.isOpen = isOpen;

        await job.save();

        res.json({ message: "Job updated", job });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CLOSE JOB
exports.closeJob = async(req, res) => {
    try {
        const { jobId } = req.params;

        let job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        job.isOpen = false;
        await job.save();

        res.json({ message: "Job closed", job });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE JOB
exports.deleteJob = async(req, res) => {
    try {
        const { jobId } = req.params;

        let job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Job.findByIdAndDelete(jobId);

        res.json({ message: "Job deleted" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
