import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, ShieldCheck, CheckCircle, DollarSign, Briefcase, ExternalLink, Check, Loader2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AppLayout from "@/components/layout/AppLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const API_BASE_URL = "https://api.freelaservicos.com.br";

const defaultTimelineSteps = [
  { key: "aceite", label: "Aceite da Vaga", icon: CheckCircle },
  { key: "inicio", label: "Início do Trabalho", icon: Clock },
  { key: "fim", label: "Final do Trabalho", icon: CheckCircle },
  { key: "pagamento", label: "Pagamento", icon: DollarSign },
];

const agendadaTimelineSteps = [
  { key: "aceite", label: "Aceite da Vaga", icon: CheckCircle },
  { key: "inicio", label: "Início do Trabalho", icon: Clock },
  { key: "fim", label: "Final do Trabalho", icon: CheckCircle },
  { key: "pagamento", label: "Pagamento", icon: DollarSign },
  { key: "feedback", label: "Feedback", icon: Star },
];

const formatDateDDMMYYYY = (dateStr: string): string => {
  if (!dateStr || dateStr === "--") return "--";
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
  return dateStr;
};

const DetalheVaga = () => {
  const { vagaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locState = location.state as any;
  const serviceIndex: number = locState?.serviceIndex ?? 0;
  const source: string = locState?.source ?? "";
  const jobIdFromState: string | undefined = locState?.jobId;
  const vacancyIdFromState: string | undefined = locState?.vacancyId;
  const isAgendada = source === "agendadas";

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [vaga, setVaga] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [candidacyStatus, setCandidacyStatus] = useState<string | null>(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinCode, setCheckinCode] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!vagaId) return;
      try {
        if (isAgendada) {
          // For scheduled jobs: use /jobs/{jobId} and /candidacies/{vacancyId}
          const actualJobId = jobIdFromState || vagaId;
          const actualVacancyId = vacancyIdFromState || vagaId;

          const [jobRes, candidacyRes, provRes] = await Promise.all([
            apiFetch(`${API_BASE_URL}/jobs/${actualJobId}`, { method: "GET" }),
            apiFetch(`${API_BASE_URL}/candidacies/${actualVacancyId}`, { method: "GET" }),
            apiFetch(`${API_BASE_URL}/users/providers`, { method: "GET" }),
          ]);

          const jobBody = await jobRes.json().catch(() => null);
          const jobData = jobBody?.data ?? jobBody;
          setVaga(jobData);

          const candidacyBody = await candidacyRes.json().catch(() => null);
          const candidacyData = candidacyBody?.data ?? candidacyBody;
          if (candidacyData?.status) {
            setCandidacyStatus(candidacyData.status);
          } else if (Array.isArray(candidacyData) && candidacyData.length > 0) {
            setCandidacyStatus(candidacyData[0]?.status ?? null);
          }

          const provBody = await provRes.json().catch(() => null);
          const provData = Array.isArray(provBody?.data) ? provBody.data[0] : (provBody?.data ?? provBody);
          if (provData?.id) setProviderId(provData.id);
          setApplied(true); // Already applied if it's scheduled
        } else {
          // Default: fetch vacancy and provider in parallel
          const [vacRes, provRes] = await Promise.all([
            apiFetch(`${API_BASE_URL}/vacancies/${vagaId}`, { method: "GET" }),
            apiFetch(`${API_BASE_URL}/users/providers`, { method: "GET" }),
          ]);

          const vacBody = await vacRes.json().catch(() => null);
          const vacData = vacBody?.data ?? vacBody;
          setVaga(vacData);

          const provBody = await provRes.json().catch(() => null);
          const provData = Array.isArray(provBody?.data) ? provBody.data[0] : (provBody?.data ?? provBody);
          if (provData?.id) setProviderId(provData.id);

          if (vacData?.candidacies && Array.isArray(vacData.candidacies) && provData?.id) {
            const alreadyApplied = vacData.candidacies.some(
              (c: any) => c.providerId === provData.id && c.status !== "rejected"
            );
            if (alreadyApplied) setApplied(true);
          }
        }
      } catch (err) {
        console.error("[DetalheVaga] error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [vagaId]);

  if (loading) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 text-center">
          <p className="text-muted-foreground">Carregando vaga...</p>
        </div>
      </AppLayout>
    );
  }

  if (!vaga) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 text-center">
          <p className="text-muted-foreground">Vaga não encontrada</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  // Use service data from the services array based on serviceIndex
  const services = vaga.services ?? vaga.freelancers ?? [];
  const serviceInfo = services[serviceIndex] ?? services[0] ?? {};

  const title = serviceInfo.assignment || vaga.establishment || vaga.description || "Vaga";
  const status = vaga.status || "aberta";
  const jobDate = vaga.jobDate ? formatDateDDMMYYYY(vaga.jobDate) : "--";
  const jobTime = serviceInfo.jobTime || "--";
  const jobValue = serviceInfo.jobValue || "--";
  const assignment = serviceInfo.assignment || "--";
  const location_ = vaga.address || vaga.location || "--";
  const clientName = vaga.contractorName || vaga.contractor?.name || vaga.establishment || "--";
  const contractorId = vaga.contractorId || vaga.contractor?.id;

  // Timeline logic
  const timelineSteps = isAgendada ? agendadaTimelineSteps : defaultTimelineSteps;

  // For agendadas: timeline depends on checkinDone
  const getAgendadaStepStatus = (stepKey: string) => {
    if (checkinDone) {
      if (stepKey === "aceite" || stepKey === "inicio") return "done";
      if (stepKey === "fim") return "in_progress";
      return "pending";
    }
    if (stepKey === "aceite") return "done";
    if (stepKey === "inicio") return "in_progress";
    return "pending";
  };

  const handleCheckinValidate = async () => {
    if (checkinCode.length !== 6) {
      toast.error("Digite o código de 6 dígitos.");
      return;
    }
    const jobId = jobIdFromState || vagaId;
    if (!providerId || !jobId) {
      toast.error("Não foi possível identificar os dados. Tente novamente.");
      return;
    }
    setCheckinLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/providers/jobs/check-ins/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, providerId, code: checkinCode }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Código inválido. Tente novamente.");
      }
      setCheckinDone(true);
      setShowCheckinModal(false);
      setCheckinCode("");
      toast.success("Check-in realizado com sucesso!");
    } catch (err: any) {
      console.error("[DetalheVaga] checkin error:", err);
      toast.error(err.message || "Erro ao validar código. Tente novamente.");
    } finally {
      setCheckinLoading(false);
    }
  };

  const defaultTimeline = vaga.timeline || { aceite: false, inicio: false, fim: false, pagamento: false };
  const agendadaTimeline = {
    aceite: true,
    inicio: checkinDone,
    fim: false,
    pagamento: false,
    feedback: false,
  };
  const timeline = isAgendada ? agendadaTimeline : defaultTimeline;

  const canConfirm = status === "aceita" && !timeline.inicio;
  const isOpen = status === "aberta" || status === "open";

  const handleApply = async () => {
    if (!providerId || !vagaId) {
      toast.error("Não foi possível identificar seu perfil. Tente novamente.");
      return;
    }
    setApplying(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/candidacies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyId: vagaId,
          providerId,
          date: new Date().toISOString(),
          status: "pending",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Erro ao se candidatar.");
      }
      setApplied(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err: any) {
      console.error("[DetalheVaga] apply error:", err);
      toast.error(err.message || "Erro ao se candidatar. Tente novamente.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-3xl mx-auto pb-8 space-y-6">
        {/* Header */}
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
            ← Voltar
          </button>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-display font-bold">{title}</h1>
            {!isAgendada && isOpen && !applied && (
              <Button size="lg" className="gap-2 text-base" onClick={handleApply} disabled={applying}>
                {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {applying ? "Enviando..." : "Se Aplicar"}
              </Button>
            )}
            {!isAgendada && isOpen && applied && (
              <Button
                size="lg"
                className="gap-2 text-base bg-emerald-500 text-white cursor-default"
                disabled
              >
                <Check className="w-5 h-5" />
                Aplicado
              </Button>
            )}
          </div>
          <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
            status === "aceita" || status === "accepted" ? "bg-primary-light text-primary" :
            status === "preenchida" || status === "confirmed" ? "bg-success-light text-success" :
            status === "aberta" || status === "open" ? "bg-warning-light text-warning" :
            "bg-muted text-muted-foreground"
          }`}>
            {isAgendada ? "Agendada" : (status === "concluida" ? "concluída" : status)}
          </span>
        </div>

        {/* Detalhes do Evento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Detalhes do Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <Calendar className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{jobDate}</p>
                  <p className="text-[10px] text-muted-foreground">Data</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <Clock className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{jobTime}</p>
                  <p className="text-[10px] text-muted-foreground">Horário</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-success-light/50 hover:bg-success-light transition-colors cursor-default text-center">
                <DollarSign className="w-6 h-6 text-success" />
                <div>
                  <p className="text-sm font-bold text-success">{jobValue}</p>
                  <p className="text-[10px] text-muted-foreground">Valor</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <Briefcase className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{assignment}</p>
                  <p className="text-[10px] text-muted-foreground">Função</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center col-span-2">
                <MapPin className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold truncate max-w-[250px]">{location_}</p>
                  <p className="text-[10px] text-muted-foreground">Local</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contratante */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Contratante</CardTitle>
              {contractorId && (
                <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/perfil-contratante/${contractorId}`)}>
                  Ver perfil <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border-2 border-primary/20">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">{clientName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              {timelineSteps.map((step, i) => {
                const isLast = i === timelineSteps.length - 1;

                let done: boolean;
                let stepStatus: string;
                if (isAgendada) {
                  stepStatus = getAgendadaStepStatus(step.key);
                  done = stepStatus === "done";
                } else {
                  done = !!timeline[step.key as keyof typeof timeline];
                  stepStatus = done ? "done" : "pending";
                }

                const isInProgress = stepStatus === "in_progress";
                const showCheckin = isAgendada && step.key === "inicio" && isInProgress;

                // For non-agendada: existing logic
                const showEntrada = !isAgendada && step.key === "inicio" && canConfirm;
                const canConfirmExit = !isAgendada && (status === "aceita" || status === "accepted") && timeline.inicio && !timeline.fim;
                const showSaida = !isAgendada && step.key === "fim" && canConfirmExit;

                return (
                  <div key={step.key} className="relative pb-6 last:pb-0">
                    {!isLast && (
                      <div className={`absolute left-[-16px] top-8 w-0.5 h-[calc(100%-16px)] ${done ? "bg-primary" : isInProgress ? "bg-primary/50" : "bg-border"}`} />
                    )}
                    <div className={`absolute left-[-22px] top-1 w-3 h-3 rounded-full border-2 ${
                      done ? "bg-primary border-primary" :
                      isInProgress ? "bg-primary/50 border-primary animate-pulse" :
                      "bg-background border-border"
                    }`} />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${done ? "text-foreground" : isInProgress ? "text-primary" : "text-muted-foreground"}`}>{step.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {done ? "✓ Concluído" : isInProgress ? "🔄 Em andamento" : "Pendente"}
                        </p>
                      </div>
                      {showCheckin && (
                        <Button size="sm" className="gap-1.5" onClick={() => navigate(`/confirmar-servico/${vaga.id}`)}>
                          <ShieldCheck className="w-4 h-4" /> Check-in
                        </Button>
                      )}
                      {showEntrada && (
                        <Button size="sm" className="gap-1.5" onClick={() => navigate(`/confirmar-servico/${vaga.id}`)}>
                          <ShieldCheck className="w-4 h-4" /> Confirmar Entrada
                        </Button>
                      )}
                      {showSaida && (
                        <Button size="sm" className="gap-1.5" onClick={() => navigate(`/confirmar-servico/${vaga.id}?tipo=saida`)}>
                          <ShieldCheck className="w-4 h-4" /> Confirmar Saída
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Popup de sucesso */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-sm text-center border-emerald-500 bg-emerald-50">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-700">Aplicação Concluída</h2>
              <p className="text-sm text-emerald-600">Sua candidatura foi enviada com sucesso!</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default DetalheVaga;
