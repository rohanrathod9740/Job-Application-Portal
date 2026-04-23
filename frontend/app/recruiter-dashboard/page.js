"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import {
  closeJob,
  getRecruiterApplications,
  getRecruiterJobs,
  updateApplicationStatus,
} from "../../utils/api";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "jobs", label: "Openings" },
  { id: "applications", label: "Applications" },
];

const STATUS_STYLES = {
  accepted: "badge badge-green",
  pending: "badge badge-blue",
  rejected: "badge badge-red",
};

export default function RecruiterDashboardPage() {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [closingJobId, setClosingJobId] = useState("");
  const [rejectingId, setRejectingId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [jobsData, applicationsData] = await Promise.all([
          getRecruiterJobs(token),
          getRecruiterApplications(token),
        ]);

        setJobs(Array.isArray(jobsData) ? jobsData : jobsData?.jobs || []);
        setApplications(
          Array.isArray(applicationsData)
            ? applicationsData
            : applicationsData?.applications || []
        );
      } catch (requestError) {
        console.error("Recruiter dashboard error:", requestError);
        setError("Unable to load workspace.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadData();
    }
  }, [token]);

  const stats = useMemo(() => {
    const pending = applications.filter((item) => item.status === "pending").length;
    const accepted = applications.filter((item) => item.status === "accepted").length;

    return {
      jobs: jobs.length,
      applicants: applications.length,
      pending,
      accepted,
    };
  }, [applications, jobs]);

  const handleStatusUpdate = async (applicationId, status, response = "") => {
    try {
      setUpdatingId(applicationId);
      const result = await updateApplicationStatus(applicationId, status, response, token);
      const updatedApplication = result?.application || result?.app;

      if (!updatedApplication) {
        setError(result?.message || "Unable to update applicant.");
        return;
      }

      setApplications((current) =>
        current.map((application) =>
          application._id === applicationId ? updatedApplication : application
        )
      );
      setError("");
      setRejectingId("");
      setRejectionReason("");
    } catch (requestError) {
      console.error("Applicant update error:", requestError);
      setError(requestError?.message || "Unable to update applicant.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      setClosingJobId(jobId);
      const result = await closeJob(jobId, token);
      const updatedJob = result?.job;

      if (!updatedJob) {
        setError(result?.message || "Unable to close job.");
        return;
      }

      setJobs((current) => current.map((job) => (job._id === jobId ? updatedJob : job)));
      setError("");
    } catch (requestError) {
      console.error("Close job error:", requestError);
      setError(requestError?.message || "Unable to close job.");
    } finally {
      setClosingJobId("");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <div className="app-shell py-8">
        <div className="page-wrap space-y-6">
          <section className="hero-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="eyebrow">Recruiter command center</span>
                <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                  {user?.companyName || "Hiring workspace"}
                </h1>
              </div>
              <Link href="/post-job" className="primary-btn px-5 py-3 text-sm">
                Post Job
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              <StatCard label="Jobs live" value={stats.jobs} />
              <StatCard label="Applications" value={stats.applicants} />
              <StatCard label="Pending review" value={stats.pending} tone="text-[var(--brand)]" />
              <StatCard label="Accepted" value={stats.accepted} tone="text-[var(--success)]" />
            </div>
          </section>

          {error ? <div className="alert-error">{error}</div> : null}

          {loading ? (
            <Loader label="Loading workspace..." />
          ) : (
            <section className="panel rounded-[2rem] p-6 sm:p-8">
              <div className="flex flex-wrap gap-3">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={activeTab === tab.id ? "choice-pill active" : "choice-pill"}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeTab === "overview" ? (
                  <Overview jobs={jobs} applications={applications} />
                ) : null}
                {activeTab === "jobs" ? (
                  <JobsPanel
                    jobs={jobs}
                    closingJobId={closingJobId}
                    onCloseJob={handleCloseJob}
                  />
                ) : null}
                {activeTab === "applications" ? (
                  <ApplicationsPanel
                    applications={applications}
                    updatingId={updatingId}
                    rejectingId={rejectingId}
                    rejectionReason={rejectionReason}
                    setRejectingId={setRejectingId}
                    setRejectionReason={setRejectionReason}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ) : null}
              </div>
            </section>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function Overview({ jobs, applications }) {
  const topCandidates = applications
    .slice()
    .sort((first, second) => (second.atsScore || 0) - (first.atsScore || 0))
    .slice(0, 3);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/90 p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-xl font-black">Recent roles</h2>
        <div className="mt-4 space-y-3">
          {jobs.slice(0, 4).map((job) => (
            <div key={job._id} className="info-chip">
              <strong>{job.title}</strong>
              <span className="subtle-text">
                {job.location} | {job.workMode} | {job.jobType}
              </span>
            </div>
          ))}
          {jobs.length === 0 ? <p className="subtle-text text-sm">No jobs posted yet.</p> : null}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/90 p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-xl font-black">Top matches</h2>
        <div className="mt-4 space-y-3">
          {topCandidates.map((application) => (
            <div key={application._id} className="info-chip">
              <strong>{application.personalInfo?.fullName || "Applicant"}</strong>
              <span className="subtle-text">
                {application.jobId?.title || "Role"} | ATS {application.atsScore || 0}%
              </span>
            </div>
          ))}
          {topCandidates.length === 0 ? (
            <p className="subtle-text text-sm">No applications available yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function JobsPanel({ jobs, onCloseJob, closingJobId }) {
  if (!jobs.length) {
    return <p className="subtle-text text-sm">No jobs posted yet.</p>;
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <article
          key={job._id}
          className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/90 p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div>
                <h3 className="text-2xl font-black">{job.title}</h3>
                <p className="subtle-text mt-1 text-sm">
                  {job.location} | {job.workMode} | {job.jobType}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(job.skillsRequired || []).map((skill) => (
                  <span key={skill} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <span className={job.isOpen ? "badge badge-green" : "badge badge-neutral"}>
                {job.isOpen ? "Open" : "Closed"}
              </span>
              <span className="subtle-text text-sm">
                {job.applicationsCount || 0} application(s)
              </span>
              {job.isOpen ? (
                <button
                  onClick={() => onCloseJob(job._id)}
                  disabled={closingJobId === job._id}
                  className="ghost-btn rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--foreground)]"
                >
                  {closingJobId === job._id ? "Closing..." : "Close Job Posting"}
                </button>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ApplicationsPanel({
  applications,
  onStatusUpdate,
  updatingId,
  rejectingId,
  rejectionReason,
  setRejectingId,
  setRejectionReason,
}) {
  if (!applications.length) {
    return <p className="subtle-text text-sm">No applicants yet.</p>;
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <article
          key={application._id}
          className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/92 p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-black">
                    {application.personalInfo?.fullName ||
                      application.userId?.name ||
                      "Applicant"}
                  </h3>
                  <span
                    className={
                      STATUS_STYLES[application.status] || "badge badge-neutral"
                    }
                  >
                    {application.status || "pending"}
                  </span>
                </div>
                <p className="subtle-text mt-2 text-sm">
                  {application.jobId?.title || "Role"} | ATS {application.atsScore || 0}%
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onStatusUpdate(application._id, "accepted")}
                  disabled={updatingId === application._id}
                  className="secondary-btn px-4 py-2 text-sm"
                >
                  {updatingId === application._id ? "Updating..." : "Accept"}
                </button>
                <button
                  onClick={() => {
                    setRejectingId(
                      rejectingId === application._id ? "" : application._id
                    );
                    setRejectionReason(
                      rejectingId === application._id ? "" : application.response || ""
                    );
                  }}
                  disabled={updatingId === application._id}
                  className="ghost-btn rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--foreground)]"
                >
                  Reject
                </button>
              </div>
            </div>

            {rejectingId === application._id ? (
              <div className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
                <label className="mb-2 block text-sm font-semibold">
                  Rejection reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  className="text-area min-h-[100px]"
                  placeholder="Add a clear reason"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      onStatusUpdate(application._id, "rejected", rejectionReason)
                    }
                    disabled={updatingId === application._id}
                    className="primary-btn px-4 py-2 text-sm"
                  >
                    Save Rejection
                  </button>
                  <button
                    onClick={() => {
                      setRejectingId("");
                      setRejectionReason("");
                    }}
                    className="ghost-btn rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--foreground)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoChip label="Email" value={application.personalInfo?.emailAddress || "-"} />
              <InfoChip label="Mobile" value={application.personalInfo?.mobileNumber || "-"} />
              <InfoChip
                label="Preferred location"
                value={application.profilePreferences?.preferredLocation || "-"}
              />
              <InfoChip
                label="Qualification"
                value={application.education?.highestQualification || "-"}
              />
              <InfoChip label="College" value={application.education?.college || "-"} />
              <InfoChip
                label="Experience"
                value={application.workExperience?.duration || "Fresher / not specified"}
              />
              <InfoChip
                label="Resume"
                value={application.documents?.resume?.name || "Not uploaded"}
              />
              <InfoChip
                label="Certificates"
                value={application.documents?.certificates?.length || 0}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <DetailBlock
                title="Address & identity"
                body={[
                  application.personalInfo?.address,
                  `Nationality: ${application.personalInfo?.nationality || "-"}`,
                  `PAN/Aadhaar: ${application.personalInfo?.panOrAadhaar || "-"}`,
                  `DOB: ${application.personalInfo?.dateOfBirth || "-"}`,
                  `Gender: ${application.personalInfo?.gender || "-"}`,
                ]
                  .filter(Boolean)
                  .join("\n")}
              />
              <DetailBlock
                title="Experience summary"
                body={[
                  `Companies: ${application.workExperience?.previousCompanies || "-"}`,
                  `Role: ${application.workExperience?.roleDesignation || "-"}`,
                  `Responsibilities: ${application.workExperience?.responsibilities || "-"}`,
                ].join("\n")}
              />
              <DetailBlock
                title="Skills & tools"
                body={[
                  `Skills: ${(application.workExperience?.skills || []).join(", ") || "-"}`,
                  `Tools: ${(application.workExperience?.tools || []).join(", ") || "-"}`,
                  `Certifications: ${application.education?.certifications || "-"}`,
                ].join("\n")}
              />
              <DetailBlock
                title="Motivation"
                body={[
                  `Why this job: ${application.additionalQuestions?.whyThisJob || "-"}`,
                  `Why this company: ${application.additionalQuestions?.whyThisCompany || "-"}`,
                  `Relevant experience: ${application.additionalQuestions?.hasRelevantExperience || "-"}`,
                  `Can join in 30 days: ${application.additionalQuestions?.canJoinInThirtyDays || "-"}`,
                  `Willing to relocate: ${application.additionalQuestions?.willingToRelocate || "-"}`,
                ].join("\n")}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function StatCard({ label, value, tone = "" }) {
  return (
    <div className="stat-card">
      <p className="subtle-text text-xs font-semibold uppercase tracking-[0.16em]">
        {label}
      </p>
      <p className={`mt-2 text-4xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="info-chip">
      <span className="subtle-text">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailBlock({ title, body }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
      <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--foreground)]">
        {title}
      </h4>
      <p className="subtle-text mt-3 whitespace-pre-line text-sm">{body}</p>
    </div>
  );
}
