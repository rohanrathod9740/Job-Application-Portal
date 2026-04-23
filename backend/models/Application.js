const mongoose = require("mongoose");

const storedDocumentSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: ""
    },
    size: {
        type: Number,
        default: 0
    },
    content: {
        type: String,
        default: ""
    }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    response: {
        type: String,
        default: ""
    },
    personalInfo: {
        fullName: { type: String, required: true },
        dateOfBirth: { type: String, required: true },
        gender: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        emailAddress: { type: String, required: true },
        address: { type: String, required: true },
        nationality: { type: String, required: true },
        panOrAadhaar: { type: String, required: true }
    },
    profilePreferences: {
        preferredLocation: { type: String, required: true },
        workMode: {
            type: String,
            enum: ["Remote", "Hybrid", "On-site"],
            required: true
        },
        expectedSalary: { type: String, required: true },
        currentCtc: { type: String, default: "" }
    },
    education: {
        highestQualification: { type: String, required: true },
        college: { type: String, required: true },
        yearOfPassing: { type: String, required: true },
        score: { type: String, required: true },
        certifications: { type: String, default: "" }
    },
    workExperience: {
        previousCompanies: { type: String, default: "" },
        roleDesignation: { type: String, default: "" },
        duration: { type: String, default: "" },
        responsibilities: { type: String, default: "" },
        skills: [{
            type: String
        }],
        tools: [{
            type: String
        }]
    },
    documents: {
        resume: {
            type: storedDocumentSchema,
            required: true
        },
        coverLetter: {
            type: String,
            default: ""
        },
        certificates: [storedDocumentSchema]
    },
    additionalQuestions: {
        whyThisJob: { type: String, required: true },
        whyThisCompany: { type: String, required: true },
        hasRelevantExperience: {
            type: String,
            enum: ["Yes", "No"],
            required: true
        },
        canJoinInThirtyDays: {
            type: String,
            enum: ["Yes", "No"],
            required: true
        },
        willingToRelocate: {
            type: String,
            enum: ["Yes", "No"],
            required: true
        }
    },
    atsScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);
