import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import logoFreela from "@/assets/logo-freela-new.png";
import { useToast } from "@/hooks/use-toast";

const EsqueciMinhaSenha = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validateEmail = () => {
    if (!email) {
      setError("Email é obrigatório");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Digite um email válido");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada.",
      });
    }, 1500);
  };

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

        {/* Back Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para login
        </Link>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">Esqueceu sua senha?</h1>
              <p className="text-muted-foreground">
                Não se preocupe! Digite seu email e enviaremos instruções para 
                redefinir sua senha.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className={`pl-10 h-12 ${error ? "border-destructive" : ""}`}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Enviar instruções"
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
            <h2 className="text-2xl font-display font-bold mb-3">Verifique seu email</h2>
            <p className="text-muted-foreground mb-6">
              Enviamos as instruções de recuperação para{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Não recebeu o email? Verifique a pasta de spam ou{" "}
              <button 
                onClick={() => setIsSuccess(false)}
                className="text-primary hover:underline"
              >
                tente novamente
              </button>
            </p>
            <Button asChild className="w-full h-12" size="lg">
              <Link to="/login">Voltar para login</Link>
            </Button>
          </div>
        )}

        {/* Help */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Precisa de ajuda?{" "}
          <Link to="/contato" className="text-primary hover:underline">
            Fale conosco
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EsqueciMinhaSenha;
