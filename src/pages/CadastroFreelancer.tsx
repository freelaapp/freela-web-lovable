import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, CalendarIcon, Briefcase, CheckCircle, Camera, X, User } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import logoFreela from "@/assets/logo-freela.png";
import { useToast } from "@/hooks/use-toast";

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const areasAtuacao = [
  { id: "garcom", label: "Garçom" },
  { id: "bartender", label: "Bartender" },
  { id: "cozinheiro", label: "Cozinheiro(a)" },
  { id: "auxiliar-cozinha", label: "Auxiliar de Cozinha" },
  { id: "recepcao", label: "Recepção" },
  { id: "caixa", label: "Caixa" },
  { id: "churrasqueiro", label: "Churrasqueiro" },
  { id: "copeira", label: "Copeira" },
  { id: "recreacao-infantil", label: "Recreação Infantil" },
  { id: "musica-ao-vivo", label: "Música ao Vivo" },
  { id: "dj", label: "DJ" },
  { id: "barista", label: "Barista" },
  { id: "seguranca", label: "Segurança" },
  { id: "hostess", label: "Hostess" },
  { id: "manobrista", label: "Manobrista" },
  { id: "camareira", label: "Camareira" },
  { id: "auxiliar-limpeza", label: "Auxiliar de Limpeza" },
  { id: "chapeiro", label: "Chapeiro(a)" },
  { id: "cumim", label: "Cumim" },
];

const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const CadastroFreelancer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState<Date>();
  const [sexo, setSexo] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const previewFoto = useMemo(() => fotoPerfil ? URL.createObjectURL(fotoPerfil) : null, [fotoPerfil]);

  const toggleArea = (id: string) => {
    setAreasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fotoPerfil) e.fotoPerfil = "Foto de perfil é obrigatória";
    if (!nomeCompleto.trim() || nomeCompleto.trim().length < 3) e.nomeCompleto = "Nome completo é obrigatório (mínimo 3 caracteres)";
    if (!cpf.replace(/\D/g, "") || cpf.replace(/\D/g, "").length !== 11) e.cpf = "CPF inválido";
    if (!dataNascimento) e.dataNascimento = "Data de nascimento é obrigatória";
    else if (differenceInYears(new Date(), dataNascimento) < 18) e.dataNascimento = "Você deve ter pelo menos 18 anos";
    if (!sexo) e.sexo = "Sexo é obrigatório";
    if (!endereco.trim()) e.endereco = "Endereço é obrigatório";
    if (!cidade.trim()) e.cidade = "Cidade é obrigatória";
    if (!estado) e.estado = "Estado é obrigatório";
    if (areasSelecionadas.length === 0) e.areas = "Selecione pelo menos uma área de atuação";
    if (!acceptTerms) e.terms = "Você deve aceitar os termos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: "Cadastro realizado!", description: "Bem-vindo à Freela." });
      navigate("/video-apresentacao");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="max-w-lg">
          <Briefcase className="w-16 h-16 text-secondary mb-6" />
          <h2 className="text-3xl font-display font-bold text-secondary mb-4">Trabalhe com liberdade</h2>
          <p className="text-secondary/80 text-lg mb-8">
            Cadastre-se e receba oportunidades de trabalho em eventos, bares, restaurantes e festas na sua região.
          </p>
          <ul className="space-y-3">
            {[
              "Vagas compatíveis com seu perfil automaticamente",
              "Você escolhe quando e onde trabalhar",
              "Pagamento garantido após o serviço",
              "Avaliações que valorizam seu trabalho",
              "Suporte dedicado ao freelancer",
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
      <div className="flex-1 flex flex-col justify-start container-padding py-12 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto">
          <Link to="/" className="inline-block mb-8">
            <img src={logoFreela} alt="Freela Serviços" className="h-12" />
          </Link>

          <h1 className="text-3xl font-display font-bold mb-2">Cadastro Freelancer</h1>
          <p className="text-muted-foreground mb-8">Complete seus dados para começar a trabalhar</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ===== Seção 1 - Informações Pessoais ===== */}
            <div className="space-y-5">
              <h3 className="text-lg font-display font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informações Pessoais
              </h3>

              {/* Foto de Perfil */}
              <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                  {previewFoto ? (
                    <div className="relative">
                      <img src={previewFoto} alt="Foto de perfil" className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
                      <button
                        type="button"
                        onClick={() => setFotoPerfil(null)}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className={`w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${errors.fotoPerfil ? "border-destructive" : "border-border"}`}>
                      <Camera className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Adicionar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type.startsWith("image/")) setFotoPerfil(file);
                        }}
                      />
                    </label>
                  )}
                  <p className="text-sm text-muted-foreground">Escolha uma foto profissional e com boa iluminação.</p>
                </div>
                {errors.fotoPerfil && <p className="text-sm text-destructive">{errors.fotoPerfil}</p>}
              </div>

              {/* Nome Completo */}
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  placeholder="Seu nome completo"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className={`h-12 ${errors.nomeCompleto ? "border-destructive" : ""}`}
                />
                {errors.nomeCompleto && <p className="text-sm text-destructive">{errors.nomeCompleto}</p>}
              </div>

              {/* CPF */}
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(maskCPF(e.target.value))}
                  className={`h-12 ${errors.cpf ? "border-destructive" : ""}`}
                />
                <p className="text-xs text-muted-foreground italic">
                  Seu CPF só será visível para o contratante após a confirmação da contratação de uma vaga.
                </p>
                {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !dataNascimento && "text-muted-foreground",
                        errors.dataNascimento && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataNascimento ? format(dataNascimento, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataNascimento}
                      onSelect={setDataNascimento}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      captionLayout="dropdown-buttons"
                      fromYear={1940}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dataNascimento && <p className="text-sm text-destructive">{errors.dataNascimento}</p>}
              </div>

              {/* Sexo */}
              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select value={sexo} onValueChange={setSexo}>
                  <SelectTrigger className={`h-12 ${errors.sexo ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="prefiro-nao-dizer">Prefiro não dizer</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sexo && <p className="text-sm text-destructive">{errors.sexo}</p>}
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  placeholder="Rua, número, complemento"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className={`h-12 ${errors.endereco ? "border-destructive" : ""}`}
                />
                {errors.endereco && <p className="text-sm text-destructive">{errors.endereco}</p>}
              </div>

              {/* Cidade + Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className={`h-12 ${errors.cidade ? "border-destructive" : ""}`}
                  />
                  {errors.cidade && <p className="text-xs text-destructive">{errors.cidade}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger className={`h-12 ${errors.estado ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBR.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.estado && <p className="text-xs text-destructive">{errors.estado}</p>}
                </div>
              </div>
            </div>

            {/* ===== Seção 2 - Áreas de Atuação ===== */}
            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-1">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Áreas de Atuação
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione todas as áreas em que você atua. Isso ajudará a encontrar vagas compatíveis na sua região.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {areasAtuacao.map((area) => {
                  const isSelected = areasSelecionadas.includes(area.id);
                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => toggleArea(area.id)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {area.label}
                    </button>
                  );
                })}
              </div>
              {errors.areas && <p className="text-sm text-destructive">{errors.areas}</p>}

              {/* Tags selecionadas preview */}
              {areasSelecionadas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Suas tags de perfil:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {areasSelecionadas.map((id) => {
                      const area = areasAtuacao.find((a) => a.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20"
                        >
                          {area?.label}
                          <button type="button" onClick={() => toggleArea(id)} className="hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Termos */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(c) => setAcceptTerms(c as boolean)} className="mt-0.5" />
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
                  Cadastrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">Cadastrar-se <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CadastroFreelancer;
