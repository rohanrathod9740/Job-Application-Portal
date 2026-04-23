"use client";

function formatSalary(salary) {
  if (!salary || (salary.min === 0 && salary.max === 0)) {
    return "Compensation discussed during process";
  }

  if (salary.max === 0) {
    return `INR ${salary.min.toLocaleString()}+`;
  }

  return `INR ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
}

export default function JobCard({ job, onApply, showApplyButton = true }) {
  return (
    <article className="job-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-neutral">{job.jobType || "Full-time"}</span>
            <span className="badge badge-blue">{job.experienceLevel || "Mid Level"}</span>
          </div>
          <h2 className="mt-4 text-2xl font-black">{job.title}</h2>
          <p className="subtle-text mt-1 text-sm">{job.company}</p>
        </div>
        <span className={job.isOpen ? "badge badge-green" : "badge badge-neutral"}>
          {job.isOpen ? "Open" : "Closed"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-[var(--foreground)] sm:grid-cols-2">
        <div className="info-chip">
          <span className="subtle-text">City</span>
          <strong>{job.location || "Bangalore"}</strong>
        </div>
        <div className="info-chip">
          <span className="subtle-text">Mode</span>
          <strong>{job.workMode || "On-site"}</strong>
        </div>
        <div className="info-chip sm:col-span-2">
          <span className="subtle-text">Salary</span>
          <strong>{formatSalary(job.salary)}</strong>
        </div>
      </div>

      {job.skillsRequired?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {job.skillsRequired.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-pill">
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      {showApplyButton && job.isOpen ? (
        <button onClick={() => onApply(job)} className="primary-btn mt-6 w-full">
          Apply
        </button>
      ) : null}
    </article>
  );
}
