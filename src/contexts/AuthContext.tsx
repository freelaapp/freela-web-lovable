import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { initializeAuth, logout as logoutUtil, getAuthUser } from "@/lib/auth";
import { registerSessionExpiredHandler } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  role: "freelancer" | "contratante" | null;
  /**
   * @deprecated Prefira `loginSuccess()` para login/cadastro ou `recheckAuth()` para sincronizar
   * após operações externas. Uso direto de `setRole` pode desincronizar `isAuthenticated` e `userId`.
   * Mantido apenas para troca de role em perfis com múltiplos roles (ex: Perfil.tsx/switchRole).
   */
  setRole: (role: "freelancer" | "contratante" | null) => void;
  /** Atualiza o estado de autenticação atomicamente após um login bem-sucedido */
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
  const [role, setRole] = useState<"freelancer" | "contratante" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stable refs to avoid stale closures without re-creating checkAuth
  const navigateRef = useRef(navigate);
  const toastRef = useRef(toast);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const hadToken = !!localStorage.getItem("authToken");
    const valid = await initializeAuth();
    setIsAuthenticated(valid);
    const authUser = getAuthUser();
    setUserId(valid ? (authUser?.id ?? null) : null);
    setRole(valid ? (authUser?.role ?? null) : null);

    if (!valid && hadToken) {
      logoutUtil();
      // Não redirecionar/exibir alerta se o usuário já estiver em rotas públicas (como cadastro, login)
      const publicPaths = [
        "/", 
        "/login", 
        "/cadastro", 
        "/inicio", 
        "/esqueci-minha-senha",
        "/escolher-perfil",
        "/cadastro-contratante",
        "/cadastro-freelancer",
        "/confirmar-email"
      ];
      if (!publicPaths.includes(window.location.pathname)) {
        navigateRef.current("/", { replace: true });
        toastRef.current({
          title: "Sessão expirada",
          description: "Seu login expirou. Faça login novamente para continuar.",
          variant: "destructive",
        });
      }
    }
    setIsLoading(false);
  }, []); // stable — no external deps needed thanks to refs

  // Register the global session-expired handler so apiFetch() can
  // trigger logout + redirect when any authenticated call gets a 401
  // that couldn't be recovered via refresh.
  useEffect(() => {
    registerSessionExpiredHandler(() => {
      logoutUtil();
      setIsAuthenticated(false);
      setUserId(null);
      setRole(null);
      navigateRef.current("/", { replace: true });
      toastRef.current({
        title: "Sessão expirada",
        description: "Seu login expirou. Faça login novamente para continuar.",
        variant: "destructive",
      });
    });
  }, []);

  // Run only on mount — route changes do NOT require re-validating the token.
  // The token expiry is already checked lazily inside initializeAuth() when
  // protected pages make authenticated API calls. Re-checking on every
  // navigation was causing false "session expired" logouts whenever the
  // refresh endpoint was temporarily unreachable.
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = useCallback(() => {
    logoutUtil();
    setIsAuthenticated(false);
    setUserId(null);
    setRole(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  /** Atualiza o estado de autenticação atomicamente após login bem-sucedido.
   *  Evita a necessidade de re-executar checkAuth() e elimina a janela
   *  onde isAuthenticated permanece false após o navigate(). */
  const handleLoginSuccess = useCallback((newUserId: string, newRole: "freelancer" | "contratante") => {
    setUserId(newUserId);
    setRole(newRole);
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
