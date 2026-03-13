import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, DollarSign, Briefcase, CheckCircle, X, ChevronRight, Star, Shield, MessageCircle, Send, Eye, UserCheck, UserX, Loader2, QrCode, Copy, KeyRound, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { apiFetch, acceptCandidacy, rejectCandidacy, getProviderDetails, createJobPayment, type JobPaymentResponse } from "@/lib/api";
import Pusher from "pusher-js";

const API_BASE_URL = "https://api.freelaservicos.com.br";

interface VacancyDetail {
  id: string;
  establishment: string;
  assignment: string;
  description: string;
  quantity: number;
  jobDate: string;
  jobTime: string;
  jobValue: string;
  status: string;
  contractorId: string;
}

const statusLabels: Record<string, string> = {
  open: "Aberta",
  "in hiring": "Em contratação",
  closed: "Preenchida",
  removed: "Concluída",
};

const statusStyles: Record<string, string> = {
  open: "bg-success-light text-success",
  "in hiring": "bg-warning-light text-warning",
  closed: "bg-primary-light text-primary",
  removed: "bg-muted text-muted-foreground",
};

interface Candidato {
  id: string;
  providerId: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
  reviews: number;
  jobs: number;
  verified: boolean;
  status: "pendente" | "aceito" | "recusado";
  price: string;
  responseTime: string;
  bio: string;
}

const DetalheEventoContratante = () => {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [vacancy, setVacancy] = useState<VacancyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loadingCandidatos, setLoadingCandidatos] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Candidato | null>(null);
  const [showPropostaDialog, setShowPropostaDialog] = useState(false);
  const [propostaFreelancer, setPropostaFreelancer] = useState<Candidato | null>(null);
  const [proposta, setProposta] = useState({ valor: "", descricao: "" });
  const [propostaEnviada, setPropostaEnviada] = useState(false);
  const [filter, setFilter] = useState<"todos" | "pendente" | "aceito" | "recusado">("todos");
  const [actionLoadingIds, setActionLoadingIds] = useState<Set<string>>(new Set());
  const [paymentStatus, setPaymentStatus] = useState<Record<string, string>>({});
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<JobPaymentResponse | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [timelineStep, setTimelineStep] = useState(0);
  const lastJobIdRef = useRef<string | null>(null);
  const [checkInCode, setCheckInCode] = useState<string | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInCopied, setCheckInCopied] = useState(false);
  const [checkOutCode, setCheckOutCode] = useState<string | null>(null);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [checkOutCopied, setCheckOutCopied] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [providerAttendedJob, setProviderAttendedJob] = useState<boolean | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Helper: fetch payment details for a job, then schedule if successful
  const fetchJobPayments = async (jobId: string, scheduleAfter = false) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/jobs/${jobId}/payments`, { method: "GET" });
      const body = await res.json().catch(() => null);
      console.log("[Payment] GET /jobs/{jobId}/payments:", body);
      const paymentInfo = body?.data ?? body;
      if (paymentInfo) {
        setPixData(prev => ({ ...prev, ...paymentInfo }));
      }

      if (res.ok && scheduleAfter) {
        try {
          await apiFetch(`${API_BASE_URL}/jobs/${jobId}/schedule`, { method: "PATCH" });
          console.log("[Payment] job scheduled successfully", jobId);
          setTimelineStep(2);
        } catch (scheduleErr: any) {
          console.error("[Payment] failed to schedule job:", scheduleErr);
        }
      }

      return paymentInfo;
    } catch (err) {
      console.error("[Payment] Erro ao buscar detalhes do pagamento:", err);
    }
  };

  // ── Pusher: listen for payment updates ──────────────────────
  useEffect(() => {
    const pusher = new Pusher("f8d94fc93946ed0f4e0b", { cluster: "sa1" });
    const channel = pusher.subscribe("payments");

    channel.bind("payment.updated", async (data: any) => {
      console.log("[Pusher] payment.updated", data);
      if (data?.status) {
        setPaymentStatus(prev => ({ ...prev, [data.providerId ?? data.jobId ?? ""]: data.status }));
      }
      toast({ title: "Pagamento atualizado", description: data?.message || `Status: ${data?.status}` });

      // Fetch full payment details after Pusher notification
      const jobId = data?.jobId || lastJobIdRef.current;
      if (jobId) {
        await fetchJobPayments(jobId, false);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("payments");
      pusher.disconnect();
    };
  }, [toast]);

  // Helper: fetch job status and update timeline accordingly
  const fetchJobStatus = async (vacancyId: string) => {
    try {
      const jobsRes = await apiFetch(`${API_BASE_URL}/vacancies/jobs?vacancyId=${vacancyId}`, { method: "GET" });
      const jobsBody = await jobsRes.json().catch(() => null);
      const jobData = jobsBody?.data ?? jobsBody;
      const jobId = Array.isArray(jobData) ? jobData[0]?.id ?? "" : jobData?.id ?? "";

      if (!jobId) return; // no job yet — stay at step 0

      const res = await apiFetch(`${API_BASE_URL}/jobs/${jobId}`, { method: "GET" });
      if (res.status === 404) {
        // 404 means job is in the first stage still
        return;
      }
      const body = await res.json().catch(() => null);
      const status = body?.data?.status ?? body?.status ?? "";
      console.log("[JobStatus] job", jobId, "status:", status);

      if (status === "unavailable") {
        setTimelineStep(1);
      } else if (status === "schedule") {
        setTimelineStep(2);
      } else if (status === "in_progress" || status === "started") {
        setTimelineStep(3);
      } else if (status === "completed" || status === "done") {
        setTimelineStep(4);
      }
    } catch (err) {
      console.error("[JobStatus] error fetching job status:", err);
    }
  };

  useEffect(() => {
    if (!eventoId) return;

    // Fetch vacancy details
    apiFetch(`${API_BASE_URL}/vacancies/${eventoId}`, { method: "GET" })
      .then(r => r.json())
      .then(body => {
        if (body?.data) setVacancy(body.data);
      })
      .catch(err => console.error("Erro ao buscar vaga:", err))
      .finally(() => setLoading(false));

    // Fetch candidacies
    setLoadingCandidatos(true);
    apiFetch(`${API_BASE_URL}/vacancies/candidacies?vacancyId=${eventoId}`, { method: "GET" })
      .then(r => r.json())
      .then(body => {
        const list = Array.isArray(body?.data) ? body.data : [];
        const mapped: Candidato[] = list.map((c: any) => ({
          id: c.id || "",
          providerId: c.providerId || "",
          name: c.providerName || c.name || "Freelancer",
          avatar: (c.providerName || c.name || "FL").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          role: c.assignment || c.role || "",
          rating: c.rating ?? 0,
          reviews: c.reviews ?? 0,
          jobs: c.jobs ?? 0,
          verified: c.verified ?? false,
          status: c.status === "accepted" ? "aceito" : c.status === "rejected" ? "recusado" : "pendente",
          price: c.price || c.jobValue || "",
          responseTime: c.responseTime || "",
          bio: c.bio || c.description || "",
        }));
        const hasAccepted = mapped.some(c => c.status === "aceito");
        if (hasAccepted && timelineStep < 1) setTimelineStep(1);
        setCandidatos(mapped);
      })
      .catch(err => console.error("Erro ao buscar candidatos:", err))
      .finally(() => setLoadingCandidatos(false));

    // Fetch job status to determine timeline position
    fetchJobStatus(eventoId);
  }, [eventoId]);

  if (loading) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!vacancy) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 text-center">
          <p className="text-muted-foreground">Vaga não encontrada</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  const formattedDate = (() => {
    try {
      return new Date(vacancy.jobDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    } catch { return vacancy.jobDate; }
  })();

  const handleAceitar = async (id: string) => {
    setActionLoadingIds(prev => new Set(prev).add(id));
    try {
      const result = await acceptCandidacy(id);
      setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status: "aceito" as const } : c));
      if (timelineStep < 1) setTimelineStep(1);
      if (result?.vacancy?.status) {
        setVacancy(prev => prev ? { ...prev, status: result.vacancy.status } : prev);
      }
      toast({ title: "Freelancer aceito!", description: "O freelancer será notificado por e-mail." });
    } catch (err: any) {
      toast({ title: "Erro ao aceitar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setActionLoadingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const handleRecusar = async (id: string) => {
    setActionLoadingIds(prev => new Set(prev).add(id));
    try {
      await rejectCandidacy(id);
      setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status: "recusado" as const } : c));
      toast({ title: "Candidatura recusada", description: "O freelancer será notificado por e-mail." });
    } catch (err: any) {
      toast({ title: "Erro ao recusar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setActionLoadingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const handlePagamento = async (candidato: Candidato) => {
    setActionLoadingIds(prev => new Set(prev).add(candidato.id));
    try {
      const vacancyId = eventoId ?? "";
      const contractorId = vacancy?.contractorId ?? "";
      const providerId = candidato.providerId;

      // Fetch jobId
      const jobsRes = await apiFetch(`${API_BASE_URL}/vacancies/jobs?vacancyId=${vacancyId}`, { method: "GET" });
      const jobsBody = await jobsRes.json().catch(() => null);
      const jobData = jobsBody?.data ?? jobsBody;
      const jobId = Array.isArray(jobData) ? jobData[0]?.id ?? "" : jobData?.id ?? "";

      if (!jobId) {
        toast({ title: "Erro", description: "Job não encontrado para esta vaga.", variant: "destructive" });
        return;
      }

      // Fetch provider PIX key
      const providerData = await getProviderDetails(providerId);
      const pixKeyValue = providerData?.pixKeyValue ?? "";

      const paymentResult = await createJobPayment(jobId, {
        vacancyId,
        contractorId,
        providerId,
        providerPixKeyId: pixKeyValue,
        method: "pix",
      });

      console.log("[Payment] created successfully for job", jobId, paymentResult);
      lastJobIdRef.current = jobId;

      // Fetch full payment details and schedule after success
      const fullPayment = await fetchJobPayments(jobId, true);

      setPixData(fullPayment ?? paymentResult);
      setShowPixModal(true);
    } catch (err: any) {
      console.error("[Payment] error:", err);
      toast({ title: "Erro ao criar pagamento", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setActionLoadingIds(prev => { const next = new Set(prev); next.delete(candidato.id); return next; });
    }
  };

  const handleGerarCodigo = async () => {
    if (checkInCode) {
      setShowCheckInModal(true);
      return;
    }
    setCheckInLoading(true);
    try {
      const vacancyId = eventoId ?? "";
      // Fetch jobId
      const jobsRes = await apiFetch(`${API_BASE_URL}/vacancies/jobs?vacancyId=${vacancyId}`, { method: "GET" });
      const jobsBody = await jobsRes.json().catch(() => null);
      const jobData = jobsBody?.data ?? jobsBody;
      const jobId = Array.isArray(jobData) ? jobData[0]?.id ?? "" : jobData?.id ?? "";

      if (!jobId) {
        toast({ title: "Erro", description: "Job não encontrado.", variant: "destructive" });
        return;
      }

      const providerId = confirmados[0]?.providerId;
      if (!providerId) {
        toast({ title: "Erro", description: "Nenhum freelancer confirmado.", variant: "destructive" });
        return;
      }

      const res = await apiFetch(`${API_BASE_URL}/providers/jobs/check-ins/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, jobId }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || "Não foi possível gerar o código.");
      }

      const code = body?.data?.code || body?.data || body?.code || "";
      setCheckInCode(String(code));
      setShowCheckInModal(true);
    } catch (err: any) {
      toast({ title: "Erro ao gerar código", description: err.message, variant: "destructive" });
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleGerarCodigoCheckout = async () => {
    if (checkOutCode) {
      setShowCheckOutModal(true);
      return;
    }
    setCheckOutLoading(true);
    try {
      const vacancyId = eventoId ?? "";
      const jobsRes = await apiFetch(`${API_BASE_URL}/vacancies/jobs?vacancyId=${vacancyId}`, { method: "GET" });
      const jobsBody = await jobsRes.json().catch(() => null);
      const jobData = jobsBody?.data ?? jobsBody;
      const jobId = Array.isArray(jobData) ? jobData[0]?.id ?? "" : jobData?.id ?? "";

      if (!jobId) {
        toast({ title: "Erro", description: "Job não encontrado.", variant: "destructive" });
        return;
      }

      const providerId = confirmados[0]?.providerId;
      if (!providerId) {
        toast({ title: "Erro", description: "Nenhum freelancer confirmado.", variant: "destructive" });
        return;
      }

      const res = await apiFetch(`${API_BASE_URL}/providers/jobs/check-outs/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, jobId }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || "Não foi possível gerar o código de check-out.");
      }

      const code = body?.data?.code || body?.data || body?.code || "";
      setCheckOutCode(String(code));
      setShowCheckOutModal(true);
    } catch (err: any) {
      toast({ title: "Erro ao gerar código", description: err.message, variant: "destructive" });
    } finally {
      setCheckOutLoading(false);
    }
  };

  const handleEnviarAvaliacao = async () => {
    if (reviewStars === 0) {
      toast({ title: "Selecione as estrelas", description: "Escolha de 1 a 5 estrelas.", variant: "destructive" });
      return;
    }
    setReviewLoading(true);
    try {
      const vacancyId = eventoId ?? "";
      const jobsRes = await apiFetch(`${API_BASE_URL}/vacancies/jobs?vacancyId=${vacancyId}`, { method: "GET" });
      const jobsBody = await jobsRes.json().catch(() => null);
      const jobData = jobsBody?.data ?? jobsBody;
      const jobId = Array.isArray(jobData) ? jobData[0]?.id ?? "" : jobData?.id ?? "";

      if (!jobId) {
        toast({ title: "Erro", description: "Job não encontrado.", variant: "destructive" });
        return;
      }

      const contractorId = vacancy?.contractorId ?? "";
      const providerId = confirmados[0]?.providerId;
      if (!providerId) {
        toast({ title: "Erro", description: "Nenhum freelancer confirmado.", variant: "destructive" });
        return;
      }

      const res = await apiFetch(`${API_BASE_URL}/providers/jobs/feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: reviewComment.trim(),
          star: reviewStars,
          sender: contractorId,
          receiver: providerId,
          jobId,
          providerAttendedJob: providerAttendedJob === true,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Erro ao enviar avaliação.");
      }

      toast({ title: "Avaliação enviada!", description: "Obrigado pelo feedback." });
      setShowReviewModal(false);
      setReviewStars(0);
      setReviewComment("");
      setProviderAttendedJob(null);
    } catch (err: any) {
      toast({ title: "Erro ao enviar avaliação", description: err.message, variant: "destructive" });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEnviarProposta = () => {
    setPropostaEnviada(true);
    setTimeout(() => {
      setPropostaEnviada(false);
      setShowPropostaDialog(false);
      setProposta({ valor: "", descricao: "" });
      setPropostaFreelancer(null);
    }, 2000);
  };

  const filteredCandidatos = filter === "todos" ? candidatos : candidatos.filter(c => c.status === filter);
  const confirmados = candidatos.filter(c => c.status === "aceito");
  const aceitos = confirmados.length;

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-3xl mx-auto pb-8 space-y-6">
        {/* Header */}
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
            ← Voltar
          </button>
          <h1 className="text-2xl font-display font-bold">{vacancy.establishment}</h1>
          <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
            statusStyles[vacancy.status] || "bg-muted text-muted-foreground"
          }`}>{statusLabels[vacancy.status] || vacancy.status}</span>
        </div>

        {/* Detalhes */}
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Calendar, value: formattedDate, label: "Data", color: "text-primary" },
                { icon: Clock, value: vacancy.jobTime, label: "Duração", color: "text-primary" },
                { icon: DollarSign, value: vacancy.jobValue, label: "Valor/pessoa", color: "text-success" },
                { icon: Briefcase, value: vacancy.assignment, label: "Função", color: "text-primary" },
                { icon: Users, value: `${vacancy.quantity}`, label: "Freelancers", color: "text-accent" },
                { icon: Briefcase, value: vacancy.establishment, label: "Local", color: "text-primary" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 text-center">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <div>
                    <p className="text-xs font-bold truncate max-w-[100px]">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        {/* Freelancers - conditional by status */}
        {(vacancy.status === "open" || vacancy.status === "in hiring") && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Freelancers Inscritos
                </CardTitle>
                <span className="text-xs text-muted-foreground">{aceitos}/{vacancy.quantity} aceitos</span>
              </div>
              {/* Filter tabs */}
              <div className="flex gap-2 mt-3">
                {(["todos", "pendente", "aceito", "recusado"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                      filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {f === "todos" ? `Todos (${candidatos.length})` :
                     f === "pendente" ? `Pendentes (${candidatos.filter(c => c.status === "pendente").length})` :
                     f === "aceito" ? `Aceitos (${candidatos.filter(c => c.status === "aceito").length})` :
                     `Recusados (${candidatos.filter(c => c.status === "recusado").length})`}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredCandidatos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum freelancer nesta categoria</p>
              ) : (
                filteredCandidatos.map((candidato) => (
                  <div key={candidato.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                      {candidato.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate">{candidato.name}</p>
                        {candidato.verified && <Shield className="w-3.5 h-3.5 text-primary fill-primary/20" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{candidato.role}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        <span className="text-xs font-medium">{candidato.rating}</span>
                        <span className="text-xs text-muted-foreground">({candidato.reviews})</span>
                        <span className="text-xs text-muted-foreground ml-1">• {candidato.jobs} jobs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {candidato.status === "pendente" ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-success hover:bg-success/10"
                            disabled={actionLoadingIds.has(candidato.id)}
                            onClick={() => handleAceitar(candidato.id)}
                          >
                            {actionLoadingIds.has(candidato.id)
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            disabled={actionLoadingIds.has(candidato.id)}
                            onClick={() => handleRecusar(candidato.id)}
                          >
                            {actionLoadingIds.has(candidato.id)
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <UserX className="w-4 h-4" />}
                          </Button>
                        </>
                      ) : candidato.status === "aceito" ? (
                        <>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-success-light text-success">aceito</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            disabled={actionLoadingIds.has(candidato.id)}
                            onClick={() => handlePagamento(candidato)}
                          >
                            {actionLoadingIds.has(candidato.id)
                              ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              : <DollarSign className="w-3 h-3 mr-1" />}
                            Pagamento
                          </Button>
                        </>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-destructive/10 text-destructive">recusado</span>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedFreelancer(candidato)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Freelancers Confirmados - status Fechado */}
        {vacancy.status === "closed" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-success" /> Freelancers Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {confirmados.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum freelancer confirmado</p>
              ) : (
                confirmados.map((candidato) => (
                  <div key={candidato.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                      {candidato.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{candidato.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        <span className="text-xs font-medium">{candidato.rating}</span>
                        <span className="text-xs text-muted-foreground">({candidato.reviews})</span>
                        <span className="text-xs text-muted-foreground ml-1">• {candidato.jobs} jobs</span>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setSelectedFreelancer(candidato)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Linha do Tempo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              {[
                { key: "contratacao", label: "Contratação", step: 0 },
                { key: "pagamento", label: "Pagamento", step: 1 },
                { key: "inicio", label: "Início do Trabalho", step: 2 },
                { key: "termino", label: "Término do Trabalho", step: 3 },
                { key: "feedback", label: "Feedback", step: 4 },
              ].map((item, i, arr) => {
                const isDone = timelineStep > item.step;
                const isInProgress = timelineStep === item.step;
                const isLast = i === arr.length - 1;
                const showPaymentBtn = item.key === "pagamento" && isInProgress && confirmados.length > 0;
                const showCheckInBtn = item.key === "inicio" && isInProgress && confirmados.length > 0;

                return (
                  <div key={item.key} className="relative pb-6 last:pb-0">
                    {!isLast && (
                      <div className={`absolute left-[-16px] top-8 w-0.5 h-[calc(100%-16px)] ${isDone ? "bg-primary" : isInProgress ? "bg-primary/50" : "bg-border"}`} />
                    )}
                    <div className={`absolute left-[-22px] top-1 w-3 h-3 rounded-full border-2 ${
                      isDone ? "bg-primary border-primary" :
                      isInProgress ? "bg-primary/50 border-primary animate-pulse" :
                      "bg-background border-border"
                    }`} />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${isDone ? "text-foreground" : isInProgress ? "text-primary" : "text-muted-foreground"}`}>{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {isDone ? "✓ Concluído" : isInProgress ? "🔄 Em andamento" : "Pendente"}
                        </p>
                      </div>
                      {showPaymentBtn && (
                        <Button
                          size="sm"
                          className="gap-1.5"
                          disabled={actionLoadingIds.has(confirmados[0]?.id)}
                          onClick={() => confirmados[0] && handlePagamento(confirmados[0])}
                        >
                          {actionLoadingIds.has(confirmados[0]?.id)
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <DollarSign className="w-4 h-4" />}
                          Pagar
                        </Button>
                      )}
                      {showCheckInBtn && (
                        <Button
                          size="sm"
                          className="gap-1.5"
                          disabled={checkInLoading}
                          onClick={handleGerarCodigo}
                        >
                          {checkInLoading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <KeyRound className="w-4 h-4" />}
                          {checkInCode ? "Ver Código" : "Gerar Código"}
                        </Button>
                      )}
                      {item.key === "termino" && (
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={handleGerarCodigoCheckout}
                          disabled={checkOutLoading}
                        >
                          {checkOutLoading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <KeyRound className="w-4 h-4" />}
                          {checkOutCode ? "Ver Código" : "Check-out"}
                        </Button>
                      )}
                      {item.key === "feedback" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => setShowReviewModal(true)}
                        >
                          <Star className="w-4 h-4" />
                          Avaliação
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Perfil do Freelancer (visão contratante) */}
      <Dialog open={!!selectedFreelancer} onOpenChange={(open) => !open && setSelectedFreelancer(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          {selectedFreelancer && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">Perfil do Freelancer</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {selectedFreelancer.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-display font-bold">{selectedFreelancer.name}</h3>
                      {selectedFreelancer.verified && <Shield className="w-4 h-4 text-primary fill-primary/20" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedFreelancer.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span className="text-sm font-medium">{selectedFreelancer.rating}</span>
                      <span className="text-xs text-muted-foreground">({selectedFreelancer.reviews} avaliações)</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: selectedFreelancer.jobs.toString(), label: "Trabalhos" },
                    { value: selectedFreelancer.rating.toString(), label: "Nota" },
                    { value: selectedFreelancer.responseTime, label: "Resposta" },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 rounded-xl bg-muted/50">
                      <p className="text-sm font-bold text-primary">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                <div>
                  <h4 className="text-sm font-semibold mb-1">Sobre</h4>
                  <p className="text-sm text-muted-foreground">{selectedFreelancer.bio}</p>
                </div>


                {/* Placeholder fotos/vídeo */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Galeria</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Foto {i}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => { setSelectedFreelancer(null); navigate("/mensagens"); }}>
                    <MessageCircle className="w-4 h-4" /> Mensagem
                  </Button>
                  <Button className="flex-1 gap-2" onClick={() => {
                    setSelectedFreelancer(null);
                    navigate(`/criar-evento?para=${encodeURIComponent(selectedFreelancer.name)}`);
                  }}>
                    <Send className="w-4 h-4" /> Proposta Exclusiva
                  </Button>
                </div>

                {selectedFreelancer.status === "pendente" && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2 bg-success hover:bg-success/90"
                      disabled={actionLoadingIds.has(selectedFreelancer.id)}
                      onClick={() => { handleAceitar(selectedFreelancer.id); setSelectedFreelancer(null); }}
                    >
                      {actionLoadingIds.has(selectedFreelancer.id)
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <UserCheck className="w-4 h-4" />}
                      Aceitar
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 gap-2"
                      disabled={actionLoadingIds.has(selectedFreelancer.id)}
                      onClick={() => { handleRecusar(selectedFreelancer.id); setSelectedFreelancer(null); }}
                    >
                      {actionLoadingIds.has(selectedFreelancer.id)
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <UserX className="w-4 h-4" />}
                      Recusar
                    </Button>
                  </div>
                )}

                <Button variant="outline" className="w-full gap-2" onClick={() => { setSelectedFreelancer(null); navigate(`/freelancer/${selectedFreelancer.id}`); }}>
                  <Eye className="w-4 h-4" /> Ver Perfil Completo <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal Pix ──────────────────────────────────────────── */}
      <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Pagamento via Pix</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {/* QR Code Image */}
            {pixData?.pixQrCodeImage ? (
              <img
                src={pixData.pixQrCodeImage}
                alt="QR Code Pix"
                className="w-56 h-56 rounded-xl"
              />
            ) : pixData?.qrCodeBase64 ? (
              <img
                src={pixData.qrCodeBase64.startsWith("data:") ? pixData.qrCodeBase64 : `data:image/png;base64,${pixData.qrCodeBase64}`}
                alt="QR Code Pix"
                className="w-56 h-56 rounded-xl"
              />
            ) : (
              <div className="w-56 h-56 bg-foreground rounded-xl flex items-center justify-center p-4">
                <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Valor */}
            {pixData?.value != null && (
              <div className="text-center space-y-1">
                <p className="text-2xl font-display font-bold text-primary">
                  {Number(pixData.value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-xs text-muted-foreground">Valor do pagamento</p>
              </div>
            )}

            {/* Pix Copia e Cola */}
            {(pixData?.pixQrCode || pixData?.pixCopyPaste || pixData?.brCode) && (
              <div className="w-full space-y-2">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground break-all font-mono">
                    {pixData.pixQrCode || pixData.pixCopyPaste || pixData.brCode}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.pixQrCode || pixData.pixCopyPaste || pixData.brCode || "");
                    setPixCopied(true);
                    setTimeout(() => setPixCopied(false), 2000);
                  }}
                >
                  {pixCopied ? (
                    <><CheckCircle className="w-4 h-4 text-success" /> Código copiado!</>
                  ) : (
                    <>📋 Copiar código Pix</>
                  )}
                </Button>
              </div>
            )}

            <div className="bg-muted rounded-lg p-3 w-full">
              <p className="text-xs text-muted-foreground text-center">
                O pagamento é processado pela <strong>OpenPix</strong> e será liberado ao freelancer
                após a conclusão do trabalho.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Código Check-in ──────────────────────────────── */}
      <Dialog open={showCheckInModal} onOpenChange={setShowCheckInModal}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">Código de Check-in</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Compartilhe este código com o freelancer para confirmar o início do trabalho.
            </p>
            <div className="flex justify-center gap-2">
              {(checkInCode || "------").split("").map((char, i) => (
                <div
                  key={i}
                  className="w-11 h-14 rounded-lg bg-muted border border-border flex items-center justify-center text-2xl font-bold font-mono text-foreground"
                >
                  {char}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                if (checkInCode) {
                  navigator.clipboard.writeText(checkInCode);
                  setCheckInCopied(true);
                  setTimeout(() => setCheckInCopied(false), 2000);
                }
              }}
            >
              {checkInCopied ? (
                <><CheckCircle className="w-4 h-4 text-success" /> Código copiado!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copiar código</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Código Check-out ──────────────────────────────── */}
      <Dialog open={showCheckOutModal} onOpenChange={setShowCheckOutModal}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">Código de Check-out</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Compartilhe este código com o freelancer para confirmar o término do trabalho.
            </p>
            <div className="flex justify-center gap-2">
              {(checkOutCode || "------").split("").map((char, i) => (
                <div
                  key={i}
                  className="w-11 h-14 rounded-lg bg-muted border border-border flex items-center justify-center text-2xl font-bold font-mono text-foreground"
                >
                  {char}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                if (checkOutCode) {
                  navigator.clipboard.writeText(checkOutCode);
                  setCheckOutCopied(true);
                  setTimeout(() => setCheckOutCopied(false), 2000);
                }
              }}
            >
              {checkOutCopied ? (
                <><CheckCircle className="w-4 h-4 text-success" /> Código copiado!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copiar código</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Avaliação ──────────────────────────────────────── */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Avaliar Freelancer</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Como foi a experiência com o freelancer?
            </p>
            {/* Stars */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewStars(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${s <= reviewStars ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            {/* Provider attended */}
            <div className="w-full space-y-2">
              <Label>O Freelancer fez o trabalho?</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  size="sm"
                  variant={providerAttendedJob === true ? "default" : "outline"}
                  onClick={() => setProviderAttendedJob(true)}
                >
                  Sim
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={providerAttendedJob === false ? "default" : "outline"}
                  onClick={() => setProviderAttendedJob(false)}
                >
                  Não
                </Button>
              </div>
            </div>
            {/* Comment */}
            <div className="w-full space-y-2">
              <Label htmlFor="review-comment">Comentário</Label>
              <textarea
                id="review-comment"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Deixe um comentário sobre o freelancer..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                maxLength={500}
              />
            </div>
            <Button
              className="w-full gap-2"
              disabled={reviewLoading || reviewStars === 0 || providerAttendedJob === null}
              onClick={handleEnviarAvaliacao}
            >
              {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
};

export default DetalheEventoContratante;
