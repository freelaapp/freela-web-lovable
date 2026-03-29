import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { initializeAuth, logout as logoutUtil, getAuthUser, setUserRoleInStorage, refreshAuthToken } from "@/lib/auth";
import { registerSessionExpiredHandler } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { errorMessages } from "@/lib/error-messages";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  role: "freelancer" | "contratante" | null;
  setRole: (role: "freelancer" | "contratante" | null) => void;
  loginSuccess: (userId: string, role: "freelancer" | "contratante") => void;
  logout: () => void;
  recheckAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  role: null,
  setRole: () => {},
  loginSuccess: () => {},
  logout: () => {},
  recheckAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRoleState] = useState<"freelancer" | "contratante" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const navigateRef = useRef(navigate);
  const toastRef = useRef(toast);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const setRole = useCallback((newRole: "freelancer" | "contratante" | null) => {
    setRoleState(newRole);
    if (newRole) {
      setUserRoleInStorage(newRole);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const hadToken = !!localStorage.getItem("authToken");
    const valid = await initializeAuth();
    setIsAuthenticated(valid);
    const authUser = getAuthUser();
    setUserId(valid ? (authUser?.id ?? null) : null);
    setRoleState(valid ? (authUser?.role ?? null) : null);

    if (!valid && hadToken) {
      logoutUtil();
      const publicPaths = [
        "/", 
        "/login", 
        "/cadastro", 
        "/inicio", 
        "/esqueci-minha-senha",
        "/escolher-perfil",
        "/cadastro-contratante",
        "/cadastro-freelancer",
        "/confirmar-email",
        "/ajuda",
        "/ajuda-contratante",
      ];
      if (!publicPaths.includes(window.location.pathname)) {
        navigateRef.current("/login", { replace: true });
        toastRef.current({
          title: "Sessão expirada",
          description: errorMessages.sessionExpired,
          variant: "destructive",
        });
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      logoutUtil();
      setIsAuthenticated(false);
      setUserId(null);
      setRoleState(null);
      navigateRef.current("/login", { replace: true });
      toastRef.current({
        title: "Sessão expirada",
        description: errorMessages.sessionExpired,
        variant: "destructive",
      });
    });
  }, []);

  // Periodic token expiration check (every 60s)
  useEffect(() => {
    const interval = setInterval(() => {
      const expRaw = localStorage.getItem("authTokenExpirationTime");
      if (!expRaw) return;
      const exp = JSON.parse(expRaw);
      if (Date.now() >= exp) {
        // Token expired — try refresh, if fails logout
        refreshAuthToken().then((ok) => {
          if (!ok) {
            logoutUtil();
            setIsAuthenticated(false);
            setUserId(null);
            setRoleState(null);
            navigateRef.current("/login", { replace: true });
          }
        });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authUser" || e.key === "authToken") {
        const authUser = getAuthUser();
        setRoleState(authUser?.role ?? null);
        setUserId(authUser?.id ?? null);
        setIsAuthenticated(!!localStorage.getItem("authToken"));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = useCallback(() => {
    logoutUtil();
    setIsAuthenticated(false);
    setUserId(null);
    setRoleState(null);
    navigate("/", { replace: true });
  }, [navigate]);

  const handleLoginSuccess = useCallback((newUserId: string, newRole: "freelancer" | "contratante") => {
    setUserId(newUserId);
    setRoleState(newRole);
    setIsAuthenticated(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userId,
        role,
        setRole,
        loginSuccess: handleLoginSuccess,
        logout: handleLogout,
        recheckAuth: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
