import { useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import logoFreela from "@/assets/logo-freela-new.png";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/lib/api";
import { z } from "zod";

// Schema only for the password step
const newPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha muito longa"),
});

type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [step, setStep] = useState<"code" | "password">("code");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "" },
  });

  // Code input handlers (same pattern as ConfirmarEmail)
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setCodeError("");
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pasted.split("").forEach((char, i) => {
      newCode[i] = char;
    });
    setCode(newCode);
    setCodeError("");
    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6 || !/^\d{6}$/.test(fullCode)) {
      setCodeError("Digite o código de 6 dígitos");
      return;
    }
    setStep("password");
  };

  const onPasswordSubmit = async (data: NewPasswordFormData) => {
    setIsLoading(true);
    try {
      await resetPassword({
        email: emailFromQuery,
        code: code.join(""),
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center container-padding relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-card shadow-md border border-border hover:bg-muted transition-colors"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="w-full max-w-md">
        <Link to="/" className="inline-block mb-8">
          <img src={logoFreela} alt="Freela Serviços" className="h-24" />
        </Link>

        {isSuccess ? (
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
        ) : step === "code" ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">Código de Recuperação</h1>
              <p className="text-muted-foreground">
                Digite o código de recuperação de senha que foi enviado no seu e-mail
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputsRef.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                ))}
              </div>

              {codeError && <p className="text-sm text-destructive text-center">{codeError}</p>}

              <Button type="submit" className="w-full h-12" size="lg">
                Enviar código
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">Redefinir senha</h1>
              <p className="text-muted-foreground">
                Digite sua nova senha no campo abaixo.
              </p>
            </div>

            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-5">
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
        )}

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
