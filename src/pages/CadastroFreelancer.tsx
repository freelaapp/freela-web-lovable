import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CitySelect from "@/components/CitySelect";
import { ArrowRight, ArrowLeft, CheckCircle, Camera, X, User, Phone, Heart } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { differenceInYears } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { validateCPF } from "@/lib/utils";
import logoFreela from "@/assets/logo-freela-new.png";
import { useToast } from "@/hooks/use-toast";
import { extractApiError } from "@/lib/api-error";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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

const freelancerSchema = z.object({
  cpf: z.string().min(1, "CPF é obrigatório").refine((v) => validateCPF(v), "CPF inválido"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória")
    .refine((v) => {
      if (!v) return false;
      return differenceInYears(new Date(), new Date(v)) >= 18;
    }, "Você deve ter pelo menos 18 anos"),
  sexo: z.string().min(1, "Sexo é obrigatório"),
  cep: z.string().optional(),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório"),
  tipoChavePix: z.string().optional(),
  chavePix: z.string().optional(),
  contatoEmergNome: z.string().optional(),
  contatoEmergParentesco: z.string().optional(),
  contatoEmergTelefone: z.string().optional(),
});

type FreelancerFormData = z.infer<typeof freelancerSchema>;

const CadastroFreelancer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [isPCD, setIsPCD] = useState(false);
  const [deficienciasSelecionadas, setDeficienciasSelecionadas] = useState<string[]>([]);
  const [cepLoading, setCepLoading] = useState(false);

  const form = useForm<FreelancerFormData>({
    resolver: zodResolver(freelancerSchema),
    defaultValues: {
      cpf: "", dataNascimento: "", sexo: "",
      cep: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
      tipoChavePix: "", chavePix: "",
      contatoEmergNome: "", contatoEmergParentesco: "", contatoEmergTelefone: "",
    },
  });

  const buscarCep = useCallback(async (cepValue: string) => {
    const digits = cepValue.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        form.setValue("endereco", data.logradouro || "");
        form.setValue("bairro", data.bairro || "");
        form.setValue("cidade", data.localidade || "");
        form.setValue("estado", data.uf || "");
        try {
          localStorage.setItem("freelancerViacepData", JSON.stringify({
            ibge: data.ibge || "", gia: data.gia || "", ddd: data.ddd || "", siafi: data.siafi || "",
          }));
        } catch { /* quota exceeded */ }
      }
    } catch { /* silently fail */ }
    finally { setCepLoading(false); }
  }, [form]);

  const handleCepChange = (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 8);
    const masked = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
    form.setValue("cep", masked);
    if (d.length === 8) buscarCep(d);
  };

  const previewFoto = useMemo(() => fotoPerfil ? URL.createObjectURL(fotoPerfil) : null, [fotoPerfil]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: FreelancerFormData) => {
    if (!fotoPerfil) {
      toast({ title: "Foto obrigatória", description: "A foto de perfil é obrigatória.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      let fotoBase64 = "";
      if (fotoPerfil) fotoBase64 = await fileToBase64(fotoPerfil);

      const freelancerData = {
        fotoBase64,
        fotoName: fotoPerfil.name,
        fotoType: fotoPerfil.type,
        cpf: data.cpf.replace(/\D/g, ""),
        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento).toISOString() : "",
        sexo: data.sexo,
        isPCD,
        deficienciasSelecionadas,
        deficiency: isPCD ? "Sim" : "Não",
        cep: (data.cep || "").replace(/\D/g, ""),
        street: data.endereco,
        complement: data.complemento || "",
        neighborhood: data.bairro || "",
        number: data.numero,
        city: data.cidade,
        uf: data.estado,
        tipoChavePix: data.tipoChavePix || "",
        pixKeyValue: data.chavePix || "",
        emergencyContactName: data.contatoEmergNome || "",
        emergencyContactRelationship: data.contatoEmergParentesco || "",
        emergencyContactNumber: (data.contatoEmergTelefone || "").replace(/\D/g, ""),
      };

      try {
        localStorage.setItem("freelancerFormData", JSON.stringify(freelancerData));
      } catch {
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
    } catch (err) {
      toast({ title: "Erro", description: extractApiError(err), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      <button onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-card shadow-md border border-border hover:bg-muted transition-colors"
        aria-label="Voltar">
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 sticky top-0 h-screen">
        <div className="max-w-md">
          <h2 className="text-3xl font-display font-bold text-secondary mb-4 text-left">Junte-se à comunidade Freela</h2>
          <p className="text-secondary/80 text-lg mb-8 leading-relaxed text-left">
            Conecte-se a pessoas e oportunidades na sua região.
          </p>
          <ul className="space-y-4">
            {["Cadastro rápido e 100% gratuito", "Tenha acesso a avaliações e histórico dos profissionais", "Conecte-se a oportunidades ou profissionais próximos de você", "Flexibilidade para trabalhar ou contratar quando precisar", "Contratação rápida e sem burocracia", "Suporte dedicado para ajudar sempre que necessário"].map((item) => (
              <li key={item} className="flex items-start gap-3 text-secondary/90 text-base">
                <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" /><span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-start container-padding py-12 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto">
          <Link to="/" className="inline-block mb-8">
            <img src={logoFreela} alt="Freela Serviços" className="h-24" />
          </Link>

          <div className="mb-2"><p className="text-sm text-primary font-semibold">Etapa 2 de 3</p></div>
          <h1 className="text-3xl font-display font-bold mb-2">Cadastro Freelancer</h1>
          <p className="text-muted-foreground mb-8">Complete seus dados para começar a trabalhar</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Foto de Perfil */}
              <div className="space-y-2">
                <FormLabel>Foto de Perfil</FormLabel>
                <div className="flex items-center gap-4">
                  {previewFoto ? (
                    <div className="relative">
                      <img src={previewFoto} alt="Foto de perfil" className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
                      <button type="button" onClick={() => setFotoPerfil(null)}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Adicionar</span>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const file = e.target.files?.[0]; if (file && file.type.startsWith("image/")) setFotoPerfil(file); }} />
                    </label>
                  )}
                  <p className="text-sm text-muted-foreground">Escolha uma foto profissional e com boa iluminação.</p>
                </div>
              </div>

              {/* CPF */}
              <FormField control={form.control} name="cpf" render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" className="h-12" {...field}
                      onChange={(e) => field.onChange(maskCPF(e.target.value))} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground italic">
                    Seu CPF só será visível para o contratante após a confirmação da contratação de uma vaga.
                  </p>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Data de Nascimento */}
              <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Sexo */}
              <FormField control={form.control} name="sexo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                      <SelectItem value="prefiro-nao-dizer">Prefiro não dizer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* PCD */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm">Possui alguma Necessidade Especial? (PCD)</FormLabel>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{isPCD ? "Sim" : "Não"}</span>
                    <Switch checked={isPCD} onCheckedChange={setIsPCD} />
                  </div>
                </div>
                {isPCD && (
                  <div className="space-y-2 pl-1">
                    <FormLabel className="text-sm text-muted-foreground">Tipo de deficiência</FormLabel>
                    <div className="space-y-2">
                      {tiposDeficiencia.map((tipo) => (
                        <div key={tipo.id} className="flex items-center gap-2">
                          <Checkbox id={`pcd-${tipo.id}`} checked={deficienciasSelecionadas.includes(tipo.id)}
                            onCheckedChange={(checked) => {
                              setDeficienciasSelecionadas((prev) =>
                                checked ? [...prev, tipo.id] : prev.filter((d) => d !== tipo.id)
                              );
                            }} />
                          <label htmlFor={`pcd-${tipo.id}`} className="text-sm font-normal cursor-pointer">{tipo.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <FormField control={form.control} name="cep" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" className="h-12" {...field}
                        onChange={(e) => handleCepChange(e.target.value)} />
                    </FormControl>
                    {cepLoading && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="endereco" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua</FormLabel>
                    <FormControl><Input placeholder="Nome da rua" className="h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="numero" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl><Input placeholder="Nº" className="h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="complemento" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl><Input placeholder="Apto, bloco..." className="h-12" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="bairro" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl><Input placeholder="Bairro" className="h-12" {...field} /></FormControl>
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="cidade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl><CitySelect value={field.value} onValueChange={field.onChange} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="estado" render={({ field }) => (
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
              </div>

              {/* PIX */}
              <FormField control={form.control} name="tipoChavePix" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Chave PIX</FormLabel>
                  <Select onValueChange={(v) => { field.onChange(v); form.setValue("chavePix", ""); }} value={field.value}>
                    <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="Selecione o tipo de chave" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />

              <FormField control={form.control} name="chavePix" render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave PIX</FormLabel>
                  <FormControl><Input placeholder="Informe sua chave PIX" className="h-12" {...field} /></FormControl>
                  <p className="text-xs text-muted-foreground italic">
                    Sua chave PIX será usada para receber os pagamentos pelos serviços realizados.
                  </p>
                </FormItem>
              )} />

              {/* Contato de Emergência */}
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-1">
                  <Phone className="w-5 h-5 text-primary" /> Contato de Emergência
                </h3>

                <FormField control={form.control} name="contatoEmergNome" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl><Input placeholder="Nome do contato" className="h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="contatoEmergParentesco" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grau de Parentesco</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{grausParentesco.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="contatoEmergTelefone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>DDD + Número</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" className="h-12" {...field}
                        onChange={(e) => field.onChange(maskPhone(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
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
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CadastroFreelancer;
