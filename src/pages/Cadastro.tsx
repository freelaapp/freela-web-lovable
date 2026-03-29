import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle, Phone } from "lucide-react";
import logoFreela from "@/assets/logo-freela-new.png";
import { useToast } from "@/hooks/use-toast";
import { generateEmailConfirmationCode } from "@/lib/api";
import { extractApiError } from "@/lib/api-error";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const cadastroSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  celular: z
    .string()
    .min(1, "Celular é obrigatório")
    .refine((v) => v.replace(/\D/g, "").length >= 11, "Celular inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Precisa de uma letra maiúscula")
    .regex(/[a-z]/, "Precisa de uma letra minúscula")
    .regex(/\d/, "Precisa de um número")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Precisa de um caractere especial"),
  confirmPassword: z.string().min(1, "Confirme sua senha"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Aceite os termos de uso" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

const formatCelular = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const Cadastro = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: "",
      email: "",
      celular: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as true,
    },
  });

  const password = form.watch("password");

  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Uma letra maiúscula", valid: /[A-Z]/.test(password) },
    { label: "Uma letra minúscula", valid: /[a-z]/.test(password) },
    { label: "Um número", valid: /\d/.test(password) },
    { label: "Um caractere especial", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const onSubmit = async (data: CadastroFormData) => {
    const emailNormalizado = data.email.toLowerCase().trim();
    const pendingData = {
      name: data.nome,
      email: emailNormalizado,
      phoneNumber: data.celular.replace(/\D/g, ""),
      password: data.password,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setIsLoading(true);
    try {
      await generateEmailConfirmationCode(emailNormalizado);
      localStorage.setItem("pendingRegisterData", JSON.stringify(pendingData));
      navigate("/confirmar-email");
    } catch (err) {
      toast({
        title: "Erro ao criar conta",
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

      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 sticky top-0 h-screen">
        <div className="max-w-lg">
          <h2 className="text-3xl font-display font-bold text-secondary mb-4">
            Junte-se à comunidade Freela
          </h2>
          <p className="text-secondary/80 text-lg mb-8">
            Conecte-se a pessoas e oportunidades na sua região. Uma plataforma criada para facilitar a conexão entre quem quer trabalhar e quem precisa de ajuda de forma simples, rápida e segura.
          </p>
          <ul className="space-y-4">
            {[
              "Cadastro rápido e 100% gratuito",
              "Tenha acesso a avaliações e histórico dos profissionais",
              "Conecte-se a oportunidades ou profissionais próximos de você",
              "Flexibilidade para trabalhar ou contratar quando precisar",
              "Contratação rápida e sem burocracia",
              "Suporte dedicado para ajudar sempre que necessário",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-secondary/90">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center container-padding py-12">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-block mb-8">
            <img src={logoFreela} alt="Freela Serviços" className="h-24" />
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold mb-2">Criar conta</h1>
            <p className="text-muted-foreground">Preencha os dados abaixo para começar</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input placeholder="Seu nome" className="pl-10 h-12" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="celular"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="(11) 99999-9999"
                          className="pl-10 h-12"
                          {...field}
                          onChange={(e) => field.onChange(formatCelular(e.target.value))}
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
                    {password && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {passwordRequirements.map((req) => (
                          <div
                            key={req.label}
                            className={`flex items-center gap-2 text-xs ${req.valid ? "text-success" : "text-muted-foreground"}`}
                          >
                            <CheckCircle
                              className={`w-3.5 h-3.5 ${req.valid ? "text-success" : "text-muted-foreground/50"}`}
                            />
                            {req.label}
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-muted-foreground font-normal cursor-pointer">
                        Li e aceito os{" "}
                        <Link to="/termos" className="text-primary hover:underline">
                          Termos de Uso
                        </Link>{" "}
                        e a{" "}
                        <Link to="/privacidade" className="text-primary hover:underline">
                          Política de Privacidade
                        </Link>
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          </Form>

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
