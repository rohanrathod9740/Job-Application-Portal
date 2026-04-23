"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GuestOnlyRoute from "../../components/GuestOnlyRoute";
import { registerUser } from "../../utils/api";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user",
  companyName: "",
  companyEmail: "",
};

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await registerUser(form);

      if (
        response?.message?.includes("successfully") ||
        response?.message?.includes("created")
      ) {
        setSuccess(response.message);
        setTimeout(() => router.push("/login"), 1000);
        return;
      }

      setError(response?.message || "Unable to register.");
    } catch (requestError) {
      console.error("Registration error:", requestError);
      setError("Unable to register.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GuestOnlyRoute>
      <div className="app-shell flex items-center justify-center px-4 py-8">
        <section className="panel w-full max-w-lg rounded-[1.75rem] p-7 sm:p-8">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[var(--foreground)]">Register</h1>
            <p className="subtle-text mt-2 text-sm">Create your account</p>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-[rgba(220,38,38,0.14)] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-5 rounded-2xl border border-[rgba(15,118,110,0.14)] bg-[#ecfdf5] px-4 py-3 text-sm font-semibold text-[var(--success)]">
              {success}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "user", label: "Job Seeker" },
                { value: "recruiter", label: "Recruiter" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField("role", option.value)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    form.role === option.value
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                      : "border-[var(--border)] bg-white text-[var(--foreground)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="field"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="field"
                placeholder="Create a password"
                required
              />
            </div>

            {form.role === "recruiter" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(event) => updateField("companyName", event.target.value)}
                    className="field"
                    placeholder="Company"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Company email
                  </label>
                  <input
                    type="email"
                    value={form.companyEmail}
                    onChange={(event) => updateField("companyEmail", event.target.value)}
                    className="field"
                    placeholder="careers@company.com"
                    required
                  />
                </div>
              </div>
            ) : null}

            <button type="submit" disabled={submitting} className="primary-btn w-full">
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="subtle-text mt-5 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--foreground)]">
              Login
            </Link>
          </p>
        </section>
      </div>
    </GuestOnlyRoute>
  );
}
