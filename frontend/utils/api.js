const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const sanitizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const BASE_URL = sanitizedBaseUrl.endsWith("/api")
    ? sanitizedBaseUrl
    : `${sanitizedBaseUrl}/api`;

// ================= AUTH =================

// Register
export const registerUser = async(data) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return res.json();
};

// Login
export const loginUser = async(data) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return res.json();
};

// Get current user
export const getCurrentUser = async(token) => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
};

// ================= JOBS =================

// Get all jobs
export const getJobs = async(token) => {
    const res = await fetch(`${BASE_URL}/jobs`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
};

// Get recruiter's jobs
export const getRecruiterJobs = async(token) => {
    const res = await fetch(`${BASE_URL}/jobs/my-jobs`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
};

// Create job (recruiter only)
export const createJob = async(data, token) => {
    const res = await fetch(`${BASE_URL}/jobs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    return res.json();
};

// Update job (recruiter only)
export const updateJob = async(jobId, data, token) => {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    return res.json();
};

// Close job
export const closeJob = async(jobId, token) => {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}/close`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.message || data?.error || "Request failed");
    }
    return data;
};

// Delete job
export const deleteJob = async(jobId, token) => {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
};

// Apply to job
export const applyJob = async(data, token) => {
    const res = await fetch(`${BASE_URL}/applications/apply`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    return res.json();
};

// ================= APPLICATIONS =================

// Get my applications (user)
export const getMyApplications = async(token) => {
    const res = await fetch(`${BASE_URL}/applications/my`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
};

// Get recruiter's all applications
export const getRecruiterApplications = async(token) => {
    const res = await fetch(`${BASE_URL}/applications/recruiter/all`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
};

// Get applications for a job (recruiter)
export const getApplicationsForJob = async(jobId, token) => {
    const res = await fetch(`${BASE_URL}/applications/job/${jobId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
};

// Get application details
export const getApplicationDetails = async(applicationId, token) => {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
};

// Update application status (recruiter)
export const updateApplicationStatus = async(applicationId, status, response, token) => {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, response })
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.message || data?.error || "Request failed");
    }
    return data;
};

// ================= ADMIN =================

export const getAdminOverview = async(token) => {
    const res = await fetch(`${BASE_URL}/admin/overview`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
};

export const updateRecruiterApproval = async(userId, isApproved, token) => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/approval`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved })
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.message || data?.error || "Request failed");
    }
    return data;
};

export const deleteUserByAdmin = async(userId, token) => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.message || data?.error || "Request failed");
    }
    return data;
};

export const deleteJobByAdmin = async(jobId, token) => {
    const res = await fetch(`${BASE_URL}/admin/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.message || data?.error || "Request failed");
    }
    return data;
};

// ================= UTILS =================

// Decode JWT token (simple, no verification on frontend)
export const decodeToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (e) {
        return null;
    }
};
