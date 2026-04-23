const Application = require("../models/Application");
const Job = require("../models/Job");

const toList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const calculateAtsScore = (job, applicationPayload) => {
    const requiredSkills = (job.skillsRequired || []).map((skill) => skill.toLowerCase());
    const candidateTerms = new Set([
        ...toList(applicationPayload?.workExperience?.skills).map((item) => item.toLowerCase()),
        ...toList(applicationPayload?.workExperience?.tools).map((item) => item.toLowerCase()),
        ...toList(applicationPayload?.education?.certifications).map((item) => item.toLowerCase())
    ]);

    if (!requiredSkills.length) {
        return 72;
    }

    const matches = requiredSkills.filter((skill) => candidateTerms.has(skill)).length;
    const score = Math.round((matches / requiredSkills.length) * 100);
    return Math.max(38, Math.min(98, score));
};

// APPLY TO JOB (User only)
exports.applyJob = async(req, res) => {
    try {
        const {
            jobId,
            personalInfo,
            profilePreferences,
            education,
            workExperience,
            documents,
            additionalQuestions
        } = req.body;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job || !job.isOpen) {
            return res.status(400).json({ message: "Job not available" });
        }

        // Prevent duplicate application
        const alreadyApplied = await Application.findOne({
            userId: req.user._id,
            jobId
        });

        if (alreadyApplied) {
            return res.status(400).json({ message: "Already applied" });
        }

        if (!personalInfo?.fullName || !education?.highestQualification || !documents?.resume?.name) {
            return res.status(400).json({ message: "Complete the application form before applying" });
        }

        const applicationPayload = {
            personalInfo: {
                fullName: personalInfo.fullName,
                dateOfBirth: personalInfo.dateOfBirth,
                gender: personalInfo.gender,
                mobileNumber: personalInfo.mobileNumber,
                emailAddress: personalInfo.emailAddress,
                address: personalInfo.address,
                nationality: personalInfo.nationality,
                panOrAadhaar: personalInfo.panOrAadhaar
            },
            profilePreferences: {
                preferredLocation: profilePreferences.preferredLocation,
                workMode: profilePreferences.workMode,
                expectedSalary: profilePreferences.expectedSalary,
                currentCtc: profilePreferences.currentCtc || ""
            },
            education: {
                highestQualification: education.highestQualification,
                college: education.college,
                yearOfPassing: education.yearOfPassing,
                score: education.score,
                certifications: education.certifications || ""
            },
            workExperience: {
                previousCompanies: workExperience?.previousCompanies || "",
                roleDesignation: workExperience?.roleDesignation || "",
                duration: workExperience?.duration || "",
                responsibilities: workExperience?.responsibilities || "",
                skills: toList(workExperience?.skills),
                tools: toList(workExperience?.tools)
            },
            documents: {
                resume: documents.resume,
                coverLetter: documents.coverLetter || "",
                certificates: Array.isArray(documents.certificates)
                    ? documents.certificates
                    : []
            },
            additionalQuestions: {
                whyThisJob: additionalQuestions.whyThisJob,
                whyThisCompany: additionalQuestions.whyThisCompany,
                hasRelevantExperience: additionalQuestions.hasRelevantExperience,
                canJoinInThirtyDays: additionalQuestions.canJoinInThirtyDays,
                willingToRelocate: additionalQuestions.willingToRelocate
            }
        };

        const application = new Application({
            userId: req.user._id,
            jobId,
            ...applicationPayload,
            atsScore: calculateAtsScore(job, applicationPayload)
        });

        await application.save();

        // Update application count
        job.applicationsCount = (job.applicationsCount || 0) + 1;
        await job.save();

        res.status(201).json({ message: "Applied successfully", application });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET MY APPLICATIONS (User)
exports.getMyApplications = async(req, res) => {
    try {
        const apps = await Application.find({ userId: req.user._id })
            .populate("jobId")
            .sort({ createdAt: -1 });

        res.json(apps);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET APPLICATIONS FOR A JOB (Recruiter)
exports.getApplicationsForJob = async(req, res) => {
    try {
        const { jobId } = req.params;

        // Verify job belongs to recruiter
        const job = await Job.findById(jobId);
        if (!job || job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const apps = await Application.find({ jobId })
            .populate("userId", "name email profileImage bio")
            .populate("jobId", "title company location workMode skillsRequired")
            .sort({ createdAt: -1 });

        res.json(apps);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ALL APPLICATIONS FOR RECRUITER'S JOBS
exports.getRecruiterApplications = async(req, res) => {
    try {
        // Get all jobs created by recruiter
        const jobs = await Job.find({ createdBy: req.user._id }, "_id");
        const jobIds = jobs.map(job => job._id);

        // Get all applications for those jobs
        const apps = await Application.find({ jobId: { $in: jobIds } })
            .populate("jobId", "title company location workMode skillsRequired")
            .populate("userId", "name email profileImage bio")
            .sort({ createdAt: -1 });

        res.json(apps);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE STATUS (Recruiter)
exports.updateStatus = async(req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, response } = req.body;

        if (!["accepted", "rejected", "pending"].includes(status)) {
            return res.status(400).json({ message: "Invalid application status" });
        }

        const app = await Application.findById(applicationId);

        if (!app) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify recruiter owns the job
        const job = await Job.findById(app.jobId);
        if (!job || job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (status === "rejected" && !String(response || "").trim()) {
            return res.status(400).json({ message: "Rejection reason is required" });
        }

        app.status = status;
        app.response = status === "rejected" ? String(response || "").trim() : String(response || "");
        await app.save();

        const populatedApp = await Application.findById(app._id)
            .populate("jobId", "title company location workMode skillsRequired")
            .populate("userId", "name email profileImage bio");

        res.json({ message: "Status updated", application: populatedApp });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET APPLICATION DETAILS
exports.getApplicationDetails = async(req, res) => {
    try {
        const { applicationId } = req.params;

        const app = await Application.findById(applicationId)
            .populate("userId")
            .populate("jobId");

        if (!app) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json(app);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
