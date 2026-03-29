import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CitySelect from "@/components/CitySelect";
import { differenceInYears } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { validateCPF } from "@/lib/utils";
import logoFreela from "@/assets/logo-freela-new.png";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { extractApiError, throwApiError } from "@/lib/api-error";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Home,
  Building2,
  UserCheck,
  Phone,
  Loader2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const API_BASE_URL = import.meta.env.API_BASE_URL;

const ramosEstabelecimento = [
  "Bar", "Restaurante", "Hotel", "Buffet", "Casa de Eventos",
  "Pub", "Balada", "Clube", "Resort", "Outro",
];

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
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

type Modo = "casa" | "empresa";
type TipoDoc = "cpf" | "cnpj";

const baseSchema = z.object({
  telefone: z.string().refine((v) => v.replace(/\D/g, "").length >= 10, "Celular inválido"),
  cep: z.string().optional(),
  rua: z.string().min(1, "Endereço é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  referencia: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório"),
});

const empresaSchema = baseSchema.extend({
  cnpj: z.string().refine((v) => v.replace(/\D/g, "").length === 14, "CNPJ inválido"),
  nomeOuRazao: z.string().min(1, "Razão Social é obrigatória"),
  ramo: z.string().min(1, "Ramo é obrigatório"),
  nomeEstabelecimento: z.string().min(1, "Nome do estabelecimento é obrigatório"),
  responsavelNome: z.string().min(1, "Nome do responsável é obrigatório"),
  responsavelTelefone: z.string().refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone do responsável inválido"),
});

const casaCPFSchema = baseSchema.extend({
  documento: z.string().refine((v) => validateCPF(v), "CPF inválido"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
});

const casaCNPJSchema = baseSchema.extend({
  documento: z.string().refine((v) => v.replace(/\D/g, "").length === 14, "CNPJ inválido"),
  nomeOuRazao: z.string().min(1, "Razão Social é obrigatória"),
  ramo: z.string().min(1, "Ramo é obrigatório"),
  responsavelNome: z.string().min(1, "Nome do responsável é obrigatório"),
  responsavelTelefone: z.string().refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone do responsável inválido"),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;
type CasaCPFFormData = z.infer<typeof casaCPFSchema>;
type CasaCNPJFormData = z.infer<typeof casaCNPJSchema>;

const CadastroContratante = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginSuccess } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [modo, setModo] = useState<Modo>("casa");
  const [tipoDoc, setTipoDoc] = useState<TipoDoc>("cpf");
  const [fotoFachada, setFotoFachada] = useState<File | null>(null);
  const [fotoInterno, setFotoInterno] = useState<File | null>(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [fotosExtras, setFotosExtras] = useState<File[]>([]);
  const [cepLoading, setCepLoading] = useState(false);

  const isCasaCPF = modo === "casa" && tipoDoc === "cpf";

  const empresaForm = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      cnpj: "", nomeOuRazao: "", telefone: getInitialPhone(),
      ramo: "", nomeEstabelecimento: "", responsavelNome: "", responsavelTelefone: "",
      cep: "", rua: "", numero: "", complemento: "", referencia: "", bairro: "", cidade: "", estado: "",
    },
  });

  const casaCPFForm = useForm<CasaCPFFormData>({
    resolver: zodResolver(casaCPFSchema),
    defaultValues: {
      documento: "", telefone: getInitialPhone(), dataNascimento: "",
      cep: "", rua: "", numero: "", complemento: "", referencia: "", bairro: "", cidade: "", estado: "",
    },
  });

  const casaCNPJForm = useForm<CasaCNPJFormData>({
    resolver: zodResolver(casaCNPJSchema),
    defaultValues: {
      documento: "", nomeOuRazao: "", telefone: getInitialPhone(),
      ramo: "", responsavelNome: "", responsavelTelefone: "",
      cep: "", rua: "", numero: "", complemento: "", referencia: "", bairro: "", cidade: "", estado: "",
    },
  });

  type FormInstance = { setValue: (name: string, value: string) => void };

  const buscarCep = useCallback(async (cepValue: string, formInstance: FormInstance) => {
    const digits = cepValue.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        formInstance.setValue("rua", data.logradouro || "");
        formInstance.setValue("bairro", data.bairro || "");
        formInstance.setValue("cidade", data.localidade || "");
        formInstance.setValue("estado", data.uf || "");
        localStorage.setItem(
          "viacepData",
          JSON.stringify({ ibge: data.ibge || "", gia: data.gia || "", ddd: data.ddd || "", siafi: data.siafi || "" }),
        );
      }
    } catch { /* silently fail */ }
    finally { setCepLoading(false); }
  }, []);

  const handleCepChange = (value: string, formInstance: FormInstance) => {
    const masked = maskCEP(value);
    formInstance.setValue("cep", masked);
    const digits = value.replace(/\D/g, "");
    if (digits.length === 8) buscarCep(digits, formInstance);
  };

  const previewFachada = useMemo(() => (fotoFachada ? URL.createObjectURL(fotoFachada) : null), [fotoFachada]);
  const previewInterno = useMemo(() => (fotoInterno ? URL.createObjectURL(fotoInterno) : null), [fotoInterno]);
  const previewExtras = useMemo(() => fotosExtras.map((f) => URL.createObjectURL(f)), [fotosExtras]);

  const handleFileChange = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) setter(file);
  };

  const onSubmit = async () => {
    if (modo === "empresa" && !fotoFachada) {
      toast({ title: "Foto obrigatória", description: "A foto da fachada é obrigatória.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const viacep = JSON.parse(localStorage.getItem("viacepData") || "{}");
      const fd = new FormData();

      fd.append("ibge", viacep.ibge || "");
      fd.append("gia", viacep.gia || "");
      fd.append("ddd", viacep.ddd || "");
      fd.append("siafi", viacep.siafi || "");
      fd.append("createdAt", new Date().toISOString());

      if (modo === "empresa") {
        const data = empresaForm.getValues();
        fd.append("cep", data.cep?.replace(/\D/g, "") || "");
        fd.append("logradouro", data.rua);
        fd.append("complemento", data.complemento || "");
        fd.append("reference", data.referencia || "");
        fd.append("bairro", data.bairro);
        fd.append("number", data.numero);
        fd.append("localidade", data.cidade);
        fd.append("uf", data.estado);
        fd.append("cnpj", data.cnpj.replace(/\D/g, ""));
        fd.append("corporateReason", data.nomeOuRazao);
        fd.append("companySegment", data.ramo);
        fd.append("companyName", data.nomeEstabelecimento);
        fd.append("nameOperationResponsible", data.responsavelNome);
        fd.append("phoneOperationResponsible", data.responsavelTelefone.replace(/\D/g, ""));
        fd.append("phoneNumber", data.telefone.replace(/\D/g, ""));
        if (fotoFachada) {
          const buf = await fotoFachada.arrayBuffer();
          fd.append("establishmentFacadeImage", new Blob([buf], { type: fotoFachada.type }), fotoFachada.name);
        }
        if (fotoInterno) {
          const buf = await fotoInterno.arrayBuffer();
          fd.append("establishmentInteriorImage", new Blob([buf], { type: fotoInterno.type }), fotoInterno.name);
        }
      } else if (tipoDoc === "cnpj") {
        const data = casaCNPJForm.getValues();
        fd.append("cep", data.cep?.replace(/\D/g, "") || "");
        fd.append("logradouro", data.rua);
        fd.append("complemento", data.complemento || "");
        fd.append("reference", data.referencia || "");
        fd.append("bairro", data.bairro);
        fd.append("number", data.numero);
        fd.append("localidade", data.cidade);
        fd.append("uf", data.estado);
        fd.append("cnpj", data.documento.replace(/\D/g, ""));
        fd.append("corporateReason", data.nomeOuRazao);
        fd.append("companySegment", data.ramo);
        fd.append("nameOperationResponsible", data.responsavelNome);
        fd.append("phoneOperationResponsible", data.responsavelTelefone.replace(/\D/g, ""));
        fd.append("phoneNumber", data.telefone.replace(/\D/g, ""));
      } else {
        const data = casaCPFForm.getValues();
        fd.append("cep", data.cep?.replace(/\D/g, "") || "");
        fd.append("logradouro", data.rua);
        fd.append("complemento", data.complemento || "");
        fd.append("reference", data.referencia || "");
        fd.append("bairro", data.bairro);
        fd.append("number", data.numero);
        fd.append("localidade", data.cidade);
        fd.append("uf", data.estado);
        fd.append("cnpj", "");
        fd.append("corporateReason", "");
        fd.append("companySegment", "casa_cpf");
        fd.append("nameOperationResponsible", "");
        fd.append("phoneOperationResponsible", data.telefone.replace(/\D/g, ""));
        fd.append("cpf", data.documento.replace(/\D/g, ""));
        fd.append("phoneNumber", data.telefone.replace(/\D/g, ""));
        if (data.dataNascimento) fd.append("birthdate", new Date(data.dataNascimento).toISOString());
      }

      const response = await apiFetch(`${API_BASE_URL}/contractors/`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!response.ok) {
        await throwApiError(response);
      }

      if (modo === "empresa") localStorage.setItem("contractorType", "empresas");
      else if (tipoDoc === "cnpj") localStorage.setItem("contractorType", "casa_cnpj");
      else localStorage.setItem("contractorType", "casa_cpf");

      localStorage.removeItem("viacepData");
      toast({ title: "Cadastro realizado!", description: "Bem-vindo à Freela." });
      const authUser = getAuthUser();
      loginSuccess(authUser?.id ?? "", "contratante");
      navigate("/dashboard-contratante");
    } catch (err: unknown) {
      toast({ title: "Erro no cadastro", description: extractApiError(err), variant: "destructive" });
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

      <div className="flex-1 flex flex-col justify-start container-padding py-12 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto">
          <Link to="/" className="inline-block mb-8">
            <img src={logoFreela} alt="Freela Serviços" className="h-24" />
          </Link>

          <h1 className="text-3xl font-display font-bold mb-2">Cadastro Contratante</h1>
          <p className="text-muted-foreground mb-6">Complete seus dados para começar a contratar</p>

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

          {modo === "empresa" ? (
            <Form {...empresaForm}>
              <form onSubmit={empresaForm.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={empresaForm.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00.000.000/0000-00"
                          className="h-12"
                          {...field}
                          onChange={(e) => {
                            const masked = maskCNPJ(e.target.value);
                            field.onChange(masked);
                            const digits = masked.replace(/\D/g, "");
                            if (digits.length === 14) {
                              setCnpjLoading(true);
                              fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
                                .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
                                .then((data) => { if (data.razao_social) empresaForm.setValue("nomeOuRazao", data.razao_social); })
                                .catch(() => empresaForm.setError("cnpj", { message: "CNPJ inválido" }))
                                .finally(() => setCnpjLoading(false));
                            }
                          }}
                        />
                      </FormControl>
                      {cnpjLoading && <p className="text-xs text-muted-foreground">Validando CNPJ...</p>}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={empresaForm.control}
                  name="nomeOuRazao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl><Input placeholder="Razão Social da empresa" className="h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={empresaForm.control}
                  name="ramo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ramo do Estabelecimento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12"><SelectValue placeholder="Selecione o ramo" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ramosEstabelecimento.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={empresaForm.control}
                  name="nomeEstabelecimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Estabelecimento</FormLabel>
                      <FormControl><Input placeholder="Nome do estabelecimento" className="h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={empresaForm.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input placeholder="(11) 99999-9999" className="pl-10 h-12" {...field}
                            onChange={(e) => field.onChange(formatPhone(e.target.value))} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fotos do Estabelecimento */}
                <div className="space-y-4">
                  <FormLabel>Fotos do Estabelecimento</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Fachada (obrigatório)</p>
                      {previewFachada ? (
                        <div className="relative rounded-lg overflow-hidden aspect-video">
                          <img src={previewFachada} alt="Fachada" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFotoFachada(null)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg aspect-video cursor-pointer hover:border-primary transition-colors border-border">
                          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Clique para enviar</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange(setFotoFachada)} />
                        </label>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Ambiente Interno</p>
                      {previewInterno ? (
                        <div className="relative rounded-lg overflow-hidden aspect-video">
                          <img src={previewInterno} alt="Ambiente Interno" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFotoInterno(null)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg aspect-video cursor-pointer hover:border-primary transition-colors border-border">
                          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Clique para enviar</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange(setFotoInterno)} />
                        </label>
                      )}
                    </div>
                  </div>
                  {previewExtras.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {previewExtras.map((src, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <img src={src} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFotosExtras((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
                    <Upload className="w-4 h-4" /> Adicionar mais fotos
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
                        setFotosExtras((prev) => [...prev, ...files]);
                      }} />
                  </label>
                </div>

                {/* Endereço */}
                <div className="border-t border-border pt-5 mt-5 space-y-4">
                  <h3 className="text-lg font-display font-semibold">Endereço</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={empresaForm.control} name="cep" render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl><Input placeholder="00000-000" className="h-12" {...field}
                          onChange={(e) => handleCepChange(e.target.value, empresaForm)} /></FormControl>
                        {cepLoading && <p className="text-xs text-muted-foreground">Buscando CEP...</p>}
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={empresaForm.control} name="estado" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="UF" /></SelectTrigger></FormControl>
                          <SelectContent>{estadosBR.map((uf) => (<SelectItem key={uf} value={uf}>{uf}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={empresaForm.control} name="rua" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl><Input placeholder="Nome da rua" className="h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={empresaForm.control} name="numero" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl><Input placeholder="Nº" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={empresaForm.control} name="complemento" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl><Input placeholder="Apto, Bloco..." className="h-12" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={empresaForm.control} name="referencia" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referência</FormLabel>
                        <FormControl><Input placeholder="Próximo a..." className="h-12" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={empresaForm.control} name="bairro" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl><Input placeholder="Bairro" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={empresaForm.control} name="cidade" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl><CitySelect value={field.value} onValueChange={field.onChange} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-1">
                    <UserCheck className="w-5 h-5 text-primary" /> Responsável pela Operação
                  </h3>
                  <FormField control={empresaForm.control} name="responsavelNome" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome e Sobrenome</FormLabel>
                      <FormControl><Input placeholder="Nome completo do responsável" className="h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={empresaForm.control} name="responsavelTelefone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>DDD + Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" className="h-12" {...field}
                          onChange={(e) => {
                            const d = e.target.value.replace(/\D/g, "").slice(0, 11);
                            let f = d;
                            if (d.length > 2) f = `(${d.slice(0, 2)}) ${d.slice(2)}`;
                            if (d.length > 7) f = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
                            field.onChange(f);
                          }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Cadastrando empresa…</span>
                  ) : (
                    <span className="flex items-center gap-2">Cadastrar-se <ArrowRight className="w-4 h-4" /></span>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            /* MODO CASA */
            <div className="space-y-5">
              <div className="space-y-2">
                <FormLabel>Tipo de Documento</FormLabel>
                <Select value={tipoDoc} onValueChange={(v) => {
                  setTipoDoc(v as TipoDoc);
                  casaCPFForm.reset({ documento: "", telefone: getInitialPhone(), dataNascimento: "", cep: "", rua: "", numero: "", complemento: "", referencia: "", bairro: "", cidade: "", estado: "" });
                  casaCNPJForm.reset({ documento: "", nomeOuRazao: "", telefone: getInitialPhone(), ramo: "", responsavelNome: "", responsavelTelefone: "", cep: "", rua: "", numero: "", complemento: "", referencia: "", bairro: "", cidade: "", estado: "" });
                }}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isCasaCPF ? (
                  <Form {...casaCPFForm}>
                    <div className="space-y-5">
                      <FormField control={casaCPFForm.control} name="documento" render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl><Input placeholder="000.000.000-00" className="h-12" {...field}
                            onChange={(e) => field.onChange(maskCPF(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={casaCPFForm.control} name="telefone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input placeholder="(11) 99999-9999" className="pl-10 h-12" {...field}
                                onChange={(e) => field.onChange(formatPhone(e.target.value))} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={casaCPFForm.control} name="dataNascimento" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <DatePicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Endereço Casa CPF */}
                      <div className="border-t border-border pt-5 space-y-4">
                        <h3 className="text-lg font-display font-semibold">Endereço</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={casaCPFForm.control} name="cep" render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl><Input placeholder="00000-000" className="h-12" {...field}
                                onChange={(e) => handleCepChange(e.target.value, casaCPFForm)} /></FormControl>
                              {cepLoading && <p className="text-xs text-muted-foreground">Buscando CEP...</p>}
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={casaCPFForm.control} name="estado" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="UF" /></SelectTrigger></FormControl>
                                <SelectContent>{estadosBR.map((uf) => (<SelectItem key={uf} value={uf}>{uf}</SelectItem>))}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={casaCPFForm.control} name="rua" render={({ field }) => (
                          <FormItem><FormLabel>Rua</FormLabel><FormControl><Input placeholder="Nome da rua" className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={casaCPFForm.control} name="numero" render={({ field }) => (
                            <FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="Nº" className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={casaCPFForm.control} name="complemento" render={({ field }) => (
                            <FormItem><FormLabel>Complemento</FormLabel><FormControl><Input placeholder="Apto, Bloco..." className="h-12" {...field} /></FormControl></FormItem>
                          )} />
                          <FormField control={casaCPFForm.control} name="referencia" render={({ field }) => (
                            <FormItem><FormLabel>Referência</FormLabel><FormControl><Input placeholder="Próximo a..." className="h-12" {...field} /></FormControl></FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={casaCPFForm.control} name="bairro" render={({ field }) => (
                            <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Bairro" className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={casaCPFForm.control} name="cidade" render={({ field }) => (
                            <FormItem><FormLabel>Cidade</FormLabel><FormControl><CitySelect value={field.value} onValueChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
                        {isLoading ? (
                          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Cadastrando…</span>
                        ) : (
                          <span className="flex items-center gap-2">Cadastrar-se <ArrowRight className="w-4 h-4" /></span>
                        )}
                      </Button>
                    </div>
                  </Form>
                ) : (
                  /* CASA CNPJ */
                  <Form {...casaCNPJForm}>
                    <div className="space-y-5">
                      <FormField control={casaCNPJForm.control} name="documento" render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl><Input placeholder="00.000.000/0000-00" className="h-12" {...field}
                            onChange={(e) => field.onChange(maskCNPJ(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={casaCNPJForm.control} name="nomeOuRazao" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razão Social</FormLabel>
                          <FormControl><Input placeholder="Razão Social da empresa" className="h-12" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={casaCNPJForm.control} name="ramo" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ramo do Estabelecimento</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="Selecione o ramo" /></SelectTrigger></FormControl>
                            <SelectContent>{ramosEstabelecimento.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="border-t border-border pt-5 space-y-4">
                        <h3 className="text-base font-semibold flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-primary" /> Responsável pela Operação
                        </h3>
                        <FormField control={casaCNPJForm.control} name="responsavelNome" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome e Sobrenome</FormLabel>
                            <FormControl><Input placeholder="Nome completo do responsável" className="h-12" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={casaCNPJForm.control} name="responsavelTelefone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>DDD + Telefone do Responsável</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" className="h-12" {...field}
                                onChange={(e) => {
                                  const d = e.target.value.replace(/\D/g, "").slice(0, 11);
                                  let f = d;
                                  if (d.length > 2) f = `(${d.slice(0, 2)}) ${d.slice(2)}`;
                                  if (d.length > 7) f = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
                                  field.onChange(f);
                                }} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={casaCNPJForm.control} name="telefone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input placeholder="(11) 99999-9999" className="pl-10 h-12" {...field}
                                onChange={(e) => field.onChange(formatPhone(e.target.value))} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Endereço Casa CNPJ */}
                      <div className="border-t border-border pt-5 space-y-4">
                        <h3 className="text-lg font-display font-semibold">Endereço</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={casaCNPJForm.control} name="cep" render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl><Input placeholder="00000-000" className="h-12" {...field}
                                onChange={(e) => handleCepChange(e.target.value, casaCNPJForm)} /></FormControl>
                              {cepLoading && <p className="text-xs text-muted-foreground">Buscando CEP...</p>}
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={casaCNPJForm.control} name="estado" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="UF" /></SelectTrigger></FormControl>
                                <SelectContent>{estadosBR.map((uf) => (<SelectItem key={uf} value={uf}>{uf}</SelectItem>))}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={casaCNPJForm.control} name="rua" render={({ field }) => (
                          <FormItem><FormLabel>Rua</FormLabel><FormControl><Input placeholder="Nome da rua" className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={casaCNPJForm.control} name="numero" render={({ field }) => (
                            <FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="Nº" className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={casaCNPJForm.control} name="complemento" render={({ field }) => (
                            <FormItem><FormLabel>Complemento</FormLabel><FormControl><Input placeholder="Apto, Bloco..." className="h-12" {...field} /></FormControl></FormItem>
                          )} />
                          <FormField control={casaCNPJForm.control} name="referencia" render={({ field }) => (
                            <FormItem><FormLabel>Referência</FormLabel><FormControl><Input placeholder="Próximo a..." className="h-12" {...field} /></FormControl></FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={casaCNPJForm.control} name="bairro" render={({ field }) => (
                            <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Bairro" className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={casaCNPJForm.control} name="cidade" render={({ field }) => (
                            <FormItem><FormLabel>Cidade</FormLabel><FormControl><CitySelect value={field.value} onValueChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
                        {isLoading ? (
                          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Cadastrando…</span>
                        ) : (
                          <span className="flex items-center gap-2">Cadastrar-se <ArrowRight className="w-4 h-4" /></span>
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </div>
            )}
         </div>
       </div>

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
