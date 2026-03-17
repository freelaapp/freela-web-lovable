import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CitySelect from "@/components/CitySelect";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, ArrowLeft, CalendarIcon, Briefcase, CheckCircle, Camera, X, User, Phone, Heart } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, validateCPF } from "@/lib/utils";
import logoFreela from "@/assets/logo-freela-new.png";
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

const tiposDeficiencia = [
  { id: "auditiva", label: "Deficiência Auditiva" },
  { id: "visual", label: "Deficiência Visual" },
  { id: "intelectual", label: "Deficiência Intelectual" },
  { id: "mental", label: "Deficiência Mental/Psicossocial" },
];

const grausParentesco = [
  "Pais", "Irmãos(ãs)", "Cônjuge", "Tios(as) e Avós(ôs)", "Amigos(as)",
];

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

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
  const [isPCD, setIsPCD] = useState(false);
  const [deficienciasSelecionadas, setDeficienciasSelecionadas] = useState<string[]>([]);
  const [cep, setCep] = useState("");
  const [contatoEmergNome, setContatoEmergNome] = useState("");
  const [contatoEmergParentesco, setContatoEmergParentesco] = useState("");
  const [contatoEmergTelefone, setContatoEmergTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tipoChavePix, setTipoChavePix] = useState("");
  const [chavePix, setChavePix] = useState("");

  const buscarCep = useCallback(async (cepValue: string) => {
    const digits = cepValue.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
        if (!data.erro) {
          setEndereco(data.logradouro || "");
          setBairro(data.bairro || "");
          setCidade(data.localidade || "");
          setEstado(data.uf || "");
          // Persist viacep metadata for provider registration
          try {
            localStorage.setItem("freelancerViacepData", JSON.stringify({
              ibge: data.ibge || "",
              gia: data.gia || "",
              ddd: data.ddd || "",
              siafi: data.siafi || "",
            }));
          } catch {
            // QuotaExceededError — os dados de viacep são apenas metadados secundários,
            // a falha aqui não bloqueia o fluxo principal
          }
        }
    } catch {
      // silently fail
    } finally {
      setCepLoading(false);
    }
  }, []);

  const handleCepChange = (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 8);
    const masked = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
    setCep(masked);
    if (d.length === 8) {
      buscarCep(d);
    }
  };

  const previewFoto = useMemo(() => fotoPerfil ? URL.createObjectURL(fotoPerfil) : null, [fotoPerfil]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fotoPerfil) e.fotoPerfil = "Foto de perfil é obrigatória";
    if (!nomeCompleto.trim() || nomeCompleto.trim().length < 3) e.nomeCompleto = "Nome completo é obrigatório (mínimo 3 caracteres)";
    if (!cpf.replace(/\D/g, "") || !validateCPF(cpf)) e.cpf = "CPF inválido";
    if (!dataNascimento) e.dataNascimento = "Data de nascimento é obrigatória";
    else if (differenceInYears(new Date(), dataNascimento) < 18) e.dataNascimento = "Você deve ter pelo menos 18 anos";
    if (!sexo) e.sexo = "Sexo é obrigatório";
    if (!endereco.trim()) e.endereco = "Endereço é obrigatório";
    if (!numero.trim()) e.numero = "Número do endereço é obrigatório";
    if (!cidade.trim()) e.cidade = "Cidade é obrigatória";
    if (!estado) e.estado = "Estado é obrigatório";
    if (!acceptTerms) e.terms = "Você deve aceitar os termos";
    setErrors(e);

    if (Object.keys(e).length > 0) {
      toast({
        title: "Campos pendentes ou incorretos",
        description: Object.values(e).join(", "),
        variant: "destructive",
      });
    }

    return Object.keys(e).length === 0;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      // Convert profile image to base64 for persistence
      let fotoBase64 = "";
      if (fotoPerfil) {
        fotoBase64 = await fileToBase64(fotoPerfil);
      }

      // Save all form data to localStorage for the next step
      const freelancerData = {
        fotoBase64,
        fotoName: fotoPerfil?.name || "",
        fotoType: fotoPerfil?.type || "",
        nomeCompleto,
        cpf: cpf.replace(/\D/g, ""),
        dataNascimento: dataNascimento?.toISOString() || "",
        sexo,
        isPCD,
        deficienciasSelecionadas,
        deficiency: isPCD ? "Sim" : "Não",
        cep: cep.replace(/\D/g, ""),
        street: endereco,
        complement: complemento,
        neighborhood: bairro,
        number: numero,
        city: cidade,
        uf: estado,
        tipoChavePix,
        pixKeyValue: chavePix,
        emergencyContactName: contatoEmergNome,
        emergencyContactRelationship: contatoEmergParentesco,
        emergencyContactNumber: contatoEmergTelefone.replace(/\D/g, ""),
      };

      try {
        localStorage.setItem("freelancerFormData", JSON.stringify(freelancerData));
      } catch {
        // localStorage cheio (QuotaExceededError) — salva sem a foto e avisa o usuário
        const dataWithoutPhoto = { ...freelancerData, fotoBase64: "" };
        localStorage.setItem("freelancerFormData", JSON.stringify(dataWithoutPhoto));
        toast({
          title: "Aviso",
          description: "A foto é muito grande para ser armazenada temporariamente. Ela será solicitada novamente na próxima etapa.",
          variant: "destructive",
        });
      }

      toast({ title: "Dados salvos!", description: "Agora defina suas áreas de atuação." });
      navigate("/cadastro-freelancer-areas");
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar os dados.", variant: "destructive" });
    } finally {
      setIsLoading(false);
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
        <div className="max-w-md">
          <h2 className="text-3xl font-display font-bold text-secondary mb-4 text-left">
            Junte-se à comunidade Freela
          </h2>
          <p className="text-secondary/80 text-lg mb-8 leading-relaxed text-left">
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
              <li key={item} className="flex items-start gap-3 text-secondary/90 text-base">
                <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
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
            <img src={logoFreela} alt="Freela Serviços" className="h-24" />
          </Link>

          <div className="mb-2">
            <p className="text-sm text-primary font-semibold">Etapa 2 de 3</p>
          </div>
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
                      locale={ptBR}
                      labels={{
                        labelMonthDropdown: () => "Mês",
                        labelYearDropdown: () => "Ano",
                      }}
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

              {/* PCD */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Possui alguma Necessidade Especial? (PCD)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{isPCD ? "Sim" : "Não"}</span>
                    <Switch checked={isPCD} onCheckedChange={setIsPCD} />
                  </div>
                </div>
                {isPCD && (
                  <div className="space-y-2 pl-1">
                    <Label className="text-sm text-muted-foreground">Tipo de deficiência</Label>
                    <div className="space-y-2">
                      {tiposDeficiencia.map((tipo) => (
                        <div key={tipo.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`pcd-${tipo.id}`}
                            checked={deficienciasSelecionadas.includes(tipo.id)}
                            onCheckedChange={(checked) => {
                              setDeficienciasSelecionadas((prev) =>
                                checked ? [...prev, tipo.id] : prev.filter((d) => d !== tipo.id)
                              );
                            }}
                          />
                          <Label htmlFor={`pcd-${tipo.id}`} className="text-sm font-normal cursor-pointer">
                            {tipo.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CEP */}
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  className={`h-12 ${errors.cep ? "border-destructive" : ""}`}
                />
                {cepLoading && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
                {errors.cep && <p className="text-sm text-destructive">{errors.cep}</p>}
              </div>

              {/* Rua */}
              <div className="space-y-2">
                <Label>Rua</Label>
                <Input
                  placeholder="Nome da rua"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className={`h-12 ${errors.endereco ? "border-destructive" : ""}`}
                />
                {errors.endereco && <p className="text-sm text-destructive">{errors.endereco}</p>}
              </div>

              {/* Número + Complemento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    placeholder="Nº"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className={`h-12 ${errors.numero ? "border-destructive" : ""}`}
                  />
                  {errors.numero && <p className="text-sm text-destructive">{errors.numero}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    placeholder="Apto, bloco..."
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Bairro */}
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input
                  placeholder="Bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Cidade + Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <CitySelect
                    value={cidade}
                    onValueChange={setCidade}
                    className={`h-12`}
                    hasError={!!errors.cidade}
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

              {/* Tipo de Chave PIX */}
              <div className="space-y-2">
                <Label>Tipo de Chave PIX</Label>
                <Select value={tipoChavePix} onValueChange={setTipoChavePix}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione o tipo de chave" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chave PIX */}
              <div className="space-y-2">
                <Label>Chave PIX</Label>
                <Input
                  placeholder="Informe sua chave PIX"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground italic">
                  Sua chave PIX será usada para receber os pagamentos pelos serviços realizados.
                </p>
              </div>
            </div>

            {/* ===== Seção 2 - Contato de Emergência ===== */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-1">
                <Phone className="w-5 h-5 text-primary" />
                Contato de Emergência
              </h3>

              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Nome do contato"
                  value={contatoEmergNome}
                  onChange={(e) => setContatoEmergNome(e.target.value)}
                  className={`h-12 ${errors.contatoEmergNome ? "border-destructive" : ""}`}
                />
                {errors.contatoEmergNome && <p className="text-sm text-destructive">{errors.contatoEmergNome}</p>}
              </div>

              <div className="space-y-2">
                <Label>Grau de Parentesco</Label>
                <Select value={contatoEmergParentesco} onValueChange={setContatoEmergParentesco}>
                  <SelectTrigger className={`h-12 ${errors.contatoEmergParentesco ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {grausParentesco.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contatoEmergParentesco && <p className="text-sm text-destructive">{errors.contatoEmergParentesco}</p>}
              </div>

              <div className="space-y-2">
                <Label>DDD + Número</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={contatoEmergTelefone}
                  onChange={(e) => setContatoEmergTelefone(maskPhone(e.target.value))}
                  className={`h-12 ${errors.contatoEmergTelefone ? "border-destructive" : ""}`}
                />
                {errors.contatoEmergTelefone && <p className="text-sm text-destructive">{errors.contatoEmergTelefone}</p>}
              </div>
            </div>

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
