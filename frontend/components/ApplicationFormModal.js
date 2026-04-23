"use client";

import { useMemo, useState } from "react";
import { CITY_OPTIONS, WORK_MODE_OPTIONS } from "../utils/jobOptions";

const EMPTY_FORM = () => ({
  personalInfo: {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    mobileNumber: "",
    emailAddress: "",
    address: "",
    nationality: "Indian",
    panOrAadhaar: "",
  },
  profilePreferences: {
    preferredLocation: "Bangalore",
    workMode: "Hybrid",
  },
  education: {
    highestQualification: "",
    college: "",
    yearOfPassing: "",
    score: "",
    certifications: "",
  },
  workExperience: {
    previousCompanies: "",
    roleDesignation: "",
    duration: "",
    responsibilities: "",
    skills: "",
    tools: "",
  },
  documents: {
    resume: null,
    coverLetter: "",
    certificates: [],
  },
  additionalQuestions: {
    whyThisJob: "",
    whyThisCompany: "",
    hasRelevantExperience: "Yes",
    canJoinInThirtyDays: "Yes",
    willingToRelocate: "Yes",
  },
});

const YES_NO_OPTIONS = ["Yes", "No"];

function readFileAsPayload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        content: typeof reader.result === "string" ? reader.result : "",
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ApplicationFormModal({
  open,
  job,
  onClose,
  onSubmit,
  submitting,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const resetAndClose = () => {
    setForm(EMPTY_FORM());
    setError("");
    onClose();
  };

  const updateGroupField = (group, field, value) => {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  };

  const completionStats = useMemo(() => {
    const requiredValues = [
      form.personalInfo.fullName,
      form.personalInfo.dateOfBirth,
      form.personalInfo.gender,
      form.personalInfo.mobileNumber,
      form.personalInfo.emailAddress,
      form.personalInfo.address,
      form.personalInfo.nationality,
      form.personalInfo.panOrAadhaar,
      form.profilePreferences.preferredLocation,
      form.profilePreferences.workMode,
      form.education.highestQualification,
      form.education.college,
      form.education.yearOfPassing,
      form.education.score,
      form.documents.resume?.name,
      form.additionalQuestions.whyThisJob,
      form.additionalQuestions.whyThisCompany,
    ];

    const completed = requiredValues.filter(Boolean).length;
    return Math.round((completed / requiredValues.length) * 100);
  }, [form]);

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/pdf|msword|officedocument/.test(file.type)) {
      setError("Upload resume in PDF or DOC/DOCX format.");
      return;
    }

    const payload = await readFileAsPayload(file);
    updateGroupField("documents", "resume", payload);
    setError("");
  };

  const handleCertificatesUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    const payloads = await Promise.all(files.map(readFileAsPayload));
    updateGroupField("documents", "certificates", payloads);
  };

  const removeCertificate = (indexToRemove) => {
    updateGroupField(
      "documents",
      "certificates",
      form.documents.certificates.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.documents.resume?.name) {
      setError("Resume upload is required.");
      return;
    }

    setError("");

    const success = await onSubmit({
      jobId: job?._id,
      personalInfo: form.personalInfo,
      profilePreferences: form.profilePreferences,
      education: form.education,
      workExperience: form.workExperience,
      documents: form.documents,
      additionalQuestions: form.additionalQuestions,
    });

    if (success) {
      setForm(EMPTY_FORM());
    }
  };

  if (!open || !job) {
    return null;
  }

  return (
    <div className="modal-shell">
      <div className="modal-backdrop" onClick={resetAndClose} />
      <section className="modal-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-soft)] pb-5">
          <div>
            <span className="eyebrow">Application form</span>
            <h2 className="mt-3 text-3xl font-black">{job.title}</h2>
            <p className="subtle-text mt-2 text-sm">
              {job.company} | {job.location} | {job.workMode}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
              {completionStats}% complete
            </div>
            <button type="button" onClick={resetAndClose} className="ghost-btn px-4 py-2">
              Close
            </button>
          </div>
        </div>

        {error ? <div className="alert-error mt-5">{error}</div> : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          <FormSection
            title="Personal Information"
            description="Basic identity and contact details used for the application."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledField label="Full Name" required>
                <input
                  className="field"
                  value={form.personalInfo.fullName}
                  onChange={(event) =>
                    updateGroupField("personalInfo", "fullName", event.target.value)
                  }
                  required
                />
              </LabeledField>
              <LabeledField label="Date of Birth" required>
                <input
                  type="date"
                  className="field"
                  value={form.personalInfo.dateOfBirth}
                  onChange={(event) =>
                    updateGroupField("personalInfo", "dateOfBirth", event.target.value)
                  }
                  required
                />
              </LabeledField>
              <LabeledField label="Gender" required>
                <select
                  className="select-field"
                  value={form.personalInfo.gender}
                  onChange={(event) =>
                    updateGroupField("personalInfo", "gender", event.target.value)
                  }
                  required
                >
                  <option value="">Select gender</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </LabeledField>
              <LabeledField label="Mobile Number" required>
                <input
                  className="field"
                  value={form.personalInfo.mobileNumber}
                  onChange={(event) =>
                    updateGroupField("personalInfo", "mobileNumber", event.target.value)
                  }
                  required
                />
              </LabeledField>
              <LabeledField label="Email Address" required>
                <input
                  type="email"
                  className="field"
                  value={form.personalInfo.emailAddress}
                  onChange={(event) =>
                    updateGroupField("personalInfo", "emailAddress", event.target.value)
                  }
                  required
                />
              </LabeledField>
              <LabeledField label="Nationality" required>
                <input
                  className="field"
                  value={form.personalInfo.nationality}
                  onChange={(event) =>
                    updateGroupField("personalInfo", "nationality", event.target.value)
                  }
                  required
                />
              </LabeledField>
            </div>
            <LabeledField label="Address" required>
              <textarea
                className="text-area min-h-[120px]"
                value={form.personalInfo.address}
                onChange={(event) =>
                  updateGroupField("personalInfo", "address", event.target.value)
                }
                required
              />
            </LabeledField>
            <LabeledField label="PAN / Aadhaar" required>
              <input
                className="field"
                value={form.personalInfo.panOrAadhaar}
                onChange={(event) =>
                  updateGroupField("personalInfo", "panOrAadhaar", event.target.value)
                }
                required
              />
            </LabeledField>
          </FormSection>

          <FormSection
            title="Preferences"
            description="Choose your preferred work setup."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledField label="Preferred Job Location" required>
                <select
                  className="select-field"
                  value={form.profilePreferences.preferredLocation}
                  onChange={(event) =>
                    updateGroupField(
                      "profilePreferences",
                      "preferredLocation",
                      event.target.value
                    )
                  }
                  required
                >
                  {CITY_OPTIONS.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </LabeledField>
              <LabeledField label="Work Mode" required>
                <select
                  className="select-field"
                  value={form.profilePreferences.workMode}
                  onChange={(event) =>
                    updateGroupField("profilePreferences", "workMode", event.target.value)
                  }
                  required
                >
                  {WORK_MODE_OPTIONS.map((mode) => (
                    <option key={mode}>{mode}</option>
                  ))}
                </select>
              </LabeledField>
            </div>
          </FormSection>

          <FormSection title="Education" description="Academic background and certifications.">
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledField label="Highest Qualification" required>
                <input
                  className="field"
                  value={form.education.highestQualification}
                  onChange={(event) =>
                    updateGroupField("education", "highestQualification", event.target.value)
                  }
                  required
                />
              </LabeledField>
              <LabeledField label="College / University" required>
                <input
                  className="field"
                  value={form.education.college}
                  onChange={(event) =>
                    updateGroupField("education", "college", event.target.value)
                  }
                  required
                />
              </LabeledField>
              <LabeledField label="Year of Passing" required>
                <input
                  className="field"
                  value={form.education.yearOfPassing}
                  onChange={(event) =>
                    updateGroupField("education", "yearOfPassing", event.target.value)
                  }
                  required
                />
              </LabeledField>
              <LabeledField label="CGPA / Percentage" required>
                <input
                  className="field"
                  value={form.education.score}
                  onChange={(event) =>
                    updateGroupField("education", "score", event.target.value)
                  }
                  required
                />
              </LabeledField>
            </div>
            <LabeledField label="Certifications / Courses">
              <textarea
                className="text-area min-h-[120px]"
                placeholder="AWS Cloud Practitioner, React Bootcamp, Data Structures..."
                value={form.education.certifications}
                onChange={(event) =>
                  updateGroupField("education", "certifications", event.target.value)
                }
              />
            </LabeledField>
          </FormSection>

          <FormSection
            title="Work Experience"
            description="Experience details, responsibilities, and capability summary."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledField label="Previous Companies">
                <input
                  className="field"
                  value={form.workExperience.previousCompanies}
                  onChange={(event) =>
                    updateGroupField(
                      "workExperience",
                      "previousCompanies",
                      event.target.value
                    )
                  }
                />
              </LabeledField>
              <LabeledField label="Role / Designation">
                <input
                  className="field"
                  value={form.workExperience.roleDesignation}
                  onChange={(event) =>
                    updateGroupField("workExperience", "roleDesignation", event.target.value)
                  }
                />
              </LabeledField>
              <LabeledField label="Duration">
                <input
                  className="field"
                  placeholder="e.g. 2 years 6 months"
                  value={form.workExperience.duration}
                  onChange={(event) =>
                    updateGroupField("workExperience", "duration", event.target.value)
                  }
                />
              </LabeledField>
              <LabeledField label="Skills">
                <input
                  className="field"
                  placeholder="React, Python, SQL"
                  value={form.workExperience.skills}
                  onChange={(event) =>
                    updateGroupField("workExperience", "skills", event.target.value)
                  }
                />
              </LabeledField>
              <LabeledField label="Tools">
                <input
                  className="field"
                  placeholder="Excel, SAP, Figma"
                  value={form.workExperience.tools}
                  onChange={(event) =>
                    updateGroupField("workExperience", "tools", event.target.value)
                  }
                />
              </LabeledField>
            </div>
            <LabeledField label="Key Responsibilities & Achievements">
              <textarea
                className="text-area min-h-[120px]"
                value={form.workExperience.responsibilities}
                onChange={(event) =>
                    updateGroupField("workExperience", "responsibilities", event.target.value)
                }
              />
            </LabeledField>
            <LabeledField label="Certificate Uploads">
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="field file:mr-4 file:rounded-full file:border-0 file:bg-[var(--surface-muted)] file:px-4 file:py-2 file:font-semibold"
                onChange={handleCertificatesUpload}
              />
            </LabeledField>
            {form.documents.certificates.length ? (
              <div className="space-y-2">
                {form.documents.certificates.map((certificate, index) => (
                  <div
                    key={`${certificate.name}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[1rem] border border-[var(--border-soft)] bg-white/85 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{certificate.name}</p>
                      <p className="subtle-text text-xs">
                        {certificate.type || "File"} |{" "}
                        {Math.max(1, Math.round((certificate.size || 0) / 1024))} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertificate(index)}
                      className="ghost-btn rounded-full border border-[var(--border-soft)] px-4 py-2 text-xs font-semibold text-[var(--foreground)]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </FormSection>

          <FormSection title="Documents" description="Upload the required candidate documents.">
            <LabeledField label="Resume Upload (PDF/DOC)" required>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="field file:mr-4 file:rounded-full file:border-0 file:bg-[var(--surface-muted)] file:px-4 file:py-2 file:font-semibold"
                onChange={handleResumeUpload}
                required
              />
              {form.documents.resume?.name ? (
                <p className="subtle-text mt-2 text-xs">{form.documents.resume.name}</p>
              ) : null}
            </LabeledField>
            <LabeledField label="Cover Letter (Optional)">
              <textarea
                className="text-area min-h-[120px]"
                value={form.documents.coverLetter}
                onChange={(event) =>
                  updateGroupField("documents", "coverLetter", event.target.value)
                }
              />
            </LabeledField>
          </FormSection>

          <FormSection
            title="Additional Questions"
            description="Recruiter screening questions for better fit and intent."
          >
            <LabeledField label="Why do you want this job?" required>
              <textarea
                className="text-area min-h-[120px]"
                value={form.additionalQuestions.whyThisJob}
                onChange={(event) =>
                  updateGroupField("additionalQuestions", "whyThisJob", event.target.value)
                }
                required
              />
            </LabeledField>
            <LabeledField label="Why this company?" required>
              <textarea
                className="text-area min-h-[120px]"
                value={form.additionalQuestions.whyThisCompany}
                onChange={(event) =>
                  updateGroupField("additionalQuestions", "whyThisCompany", event.target.value)
                }
                required
              />
            </LabeledField>
            <div className="grid gap-4 md:grid-cols-3">
              <ChoiceField
                label="Relevant experience?"
                value={form.additionalQuestions.hasRelevantExperience}
                onChange={(value) =>
                  updateGroupField("additionalQuestions", "hasRelevantExperience", value)
                }
              />
              <ChoiceField
                label="Can join within 30 days?"
                value={form.additionalQuestions.canJoinInThirtyDays}
                onChange={(value) =>
                  updateGroupField("additionalQuestions", "canJoinInThirtyDays", value)
                }
              />
              <ChoiceField
                label="Willing to relocate?"
                value={form.additionalQuestions.willingToRelocate}
                onChange={(value) =>
                  updateGroupField("additionalQuestions", "willingToRelocate", value)
                }
              />
            </div>
          </FormSection>

          <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/92 px-5 py-4 backdrop-blur">
            <p className="subtle-text text-sm">
              Review your entries carefully before sending your application.
            </p>
            <button type="submit" disabled={submitting} className="primary-btn px-6 py-3">
              {submitting ? "Submitting..." : "Apply Now"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FormSection({ title, description, children }) {
  return (
    <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-xl font-black">{title}</h3>
        <p className="subtle-text mt-1 text-sm">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function LabeledField({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
        {label}
        {required ? <span className="ml-1 text-[var(--danger)]">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function ChoiceField({ label, value, onChange }) {
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <div className="flex gap-2">
        {YES_NO_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={value === option ? "choice-pill active" : "choice-pill"}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
