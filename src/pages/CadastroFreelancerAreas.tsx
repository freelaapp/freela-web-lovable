import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Briefcase, Clock, X, CheckCircle } from "lucide-react";
import logoFreela from "@/assets/logo-freela.png";
import { useToast } from "@/hooks/use-toast";

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
  { id: "seg", label: "Segunda" },
  { id: "ter", label: "Terça" },
  { id: "qua", label: "Quarta" },
  { id: "qui", label: "Quinta" },
  { id: "sex", label: "Sexta" },
  { id: "sab", label: "Sábado" },
  { id: "dom", label: "Domingo" },
];

const periodos = [
  { id: "manha", label: "Manhã", horario: "06h - 12h" },
  { id: "tarde", label: "Tarde", horario: "12h - 18h" },
  { id: "noite", label: "Noite", horario: "18h - 00h" },
  { id: "madrugada", label: "Madrugada", horario: "00h - 06h" },
];

const CadastroFreelancerAreas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>([]);
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [periodosSelecionados, setPeriodosSelecionados] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleArea = (id: string) => {
    setAreasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleDia = (id: string) => {
    setDiasSelecionados((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const togglePeriodo = (id: string) => {
    setPeriodosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (areasSelecionadas.length === 0) e.areas = "Selecione pelo menos uma área de atuação";
    if (diasSelecionados.length === 0) e.dias = "Selecione pelo menos um dia disponível";
    if (periodosSelecionados.length === 0) e.periodos = "Selecione pelo menos um período";
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

            {/* Disponibilidade de Horários */}
            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-primary" />
                  Horários Disponíveis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Defina os dias e períodos em que você está disponível para trabalhar.
                </p>
              </div>

              {/* Dias */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Dias da semana</Label>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map((dia) => {
                    const isSelected = diasSelecionados.includes(dia.id);
                    return (
                      <button
                        key={dia.id}
                        type="button"
                        onClick={() => toggleDia(dia.id)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {dia.label}
                      </button>
                    );
                  })}
                </div>
                {errors.dias && <p className="text-sm text-destructive">{errors.dias}</p>}
              </div>

              {/* Períodos */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Períodos</Label>
                <div className="grid grid-cols-2 gap-3">
                  {periodos.map((periodo) => {
                    const isSelected = periodosSelecionados.includes(periodo.id);
                    return (
                      <button
                        key={periodo.id}
                        type="button"
                        onClick={() => togglePeriodo(periodo.id)}
                        className={`p-4 rounded-xl text-left transition-all border ${
                          isSelected
                            ? "bg-primary/10 border-primary shadow-sm"
                            : "bg-background border-border hover:border-primary/50"
                        }`}
                      >
                        <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {periodo.label}
                        </span>
                        <span className={`block text-xs mt-0.5 ${isSelected ? "text-primary/70" : "text-muted-foreground"}`}>
                          {periodo.horario}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.periodos && <p className="text-sm text-destructive">{errors.periodos}</p>}
              </div>
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
    </div>
  );
};

export default CadastroFreelancerAreas;
