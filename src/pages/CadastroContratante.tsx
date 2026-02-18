import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, ArrowLeft, CalendarIcon, Upload, X, Home, Building2 } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import logoFreela from "@/assets/logo-freela.png";
import { useToast } from "@/hooks/use-toast";

const ramosEstabelecimento = [
  "Bar", "Restaurante", "Hotel", "Buffet", "Casa de Eventos", "Pub", "Balada", "Clube", "Resort", "Outro",
];

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const maskCNPJ = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
};

const maskCEP = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d)/, "$1-$2");
};

const CadastroContratante = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [modo, setModo] = useState<"casa" | "empresa">("casa");
  const [cnpj, setCnpj] = useState("");
  const [tipoDoc, setTipoDoc] = useState<"cpf" | "cnpj">("cpf");
  const [documento, setDocumento] = useState("");
  const [nomeOuRazao, setNomeOuRazao] = useState("");
  const [dataNascimento, setDataNascimento] = useState<Date>();
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [ramo, setRamo] = useState("");
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [fotoFachada, setFotoFachada] = useState<File | null>(null);
  const [fotoAmbiente, setFotoAmbiente] = useState<File | null>(null);
  const [fotosExtras, setFotosExtras] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const previewFachada = useMemo(() => fotoFachada ? URL.createObjectURL(fotoFachada) : null, [fotoFachada]);
  const previewAmbiente = useMemo(() => fotoAmbiente ? URL.createObjectURL(fotoAmbiente) : null, [fotoAmbiente]);
  const previewExtras = useMemo(() => fotosExtras.map((f) => URL.createObjectURL(f)), [fotosExtras]);

  const isCasaCPF = modo === "casa" && tipoDoc === "cpf";

  const validate = () => {
    const e: Record<string, string> = {};
    if (modo === "empresa") {
      if (!cnpj.replace(/\D/g, "") || cnpj.replace(/\D/g, "").length !== 14) e.cnpj = "CNPJ inválido";
      if (!nomeOuRazao.trim()) e.nomeOuRazao = "Razão Social é obrigatória";
    } else {
      if (!documento.replace(/\D/g, "")) e.documento = "Documento é obrigatório";
      else if (tipoDoc === "cpf" && documento.replace(/\D/g, "").length !== 11) e.documento = "CPF inválido";
      else if (tipoDoc === "cnpj" && documento.replace(/\D/g, "").length !== 14) e.documento = "CNPJ inválido";
      if (!nomeOuRazao.trim()) e.nomeOuRazao = tipoDoc === "cnpj" ? "Razão Social é obrigatória" : "Nome Completo é obrigatório";
      if (isCasaCPF) {
        if (!dataNascimento) e.dataNascimento = "Data de nascimento é obrigatória";
        else if (differenceInYears(new Date(), dataNascimento) < 18) e.dataNascimento = "Você deve ter pelo menos 18 anos";
      }
    }
    if (!cep.replace(/\D/g, "")) e.cep = "CEP é obrigatório";
    if (!rua.trim()) e.rua = "Rua é obrigatória";
    if (!numero.trim()) e.numero = "Número é obrigatório";
    if (!bairro.trim()) e.bairro = "Bairro é obrigatório";
    if (!cidade.trim()) e.cidade = "Cidade é obrigatória";
    if (!estado) e.estado = "Estado é obrigatório";
    if (modo === "empresa") {
      if (!ramo) e.ramo = "Ramo é obrigatório";
      if (!nomeEstabelecimento.trim()) e.nomeEstabelecimento = "Nome do estabelecimento é obrigatório";
      if (!fotoFachada) e.fotoFachada = "Foto da fachada é obrigatória";
      if (!fotoAmbiente) e.fotoAmbiente = "Foto do ambiente interno é obrigatória";
    }
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
      navigate("/dashboard-contratante");
    }, 1500);
  };

  const handleFileChange = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) setter(file);
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

      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-start container-padding py-12 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto">
          <Link to="/" className="inline-block mb-8">
            <img src={logoFreela} alt="Freela Serviços" className="h-12" />
          </Link>

          <h1 className="text-3xl font-display font-bold mb-2">Cadastro Contratante</h1>
          <p className="text-muted-foreground mb-6">Complete seus dados para começar a contratar</p>

          {/* Switch Casa / Empresa */}
          <div className="flex gap-2 mb-8 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setModo("casa")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                modo === "casa" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="w-4 h-4" /> Freela em Casa
            </button>
            <button
              type="button"
              onClick={() => setModo("empresa")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                modo === "empresa" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" /> Freela para Empresas
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {modo === "empresa" ? (
              <>
                {/* CNPJ - Empresas */}
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                    className={`h-12 ${errors.cnpj ? "border-destructive" : ""}`}
                  />
                  {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj}</p>}
                </div>

                {/* Razão Social */}
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input
                    placeholder="Razão Social da empresa"
                    value={nomeOuRazao}
                    onChange={(e) => setNomeOuRazao(e.target.value)}
                    className={`h-12 ${errors.nomeOuRazao ? "border-destructive" : ""}`}
                  />
                  {errors.nomeOuRazao && <p className="text-sm text-destructive">{errors.nomeOuRazao}</p>}
                </div>
              </>
            ) : (
              <>
                {/* Tipo de Documento - Casa */}
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select value={tipoDoc} onValueChange={(v) => { setTipoDoc(v as "cpf" | "cnpj"); setDocumento(""); setNomeOuRazao(""); }}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Documento */}
                <div className="space-y-2">
                  <Label>{tipoDoc === "cpf" ? "CPF" : "CNPJ"}</Label>
                  <Input
                    placeholder={tipoDoc === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                    value={documento}
                    onChange={(e) => setDocumento(tipoDoc === "cpf" ? maskCPF(e.target.value) : maskCNPJ(e.target.value))}
                    className={`h-12 ${errors.documento ? "border-destructive" : ""}`}
                  />
                  {errors.documento && <p className="text-sm text-destructive">{errors.documento}</p>}
                </div>

                {/* Nome / Razão Social */}
                <div className="space-y-2">
                  <Label>{tipoDoc === "cnpj" ? "Razão Social" : "Nome Completo"}</Label>
                  <Input
                    placeholder={tipoDoc === "cnpj" ? "Razão Social da empresa" : "Seu nome completo"}
                    value={nomeOuRazao}
                    onChange={(e) => setNomeOuRazao(e.target.value)}
                    className={`h-12 ${errors.nomeOuRazao ? "border-destructive" : ""}`}
                  />
                  {errors.nomeOuRazao && <p className="text-sm text-destructive">{errors.nomeOuRazao}</p>}
                </div>
              </>
            )}

            {/* Data de Nascimento - Apenas Casa + CPF */}
            {isCasaCPF && (
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full h-12 justify-start text-left font-normal", !dataNascimento && "text-muted-foreground", errors.dataNascimento && "border-destructive")}
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
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dataNascimento && <p className="text-sm text-destructive">{errors.dataNascimento}</p>}
              </div>
            )}

            {/* Campos Empresa */}
            {modo === "empresa" && (
              <>
                <div className="space-y-2">
                  <Label>Ramo do Estabelecimento</Label>
                  <Select value={ramo} onValueChange={setRamo}>
                    <SelectTrigger className={`h-12 ${errors.ramo ? "border-destructive" : ""}`}><SelectValue placeholder="Selecione o ramo" /></SelectTrigger>
                    <SelectContent>
                      {ramosEstabelecimento.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.ramo && <p className="text-sm text-destructive">{errors.ramo}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Nome do Estabelecimento</Label>
                  <Input
                    placeholder="Nome do estabelecimento"
                    value={nomeEstabelecimento}
                    onChange={(e) => setNomeEstabelecimento(e.target.value)}
                    className={`h-12 ${errors.nomeEstabelecimento ? "border-destructive" : ""}`}
                  />
                  {errors.nomeEstabelecimento && <p className="text-sm text-destructive">{errors.nomeEstabelecimento}</p>}
                </div>

                {/* Uploads */}
                <div className="space-y-4">
                  <Label>Fotos do Estabelecimento</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fachada */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Fachada (obrigatório)</p>
                      {previewFachada ? (
                        <div className="relative rounded-lg overflow-hidden aspect-video">
                          <img src={previewFachada} alt="Fachada" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFotoFachada(null)} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg aspect-video cursor-pointer hover:border-primary transition-colors ${errors.fotoFachada ? "border-destructive" : "border-border"}`}>
                          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Clique para enviar</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange(setFotoFachada)} />
                        </label>
                      )}
                      {errors.fotoFachada && <p className="text-xs text-destructive">{errors.fotoFachada}</p>}
                    </div>

                    {/* Ambiente */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Ambiente interno (obrigatório)</p>
                      {previewAmbiente ? (
                        <div className="relative rounded-lg overflow-hidden aspect-video">
                          <img src={previewAmbiente} alt="Ambiente" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFotoAmbiente(null)} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg aspect-video cursor-pointer hover:border-primary transition-colors ${errors.fotoAmbiente ? "border-destructive" : "border-border"}`}>
                          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Clique para enviar</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange(setFotoAmbiente)} />
                        </label>
                      )}
                      {errors.fotoAmbiente && <p className="text-xs text-destructive">{errors.fotoAmbiente}</p>}
                    </div>
                  </div>

                  {/* Fotos extras */}
                  {previewExtras.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {previewExtras.map((src, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <img src={src} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFotosExtras((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
                    <Upload className="w-4 h-4" /> Adicionar mais fotos
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                      const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
                      setFotosExtras((prev) => [...prev, ...files]);
                    }} />
                  </label>
                </div>
              </>
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

      {/* Right Side - Informativo */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="max-w-lg">
          {modo === "casa" ? (
            <>
              <Home className="w-16 h-16 text-secondary mb-6" />
              <h2 className="text-3xl font-display font-bold text-secondary mb-4">Freela em Casa</h2>
              <p className="text-secondary/80 text-lg mb-8">
                Contrate profissionais qualificados para suas festas, churrascos e eventos residenciais.
              </p>
              <ul className="space-y-3">
                {["Bartenders, garçons e cozinheiros à disposição", "Ideal para festas, aniversários e churrascos", "Profissionais avaliados e verificados", "Contratação rápida e sem burocracia"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-secondary/90">
                    <ArrowRight className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <Building2 className="w-16 h-16 text-secondary mb-6" />
              <h2 className="text-3xl font-display font-bold text-secondary mb-4">Freela para Empresas</h2>
              <p className="text-secondary/80 text-lg mb-8">
                Reforce sua equipe com profissionais experientes sob demanda.
              </p>
              <ul className="space-y-3">
                {["Bares, restaurantes, hotéis e casas de eventos", "Freelancers prontos para cobrir demandas extras", "Gestão simplificada de contratações", "Sem vínculo — contrate quando precisar"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-secondary/90">
                    <ArrowRight className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CadastroContratante;
