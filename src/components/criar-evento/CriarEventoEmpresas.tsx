import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar, MapPin, Users, ArrowRight, ChevronDown, Building2, Info, FileText, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { servicosPF } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import ServicoCard, { getServiceIcon, calcHours } from "./ServicoCard";

interface SelectedService {
  id: string;
  label: string;
  quantidade: number;
  horaInicio: string;
  horaFim: string;
  pricePerHour: number;
  minHours: number;
}

const PRICE_PER_HOUR = 20;
const MIN_HOURS = 6;

const CriarEventoEmpresas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();


  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [descricaoVaga, setDescricaoVaga] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [noEstabelecimento, setNoEstabelecimento] = useState(true);
  const [endereco, setEndereco] = useState({
    logradouro: "",
    numero: "",
    cep: "",
    cidade: "",
    estado: "",
  });
  const [servicesOpen, setServicesOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
          pricePerHour: PRICE_PER_HOUR,
          minHours: MIN_HOURS,
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

  const valorTotal = useMemo(() => {
    return selectedServices.reduce((total, s) => {
      const hours = calcHours(s.horaInicio, s.horaFim);
      if (hours <= 0) return total;
      const effectiveHours = Math.max(hours, s.minHours);
      return total + s.pricePerHour * effectiveHours * s.quantidade;
    }, 0);
  }, [selectedServices]);

  const totalProfissionais = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.quantidade, 0);
  }, [selectedServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      toast({ title: "Selecione ao menos um serviço", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "✅ Contratação criada com sucesso!",
        description: "Freelancers já podem se candidatar.",
        className: "bg-green-600 text-white border-green-700",
        duration: 3000,
      });
      // Redirect to event detail page after toast
      setTimeout(() => {
        navigate("/evento/1");
      }, 800);
    }, 1200);
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
                />
              ))}
            </div>
          </div>
        )}

        {/* ========== STEP 3: Data ========== */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Data do evento</h2>
          </div>
          <Input
            type="date"
            value={dataEvento}
            onChange={(e) => setDataEvento(e.target.value)}
            className="h-10 rounded-lg max-w-xs text-sm"
            required
          />
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
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">CEP</Label>
                  <Input
                    placeholder="00000-000"
                    value={endereco.cep}
                    onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
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
              <p className="text-xs text-muted-foreground">Descreva detalhes importantes para os freelancers</p>
            </div>
          </div>
          <Textarea
            placeholder="Ex: Preciso de garçons com experiência em buffet para evento corporativo de 200 pessoas..."
            value={descricaoVaga}
            onChange={(e) => setDescricaoVaga(e.target.value)}
            className="min-h-[100px] rounded-lg text-sm"
          />
        </div>

        {/* ========== RESUMO + SUBMIT ========== */}
        {selectedServices.length > 0 && valorTotal > 0 && (
          <div className="bg-secondary text-secondary-foreground rounded-xl p-4 space-y-2">
            <h3 className="text-[10px] font-medium uppercase tracking-wide opacity-70">Resumo da vaga</h3>
            <div className="flex items-end justify-between">
              <div className="space-y-0.5">
                <p className="text-xs opacity-80">
                  {selectedServices.length} serviço{selectedServices.length > 1 ? "s" : ""} •{" "}
                  {totalProfissionais} profissiona{totalProfissionais > 1 ? "is" : "l"}
                </p>
                {dataEvento && (
                  <p className="text-xs opacity-80">
                    📅 {new Date(dataEvento + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-60">Valor total estimado</p>
                <p className="text-2xl font-display font-bold">
                  R$ {valorTotal.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
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
              Publicar contratação
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default CriarEventoEmpresas;
