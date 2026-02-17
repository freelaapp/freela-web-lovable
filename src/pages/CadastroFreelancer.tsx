import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, CalendarIcon, Music, Briefcase, CheckCircle } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import logoFreela from "@/assets/logo-freela.png";
import { useToast } from "@/hooks/use-toast";
import { servicosPF, estilosMusicais } from "@/lib/services";

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const maskCEP = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d)/, "$1-$2");
};

const CadastroFreelancer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState<Date>();
  const [servico, setServico] = useState("");
  const [estilosSelecionados, setEstilosSelecionados] = useState<string[]>([]);
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isMusician = servico === "musico" || servico.startsWith("musico-");

  const toggleEstilo = (id: string) => {
    setEstilosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!cpf.replace(/\D/g, "") || cpf.replace(/\D/g, "").length !== 11) e.cpf = "CPF inválido";
    if (!dataNascimento) e.dataNascimento = "Data de nascimento é obrigatória";
    else if (differenceInYears(new Date(), dataNascimento) < 18) e.dataNascimento = "Você deve ter pelo menos 18 anos";
    if (!servico) e.servico = "Selecione um serviço";
    if (isMusician && estilosSelecionados.length === 0) e.estilos = "Selecione pelo menos um estilo musical";
    if (!cep.replace(/\D/g, "")) e.cep = "CEP é obrigatório";
    if (!rua.trim()) e.rua = "Rua é obrigatória";
    if (!numero.trim()) e.numero = "Número é obrigatório";
    if (!bairro.trim()) e.bairro = "Bairro é obrigatório";
    if (!cidade.trim()) e.cidade = "Cidade é obrigatória";
    if (!estado) e.estado = "Estado é obrigatório";
    if (!acceptTerms) e.terms = "Você deve aceitar os termos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: "Cadastro realizado!", description: "Bem-vindo à Freela." });
      navigate("/dashboard-freelancer");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="max-w-lg">
          <Briefcase className="w-16 h-16 text-secondary mb-6" />
          <h2 className="text-3xl font-display font-bold text-secondary mb-4">Cadastro Freelancer</h2>
          <p className="text-secondary/80 text-lg mb-8">
            Faça parte da maior rede de profissionais para eventos e estabelecimentos do Brasil.
          </p>
          <ul className="space-y-3">
            {["Receba propostas na sua região", "Pagamento garantido", "Flexibilidade de horários", "Suporte dedicado"].map((item) => (
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
          <p className="text-muted-foreground mb-6">Complete seus dados profissionais</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* CPF */}
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} className={`h-12 ${errors.cpf ? "border-destructive" : ""}`} />
              {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full h-12 justify-start text-left font-normal", !dataNascimento && "text-muted-foreground", errors.dataNascimento && "border-destructive")}>
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

            {/* Serviço */}
            <div className="space-y-2">
              <Label>Tipo de serviço que você oferece</Label>
              <Select value={servico} onValueChange={setServico}>
                <SelectTrigger className={`h-12 ${errors.servico ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Selecione seu serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicosPF.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.servico && <p className="text-sm text-destructive">{errors.servico}</p>}
            </div>

            {/* Estilos musicais */}
            {isMusician && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  <Label>Estilos musicais que você toca</Label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {estilosMusicais.map((estilo) => {
                    const isSelected = estilosSelecionados.includes(estilo.id);
                    return (
                      <button
                        key={estilo.id}
                        type="button"
                        onClick={() => toggleEstilo(estilo.id)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                          isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {estilo.label}
                      </button>
                    );
                  })}
                </div>
                {errors.estilos && <p className="text-sm text-destructive">{errors.estilos}</p>}
              </div>
            )}

            {/* Endereço */}
            <div className="border-t border-border pt-5 mt-5 space-y-4">
              <h3 className="text-lg font-display font-semibold">Endereço</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input placeholder="00000-000" value={cep} onChange={(e) => setCep(maskCEP(e.target.value))} className={`h-12 ${errors.cep ? "border-destructive" : ""}`} />
                  {errors.cep && <p className="text-xs text-destructive">{errors.cep}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger className={`h-12 ${errors.estado ? "border-destructive" : ""}`}><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>{estadosBR.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.estado && <p className="text-xs text-destructive">{errors.estado}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rua</Label>
                <Input placeholder="Nome da rua" value={rua} onChange={(e) => setRua(e.target.value)} className={`h-12 ${errors.rua ? "border-destructive" : ""}`} />
                {errors.rua && <p className="text-xs text-destructive">{errors.rua}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input placeholder="Nº" value={numero} onChange={(e) => setNumero(e.target.value)} className={`h-12 ${errors.numero ? "border-destructive" : ""}`} />
                  {errors.numero && <p className="text-xs text-destructive">{errors.numero}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input placeholder="Apto, Bloco..." value={complemento} onChange={(e) => setComplemento(e.target.value)} className="h-12" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} className={`h-12 ${errors.bairro ? "border-destructive" : ""}`} />
                  {errors.bairro && <p className="text-xs text-destructive">{errors.bairro}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} className={`h-12 ${errors.cidade ? "border-destructive" : ""}`} />
                  {errors.cidade && <p className="text-xs text-destructive">{errors.cidade}</p>}
                </div>
              </div>
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
