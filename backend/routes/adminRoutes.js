const express = require("express");

const {
    deleteJob,
    deleteUser,
    getAdminOverview,
    getApplications,
    getJobs,
    getUsers,
    updateRecruiterApproval,
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/overview", getAdminOverview);
router.get("/users", getUsers);
router.patch("/users/:userId/approval", updateRecruiterApproval);
router.delete("/users/:userId", deleteUser);
router.get("/jobs", getJobs);
router.delete("/jobs/:jobId", deleteJob);
router.get("/applications", getApplications);

module.exports = router;
