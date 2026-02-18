import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar, MapPin, Users, ArrowRight, ChevronDown, Building2, Info } from "lucide-react";
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
  const [searchParams] = useSearchParams();
  const freelancerExclusivo = searchParams.get("para");
  const { toast } = useToast();

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
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
        title: "Evento criado com sucesso!",
        description: "Você receberá notificações quando freelancers aceitarem.",
      });
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Building2 className="w-4 h-4" />
          <span>Freela para Empresas</span>
        </div>
        {freelancerExclusivo ? (
          <>
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4 flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Proposta exclusiva para{" "}
                  <span className="text-primary font-bold">{freelancerExclusivo}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Este evento será enviado diretamente para o freelancer selecionado.
                </p>
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Criar evento para {freelancerExclusivo}
            </h1>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-display font-bold mb-2">Nova contratação</h1>
            <p className="text-muted-foreground">
              Monte seu evento selecionando os serviços que precisa
            </p>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ========== STEP 1: Serviços ========== */}
        <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold text-foreground">Serviços necessários</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedServices.length > 0
                      ? `${selectedServices.length} selecionado${selectedServices.length > 1 ? "s" : ""}`
                      : "Selecione os profissionais"}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${servicesOpen ? "rotate-180" : ""}`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {servicosPF.map((servico) => {
                const isSelected = selectedServices.some((s) => s.id === servico.id);
                return (
                  <button
                    key={servico.id}
                    type="button"
                    onClick={() => toggleService(servico)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left text-sm ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/20 bg-card"
                    }`}
                  >
                    <span className="text-xl">{getServiceIcon(servico.id)}</span>
                    <span className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {selectedServices.length}
              </span>
              Configure cada serviço
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Data do evento</h2>
          </div>
          <Input
            type="date"
            value={dataEvento}
            onChange={(e) => setDataEvento(e.target.value)}
            className="h-12 rounded-xl max-w-xs"
            required
          />
        </div>

        {/* ========== STEP 4: Local ========== */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Local do evento</h2>
                <p className="text-sm text-muted-foreground">No seu estabelecimento?</p>
              </div>
            </div>
            <Switch
              checked={noEstabelecimento}
              onCheckedChange={setNoEstabelecimento}
            />
          </div>

          {!noEstabelecimento && (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-muted/50 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Informe o endereço onde os profissionais deverão comparecer.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Logradouro</Label>
                  <Input
                    placeholder="Rua, Avenida..."
                    value={endereco.logradouro}
                    onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })}
                    className="h-11 rounded-xl"
                    required={!noEstabelecimento}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Número</Label>
                  <Input
                    placeholder="123"
                    value={endereco.numero}
                    onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                    className="h-11 rounded-xl"
                    required={!noEstabelecimento}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">CEP</Label>
                  <Input
                    placeholder="00000-000"
                    value={endereco.cep}
                    onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Cidade</Label>
                  <Input
                    placeholder="São Paulo"
                    value={endereco.cidade}
                    onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                    className="h-11 rounded-xl"
                    required={!noEstabelecimento}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Estado</Label>
                  <Input
                    placeholder="SP"
                    value={endereco.estado}
                    onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })}
                    className="h-11 rounded-xl"
                    maxLength={2}
                    required={!noEstabelecimento}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========== RESUMO + SUBMIT ========== */}
        {selectedServices.length > 0 && valorTotal > 0 && (
          <div className="bg-secondary text-secondary-foreground rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-medium uppercase tracking-wide opacity-70">Resumo do evento</h3>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-sm opacity-80">
                  {selectedServices.length} serviço{selectedServices.length > 1 ? "s" : ""} •{" "}
                  {totalProfissionais} profissiona{totalProfissionais > 1 ? "is" : "l"}
                </p>
                {dataEvento && (
                  <p className="text-sm opacity-80">
                    📅 {new Date(dataEvento + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs opacity-60">Valor total estimado</p>
                <p className="text-3xl font-display font-bold">
                  R$ {valorTotal.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-base rounded-2xl"
          disabled={isLoading || selectedServices.length === 0}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Criando evento...
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
