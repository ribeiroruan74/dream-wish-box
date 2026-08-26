import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProfile } from "@/lib/profile-store";

export function RequireProfile({ children }: { children: ReactNode }) {
  const { profile, hydrated } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !profile) {
      navigate({ to: "/login" });
    }
  }, [hydrated, profile, navigate]);

  if (!hydrated || !profile) {
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
}
