import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, Lock, Eye, EyeOff, RotateCcw, ShieldCheck, Check, CheckCircle2 } from "lucide-react";
import logoFreela from "@/assets/logo-freela-new.png";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword, resetPassword } from "@/lib/api";
import { extractApiError } from "@/lib/api-error";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const RESEND_COOLDOWN = 60;

const emailSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
});

const resetSchema = z
  .object({
    password: z
      .string()
      .min(6, "Mínimo 6 caracteres")
      .regex(/[A-Z]/, "Precisa de uma letra maiúscula")
      .regex(/[a-z]/, "Precisa de uma letra minúscula")
      .regex(/\d/, "Precisa de um número"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const getPasswordRequirements = (pwd: string) => [
  { label: "Mínimo 6 caracteres", met: pwd.length >= 6 },
  { label: "Uma letra maiúscula", met: /[A-Z]/.test(pwd) },
  { label: "Uma letra minúscula", met: /[a-z]/.test(pwd) },
  { label: "Um número", met: /\d/.test(pwd) },
];

type Step = "email" | "reset" | "success";

const EsqueciMinhaSenha = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [codeVerified, setCodeVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = resetForm.watch("password");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const startCooldown = useCallback(() => setCooldown(RESEND_COOLDOWN), []);

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      await forgotPassword({ email: data.email });
      setEmail(data.email);
      toast({
        title: "Código enviado!",
        description: "Verifique sua caixa de entrada.",
      });
      startCooldown();
      setStep("reset");
    } catch (err) {
      toast({
        title: "Erro",
        description: extractApiError(err),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await forgotPassword({ email });
      toast({ title: "Código reenviado!", description: "Verifique sua caixa de entrada." });
      startCooldown();
    } catch (err) {
      toast({
        title: "Erro",
        description: extractApiError(err),
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

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

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");
    const fullCode = code.join("");
    if (fullCode.length < 6 || !/^\d{6}$/.test(fullCode)) {
      setCodeError("Digite o código de 6 dígitos");
      return;
    }
    setCodeVerified(true);
  };

  const handleResetSubmit = async (data: ResetFormData) => {
    const fullCode = code.join("");

    setIsLoading(true);
    try {
      await resetPassword({
        email,
        code: fullCode,
        password: data.password,
      });
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi redefinida com sucesso.",
      });
      setStep("success");
    } catch (err) {
      toast({
        title: "Erro ao redefinir senha",
        description: extractApiError(err),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === "reset") {
      if (codeVerified) {
        setCodeVerified(false);
        return;
      }
      setStep("email");
    } else {
      navigate(-1);
    }
  };

  const stepNumber = step === "email" ? 1 : 2;

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

        {step !== "success" && (
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
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
                {s < 2 && (
                  <div className={`w-8 h-0.5 ${s < stepNumber ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {step === "email" && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">Esqueceu sua senha?</h1>
              <p className="text-muted-foreground">
                Digite seu email e enviaremos um código de recuperação.
              </p>
            </div>

            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-5">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="Digite seu email"
                            className="pl-10 h-12"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
            </Form>
          </>
        )}

        {step === "reset" && (
          <>
            <div className="mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-2 text-center">
                {codeVerified ? "Redefinir senha" : "Digite o código"}
              </h1>
              <p className="text-muted-foreground text-center">
                {codeVerified
                  ? "Crie uma nova senha para sua conta."
                  : <>Enviamos um código de 6 dígitos para <span className="font-medium text-foreground">{email}</span></>}
              </p>
            </div>

            {!codeVerified ? (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-2">
                  <FormLabel>Código de verificação</FormLabel>
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
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${codeError ? "border-destructive" : "border-border"}`}
                      />
                    ))}
                  </div>
                  {codeError && <p className="text-sm text-destructive text-center">{codeError}</p>}
                </div>

                <Button type="submit" className="w-full h-12" size="lg">
                  Verificar código
                </Button>
              </form>
            ) : (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Código: <strong className="text-foreground">{code.join("")}</strong></span>
                    <button
                      type="button"
                      onClick={() => setCodeVerified(false)}
                      className="text-primary hover:underline ml-1"
                    >
                      Alterar
                    </button>
                  </div>

                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Digite sua senha"
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
                        {password.length > 0 && (
                          <ul className="space-y-1 mt-2">
                            {getPasswordRequirements(password).map((req) => (
                              <li key={req.label} className="flex items-center gap-2 text-xs">
                                <Check className={`w-3.5 h-3.5 ${req.met ? "text-green-500" : "text-muted-foreground/40"}`} />
                                <span className={req.met ? "text-green-500" : "text-muted-foreground"}>{req.label}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              type={showConfirm ? "text" : "password"}
                              placeholder="Digite sua senha"
                              className="pl-10 pr-10 h-12"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
              </Form>
            )}

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

        {step === "success" && (
          <>
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-2">Senha redefinida!</h1>
              <p className="text-muted-foreground">
                Sua senha foi alterada com sucesso. Você já pode fazer login com a nova senha.
              </p>
            </div>

            <Link to="/login">
              <Button className="w-full h-12" size="lg">
                Ir para login
              </Button>
            </Link>
          </>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Precisa de ajuda?{" "}
          <Link to="/ajuda" className="text-primary hover:underline">
            Fale conosco
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EsqueciMinhaSenha;
