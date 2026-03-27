import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createVacancy, getContractorProfile, type ContractorProfile } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar as CalendarIcon, MapPin, Users, ArrowRight, ChevronDown, ChevronUp, Building2, Info, FileText, AlertCircle, DollarSign, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { servicosPF, FREELA_COMMISSION } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import ServicoCard, { getServiceIcon, calcHours } from "./ServicoCard";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { errorMessages } from "@/lib/error-messages";

interface SelectedService {
  id: string;
  label: string;
  quantidade: number;
  horaInicio: string;
  horaFim: string;
  pricePerHour: number;
  minHours: number;
}


const CriarEventoEmpresas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [contractorProfile, setContractorProfile] = useState<ContractorProfile | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [descricaoVaga, setDescricaoVaga] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [noEstabelecimento, setNoEstabelecimento] = useState(true);
  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    referencia: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const maskCEP = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.replace(/(\d{5})(\d)/, "$1-$2");
  };

  const buscarCep = useCallback(async (digits: string) => {
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEndereco((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
          complemento: data.complemento || prev.complemento,
        }));
      }
    } catch {
      // silently fail
    } finally {
      setCepLoading(false);
    }
  }, []);

  const handleCepChange = (value: string) => {
    const masked = maskCEP(value);
    setEndereco((prev) => ({ ...prev, cep: masked }));
    const digits = value.replace(/\D/g, "");
    if (digits.length === 8) {
      buscarCep(digits);
    }
  };

  // Fetch contractor profile on mount
  useEffect(() => {
    const tokenRaw = localStorage.getItem("authToken");
    if (!tokenRaw) return;
    try {
      const token = JSON.parse(tokenRaw);
      getContractorProfile(token)
        .then((p) => {
          console.log("[CriarEvento] profile carregado no mount:", JSON.stringify(p));
          setContractorProfile(p);
        })
        .catch((err) => console.error("[CriarEvento] Contractor profile error:", err));
    } catch {
      console.error("[CriarEvento] Failed to parse authToken");
    }
  }, []);

  const toggleService = (servico: (typeof servicosPF)[number]) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === servico.id);
      if (exists) {
        return prev.filter((s) => s.id !== servico.id);
      }
      return [
        ...prev,
        {
          id: servico.id,
          label: servico.label,
          quantidade: 1,
          horaInicio: "",
          horaFim: "",
          pricePerHour: servico.pricePerHour,
          minHours: servico.minHoursEmpresa,
        },
      ];
    });
  };

  const updateService = (id: string, field: string, value: string | number) => {
    setSelectedServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeService = (id: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== id));
  };

  const servicePricing = useMemo(() => {
    return selectedServices.map((s) => {
      const hours = calcHours(s.horaInicio, s.horaFim);
      const effectiveHours = hours > 0 ? Math.max(hours, s.minHours) : 0;
      const subtotal = s.pricePerHour * effectiveHours * s.quantidade;
      const commission = subtotal * FREELA_COMMISSION;
      const freelancerValue = s.quantidade > 0 ? (subtotal - commission) / s.quantidade : 0;
      return {
        ...s,
        hours,
        effectiveHours,
        subtotal,
        commission,
        freelancerValue,
        total: subtotal,
      };
    });
  }, [selectedServices]);

   const valorTotal = useMemo(() => {
     const subtotal = servicePricing.reduce((sum, s) => sum + s.total, 0);
     return subtotal + 1.00; // Add R$ 1,00 for Pix payment (secure)
   }, [servicePricing]);


  const totalSubtotal = useMemo(() => {
    return servicePricing.reduce((sum, s) => sum + s.subtotal, 0);
  }, [servicePricing]);

  const totalProfissionais = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.quantidade, 0);
  }, [selectedServices]);

  /**
   * Hora mínima permitida para início do serviço.
   * Regra: quando o evento é hoje, a abertura de vaga deve ser
   * no mínimo 1 hora depois do horário atual.
   * Retorna string "XXh" ou undefined (sem restrição) se o evento não for hoje.
   */
  const horaMinima = useMemo((): string | undefined => {
    if (!dataEvento) return undefined;
    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    if (dataEvento !== hojeStr) return undefined;
    // Hora atual + 1h, arredondada para cima para hora cheia
    const minHour = hoje.getHours() + 1;
    const capped = Math.min(minHour, 23);
    return `${String(capped).padStart(2, "0")}h`;
  }, [dataEvento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate services
    if (selectedServices.length === 0) {
      toast({ title: "Selecione ao menos um serviço", variant: "destructive" });
      return;
    }

    // Validate date
    if (!dataEvento) {
      toast({ title: "Informe a data do evento", variant: "destructive" });
      return;
    }

    // Validate description
    if (!descricaoVaga.trim()) {
      toast({ title: "Preencha a descrição da vaga", variant: "destructive" });
      return;
    }

    // Validate each service has valid hours
    for (const s of selectedServices) {
      const hours = calcHours(s.horaInicio, s.horaFim);
      if (!s.horaInicio || !s.horaFim || hours <= 0) {
        toast({ title: `Configure o horário de "${s.label}"`, variant: "destructive" });
        return;
      }
      if (hours < s.minHours) {
        toast({
          title: `Horas insuficientes para "${s.label}"`,
          description: `O mínimo é ${s.minHours}h. Você configurou ${hours.toFixed(1)}h.`,
          variant: "destructive",
        });
        return;
      }
      if (hours > 12) {
        toast({
          title: `Horas excedidas para "${s.label}"`,
          description: `O limite máximo é de 12h. Você configurou ${hours.toFixed(1)}h.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate contractor profile
    const tokenRaw = localStorage.getItem("authToken");
    if (!tokenRaw) {
      toast({ title: "Sessão expirada. Faça login novamente.", variant: "destructive" });
      navigate("/login");
      return;
    }

    let parsedToken: string;
    try {
      parsedToken = JSON.parse(tokenRaw);
    } catch {
      toast({ title: "Sessão expirada. Faça login novamente.", variant: "destructive" });
      navigate("/login");
      return;
    }

    let profile = contractorProfile;
    if (!profile) {
      try {
        profile = await getContractorProfile(parsedToken);
        setContractorProfile(profile);
      } catch {
        toast({ title: "Não foi possível carregar o perfil do contratante.", variant: "destructive" });
        return;
      }
    }

    console.log("[CriarEvento] contractor profile completo:", JSON.stringify(profile));

    // Build establishment from "Local do Evento"
    let establishment = "";
    if (noEstabelecimento && profile) {
      const parts = [
        profile.street || profile.address,
        profile.number ? `, ${profile.number}` : "",
        profile.neighborhood ? ` - ${profile.neighborhood}` : "",
        profile.city ? `, ${profile.city}` : "",
        profile.state ? ` - ${profile.state}` : "",
        profile.cep ? ` • CEP: ${profile.cep}` : "",
        profile.reference ? ` • Ref: ${profile.reference}` : "",
      ];
      establishment = parts.join("").trim();
      if (!establishment) {
        establishment =
          (profile.establishmentName as string | undefined)?.trim() ||
          (profile.fantasyName as string | undefined)?.trim() ||
          (profile.name as string | undefined)?.trim() ||
          "";
      }
    } else {
      const parts = [
        endereco.logradouro,
        endereco.numero ? `, ${endereco.numero}` : "",
        endereco.cidade ? `, ${endereco.cidade}` : "",
        endereco.estado ? ` - ${endereco.estado}` : "",
        endereco.cep ? ` • CEP: ${endereco.cep}` : "",
        endereco.referencia ? ` • Ref: ${endereco.referencia}` : "",
      ];
      establishment = parts.join("").trim();
    }
    const contractorId = profile.id;

    if (!contractorId) {
      toast({ title: "Perfil de contratante não encontrado.", variant: "destructive" });
      return;
    }

    if (!establishment) {
      toast({
        title: "Nome do estabelecimento não encontrado",
        description: "Atualize o nome do seu estabelecimento em Meus Dados e tente novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Build freelancers array from selected services
      const freelancers = servicePricing
        .filter((sp) => sp.hours > 0)
        .map((s) => ({
          quantity: s.quantidade,
          assignment: s.label,
          jobTime: `${Math.floor(s.effectiveHours)}h`,
          jobValue: s.total.toFixed(2),
        }));

      await createVacancy(
        {
          establishment,
          description: descricaoVaga.trim(),
          jobDate: new Date(dataEvento + "T12:00:00").toISOString(),
          contractorId,
          freelancers,
        },
        parsedToken
      );

      toast({
        title: "✅ Vaga criada com sucesso!",
        description: "Freelancers já podem se candidatar.",
        className: "bg-green-600 text-white border-green-700",
        duration: 3000,
      });
      setTimeout(() => navigate("/dashboard-contratante"), 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar vaga.";
      toast({ title: "Erro ao criar vaga", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Building2 className="w-3.5 h-3.5" />
          <span>Freela para Empresas</span>
        </div>
        <h1 className="text-xl font-display font-bold mb-1">Nova contratação</h1>
        <p className="text-sm text-muted-foreground">
          Monte seu evento selecionando os serviços que precisa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ========== STEP 1: Serviços ========== */}
        <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-semibold text-foreground">Serviços necessários</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedServices.length > 0
                      ? `${selectedServices.length} selecionado${selectedServices.length > 1 ? "s" : ""}`
                      : "Selecione os profissionais"}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${servicesOpen ? "rotate-180" : ""}`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {servicosPF.map((servico) => {
                const isSelected = selectedServices.some((s) => s.id === servico.id);
                return (
                  <button
                    key={servico.id}
                    type="button"
                    onClick={() => toggleService(servico)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left text-xs ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/20 bg-card"
                    }`}
                  >
                    <span className="text-base">{getServiceIcon(servico.id)}</span>
                    <span className={`font-medium leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {servico.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* ========== STEP 2: Cards dos serviços selecionados ========== */}
        {selectedServices.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                {selectedServices.length}
              </span>
              Configure cada serviço
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedServices.map((service) => (
                <ServicoCard
                  key={service.id}
                  label={service.label}
                  icon={getServiceIcon(service.id)}
                  quantidade={service.quantidade}
                  horaInicio={service.horaInicio}
                  horaFim={service.horaFim}
                  onQuantidadeChange={(val) => updateService(service.id, "quantidade", val)}
                  onHoraInicioChange={(val) => updateService(service.id, "horaInicio", val)}
                  onHoraFimChange={(val) => updateService(service.id, "horaFim", val)}
                  onRemove={() => removeService(service.id)}
                  pricePerHour={service.pricePerHour}
                  minHours={service.minHours}
                  horaMinima={horaMinima}
                />
              ))}
            </div>
          </div>
        )}

        {/* ========== STEP 3: Data ========== */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Data do evento</h2>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal",
                  !dataEvento && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataEvento
                  ? format(new Date(dataEvento + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
                  : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dataEvento ? new Date(dataEvento + "T12:00:00") : undefined}
                onSelect={(date) => {
                  if (date) setDataEvento(format(date, "yyyy-MM-dd"));
                }}
                initialFocus
                className="pointer-events-auto"
                captionLayout="dropdown-buttons"
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 2}
                locale={ptBR}
                labels={{
                  labelMonthDropdown: () => "Mês",
                  labelYearDropdown: () => "Ano",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* ========== STEP 4: Local ========== */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Local do evento</h2>
                <p className="text-xs text-muted-foreground">No seu estabelecimento?</p>
              </div>
            </div>
            <Switch
              checked={noEstabelecimento}
              onCheckedChange={setNoEstabelecimento}
            />
          </div>

          {/* Establishment address (always shown when toggle is ON) */}
          {noEstabelecimento && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1 animate-in fade-in duration-200">
              <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                Endereço do estabelecimento
              </p>
              {contractorProfile ? (
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{contractorProfile.establishmentName || contractorProfile.fantasyName || contractorProfile.name || "—"}</p>
                  {(contractorProfile.street || contractorProfile.address) && (
                    <p>
                      {String(contractorProfile.street || contractorProfile.address)}
                      {contractorProfile.number ? `, ${String(contractorProfile.number)}` : ""}
                    </p>
                  )}
                  {(contractorProfile.neighborhood) && (
                    <p>{String(contractorProfile.neighborhood)}</p>
                  )}
                  {(contractorProfile.city || contractorProfile.state) && (
                    <p>
                      {String(contractorProfile.city || "")}
                      {contractorProfile.city && contractorProfile.state ? " - " : ""}
                      {String(contractorProfile.state || "")}
                      {contractorProfile.cep ? ` • CEP: ${String(contractorProfile.cep)}` : ""}
                    </p>
                  )}
                  {contractorProfile.reference && (
                    <p className="text-muted-foreground/80">Ref: {String(contractorProfile.reference)}</p>
                  )}
                  {!contractorProfile.street && !contractorProfile.address && !contractorProfile.city && (
                    <p className="italic text-muted-foreground/70">Endereço não cadastrado. Atualize em Meus Dados.</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/70 italic">Carregando dados do estabelecimento...</p>
              )}
            </div>
          )}

          {!noEstabelecimento && (
            <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-muted/50 rounded-lg p-2.5 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Informe o endereço onde os profissionais deverão comparecer.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">CEP</Label>
                  <Input
                    placeholder="00000-000"
                    value={endereco.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    className="h-9 rounded-lg text-sm"
                  />
                  {cepLoading && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Buscando endereço...
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Logradouro</Label>
                  <Input
                    placeholder="Rua, Avenida..."
                    value={endereco.logradouro}
                    onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })}
                    className="h-9 rounded-lg text-sm"
                    required={!noEstabelecimento}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Número</Label>
                  <Input
                    placeholder="123"
                    value={endereco.numero}
                    onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                    className="h-9 rounded-lg text-sm"
                    required={!noEstabelecimento}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Complemento</Label>
                  <Input
                    placeholder="Opcional"
                    value={endereco.complemento}
                    onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                    className="h-9 rounded-lg text-sm"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Referência</Label>
                  <Input
                    placeholder="Próximo a..."
                    value={endereco.referencia}
                    onChange={(e) => setEndereco({ ...endereco, referencia: e.target.value })}
                    className="h-9 rounded-lg text-sm"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Bairro</Label>
                  <Input
                    placeholder="Bairro"
                    value={endereco.bairro}
                    onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                    className="h-9 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Cidade</Label>
                  <Input
                    placeholder="São Paulo"
                    value={endereco.cidade}
                    onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                    className="h-9 rounded-lg text-sm"
                    required={!noEstabelecimento}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Estado</Label>
                  <Input
                    placeholder="SP"
                    value={endereco.estado}
                    onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })}
                    className="h-9 rounded-lg text-sm"
                    maxLength={2}
                    required={!noEstabelecimento}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========== STEP 5: Descrição da Vaga ========== */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Descrição da vaga</h2>
              <p className="text-xs text-muted-foreground">Descreva detalhes importantes para os freelancers, como vestimenta, regras e comportamento esperado.</p>
            </div>
          </div>
          <Textarea
            placeholder="Ex: Preciso de garçons com experiência em buffet para evento corporativo de 200 pessoas..."
            value={descricaoVaga}
            onChange={(e) => setDescricaoVaga(e.target.value)}
            className="min-h-[100px] rounded-lg text-sm"
          />
        </div>

        {/* ========== RESUMO DE VALORES ========== */}
        {servicePricing.some(s => s.hours > 0) && (
          <div className="bg-card border-2 border-primary/20 rounded-xl overflow-hidden">
            {/* Total em destaque */}
            <div className="bg-primary/5 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Valor total estimado</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedServices.length} serviço{selectedServices.length > 1 ? "s" : ""} • {totalProfissionais} profissiona{totalProfissionais > 1 ? "is" : "l"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-display font-bold text-primary">
                    R$ {valorTotal.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
              {dataEvento && (
                <p className="text-xs text-muted-foreground mt-2">
                  📅 {new Date(dataEvento + "T12:00:00").toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>

            {/* Botão para expandir detalhes */}
            <button
              type="button"
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="w-full flex items-center justify-between px-5 py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-t border-border/50"
            >
              <span>Ver detalhamento por serviço</span>
              {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Detalhes expandidos */}
            {detailsOpen && (
              <div className="px-5 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-border/50">
                {servicePricing.filter(s => s.hours > 0).map((s) => (
                  <div key={s.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getServiceIcon(s.id)}</span>
                        <span className="text-sm font-semibold text-foreground">{s.label}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        R$ {s.total.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5 pl-7">
                      <p>
                        R$ {s.pricePerHour.toFixed(2).replace(".", ",")}/h × {s.effectiveHours}h × {s.quantidade} pessoa{s.quantidade > 1 ? "s" : ""} = R$ {s.subtotal.toFixed(2).replace(".", ",")}
                      </p>
                      
                    </div>
                  </div>
                ))}

                 {/* Totais gerais */}
                 <div className="border-t border-border pt-3 space-y-1 text-xs">
                   <div className="flex justify-between">
                     <span>Pagamento via Pix (seguro):</span>
                     <span>R$ 1,00</span>
                   </div>
                   <div className="flex justify-between font-bold text-sm text-foreground pt-1">
                     <span>Total</span>
                     <span>R$ {valorTotal.toFixed(2).replace(".", ",")}</span>
                   </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Informativo de contratação */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Contratação</p>
            <p className="text-xs text-amber-700 dark:text-amber-400/80">
              Você pode criar vagas 1 hora antes do início à 3 meses antes do início.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-sm rounded-xl"
          disabled={isLoading || selectedServices.length === 0}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Criando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Publicar Vaga
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default CriarEventoEmpresas;
