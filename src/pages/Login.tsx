import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import logoFreela from "@/assets/logo-freela-new.png";
import { useToast } from "@/hooks/use-toast";
import { loginUser, apiFetch, SessionExpiredError } from "@/lib/api";
import { onAuthSuccess, getAuthUser } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { extractApiError } from "@/lib/api-error";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const API_BASE_URL = import.meta.env.API_BASE_URL;

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export async function detectUserRole(): Promise<"freelancer" | "contratante"> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/users/profiles`, {
      method: "GET",
    });

    if (response.status === 401) {
      throw new SessionExpiredError();
    }

    if (!response.ok) {
      return "freelancer";
    }

    const body = await response.json().catch(() => null);

    if (!body?.success || !body?.data) {
      return "freelancer";
    }

    const { activeRole } = body.data;

    if (activeRole === "contractor") {
      return "contratante";
    }
    if (activeRole === "provider") {
      return "freelancer";
    }

    return "freelancer";
  } catch (err) {
    if (err instanceof SessionExpiredError) {
      throw err;
    }
    return "freelancer";
  }
}

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { loginSuccess, isAuthenticated, isLoading: authLoading } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const userRole = localStorage.getItem("authUser");
      const role = userRole ? JSON.parse(userRole).role : "freelancer";
      navigate(role === "contratante" ? "/dashboard-contratante" : "/dashboard-freelancer", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await loginUser({ email: data.email.toLowerCase().trim(), password: data.password });
      onAuthSuccess(result.data);

      const authUser = getAuthUser();
      let userRole = authUser?.role;

      if (!userRole) {
        userRole = await detectUserRole();
      }

      const finalRole = userRole || "freelancer";
      
      if (!authUser?.id) {
        const tokenRaw = localStorage.getItem("authToken");
        if (tokenRaw) {
          const token = JSON.parse(tokenRaw);
          try {
            const decoded = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
            localStorage.setItem("authUser", JSON.stringify({ id: decoded.id, role: finalRole }));
          } catch {
            const userRes = await apiFetch(`${API_BASE_URL}/users/me`, { method: "GET" });
            if (userRes.ok) {
              const userBody = await userRes.json();
              if (userBody?.data?.id) {
                localStorage.setItem("authUser", JSON.stringify({ id: userBody.data.id, role: finalRole }));
              }
            }
          }
        }
      }

      loginSuccess(authUser?.id ?? "", finalRole);

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta à Freela.",
      });
      navigate(finalRole === "contratante" ? "/dashboard-contratante" : "/dashboard-freelancer");
    } catch (err: unknown) {
      toast({
        title: "Erro no login",
        description: extractApiError(err),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-card shadow-md border border-border hover:bg-muted transition-colors"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex-1 flex flex-col justify-center container-padding">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-block mb-8">
            <img src={logoFreela} alt="Freela Serviços" className="h-24" />
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">
              Entre na sua conta para continuar
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 h-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <div className="text-center mt-4">
                <Link
                  to="/esqueci-minha-senha"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </form>
          </Form>

          <p className="mt-8 text-center text-muted-foreground">
            Não tem uma conta?{" "}
            <Link to="/cadastro" className="text-primary font-semibold hover:underline">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <h2 className="text-3xl font-display font-bold text-secondary mb-4">
            Bom te ver de volta
          </h2>
          <p className="text-secondary/80 text-lg">
            Suas oportunidades e conexões estão te esperando. Entre e continue de onde parou.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
