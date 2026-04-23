"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GuestOnlyRoute from "../../components/GuestOnlyRoute";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../utils/api";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await loginUser(form);

      if (response?.token && response?.user) {
        login(response.user, response.token);
        router.push(
          response.user.role === "admin"
            ? "/admin"
            : response.user.role === "recruiter"
              ? "/recruiter-dashboard"
              : "/dashboard"
        );
        return;
      }

      setError(response?.message || "Unable to sign in.");
    } catch (requestError) {
      console.error("Login error:", requestError);
      setError("Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GuestOnlyRoute>
      <div className="app-shell flex items-center justify-center px-4 py-8">
        <section className="panel w-full max-w-md rounded-[1.75rem] p-7 sm:p-8">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[var(--foreground)]">Login</h1>
            <p className="subtle-text mt-2 text-sm">Access your workspace</p>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-[rgba(220,38,38,0.14)] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Role</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "user", label: "Job Seeker" },
                  { value: "recruiter", label: "Recruiter" },
                  { value: "admin", label: "Admin" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, role: option.value }))}
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
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
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
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                className="field"
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" disabled={submitting} className="primary-btn w-full">
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="subtle-text mt-5 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[var(--foreground)]">
              Register
            </Link>
          </p>
        </section>
      </div>
    </GuestOnlyRoute>
  );
}
