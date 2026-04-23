"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import {
  CITY_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from "../../utils/jobOptions";
import { createJob } from "../../utils/api";

const INITIAL_FORM = {
  title: "",
  description: "",
  company: "",
  location: "Bangalore",
  workMode: "On-site",
  salary: { min: "", max: "" },
  experienceLevel: "Mid Level",
  jobType: "Full-time",
  skillsRequired: "",
  responsibilities: "",
};

export default function PostJobPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateSalary = (field, value) => {
    setForm((current) => ({
      ...current,
      salary: {
        ...current.salary,
        [field]: value.replace(/[^\d]/g, ""),
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await createJob(
        {
          ...form,
          company: (form.company || user?.companyName || "").trim(),
          salary: {
            min: form.salary.min ? Number(form.salary.min) : 0,
            max: form.salary.max ? Number(form.salary.max) : 0,
          },
          skillsRequired: form.skillsRequired
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          responsibilities: form.responsibilities
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        },
        token
      );

      if (response?.job) {
        router.push("/recruiter-dashboard");
        return;
      }

      setError(response?.error || response?.message || "Unable to post job.");
    } catch (requestError) {
      console.error("Post job error:", requestError);
      setError("Unable to post job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <div className="app-shell flex items-center justify-center px-4 py-8">
        <section className="hero-panel w-full max-w-4xl rounded-[1.75rem] p-7 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="eyebrow">Hiring setup</span>
              <h1 className="mt-4 text-4xl font-black">Post a job</h1>
            </div>
            <Link href="/recruiter-dashboard" className="ghost-btn px-4 py-2 text-sm">
              Back
            </Link>
          </div>

          {error ? <div className="alert-error mt-5">{error}</div> : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">Job Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="field"
                  placeholder="Senior Frontend Engineer"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Company</label>
                <input
                  type="text"
                  value={form.company || user?.companyName || ""}
                  onChange={(event) => updateField("company", event.target.value)}
                  className="field"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold">City</label>
                <select
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  className="select-field"
                >
                  {CITY_OPTIONS.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Work Mode</label>
                <select
                  value={form.workMode}
                  onChange={(event) => updateField("workMode", event.target.value)}
                  className="select-field"
                >
                  {WORK_MODE_OPTIONS.map((mode) => (
                    <option key={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Job Type</label>
                <select
                  value={form.jobType}
                  onChange={(event) => updateField("jobType", event.target.value)}
                  className="select-field"
                >
                  {JOB_TYPE_OPTIONS.map((jobType) => (
                    <option key={jobType}>{jobType}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold">Experience Level</label>
                <select
                  value={form.experienceLevel}
                  onChange={(event) => updateField("experienceLevel", event.target.value)}
                  className="select-field"
                >
                  {EXPERIENCE_LEVEL_OPTIONS.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Min Salary</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.salary.min}
                  onChange={(event) => updateSalary("min", event.target.value)}
                  className="field"
                  placeholder="800000"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Max Salary</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.salary.max}
                  onChange={(event) => updateSalary("max", event.target.value)}
                  className="field"
                  placeholder="1400000"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className="text-area"
                placeholder="Outline the role scope, team context, must-have qualifications, and success outcomes."
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Key Responsibilities
              </label>
              <textarea
                value={form.responsibilities}
                onChange={(event) => updateField("responsibilities", event.target.value)}
                className="text-area"
                placeholder={"Own feature delivery across web experiences\nCollaborate with design and backend teams\nImprove performance and code quality"}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Skills</label>
              <input
                type="text"
                value={form.skillsRequired}
                onChange={(event) => updateField("skillsRequired", event.target.value)}
                className="field"
                placeholder="React, TypeScript, Node.js"
              />
            </div>

            <button type="submit" disabled={submitting} className="primary-btn w-full">
              {submitting ? "Posting..." : "Post Job"}
            </button>
          </form>
        </section>
      </div>
    </ProtectedRoute>
  );
}
