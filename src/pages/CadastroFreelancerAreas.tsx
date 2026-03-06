import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Briefcase, Clock, X, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import logoFreela from "@/assets/logo-freela.png";
import { useToast } from "@/hooks/use-toast";
import { registerProvider } from "@/lib/api";

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

const diasSemana = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

const horasDisponiveis = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

type Horarios = Record<string, { de: string; ate: string }>;

const CadastroFreelancerAreas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>([]);
  const [diasAtivos, setDiasAtivos] = useState<string[]>([]);
  const [horarios, setHorarios] = useState<Horarios>({
    seg: { de: "08:00", ate: "18:00" },
    ter: { de: "08:00", ate: "18:00" },
    qua: { de: "08:00", ate: "18:00" },
    qui: { de: "08:00", ate: "18:00" },
    sex: { de: "08:00", ate: "18:00" },
    sab: { de: "10:00", ate: "16:00" },
    dom: { de: "10:00", ate: "14:00" },
  });
  const [horarioDialog, setHorarioDialog] = useState<string | null>(null);
  const [tempDe, setTempDe] = useState("");
  const [tempAte, setTempAte] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleArea = (id: string) => {
    setAreasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleDia = (key: string) => {
    setDiasAtivos((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const openHorario = (key: string) => {
    setTempDe(horarios[key]?.de || "08:00");
    setTempAte(horarios[key]?.ate || "18:00");
    setHorarioDialog(key);
  };

  const saveHorario = () => {
    if (horarioDialog) {
      setHorarios((prev) => ({ ...prev, [horarioDialog]: { de: tempDe, ate: tempAte } }));
      setHorarioDialog(null);
    }
  };

  const formatHorario = (key: string) => {
    const h = horarios[key];
    if (!h) return "--";
    return `${h.de.replace(":00", "h")}-${h.ate.replace(":00", "h")}`;
  };

  const diaLabel = diasSemana.find((d) => d.key === horarioDialog)?.label || "";

  const validate = () => {
    const e: Record<string, string> = {};
    if (areasSelecionadas.length === 0) e.areas = "Selecione pelo menos uma área de atuação";
    if (diasAtivos.length === 0) e.dias = "Selecione pelo menos um dia disponível";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: "Cadastro finalizado!", description: "Seu perfil está completo. Bem-vindo à Freela!" });
      navigate("/dashboard-freelancer");
    }, 1500);
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

      {/* Left Side */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 sticky top-0 h-screen">
        <div className="max-w-lg">
          <CheckCircle className="w-16 h-16 text-secondary mb-6" />
          <h2 className="text-3xl font-display font-bold text-secondary mb-4">Última etapa!</h2>
          <p className="text-secondary/80 text-lg mb-8">
            Defina suas áreas de atuação e horários disponíveis para receber vagas compatíveis com seu perfil.
          </p>
          <ul className="space-y-3">
            {[
              "Vagas filtradas pelo seu perfil",
              "Notificações de oportunidades na sua região",
              "Flexibilidade total de horários",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-secondary/90">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col justify-start container-padding py-12 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto">
          <Link to="/" className="inline-block mb-8">
            <img src={logoFreela} alt="Freela Serviços" className="h-12" />
          </Link>

          <div className="mb-2">
            <p className="text-sm text-primary font-semibold">Etapa 3 de 3</p>
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Áreas e Disponibilidade</h1>
          <p className="text-muted-foreground mb-8">Selecione onde e quando você quer trabalhar</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Áreas de Atuação */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-1">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Áreas de Atuação
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione todas as áreas em que você atua.
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

            {/* Disponibilidade - Quadradinhos com relógio */}
            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-primary" />
                  Horários Disponíveis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Clique nos dias para ativar e use o relógio para definir o horário.
                </p>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {diasSemana.map((dia) => {
                  const ativo = diasAtivos.includes(dia.key);
                  return (
                    <div key={dia.key} className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleDia(dia.key)}
                        className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
                          ativo
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30"
                        }`}
                      >
                        <span className="text-sm font-bold">{dia.label}</span>
                        {ativo && (
                          <span className="text-[10px] mt-0.5 opacity-90">{formatHorario(dia.key)}</span>
                        )}
                      </button>
                      {ativo && (
                        <button
                          type="button"
                          onClick={() => openHorario(dia.key)}
                          className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                        >
                          <Clock className="w-4 h-4 text-primary" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.dias && <p className="text-sm text-destructive">{errors.dias}</p>}
            </div>

            <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Finalizando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Finalizar cadastro <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Dialog de horário */}
      <Dialog open={!!horarioDialog} onOpenChange={(open) => !open && setHorarioDialog(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Horário — {diaLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">De</label>
              <select value={tempDe} onChange={(e) => setTempDe(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                {horasDisponiveis.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Até</label>
              <select value={tempAte} onChange={(e) => setTempAte(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                {horasDisponiveis.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setHorarioDialog(null)}>Cancelar</Button>
            <Button onClick={saveHorario}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CadastroFreelancerAreas;
