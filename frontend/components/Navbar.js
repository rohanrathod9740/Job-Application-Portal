"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = {
  admin: [
    { href: "/admin", label: "Admin" },
  ],
  recruiter: [
    { href: "/recruiter-dashboard", label: "Workspace" },
    { href: "/post-job", label: "Post Job" },
  ],
  user: [
    { href: "/jobs", label: "Jobs" },
    { href: "/dashboard", label: "Dashboard" },
  ],
};

export default function Navbar() {
  const router = useRouter();
  const { user, token, role, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const links = NAV_LINKS[role] || [];

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="page-wrap flex h-[76px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="brand-mark">
            JP
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--foreground)]">JobPortal</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {!loading && token
            ? links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
                >
                  {link.label}
                </Link>
              ))
            : null}

          {!loading && token ? (
            <div className="ml-2 flex items-center gap-3 rounded-full border border-[var(--border-soft)] bg-white/80 px-3 py-2 shadow-[var(--shadow-soft)] backdrop-blur">
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {user?.name || "Account"}
                </p>
                <p className="subtle-text text-xs capitalize">{role}</p>
              </div>
              <button onClick={handleLogout} className="primary-btn px-4 py-2 text-sm">
                Logout
              </button>
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link href="/login" className="ghost-btn px-4 py-2 text-sm font-semibold">
                Login
              </Link>
              <Link href="/register" className="primary-btn px-4 py-2 text-sm">
                Register
              </Link>
            </div>
          ) : null}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold md:hidden"
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--border)] bg-white md:hidden">
          <div className="page-wrap flex flex-col gap-3 py-4">
            {!loading && token ? (
              <>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-[var(--border)] px-4 py-3 font-semibold"
                  >
                    {link.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="primary-btn w-full text-sm">
                  Logout
                </button>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="secondary-btn w-full text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="primary-btn w-full text-sm"
                >
                  Register
                </Link>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
