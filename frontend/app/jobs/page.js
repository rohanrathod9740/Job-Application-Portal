"use client";

import { useEffect, useMemo, useState } from "react";
import ApplicationFormModal from "../../components/ApplicationFormModal";
import JobCard from "../../components/JobCard";
import Loader from "../../components/Loader";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { CITY_OPTIONS, WORK_MODE_OPTIONS } from "../../utils/jobOptions";
import { applyJob, getJobs } from "../../utils/api";

export default function JobsPage() {
  const { token, role } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [workMode, setWorkMode] = useState("All");
  const [activeJob, setActiveJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await getJobs(token);
        setJobs(Array.isArray(data) ? data : data?.jobs || []);
      } catch (requestError) {
        console.error("Jobs error:", requestError);
        setError("Unable to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadJobs();
    }
  }, [token]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        job.title?.toLowerCase().includes(keyword) ||
        job.company?.toLowerCase().includes(keyword);
      const matchesLocation = location === "All" || job.location === location;
      const matchesWorkMode = workMode === "All" || job.workMode === workMode;
      return matchesSearch && matchesLocation && matchesWorkMode;
    });
  }, [jobs, location, search, workMode]);

  const handleApplyClick = (job) => {
    setActiveJob(job);
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (payload) => {
    try {
      setSubmitting(true);
      const response = await applyJob(payload, token);
      if (!response?.application) {
        setError(response?.error || response?.message || "Unable to apply.");
        return false;
      }
      setToast("Applied Successfully");
      setShowApplyModal(false);
      setActiveJob(null);
      setError("");
      return true;
    } catch (requestError) {
      console.error("Apply error:", requestError);
      setError(
        requestError?.message || "Unable to apply. Please complete the form and try again."
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="app-shell py-8">
        <div className="page-wrap space-y-6">
          <section className="hero-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="eyebrow">Talent marketplace</span>
                <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                  Discover high-quality roles built around real hiring needs.
                </h1>
                <p className="subtle-text mt-4 max-w-2xl text-base sm:text-lg">
                  Explore curated openings, compare locations and work modes, and
                  submit a complete application that recruiters can actually review.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="stat-card">
                  <p className="subtle-text text-xs font-semibold uppercase tracking-[0.16em]">
                    Open roles
                  </p>
                  <p className="mt-2 text-3xl font-black">{jobs.length}</p>
                </div>
                <div className="stat-card">
                  <p className="subtle-text text-xs font-semibold uppercase tracking-[0.16em]">
                    Cities
                  </p>
                  <p className="mt-2 text-3xl font-black">{CITY_OPTIONS.length}</p>
                </div>
                <div className="stat-card">
                  <p className="subtle-text text-xs font-semibold uppercase tracking-[0.16em]">
                    Work modes
                  </p>
                  <p className="mt-2 text-3xl font-black">{WORK_MODE_OPTIONS.length}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.5fr_0.5fr]">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="field"
                placeholder="Search by role, company, or skill"
              />
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="select-field"
              >
                <option>All</option>
                {CITY_OPTIONS.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
              <select
                value={workMode}
                onChange={(event) => setWorkMode(event.target.value)}
                className="select-field"
              >
                <option>All</option>
                {WORK_MODE_OPTIONS.map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </div>
          </section>

          {toast ? <div className="alert-success">{toast}</div> : null}

          {error ? (
            <div className="alert-error">{error}</div>
          ) : null}

          {loading ? (
            <Loader label="Loading jobs..." />
          ) : filteredJobs.length === 0 ? (
            <section className="panel rounded-[2rem] p-10 text-center">
              <h2 className="text-3xl font-black">No roles match these filters</h2>
              <p className="subtle-text mt-3">
                Try another city, work mode, or search keyword to broaden the results.
              </p>
            </section>
          ) : (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onApply={handleApplyClick}
                  showApplyButton={role === "user"}
                />
              ))}
            </section>
          )}
        </div>

        <ApplicationFormModal
          open={showApplyModal}
          job={activeJob}
          onClose={() => {
            setShowApplyModal(false);
            setActiveJob(null);
          }}
          onSubmit={handleApplySubmit}
          submitting={submitting}
        />
      </div>
    </ProtectedRoute>
  );
}
