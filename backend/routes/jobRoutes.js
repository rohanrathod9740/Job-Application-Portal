const express = require("express");
const router = express.Router();

const { 
    createJob, 
    getJobs, 
    getRecruiterJobs,
    updateJob,
    closeJob,
    deleteJob 
} = require("../controllers/jobController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create job (recruiter only)
router.post("/", authMiddleware, roleMiddleware(["recruiter"]), createJob);

// Get all jobs
router.get("/", authMiddleware, getJobs);

// Get recruiter's jobs
router.get("/my-jobs", authMiddleware, roleMiddleware(["recruiter"]), getRecruiterJobs);

// Update job (recruiter only)
router.put("/:jobId", authMiddleware, roleMiddleware(["recruiter"]), updateJob);

// Close job (recruiter only)
router.patch("/:jobId/close", authMiddleware, roleMiddleware(["recruiter"]), closeJob);

// Delete job (recruiter only)
router.delete("/:jobId", authMiddleware, roleMiddleware(["recruiter"]), deleteJob);

module.exports = router;