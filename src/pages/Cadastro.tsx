import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from "lucide-react";
import logoFreela from "@/assets/logo-freela.png";
import { useToast } from "@/hooks/use-toast";

const Cadastro = () => {
  const [searchParams] = useSearchParams();
  const defaultTipo = searchParams.get("tipo") || "freelancer";
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    tipo: defaultTipo,
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

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo à Freela. Você já pode começar a usar a plataforma.",
      });
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-display font-bold text-secondary mb-6">
            Junte-se à maior comunidade de freelancers do Brasil
          </h2>
          <ul className="space-y-4">
            {[
              "Acesso a milhares de projetos",
              "Pagamento seguro e garantido",
              "Suporte especializado 24/7",
              "Sem taxas para se cadastrar",
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
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <img src={logoFreela} alt="Freela Serviços" className="h-12" />
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold mb-2">Criar conta</h1>
            <p className="text-muted-foreground">
              Preencha os dados abaixo para começar
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => handleChange("tipo", "freelancer")}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                formData.tipo === "freelancer"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sou Freelancer
            </button>
            <button
              type="button"
              onClick={() => handleChange("tipo", "cliente")}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                formData.tipo === "cliente"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sou Cliente
            </button>
          </div>

          {/* Form */}
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
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {passwordRequirements.map((req) => (
                    <div 
                      key={req.label} 
                      className={`flex items-center gap-2 text-xs ${
                        req.valid ? "text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${req.valid ? "text-green-600" : "text-muted-foreground/50"}`} />
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

            {/* Terms */}
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
                  <Link to="/termos" className="text-primary hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link to="/privacidade" className="text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                </Label>
              </div>
              {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
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
                  Criando conta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Criar conta
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-muted-foreground">
            Já possui cadastro?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Clique aqui!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
