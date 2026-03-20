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

  // resolvedByRoute: true when the role was determined by an explicit route match.
  // false when it came from localStorage or the default fallback.
  const { role, resolvedByRoute } = useMemo(() => {
    if (contratantePaths.some(p => location.pathname.startsWith(p))) {
      return { role: "contratante" as UserRole, resolvedByRoute: true };
    }
    if (freelancerPaths.some(p => location.pathname.startsWith(p))) {
      return { role: "freelancer" as UserRole, resolvedByRoute: true };
    }
    // For shared routes, use persisted role without falling back to a default
    // that could overwrite the stored value of the other role.
    const stored = localStorage.getItem("userRole");
    if (stored === "contratante" || stored === "freelancer") {
      return { role: stored as UserRole, resolvedByRoute: false };
    }
    // No stored role — default to freelancer but do NOT persist this default
    return { role: "freelancer" as UserRole, resolvedByRoute: false };
  }, [location.pathname]);

  // Only persist when the role was inferred from an explicit route match.
  // Persisting the fallback "freelancer" would silently overwrite a contractor's
  // stored role when they visit a shared route (e.g. /perfil, /carteira).
  useEffect(() => {
    if (resolvedByRoute) {
      localStorage.setItem("userRole", role);
    }
  }, [role, resolvedByRoute]);

  return role;
};

export const setUserRole = (role: UserRole) => {
  localStorage.setItem("userRole", role);
};
