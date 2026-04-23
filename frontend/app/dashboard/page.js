"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { getMyApplications } from "../../utils/api";

const STATUS_BADGES = {
  accepted: "badge badge-green",
  pending: "badge badge-blue",
  rejected: "badge badge-red",
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const data = await getMyApplications(token);
        setApplications(Array.isArray(data) ? data : data?.applications || []);
        setError("");
      } catch (requestError) {
        console.error("Dashboard error:", requestError);
        setError("Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadApplications();
    }
  }, [token]);

  const stats = useMemo(() => {
    const accepted = applications.filter((item) => item.status === "accepted").length;
    const pending = applications.filter((item) => item.status === "pending").length;
    const rejected = applications.filter((item) => item.status === "rejected").length;

    return {
      total: applications.length,
      accepted,
      pending,
      rejected,
    };
  }, [applications]);

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="app-shell py-8">
        <div className="page-wrap space-y-6">
          <section className="hero-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="eyebrow">Candidate dashboard</span>
                <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                  Welcome back, {user?.name || "Candidate"}
                </h1>
              </div>
              <Link href="/jobs" className="primary-btn px-5 py-3 text-sm">
                Browse Jobs
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              <StatCard label="Applications" value={stats.total} />
              <StatCard label="Pending" value={stats.pending} tone="text-[var(--brand)]" />
              <StatCard label="Accepted" value={stats.accepted} tone="text-[var(--success)]" />
              <StatCard label="Rejected" value={stats.rejected} tone="text-[var(--danger)]" />
            </div>
          </section>

          {error ? <div className="alert-error">{error}</div> : null}

          {loading ? (
            <Loader label="Loading dashboard..." />
          ) : applications.length === 0 ? (
            <section className="panel rounded-[2rem] p-10 text-center">
              <h2 className="text-3xl font-black">No applications yet</h2>
              <Link href="/jobs" className="primary-btn mt-6">
                Find Jobs
              </Link>
            </section>
          ) : (
            <section className="panel rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Recent applications</h2>
              </div>

              <div className="mt-6 space-y-4">
                {applications.map((application) => (
                  <article
                    key={application._id}
                    className="rounded-[1.6rem] border border-[var(--border-soft)] bg-white/90 p-5 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-2xl font-black">
                            {application.jobId?.title || "Job"}
                          </h3>
                          <p className="subtle-text mt-1 text-sm">
                            {(application.jobId?.company || "Company") +
                              " | " +
                              (application.jobId?.location || "Bangalore") +
                              " | " +
                              (application.jobId?.workMode || "On-site")}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(application.jobId?.skillsRequired || []).slice(0, 4).map((skill) => (
                            <span key={skill} className="skill-pill">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <InfoChip
                            label="Preferred city"
                            value={application.profilePreferences?.preferredLocation || "-"}
                          />
                          <InfoChip label="Status" value={application.status || "pending"} />
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 lg:items-end">
                        <span
                          className={
                            STATUS_BADGES[application.status] || "badge badge-neutral"
                          }
                        >
                          {application.status || "pending"}
                        </span>
                        <p className="subtle-text text-sm">
                          Applied on{" "}
                          {new Date(application.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {application.status === "rejected" && application.response ? (
                      <div className="mt-4 rounded-[1rem] border border-[rgba(220,38,38,0.14)] bg-[#fff5f5] p-4">
                        <p className="text-sm font-semibold text-[var(--danger)]">
                          Rejection Reason
                        </p>
                        <p className="subtle-text mt-2 text-sm">{application.response}</p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </ProtectedRoute>
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
