const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: "Bangalore"
    },
    workMode: {
        type: String,
        enum: ["Remote", "Hybrid", "On-site"],
        default: "On-site"
    },
    salary: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    },
    experienceLevel: {
        type: String,
        enum: ["Entry Level", "Mid Level", "Senior", "Lead"],
        default: "Mid Level"
    },
    jobType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Internship"],
        default: "Full-time"
    },
    skillsRequired: [{
        type: String
    }],
    responsibilities: [{
        type: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isOpen: {
        type: Boolean,
        default: true
    },
    applicationsCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
