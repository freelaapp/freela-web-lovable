import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  const { role: authRole } = useAuth();

  const role = useMemo(() => {
    if (contratantePaths.some(p => location.pathname.startsWith(p))) {
      return "contratante" as UserRole;
    }
    if (freelancerPaths.some(p => location.pathname.startsWith(p))) {
      return "freelancer" as UserRole;
    }
    if (authRole === "contratante" || authRole === "freelancer") {
      return authRole;
    }
    return "freelancer" as UserRole;
  }, [location.pathname, authRole]);

  return role;
};

export const setUserRole = (_role: UserRole) => {
};
