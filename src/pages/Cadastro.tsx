import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle, Phone } from "lucide-react";
import logoFreela from "@/assets/logo-freela.png";
import { useToast } from "@/hooks/use-toast";
import { generateEmailConfirmationCode } from "@/lib/api";

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    celular: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", valid: formData.password.length >= 8 },
    { label: "Uma letra maiúscula", valid: /[A-Z]/.test(formData.password) },
    { label: "Uma letra minúscula", valid: /[a-z]/.test(formData.password) },
    { label: "Um número", valid: /\d/.test(formData.password) },
    { label: "Um caractere especial", valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Digite um email válido";
    }

    if (!formData.celular) {
      newErrors.celular = "Celular é obrigatório";
    } else if (formData.celular.replace(/\D/g, "").length < 11) {
      newErrors.celular = "Digite um celular válido com DDD";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!passwordRequirements.every((r) => r.valid)) {
      newErrors.password = "Senha não atende os requisitos";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    if (!acceptTerms) {
      newErrors.terms = "Você deve aceitar os termos de uso";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Persistir dados para uso posterior em /users/register
    const pendingData = {
      name: formData.nome,
      email: formData.email,
      phoneNumber: formData.celular.replace(/\D/g, ""),
      password: formData.password,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("pendingRegisterData", JSON.stringify(pendingData));

    setIsLoading(true);
    try {
      await generateEmailConfirmationCode(formData.email);

      toast({
        title: "Código enviado!",
        description: "Verifique seu email para o código de confirmação.",
      });
      navigate("/confirmar-email");
    } catch (error: any) {
      const message =
        error instanceof TypeError
          ? "Falha de conexão. Verifique sua internet e tente novamente."
          : error.message || "Não foi possível enviar o código. Tente novamente.";

      toast({
        title: "Erro ao enviar código",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCelular = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleChange = (field: string, value: string) => {
    if (field === "celular") {
      value = formatCelular(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-card shadow-md border border-border hover:bg-muted transition-colors"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 sticky top-0 h-screen">
        <div className="max-w-lg">
          <h2 className="text-3xl font-display font-bold text-secondary mb-4">
            Junte-se à maior comunidade de freelancers do Brasil
          </h2>
          <p className="text-secondary/80 text-lg mb-8">
            Crie sua conta e comece a conectar-se com profissionais e oportunidades na sua região.
          </p>
          <ul className="space-y-4">
            {[
              "Cadastro rápido e 100% gratuito",
              "Contrate ou trabalhe com flexibilidade",
              "Pagamento seguro e garantido",
              "Suporte dedicado para você",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-secondary/90">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center container-padding py-12">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-block mb-8">
            <img src={logoFreela} alt="Freela Serviços" className="h-12" />
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold mb-2">Criar conta</h1>
            <p className="text-muted-foreground">Preencha os dados abaixo para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  className={`pl-10 h-12 ${errors.nome ? "border-destructive" : ""}`}
                />
              </div>
              {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`pl-10 h-12 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="celular">Celular</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="celular"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.celular}
                  onChange={(e) => handleChange("celular", e.target.value)}
                  className={`pl-10 h-12 ${errors.celular ? "border-destructive" : ""}`}
                />
              </div>
              {errors.celular && <p className="text-sm text-destructive">{errors.celular}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
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
              {formData.password && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-2 text-xs ${req.valid ? "text-success" : "text-muted-foreground"}`}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${req.valid ? "text-success" : "text-muted-foreground/50"}`} />
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className={`pl-10 pr-10 h-12 ${errors.confirmPassword ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal cursor-pointer">
                  Li e aceito os{" "}
                  <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>{" "}
                  e a{" "}
                  <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                </Label>
              </div>
              {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
            </div>

            <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Enviando código…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Criar conta
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground">
            Já possui cadastro?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Clique aqui!</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
