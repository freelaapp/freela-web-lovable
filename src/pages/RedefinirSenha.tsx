import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import logoFreela from "@/assets/logo-freela-new.png";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/lib/api";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations/reset-password.schema";

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";
  const codeFromQuery = searchParams.get("code") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromQuery,
      code: codeFromQuery,
      password: "",
    },
  });

  // Preencher email e código automaticamente da query
  useState(() => {
    if (emailFromQuery) setValue("email", emailFromQuery);
    if (codeFromQuery) setValue("code", codeFromQuery);
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      await resetPassword({
        email: data.email,
        code: data.code,
        password: data.password,
      });
      setIsSuccess(true);
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi redefinida com sucesso. Faça login para continuar.",
      });
      reset();
    } catch (err) {
      toast({
        title: "Erro ao redefinir senha",
        description: err instanceof Error ? err.message : "Código inválido ou expirado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!emailFromQuery && !codeFromQuery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center container-padding">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-display font-bold mb-4">_link de recuperação inválido</h1>
          <p className="text-muted-foreground mb-6">
            O link de redefinição de senha é inválido ou expirou. Solicite um novo código.
          </p>
          <Button asChild className="w-full h-12" size="lg">
            <Link to="/esqueci-minha-senha">Solicitar novo código</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center container-padding relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-card shadow-md border border-border hover:bg-muted transition-colors"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="inline-block mb-8">
          <img src={logoFreela} alt="Freela Serviços" className="h-24" />
        </Link>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">Redefinir senha</h1>
              <p className="text-muted-foreground">
                Digite sua nova senha nos campos abaixo.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email (readonly) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                    className="pl-10 h-12 bg-muted cursor-not-allowed"
                    readOnly
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              {/* Código (readonly) */}
              <div className="space-y-2">
                <Label htmlFor="code">Código de recuperação</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  {...register("code")}
                  className={`h-12 text-center text-2xl tracking-widest ${errors.code ? "border-destructive" : ""}`}
                  readOnly
                />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
              </div>

              {/* Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`pl-10 pr-10 h-12 ${errors.password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
              </div>

              <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Redefinindo...
                  </span>
                ) : (
                  "Redefinir senha"
                )}
              </Button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">Senha alterada!</h2>
            <p className="text-muted-foreground mb-6">
              Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
            </p>
            <Button asChild className="w-full h-12" size="lg">
              <Link to="/login">Ir para login</Link>
            </Button>
          </div>
        )}

        {/* Help */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Precisa de ajuda?{" "}
          <Link to="/ajuda" className="text-primary hover:underline">
            Fale conosco
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RedefinirSenha;