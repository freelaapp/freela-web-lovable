import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Lock, Eye, EyeOff, RotateCcw, ShieldCheck } from "lucide-react";
import logoFreela from "@/assets/logo-freela-new.png";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword, resetPassword } from "@/lib/api";

const RESEND_COOLDOWN = 60;

type Step = "email" | "code" | "password";

const EsqueciMinhaSenha = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Code step
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Password step
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const startCooldown = useCallback(() => setCooldown(RESEND_COOLDOWN), []);

  // Step 1: Email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Digite um email válido");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword({ email });
      toast({
        title: "Código enviado!",
        description: "Verifique sua caixa de entrada.",
      });
      startCooldown();
      setStep("code");
    } catch (err) {
      setEmailError(
        err instanceof Error ? err.message : "Erro ao verificar email. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    setIsResending(true);
    try {
      await forgotPassword({ email });
      toast({ title: "Código reenviado!", description: "Verifique sua caixa de entrada." });
      startCooldown();
    } catch {
      toast({ title: "Erro", description: "Não foi possível reenviar o código.", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  // Code input handlers
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setCodeError("");
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
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

  // Step 2: Code submit
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6 || !/^\d{6}$/.test(fullCode)) {
      setCodeError("Digite o código de 6 dígitos");
      return;
    }
    setStep("password");
  };

  // Step 3: Password reset
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        email,
        code: code.join(""),
        password,
      });
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi redefinida com sucesso.",
      });
      navigate("/login");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Erro ao redefinir senha. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === "code") {
      setStep("email");
    } else if (step === "password") {
      setStep("code");
    } else {
      navigate(-1);
    }
  };

  const stepNumber = step === "email" ? 1 : step === "code" ? 2 : 3;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center container-padding relative">
      <button
        onClick={goBack}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-card shadow-md border border-border hover:bg-muted transition-colors"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="w-full max-w-md">
        <Link to="/" className="inline-block mb-8">
          <img src={logoFreela} alt="Freela Serviços" className="h-24" />
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  s <= stepNumber
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-8 h-0.5 ${s < stepNumber ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* STEP 1: Email */}
        {step === "email" && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">Esqueceu sua senha?</h1>
              <p className="text-muted-foreground">
                Digite seu email e enviaremos um código de recuperação.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    className={`pl-10 h-12 ${emailError ? "border-destructive" : ""}`}
                  />
                </div>
                {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              </div>

              <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  "Enviar código"
                )}
              </Button>
            </form>
          </>
        )}

        {/* STEP 2: Code */}
        {step === "code" && (
          <>
            <div className="mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-2 text-center">Digite o código</h1>
              <p className="text-muted-foreground text-center">
                Enviamos um código de 6 dígitos para{" "}
                <span className="font-medium text-foreground">{email}</span>
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
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={index === 0 ? handleCodePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                ))}
              </div>

              {codeError && <p className="text-sm text-destructive text-center">{codeError}</p>}

              <Button type="submit" className="w-full h-12" size="lg">
                Verificar código
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Não encontrou o código? Verifique também sua caixa de <strong>Spam</strong> e <strong>Lixeira</strong>.
            </p>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || cooldown > 0}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                {isResending
                  ? "Reenviando..."
                  : cooldown > 0
                    ? `Reenviar código em ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")}`
                    : "Reenviar código"}
              </button>
            </div>
          </>
        )}

        {/* STEP 3: New password */}
        {step === "password" && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">Redefinir senha</h1>
              <p className="text-muted-foreground">
                Crie uma nova senha para sua conta.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                    className={`pl-10 pr-10 h-12 ${passwordError ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                    className={`pl-10 pr-10 h-12 ${passwordError ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}

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

export default EsqueciMinhaSenha;
