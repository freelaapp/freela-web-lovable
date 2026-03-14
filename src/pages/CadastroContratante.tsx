import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CitySelect from "@/components/CitySelect";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowRight,
  ArrowLeft,
  CalendarIcon,
  Upload,
  X,
  Home,
  Building2,
  UserCheck,
  Phone,
  Loader2,
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import logoFreela from "@/assets/logo-freela.png";
import { useToast } from "@/hooks/use-toast";
import { getAuthUser } from "@/lib/auth";

const API_BASE_URL = "https://api.freelaservicos.com.br";

const ramosEstabelecimento = [
  "Bar",
  "Restaurante",
  "Hotel",
  "Buffet",
  "Casa de Eventos",
  "Pub",
  "Balada",
  "Clube",
  "Resort",
  "Outro",
];

const estadosBR = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const maskCNPJ = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const maskCEP = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d)/, "$1-$2");
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const getInitialPhone = () => {
  try {
    const data = JSON.parse(localStorage.getItem("pendingRegisterData") || "{}");
    return data.phoneNumber ? formatPhone(data.phoneNumber) : "";
  } catch {
    return "";
  }
};

const CadastroContratante = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [modo, setModo] = useState<"casa" | "empresa">("casa");
  const [telefone, setTelefone] = useState(getInitialPhone);
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
  const [fotoInterno, setFotoInterno] = useState<File | null>(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [fotosExtras, setFotosExtras] = useState<File[]>([]);
  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelTelefone, setResponsavelTelefone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cepLoading, setCepLoading] = useState(false);

  const buscarCep = useCallback(async (cepValue: string) => {
    const digits = cepValue.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
        // Persist ViaCEP extra fields for API submission
        localStorage.setItem(
          "viacepData",
          JSON.stringify({
            ibge: data.ibge || "",
            gia: data.gia || "",
            ddd: data.ddd || "",
            siafi: data.siafi || "",
          }),
        );
      }
    } catch {
      // silently fail
    } finally {
      setCepLoading(false);
    }
  }, []);

  const handleCepChange = (value: string) => {
    const masked = maskCEP(value);
    setCep(masked);
    const digits = value.replace(/\D/g, "");
    if (digits.length === 8) {
      buscarCep(digits);
    }
  };

  const previewFachada = useMemo(() => (fotoFachada ? URL.createObjectURL(fotoFachada) : null), [fotoFachada]);
  const previewInterno = useMemo(() => (fotoInterno ? URL.createObjectURL(fotoInterno) : null), [fotoInterno]);

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
      if (tipoDoc === "cnpj" && !nomeOuRazao.trim()) e.nomeOuRazao = "Razão Social é obrigatória";
      if (isCasaCPF) {
        if (!dataNascimento) e.dataNascimento = "Data de nascimento é obrigatória";
        else if (differenceInYears(new Date(), dataNascimento) < 18)
          e.dataNascimento = "Você deve ter pelo menos 18 anos";
      }
    }
    if (!rua.trim()) e.rua = "Rua é obrigatória";
    if (!numero.trim()) e.numero = "Número é obrigatório";
    if (!bairro.trim()) e.bairro = "Bairro é obrigatório";
    if (!cidade.trim()) e.cidade = "Cidade é obrigatória";
    if (!estado) e.estado = "Estado é obrigatório";
    if (!telefone.replace(/\D/g, "") || telefone.replace(/\D/g, "").length < 10) e.telefone = "Celular inválido";

    if (modo === "empresa") {
      if (!ramo) e.ramo = "Ramo é obrigatório";
      if (!nomeEstabelecimento.trim()) e.nomeEstabelecimento = "Nome do estabelecimento é obrigatório";
      if (!fotoFachada) e.fotoFachada = "Foto da fachada é obrigatória";
      if (!responsavelNome.trim()) e.responsavelNome = "Nome do responsável é obrigatório";
      if (!responsavelTelefone.replace(/\D/g, "") || responsavelTelefone.replace(/\D/g, "").length < 10)
        e.responsavelTelefone = "Telefone inválido";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      // Get auth data
      const tokenRaw = localStorage.getItem("authToken");
      if (!tokenRaw) throw new Error("Sessão expirada. Faça login novamente.");
      const token = JSON.parse(tokenRaw);
      console.log("[CadastroContratante] token enviado no header Authorization:", token);
      const authUser = getAuthUser();
      if (!authUser?.id) throw new Error("Sessão expirada. Faça login novamente.");

      // Get viacep data
      const viacep = JSON.parse(localStorage.getItem("viacepData") || "{}");

      const fd = new FormData();

      // ViaCEP fields
      fd.append("ibge", viacep.ibge || "");
      fd.append("gia", viacep.gia || "");
      fd.append("ddd", viacep.ddd || "");
      fd.append("siafi", viacep.siafi || "");

      // Address fields
      fd.append("cep", cep.replace(/\D/g, ""));
      fd.append("street", rua);
      fd.append("complement", complemento);
      fd.append("neighborhood", bairro);
      fd.append("number", numero);
      fd.append("city", cidade);
      fd.append("uf", estado);

      const phoneDigits = telefone.replace(/\D/g, "");

      if (modo === "empresa") {
        // Freela para Empresas
        fd.append("cnpj", cnpj.replace(/\D/g, ""));
        fd.append("corporateReason", nomeOuRazao);
        fd.append("companySegment", ramo);
        fd.append("companyName", nomeEstabelecimento);
        fd.append("nameOperationResponsible", responsavelNome);
        fd.append("phoneOperationResponsible", responsavelTelefone.replace(/\D/g, ""));
        if (fotoFachada) {
          const facadeBuffer = await fotoFachada.arrayBuffer();
          const facadeBlob = new Blob([facadeBuffer], { type: fotoFachada.type });
          fd.append("establishmentFacadeImage", facadeBlob, fotoFachada.name);
        }
        if (fotoInterno) {
          const interiorBuffer = await fotoInterno.arrayBuffer();
          const interiorBlob = new Blob([interiorBuffer], { type: fotoInterno.type });
          fd.append("establishmentInteriorImage", interiorBlob, fotoInterno.name);
        }
      } else {
        // Freela em Casa
        if (tipoDoc === "cpf") {
          fd.append("cpf", documento.replace(/\D/g, ""));
          if (dataNascimento) fd.append("birthdate", dataNascimento.toISOString());
        } else {
          fd.append("cnpj", documento.replace(/\D/g, ""));
          fd.append("corporateReason", nomeOuRazao);
        }
      }

      const response = await fetch(`${API_BASE_URL}/contractors/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Origin-type": "Web",
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      if (response.status !== 200 && response.status !== 201) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Não foi possível completar o cadastro. Tente novamente.");
      }

      // Persist contractor type for profile page
      if (modo === "empresa") {
        localStorage.setItem("contractorType", "empresas");
      } else if (tipoDoc === "cnpj") {
        localStorage.setItem("contractorType", "casa_cnpj");
      } else {
        localStorage.setItem("contractorType", "casa_cpf");
      }

      // Cleanup
      localStorage.removeItem("viacepData");

      toast({ title: "Cadastro realizado!", description: "Bem-vindo à Freela." });
      navigate("/dashboard-contratante");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado. Tente novamente.";
      toast({ title: "Erro no cadastro", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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
                modo === "casa"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="w-4 h-4" /> Freela em Casa
            </button>
            <button
              type="button"
              onClick={() => setModo("empresa")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                modo === "empresa"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
                    onChange={(e) => {
                      const masked = maskCNPJ(e.target.value);
                      setCnpj(masked);
                      const digits = masked.replace(/\D/g, "");
                      if (digits.length === 14) {
                        setCnpjLoading(true);
                        setErrors((prev) => {
                          const { cnpj: _, ...rest } = prev;
                          return rest;
                        });
                        fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
                          .then((res) => {
                            if (!res.ok) throw new Error();
                            return res.json();
                          })
                          .then((data) => {
                            if (data.razao_social) setNomeOuRazao(data.razao_social);
                          })
                          .catch(() => {
                            setErrors((prev) => ({ ...prev, cnpj: "CNPJ inválido" }));
                          })
                          .finally(() => setCnpjLoading(false));
                      }
                    }}
                    className={`h-12 ${errors.cnpj ? "border-destructive" : ""}`}
                  />
                  {cnpjLoading && <p className="text-xs text-muted-foreground">Validando CNPJ...</p>}
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
                  <Select
                    value={tipoDoc}
                    onValueChange={(v) => {
                      setTipoDoc(v as "cpf" | "cnpj");
                      setDocumento("");
                      setNomeOuRazao("");
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
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
                    onChange={(e) =>
                      setDocumento(tipoDoc === "cpf" ? maskCPF(e.target.value) : maskCNPJ(e.target.value))
                    }
                    className={`h-12 ${errors.documento ? "border-destructive" : ""}`}
                  />
                  {errors.documento && <p className="text-sm text-destructive">{errors.documento}</p>}
                </div>

                {/* Razão Social - apenas quando CNPJ */}
                {tipoDoc === "cnpj" && (
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
                )}

                {/* Celular */}
                <div className="space-y-2">
                  <Label>Celular</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="(11) 99999-9999"
                      value={telefone}
                      onChange={(e) => setTelefone(formatPhone(e.target.value))}
                      className={`pl-10 h-12 ${errors.telefone ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
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
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !dataNascimento && "text-muted-foreground",
                        errors.dataNascimento && "border-destructive",
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
            )}

            {/* Campos Empresa */}
            {modo === "empresa" && (
              <>
                <div className="space-y-2">
                  <Label>Ramo do Estabelecimento</Label>
                  <Select value={ramo} onValueChange={setRamo}>
                    <SelectTrigger className={`h-12 ${errors.ramo ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Selecione o ramo" />
                    </SelectTrigger>
                    <SelectContent>
                      {ramosEstabelecimento.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
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
                  {errors.nomeEstabelecimento && (
                    <p className="text-sm text-destructive">{errors.nomeEstabelecimento}</p>
                  )}
                </div>

                {/* Celular */}
                <div className="space-y-2">
                  <Label>Celular</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="(11) 99999-9999"
                      value={telefone}
                      onChange={(e) => setTelefone(formatPhone(e.target.value))}
                      className={`pl-10 h-12 ${errors.telefone ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
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
                          <button
                            type="button"
                            onClick={() => setFotoFachada(null)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label
                          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg aspect-video cursor-pointer hover:border-primary transition-colors ${errors.fotoFachada ? "border-destructive" : "border-border"}`}
                        >
                          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Clique para enviar</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange(setFotoFachada)}
                          />
                        </label>
                      )}
                      {errors.fotoFachada && <p className="text-xs text-destructive">{errors.fotoFachada}</p>}
                    </div>

                    {/* Ambiente Interno */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Ambiente Interno</p>
                      {previewInterno ? (
                        <div className="relative rounded-lg overflow-hidden aspect-video">
                          <img src={previewInterno} alt="Ambiente Interno" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFotoInterno(null)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg aspect-video cursor-pointer hover:border-primary transition-colors border-border">
                          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Clique para enviar</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange(setFotoInterno)}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Fotos extras */}
                  {previewExtras.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {previewExtras.map((src, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <img src={src} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFotosExtras((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
                    <Upload className="w-4 h-4" /> Adicionar mais fotos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
                        setFotosExtras((prev) => [...prev, ...files]);
                      }}
                    />
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
                  <Input
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    className={`h-12 ${errors.cep ? "border-destructive" : ""}`}
                  />
                  {cepLoading && <p className="text-xs text-muted-foreground">Buscando CEP...</p>}
                  {errors.cep && <p className="text-xs text-destructive">{errors.cep}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger className={`h-12 ${errors.estado ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBR.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.estado && <p className="text-xs text-destructive">{errors.estado}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rua</Label>
                <Input
                  placeholder="Nome da rua"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  className={`h-12 ${errors.rua ? "border-destructive" : ""}`}
                />
                {errors.rua && <p className="text-xs text-destructive">{errors.rua}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    placeholder="Nº"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className={`h-12 ${errors.numero ? "border-destructive" : ""}`}
                  />
                  {errors.numero && <p className="text-xs text-destructive">{errors.numero}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    placeholder="Apto, Bloco..."
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className={`h-12 ${errors.bairro ? "border-destructive" : ""}`}
                  />
                  {errors.bairro && <p className="text-xs text-destructive">{errors.bairro}</p>}
                </div>
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
              </div>
            </div>

            {modo === "empresa" && (
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-1">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Responsável pela Operação
                </h3>
                <div className="space-y-2">
                  <Label>Nome e Sobrenome</Label>
                  <Input
                    placeholder="Nome completo do responsável"
                    value={responsavelNome}
                    onChange={(e) => setResponsavelNome(e.target.value)}
                    className={`h-12 ${errors.responsavelNome ? "border-destructive" : ""}`}
                  />
                  {errors.responsavelNome && <p className="text-sm text-destructive">{errors.responsavelNome}</p>}
                </div>
                <div className="space-y-2">
                  <Label>DDD + Telefone</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={responsavelTelefone}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 11);
                      let formatted = d;
                      if (d.length > 2) formatted = `(${d.slice(0, 2)}) ${d.slice(2)}`;
                      if (d.length > 7) formatted = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
                      setResponsavelTelefone(formatted);
                    }}
                    className={`h-12 ${errors.responsavelTelefone ? "border-destructive" : ""}`}
                  />
                  {errors.responsavelTelefone && (
                    <p className="text-sm text-destructive">{errors.responsavelTelefone}</p>
                  )}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {modo === "empresa" ? "Cadastrando empresa…" : "Cadastrando…"}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Cadastrar-se <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Informativo */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 sticky top-0 h-screen">
        <div className="max-w-lg">
          {modo === "casa" ? (
            <>
              <Home className="w-16 h-16 text-secondary mb-6" />
              <h2 className="text-3xl font-display font-bold text-secondary mb-4">Freela em Casa</h2>
              <p className="text-secondary/80 text-lg mb-8">
                Contrate profissionais qualificados para suas festas, churrascos e eventos residenciais.
              </p>
              <ul className="space-y-3">
                {[
                  "Bartenders, garçons e cozinheiros à disposição",
                  "Ideal para festas, aniversários e churrascos",
                  "Profissionais avaliados e verificados",
                  "Contratação rápida e sem burocracia",
                ].map((item) => (
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
                {[
                  "Bares, restaurantes, hotéis e casas de eventos",
                  "Freelancers prontos para cobrir demandas extras",
                  "Gestão simplificada de contratações",
                  "Sem vínculo — contrate quando precisar",
                ].map((item) => (
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
