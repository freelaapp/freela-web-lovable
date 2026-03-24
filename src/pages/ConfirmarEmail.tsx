import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Mail, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { confirmEmail, generateEmailConfirmationCode, registerUser } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { onAuthSuccess } from "@/lib/auth";

const ConfirmarEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recheckAuth } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");
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
    setError("");
    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    const pending = localStorage.getItem("pendingRegisterData");
    if (!pending) {
      toast({ title: "Erro", description: "Dados de cadastro não encontrados. Volte para a tela de cadastro.", variant: "destructive" });
      return;
    }
    const { email } = JSON.parse(pending);
    setIsResending(true);
    try {
      await generateEmailConfirmationCode(email);
      toast({ title: "Código reenviado!", description: "Verifique sua caixa de entrada." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível reenviar o código.", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     const fullCode = code.join("");

     // 1) Validação local
     if (fullCode.length < 6 || !/^\d{6}$/.test(fullCode)) {
       setError("Digite o código de 6 dígitos");
       return;
     }

     // 2) Ler dados pendentes
     const pendingRaw = localStorage.getItem("pendingRegisterData");
     if (!pendingRaw) {
       setError("Dados de cadastro não encontrados. Volte para /cadastro.");
       return;
     }

     const pendingData = JSON.parse(pendingRaw);
     if (!pendingData.email) {
       setError("Dados de cadastro não encontrados. Volte para /cadastro.");
       return;
     }

     setIsLoading(true);
     setError("");

    try {
      // 3) Confirmar e-mail com o código digitado primeiro
      setLoadingMessage("Validando código...");
      await confirmEmail(pendingData.email, fullCode);

      // 4) Registrar usuário (POST /users/register) com dados pendentes
      setLoadingMessage("Criando conta...");
      const result = await registerUser(pendingData);
      onAuthSuccess(result.data);

      // 5) Limpar dados pendentes e navegar
      localStorage.removeItem("pendingRegisterData");
      await recheckAuth();
      navigate("/escolher-perfil");
    } catch (err: any) {
       const msg = err?.message || "";
       const message =
         err instanceof TypeError
           ? "Falha de conexão. Verifique sua internet e tente novamente."
           : msg || "Código inválido ou expirado. Tente novamente.";
       setError(message);
     } finally {
       setIsLoading(false);
       setLoadingMessage("");
     }
   };

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center container-padding py-12 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-card shadow-md border border-border hover:bg-muted transition-colors"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <img alt="Freela Serviços" className="h-14 mb-10" src="/lovable-uploads/8e9ea4aa-b6c7-49f5-9a45-b521e7f13075.png" />

      <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12 max-w-md w-full text-center border border-border">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-bold mb-3">Confirme seu email</h1>
        <p className="text-muted-foreground mb-8">
          Enviamos um código de 6 dígitos para o seu email. Digite-o abaixo para continuar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {loadingMessage}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Confirmar <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || isLoading}
          className="mt-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <RotateCcw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
          {isResending ? "Reenviando..." : "Reenviar código"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmarEmail;
