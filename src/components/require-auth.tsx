import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <AppShell>{children}</AppShell>;
}
