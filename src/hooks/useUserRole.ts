import { useLocation } from "react-router-dom";
import { useMemo, useEffect } from "react";

export type UserRole = "freelancer" | "contratante";

const contratantePaths = [
  "/dashboard-contratante",
  "/criar-evento",
  "/evento",
  "/meus-dados-contratante",
  "/configuracoes-contratante",
  "/ajuda-contratante",
];

const freelancerPaths = [
  "/dashboard-freelancer",
  "/mapa-vagas",
];

export const useUserRole = (): UserRole => {
  const location = useLocation();

  const role = useMemo(() => {
    // If on an explicit contratante route, set and return
    if (contratantePaths.some(p => location.pathname.startsWith(p))) {
      return "contratante" as UserRole;
    }
    // If on an explicit freelancer route, set and return
    if (freelancerPaths.some(p => location.pathname.startsWith(p))) {
      return "freelancer" as UserRole;
    }
    // For shared routes, use persisted role
    const stored = localStorage.getItem("userRole");
    if (stored === "contratante" || stored === "freelancer") return stored;
    return "freelancer" as UserRole;
  }, [location.pathname]);

  // Persist role whenever it changes
  useEffect(() => {
    localStorage.setItem("userRole", role);
  }, [role]);

  return role;
};

export const setUserRole = (role: UserRole) => {
  localStorage.setItem("userRole", role);
};
