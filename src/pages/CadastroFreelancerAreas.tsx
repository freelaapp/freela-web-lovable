/** 
 * CadastroFreelancerAreas.tsx - Cleaned of all merge conflict markers.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft, Briefcase, Clock, X, CheckCircle, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import logoFreela from "@/assets/logo-freela-new.png";
import { useToast } from "@/hooks/use-toast";
import { registerProvider } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

const areasAtuacao = [
  { id: "barista", label: "Barista" },
  { id: "barman", label: "Barman/Bartender" },
  { id: "cozinheiro", label: "Cozinheiro(a)" },
  { id: "garcom", label: "Garçom/Garçonete" },
  { id: "auxiliar-limpeza", label: "Auxiliar de Limpeza" },
  { id: "auxiliar-cozinha", label: "Auxiliar de Cozinha" },
  { id: "camareira", label: "Camareira" },
  { id: "chapeiro", label: "Chapeiro(a)" },
  { id: "cumim", label: "Cumim" },
  { id: "churrasqueiro", label: "Churrasqueiro" },
  { id: "seguranca", label: "Segurança (Não Armado)" },
  { id: "hostess", label: "Hostess/Recepcionista" },
  { id: "manobrista", label: "Manobrista" },
  { id: "dj", label: "DJ" },
  { id: "musico-sertanejo", label: "Músico (Sertanejo)" },
  { id: "musico-rock", label: "Músico (Rock)" },
  { id: "musico-samba-pagode", label: "Músico (Samba e Pagode)" },
  { id: "musico-mpb", label: "Músico (MPB)" },
  { id: "musico-multi", label: "Músico (Multi Estilo)" },
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

const horasDisponiveis = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);

type Horarios = Record<string, { de: string; ate: string }>;

const CadastroFreelancerAreas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recheckAuth, userId, loginSuccess } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>([]);
  const [diasAtivos, setDiasAtivos] = useState<string[]>(["seg", "ter", "qua", "qui", "sex", "sab", "dom"]);
  const [horarios, setHorarios] = useState<Horarios>({
    seg: { de: "00h", ate: "23h" },
    ter: { de: "00h", ate: "23h" },
    qua: { de: "00h", ate: "23h" },
    qui: { de: "00h", ate: "23h" },
    sex: { de: "00h", ate: "23h" },
    sab: { de: "00h", ate: "23h" },
    dom: { de: "00h", ate: "23h" },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleArea = (id: string) => {
    setAreasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

   const toggleDia = (key: string) => {
     console.log('[CadastroFreelancerAreas] toggleDia clicado:', key, 'diasAtivos antes:', diasAtivos);
     setDiasAtivos((prev) => {
       const novo = prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key];
       console.log('[CadastroFreelancerAreas] diasAtivos depois:', novo);
       return novo;
     });
   };

  const updateHorario = (key: string, field: "de" | "ate", value: string) => {
    setHorarios((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (areasSelecionadas.length === 0) e.areas = "Selecione pelo menos uma área de atuação";
    if (diasAtivos.length === 0) {
      e.dias = "Selecione pelo menos um dia disponível";
    } else {
      // Validação de 6 horas para cada dia ativo
      for (const diaKey of diasAtivos) {
        const h = horarios[diaKey];
        const hDe = parseInt(h.de.replace("h", ""));
        const hAte = parseInt(h.ate.replace("h", ""));
        if (hAte - hDe < 6) {
          const label = diasSemana.find((d) => d.key === diaKey)?.label;
          e.dias = `O dia ${label} deve ter no mínimo 6 horas de disponibilidade.`;
          break;
        }
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (errors.dias) {
        toast({
          title: "Disponibilidade insuficiente",
          description: errors.dias,
          variant: "destructive"
        });
      }
      return;
    }
    setIsLoading(true);

    try {
      await recheckAuth();

      const savedRaw = localStorage.getItem("freelancerFormData");
      if (!savedRaw) {
        toast({ title: "Erro", description: "Dados do cadastro não encontrados. Volte à etapa anterior.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      const saved = JSON.parse(savedRaw);

      const viacepRaw = localStorage.getItem("freelancerViacepData");
      const viacep = viacepRaw ? JSON.parse(viacepRaw) : { ibge: "", gia: "", ddd: "", siafi: "" };

      if (!userId) {
        toast({ title: "Sessão expirada", description: "Faça login novamente.", variant: "destructive" });
        navigate("/login");
        setIsLoading(false);
        return;
      }

      const areasLabels = areasSelecionadas
        .map((id) => areasAtuacao.find((a) => a.id === id)?.label || id)
        .join(", ");

      const fd = new FormData();

      if (saved.fotoBase64) {
        const res = await fetch(saved.fotoBase64);
        const rawBlob = await res.blob();
        const mimeType = saved.fotoType || rawBlob.type || "image/jpeg";
        const blob = rawBlob.type === mimeType ? rawBlob : new Blob([rawBlob], { type: mimeType });
        fd.append("profileImage", blob, saved.fotoName || "profile.jpg");
      }

      fd.append("cpf", saved.cpf || "");
      fd.append("birthdate", saved.dataNascimento ? saved.dataNascimento.split("T")[0] : "");
      fd.append("gender", saved.sexo || "");
      fd.append("deficiency", saved.deficiency === "Sim" ? "true" : "false");
      fd.append("schooling", "");
      fd.append("cnh", "");
      fd.append("language", "");
       fd.append("desiredJobVacancy", areasLabels);

       // Enviar availability como JSON string apenas com dias ativos e seus horários
       const horariosFiltrados = Object.fromEntries(
         Object.entries(horarios).filter(([key]) => diasAtivos.includes(key))
       );
       const availabilityPayload = {
         diasAtivos,
         horarios: horariosFiltrados
       };
       
        // Debug logs
        console.log('[CadastroFreelancerAreas] Debug final:', {
          diasAtivos,
          horariosOriginal: horarios,
          horariosFiltrados,
          availabilityPayload
        });
       
        const availabilityString = JSON.stringify(availabilityPayload);
        fd.append("availability", availabilityString);
        console.log('[CadastroFreelancerAreas] Enviando availability string:', availabilityString);

       fd.append("emergencyContactName", saved.emergencyContactName || "");
      fd.append("emergencyContactRelationship", saved.emergencyContactRelationship || "");
      fd.append("emergencyContactNumber", saved.emergencyContactNumber || "");
      fd.append("cep", saved.cep || "");
      fd.append("street", saved.street || "");
      fd.append("complement", saved.complement || "");
      fd.append("neighborhood", saved.neighborhood || "");
      fd.append("number", saved.number || "");
      fd.append("city", saved.city || "");
      fd.append("uf", saved.uf || "");
      fd.append("ibge", viacep.ibge || "");
      fd.append("gia", viacep.gia || "");
      fd.append("ddd", viacep.ddd || "");
      fd.append("siafi", viacep.siafi || "");

      fd.append("userId", userId);
      fd.append("pixKeyType", saved.tipoChavePix || "");
      fd.append("pixKeyValue", saved.pixKeyValue || "");
      fd.append("phoneMessage", "");
      fd.append("mileageRadius", "30");
      fd.append("feedbackStars", "0");

      await registerProvider(fd);

      localStorage.removeItem("freelancerFormData");
      localStorage.removeItem("freelancerViacepData");

      toast({ title: "Cadastro finalizado!", description: "Seu perfil está completo. Bem-vindo à Freela!" });
      // Sincroniza o AuthContext com o role correto antes de navegar,
      // garantindo que o Header renderize como freelancer imediatamente.
      const authUser = getAuthUser();
      loginSuccess(authUser?.id ?? "", "freelancer");
      navigate("/dashboard-freelancer");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tente novamente.";
      toast({ title: "Erro no cadastro", description: message, variant: "destructive" });
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

      {/* Left Side */}
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

      {/* Right Side */}
      <div className="flex-1 flex flex-col justify-start container-padding pl-8 lg:pl-16 py-12 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          <Link to="/" className="inline-block mb-8">
            <img src={logoFreela} alt="Freela Serviços" className="h-24" />
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

            {/* Disponibilidade - Grid Layout */}
            <div className="border-t border-border pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-primary" />
                  Horários Disponíveis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione os dias e defina o intervalo de trabalho (mínimo 6h).
                </p>
              </div>

              <div className="overflow-x-auto pb-4">
                <div className="min-w-[550px]">
                  <div className="grid grid-cols-[40px_repeat(7,1fr)] gap-x-3 gap-y-2 items-center">
                    {/* Row 1: Days */}
                    <div /> {/* Empty space for alignment where "Dias" was */}
                    {diasSemana.map((dia) => {
                      const ativo = diasAtivos.includes(dia.key);
                      return (
                        <button
                          key={dia.key}
                          type="button"
                          onClick={() => toggleDia(dia.key)}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
                            ativo
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30"
                          }`}
                        >
                          <span className="text-sm font-bold">{dia.label}</span>
                        </button>
                      );
                    })}

                    {/* Row 2: "De" */}
                    <div className="text-sm font-bold text-left text-muted-foreground">De</div>
                    {diasSemana.map((dia) => (
                      <div key={`de-${dia.key}`}>
                        <select
                          disabled={!diasAtivos.includes(dia.key)}
                          value={horarios[dia.key].de}
                          onChange={(e) => updateHorario(dia.key, "de", e.target.value)}
                          className="w-full bg-background border rounded-md px-1.5 py-1.5 text-[12px] font-medium focus:ring-1 focus:ring-primary outline-none disabled:opacity-20 transition-opacity cursor-pointer"
                        >
                          {horasDisponiveis.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    ))}

                    {/* Row 3: "Até" */}
                    <div className="text-sm font-bold text-left text-muted-foreground">Até</div>
                    {diasSemana.map((dia) => (
                      <div key={`ate-${dia.key}`}>
                        <select
                          disabled={!diasAtivos.includes(dia.key)}
                          value={horarios[dia.key].ate}
                          onChange={(e) => updateHorario(dia.key, "ate", e.target.value)}
                          className="w-full bg-background border rounded-md px-1.5 py-1.5 text-[12px] font-medium focus:ring-1 focus:ring-primary outline-none disabled:opacity-20 transition-opacity cursor-pointer"
                        >
                          {horasDisponiveis.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {errors.dias && <p className="text-sm text-destructive">{errors.dias}</p>}
              <p className="text-[11px] text-muted-foreground italic mt-2">
                * Defina horários apenas para os dias selecionados. Cada intervalo deve ter ao menos 6 horas.
              </p>
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
