"use client";

import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import {
  deleteJobByAdmin,
  deleteUserByAdmin,
  getAdminOverview,
  updateRecruiterApproval,
} from "../../utils/api";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "jobs", label: "Jobs" },
  { id: "applications", label: "Applications" },
];

const STATUS_BADGES = {
  accepted: "badge badge-green",
  pending: "badge badge-blue",
  rejected: "badge badge-red",
};

export default function AdminPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [approvalId, setApprovalId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [deletingJobId, setDeletingJobId] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const data = await getAdminOverview(token);
        setStats(data?.stats || null);
        setUsers(Array.isArray(data?.users) ? data.users : []);
        setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        setApplications(Array.isArray(data?.applications) ? data.applications : []);
        setError("");
      } catch (requestError) {
        console.error("Admin dashboard error:", requestError);
        setError("Unable to load the admin console.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadOverview();
    }
  }, [token]);

  const pendingRecruiters = useMemo(
    () => users.filter((member) => member.role === "recruiter" && !member.isApproved),
    [users]
  );

  const dashboardStats = useMemo(
    () => ({
      totalUsers: users.length,
      pendingRecruiters: pendingRecruiters.length,
      openJobs: jobs.filter((job) => job.isOpen).length,
      applications: applications.length,
      recruiters: users.filter((member) => member.role === "recruiter").length,
      candidates: users.filter((member) => member.role === "user").length,
    }),
    [applications, jobs, pendingRecruiters.length, users]
  );

  const recentApplications = useMemo(() => applications.slice(0, 5), [applications]);

  const handleApproval = async (userId, isApproved) => {
    try {
      setApprovalId(userId);
      const response = await updateRecruiterApproval(userId, isApproved, token);
      const updatedUser = response?.user;

      setUsers((current) =>
        current.map((member) => (member._id === userId ? updatedUser : member))
      );
      setError("");
    } catch (requestError) {
      console.error("Approval error:", requestError);
      setError(requestError?.message || "Unable to update recruiter approval.");
    } finally {
      setApprovalId("");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setDeletingUserId(userId);
      await deleteUserByAdmin(userId, token);

      const ownedJobIds = jobs
        .filter((job) => job.createdBy?._id === userId)
        .map((job) => job._id);

      setUsers((current) => current.filter((member) => member._id !== userId));
      setJobs((current) => current.filter((job) => job.createdBy?._id !== userId));
      setApplications((current) =>
        current.filter(
          (application) =>
            application.userId?._id !== userId &&
            !ownedJobIds.includes(application.jobId?._id)
        )
      );
      setError("");
    } catch (requestError) {
      console.error("Delete user error:", requestError);
      setError(requestError?.message || "Unable to delete user.");
    } finally {
      setDeletingUserId("");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      setDeletingJobId(jobId);
      await deleteJobByAdmin(jobId, token);
      setJobs((current) => current.filter((job) => job._id !== jobId));
      setApplications((current) =>
        current.filter((application) => application.jobId?._id !== jobId)
      );
      setError("");
    } catch (requestError) {
      console.error("Delete job error:", requestError);
      setError(requestError?.message || "Unable to remove job.");
    } finally {
      setDeletingJobId("");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="app-shell py-8">
        <div className="page-wrap space-y-6">
          <section className="hero-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="eyebrow">Admin control panel</span>
                <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                  Platform oversight
                </h1>
                <p className="subtle-text mt-3 max-w-2xl text-sm">
                  Review platform activity, manage recruiter approvals, and take action on
                  users, jobs, and applications.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--border-soft)] bg-white/85 px-4 py-3 shadow-[var(--shadow-soft)]">
                <p className="text-sm font-bold">{user?.name || "Admin"}</p>
                <p className="subtle-text text-xs uppercase tracking-[0.16em]">Administrator</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Users" value={dashboardStats.totalUsers || stats?.totalUsers || 0} />
              <StatCard
                label="Recruiters Pending"
                value={dashboardStats.pendingRecruiters || stats?.pendingRecruiters || 0}
              />
              <StatCard label="Open Jobs" value={dashboardStats.openJobs || stats?.openJobs || 0} />
              <StatCard
                label="Applications"
                value={dashboardStats.applications || stats?.applications || 0}
              />
            </div>
          </section>

          {error ? <div className="alert-error">{error}</div> : null}

          {loading ? (
            <Loader label="Loading admin console..." />
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
                  <OverviewPanel
                    pendingRecruiters={pendingRecruiters}
                    recentApplications={recentApplications}
                    onApproval={handleApproval}
                    approvalId={approvalId}
                  />
                ) : null}
                {activeTab === "users" ? (
                  <UsersPanel
                    users={users}
                    currentUserId={user?._id || user?.id}
                    approvalId={approvalId}
                    deletingUserId={deletingUserId}
                    onApproval={handleApproval}
                    onDeleteUser={handleDeleteUser}
                  />
                ) : null}
                {activeTab === "jobs" ? (
                  <JobsPanel
                    jobs={jobs}
                    deletingJobId={deletingJobId}
                    onDeleteJob={handleDeleteJob}
                  />
                ) : null}
                {activeTab === "applications" ? (
                  <ApplicationsPanel applications={applications} />
                ) : null}
              </div>
            </section>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function OverviewPanel({ pendingRecruiters, recentApplications, onApproval, approvalId }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/92 p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-xl font-black">Recruiter approvals</h2>
        <div className="mt-4 space-y-3">
          {pendingRecruiters.slice(0, 5).map((member) => (
            <div key={member._id} className="info-chip">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <strong>{member.name}</strong>
                  <p className="subtle-text text-sm">
                    {member.companyName || "Company not provided"} | {member.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onApproval(member._id, true)}
                    disabled={approvalId === member._id}
                    className="secondary-btn px-4 py-2 text-sm"
                  >
                    {approvalId === member._id ? "Saving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => onApproval(member._id, false)}
                    disabled={approvalId === member._id}
                    className="ghost-btn rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--foreground)]"
                  >
                    Hold
                  </button>
                </div>
              </div>
            </div>
          ))}
          {pendingRecruiters.length === 0 ? (
            <p className="subtle-text text-sm">No recruiter approvals are pending.</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/92 p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-xl font-black">Recent application activity</h2>
        <div className="mt-4 space-y-3">
          {recentApplications.map((application) => (
            <div key={application._id} className="info-chip">
              <strong>{application.personalInfo?.fullName || application.userId?.name}</strong>
              <span className="subtle-text text-sm">
                {application.jobId?.title || "Role"} | {application.userId?.email || "-"}
              </span>
            </div>
          ))}
          {recentApplications.length === 0 ? (
            <p className="subtle-text text-sm">No platform activity yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function UsersPanel({
  users,
  currentUserId,
  approvalId,
  deletingUserId,
  onApproval,
  onDeleteUser,
}) {
  if (!users.length) {
    return <p className="subtle-text text-sm">No users found.</p>;
  }

  return (
    <div className="space-y-4">
      {users.map((member) => {
        const isSelf = member._id === currentUserId;
        return (
          <article
            key={member._id}
            className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/92 p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-black">{member.name}</h3>
                  <span className="badge badge-neutral">{member.role}</span>
                  {member.role === "recruiter" ? (
                    <span className={member.isApproved ? "badge badge-green" : "badge badge-red"}>
                      {member.isApproved ? "Approved" : "Pending"}
                    </span>
                  ) : null}
                </div>
                <p className="subtle-text text-sm">
                  {member.email}
                  {member.companyName ? ` | ${member.companyName}` : ""}
                  {member.companyEmail ? ` | ${member.companyEmail}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {member.role === "recruiter" ? (
                  <button
                    onClick={() => onApproval(member._id, !member.isApproved)}
                    disabled={approvalId === member._id}
                    className="secondary-btn px-4 py-2 text-sm"
                  >
                    {approvalId === member._id
                      ? "Saving..."
                      : member.isApproved
                        ? "Revoke Approval"
                        : "Approve Recruiter"}
                  </button>
                ) : null}
                <button
                  onClick={() => onDeleteUser(member._id)}
                  disabled={deletingUserId === member._id || isSelf}
                  className="ghost-btn rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--foreground)]"
                >
                  {isSelf
                    ? "Current Admin"
                    : deletingUserId === member._id
                      ? "Removing..."
                      : "Delete User"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function JobsPanel({ jobs, deletingJobId, onDeleteJob }) {
  if (!jobs.length) {
    return <p className="subtle-text text-sm">No jobs posted yet.</p>;
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <article
          key={job._id}
          className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/92 p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-black">{job.title}</h3>
                <span className={job.isOpen ? "badge badge-green" : "badge badge-neutral"}>
                  {job.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              <p className="subtle-text text-sm">
                {job.company} | {job.location} | {job.workMode} | Posted by{" "}
                {job.createdBy?.name || "Unknown recruiter"}
              </p>
              <div className="flex flex-wrap gap-2">
                {(job.skillsRequired || []).map((skill) => (
                  <span key={skill} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onDeleteJob(job._id)}
              disabled={deletingJobId === job._id}
              className="ghost-btn rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--foreground)]"
            >
              {deletingJobId === job._id ? "Removing..." : "Delete Job"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function ApplicationsPanel({ applications }) {
  if (!applications.length) {
    return <p className="subtle-text text-sm">No applications found.</p>;
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <article
          key={application._id}
          className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/92 p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-black">
                  {application.personalInfo?.fullName || application.userId?.name || "Applicant"}
                </h3>
                <span className={STATUS_BADGES[application.status] || "badge badge-neutral"}>
                  {application.status || "pending"}
                </span>
              </div>
              <p className="subtle-text text-sm">
                {application.userId?.email || "-"} | {application.userId?.role || "-"} |{" "}
                {application.jobId?.title || "Role"} | {application.jobId?.company || "Company"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoChip label="ATS score" value={`${application.atsScore || 0}%`} />
              <InfoChip
                label="Submitted"
                value={new Date(application.createdAt).toLocaleDateString("en-IN")}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p className="subtle-text text-xs font-semibold uppercase tracking-[0.16em]">
        {label}
      </p>
      <p className="mt-2 text-4xl font-black">{value}</p>
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
