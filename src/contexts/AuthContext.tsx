import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initializeAuth, logout as logoutUtil, getAuthUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  logout: () => void;
  recheckAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  logout: () => {},
  recheckAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const hadToken = !!localStorage.getItem("authToken");
    const valid = await initializeAuth();
    setIsAuthenticated(valid);
    setUserId(valid ? (getAuthUser()?.id ?? null) : null);

    if (!valid && hadToken) {
      logoutUtil();
      navigate("/", { replace: true });
      toast({
        title: "Sessão expirada",
        description: "Seu login expirou. Faça login novamente para continuar.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [navigate, toast]);

  // Run on mount and on every route change
  useEffect(() => {
    checkAuth();
  }, [location.pathname, checkAuth]);

  const handleLogout = useCallback(() => {
    logoutUtil();
    setIsAuthenticated(false);
    setUserId(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userId,
        logout: handleLogout,
        recheckAuth: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
