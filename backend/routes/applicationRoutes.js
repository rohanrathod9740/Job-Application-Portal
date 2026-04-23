const express = require("express");
const router = express.Router();

const {
    applyJob,
    getMyApplications,
    getApplicationsForJob,
    getRecruiterApplications,
    updateStatus,
    getApplicationDetails
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// User applies
router.post("/apply", authMiddleware, roleMiddleware(["user"]), applyJob);

// User views own applications
router.get("/my", authMiddleware, roleMiddleware(["user"]), getMyApplications);

// Recruiter views all applications for their jobs
router.get("/recruiter/all", authMiddleware, roleMiddleware(["recruiter"]), getRecruiterApplications);

// Recruiter views applicants for specific job
router.get("/job/:jobId", authMiddleware, roleMiddleware(["recruiter"]), getApplicationsForJob);

// Get application details
router.get("/:applicationId", authMiddleware, getApplicationDetails);

// Recruiter updates status
router.put("/:applicationId", authMiddleware, roleMiddleware(["recruiter"]), updateStatus);

module.exports = router;