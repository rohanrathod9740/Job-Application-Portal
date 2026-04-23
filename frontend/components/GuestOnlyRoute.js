"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

const DESTINATIONS = {
  recruiter: "/recruiter-dashboard",
  user: "/dashboard",
};

export default function GuestOnlyRoute({ children }) {
  const router = useRouter();
  const { loading, token, role } = useAuth();

  useEffect(() => {
    if (loading || !token) {
      return;
    }

    router.replace(DESTINATIONS[role] || "/");
  }, [loading, role, router, token]);

  if (loading) {
    return <Loader label="Preparing your sign-in experience..." />;
  }

  if (token) {
    return <Loader label="Taking you back to your workspace..." />;
  }

  return children;
}
