"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

const DEFAULT_REDIRECTS = {
  recruiter: "/recruiter-dashboard",
  user: "/dashboard",
};

export default function ProtectedRoute({
  allowedRoles,
  children,
  redirectTo = "/login",
}) {
  const router = useRouter();
  const { loading, token, role } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!token) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles?.length && !allowedRoles.includes(role)) {
      router.replace(DEFAULT_REDIRECTS[role] || "/");
    }
  }, [allowedRoles, loading, redirectTo, role, router, token]);

  if (loading) {
    return <Loader label="Checking your session..." />;
  }

  if (!token) {
    return <Loader label="Redirecting to login..." />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Loader label="Taking you to the right workspace..." />;
  }

  return children;
}
