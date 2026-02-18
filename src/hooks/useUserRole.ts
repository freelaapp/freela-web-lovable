import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export type UserRole = "freelancer" | "contratante";

const contratantePaths = [
  "/dashboard-contratante",
  "/criar-evento",
];

export const useUserRole = (): UserRole => {
  const location = useLocation();

  return useMemo(() => {
    // Check localStorage for persisted role
    const stored = localStorage.getItem("userRole");
    if (stored === "contratante" || stored === "freelancer") return stored;

    // Fallback: infer from current route
    if (contratantePaths.some(p => location.pathname.startsWith(p))) {
      return "contratante";
    }
    return "freelancer";
  }, [location.pathname]);
};

export const setUserRole = (role: UserRole) => {
  localStorage.setItem("userRole", role);
};
