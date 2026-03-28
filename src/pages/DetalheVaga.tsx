import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, ShieldCheck, CheckCircle, DollarSign, Briefcase, ExternalLink, Check, Loader2, Star, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AppLayout from "@/components/layout/AppLayout";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { errorMessages } from "@/lib/error-messages";

const API_BASE_URL = import.meta.env.API_BASE_URL;

const statusLabels: Record<string, string> = {
  open: "Aberta",
  pending: "Pendente",
  accepted: "Aceita",
  rejected: "Recusada",
  confirmed: "Confirmada",
  closed: "Preenchida",
  removed: "Concluída",
  completed: "Concluída",
  "in hiring": "Em contratação",
  aberta: "Aberta",
  aceita: "Aceita",
  preenchida: "Preenchida",
  concluida: "Concluída",
};

const defaultTimelineSteps = [
  { key: "aceite", label: "Aceite da Vaga", icon: CheckCircle },
  { key: "inicio", label: "Início do Trabalho", icon: Clock },
  { key: "fim", label: "Final do Trabalho", icon: CheckCircle },
  { key: "pagamento", label: "Pagamento", icon: DollarSign },
  { key: "feedback", label: "Feedback", icon: Star },
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

// Extract neighborhood and city from establishment address
// Format: "Rua X, 123 - Bairro, Cidade • CEP: 12345678"
const extractNeighborhoodCity = (address: string): string => {
  if (!address || address === "--") return "--";
  // Split by " - " to get the part after dash
  const parts = address.split(" - ");
  if (parts.length < 2) return address;
  const afterDash = parts.slice(1).join(" - ");
  // Remove CEP part (starting with "•" or "CEP:")
  const cepIndex = afterDash.indexOf("•");
  if (cepIndex !== -1) {
    return afterDash.substring(0, cepIndex).trim();
  }
  const cepLabelIndex = afterDash.toUpperCase().indexOf("CEP:");
  if (cepLabelIndex !== -1) {
    return afterDash.substring(0, cepLabelIndex).trim();
  }
  return afterDash.trim();
};

const DetalheVaga = () => {
  const { vagaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const isFreelancer = role === "freelancer";
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
   const [contractorId, setContractorId] = useState<string | null>(null);
   const [candidacyStatus, setCandidacyStatus] = useState<string | null>(null);
   const [showCheckinModal, setShowCheckinModal] = useState(false);
   const [checkinCode, setCheckinCode] = useState("");
   const [checkinLoading, setCheckinLoading] = useState(false);
   const [checkinDone, setCheckinDone] = useState(false);
   const [showCheckoutModal, setShowCheckoutModal] = useState(false);
   const [checkoutCode, setCheckoutCode] = useState("");
   const [checkoutLoading, setCheckoutLoading] = useState(false);
   const [checkoutDone, setCheckoutDone] = useState(false);
   const [showReviewModal, setShowReviewModal] = useState(false);
   const [reviewStars, setReviewStars] = useState(0);
   const [reviewComment, setReviewComment] = useState("");
   const [reviewLoading, setReviewLoading] = useState(false);
   const [reviewDone, setReviewDone] = useState(false);
   const [paymentDone, setPaymentDone] = useState(false);
   // Contratante data
   const [contractorName, setContractorName] = useState<string>("--");
   const [contractorFeedback, setContractorFeedback] = useState<number>(0);
   const [loadingContractor, setLoadingContractor] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        if (!vagaId) return;
        // Se a vaga veio da seção de Vagas Pendentes, já está aplicada
        if (source === "pendentes") {
          setApplied(true);
        }
        try {
         if (isAgendada) {
           // For scheduled jobs: use /jobs/{jobId} and /candidacies/{vacancyId}
           const actualJobId = jobIdFromState || vagaId;
           const actualVacancyId = vacancyIdFromState || vagaId;

            const [jobRes, candidacyRes, provRes] = await Promise.all([
              apiFetch(`${API_BASE_URL}/jobs/${actualJobId}`, { method: "GET" }),
              apiFetch(`${API_BASE_URL}/candidacies/${actualVacancyId}`, { method: "GET" }),
              apiFetch(`${API_BASE_URL}/providers`, { method: "GET" }),
            ]);

           const jobBody = await jobRes.json().catch(() => null);
            const jobData = jobBody?.data ?? jobBody;
            // Normalize job data to match vacancy structure
            // Jobs API may return data in different structure
            const normalizedJob = {
              ...jobData,
              services: jobData.services || jobData.vacancy?.services || jobData.freelancers || [],
              establishment: jobData.establishment || jobData.vacancy?.establishment || jobData.location || "",
              jobDate: jobData.jobDate || jobData.vacancy?.jobDate || jobData.date || "",
              description: jobData.description || jobData.vacancy?.description || "",
              status: jobData.status || "agendada",
              contractorId: jobData.contractorId || jobData.contractor?.id || jobData.vacancy?.contractorId,
            };
            setVaga(normalizedJob);

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

           // Extract contractorId from job data
           const contractorIdFromJob = jobData?.contractorId || jobData?.contractor?.id;
           if (contractorIdFromJob) {
             setContractorId(contractorIdFromJob);
           }
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

           // Extract contractorId from vacancy data
           const contractorIdFromVaga = vacData?.contractorId || vacData?.contractor?.id;
           console.log("[DetalheVaga] Extracted contractorId from vacancy:", contractorIdFromVaga, "Vacancy data:", vacData);
           if (contractorIdFromVaga) {
             setContractorId(contractorIdFromVaga);
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

   // Fetch contractor data and user name
   useEffect(() => {
     const fetchContractorData = async () => {
       if (!contractorId) {
         console.log("[DetalheVaga] No contractorId, skipping fetch");
         return;
       }
       console.log("[DetalheVaga] Fetching contractor data for ID:", contractorId);
       try {
         setLoadingContractor(true);
         const tokenRaw = localStorage.getItem("authToken");
         const headers: any = {};
         if (tokenRaw) {
           const token = JSON.parse(tokenRaw);
           headers.Authorization = `Bearer ${token}`;
           headers["Origin-type"] = "Web";
         }

         // Fetch contractor by ID
         const contractorRes = await apiFetch(`${API_BASE_URL}/contractors/${contractorId}`, { headers });
         const contractorBody = await contractorRes.json().catch(() => null);
         const contractorData = contractorBody?.data ?? contractorBody;

         console.log("[DetalheVaga] Contractor data:", contractorData);

         if (contractorData) {
           const feedbackStars = contractorData.feedbackStars ?? 0;
           setContractorFeedback(feedbackStars);
           const companyName = contractorData.companyName || contractorData.name || "--";
           setContractorName(companyName);
         }
       } catch (err) {
         console.error("[DetalheVaga] Error fetching contractor data:", err);
       } finally {
         setLoadingContractor(false);
       }
     };
     fetchContractorData();
   }, [contractorId]);

   useEffect(() => {
     if (!isAgendada || !checkoutDone || paymentDone) return;
     const jobId = jobIdFromState || vagaId;
     if (!jobId) return;

     let cancelled = false;
     const poll = async () => {
       if (cancelled) return;
       try {
         const res = await apiFetch(`${API_BASE_URL}/jobs/${jobId}`, { method: "GET" });
         const data = await res.json().catch(() => null);
         const jobStatus = data?.data?.status || data?.status;
         if (jobStatus === "completed" || jobStatus === "partially completed") {
           setPaymentDone(true);
           return;
         }
       } catch (err) {
         console.error("[DetalheVaga] payment poll error:", err);
       }
       if (!cancelled) {
         setTimeout(poll, 10000);
       }
     };
     poll();

     return () => { cancelled = true; };
   }, [isAgendada, checkoutDone, paymentDone, jobIdFromState, vagaId]);

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
    const jobValueRaw = serviceInfo.jobValue || "--";
    const jobValue = jobValueRaw;
    const assignment = serviceInfo.assignment || "--";
    const location_ = extractNeighborhoodCity(vaga.establishment) || "--";

  // Timeline logic
  const timelineSteps = isAgendada ? agendadaTimelineSteps : defaultTimelineSteps;

  // For agendadas: timeline depends on checkinDone
   const getAgendadaStepStatus = (stepKey: string) => {
     if (checkinDone) {
       if (stepKey === "aceite" || stepKey === "inicio") return "done";
       if (stepKey === "fim") {
         return checkoutDone ? "done" : "in_progress";
       }
       if (stepKey === "pagamento") {
         if (paymentDone) return "done";
         if (checkoutDone) return "in_progress";
         return "pending";
       }
       if (stepKey === "feedback") {
         if (reviewDone) return "done";
         if (paymentDone) return "in_progress";
         return "pending";
       }
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

   const handleCheckoutValidate = async () => {
     if (checkoutCode.length !== 6) {
toast.error(errorMessages.checkinCodeRequired);
       return;
     }
     const jobId = jobIdFromState || vagaId;
     if (!providerId || !jobId) {
       toast.error("Não foi possível identificar os dados. Tente novamente.");
       return;
     }
     setCheckoutLoading(true);
     try {
       const res = await apiFetch(`${API_BASE_URL}/providers/jobs/check-outs/validate`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ jobId, providerId, code: checkoutCode }),
       });
         if (!res.ok) {
           const body = await res.json().catch(() => null);
           throw new Error(body?.message || "Código inválido. Tente novamente.");
         }

         setCheckoutDone(true);
         setShowCheckoutModal(false);
         setCheckoutCode("");
         toast.success("Check-out realizado com sucesso!");
     } catch (err: any) {
       console.error("[DetalheVaga] checkout error:", err);
       toast.error(err.message || "Erro ao validar código. Tente novamente.");
     } finally {
       setCheckoutLoading(false);
     }
   };

   const handleSubmitReview = async () => {
     if (reviewStars === 0) {
       toast.error("Selecione pelo menos 1 estrela.");
       return;
     }
     setReviewLoading(true);
     try {
       const jobId = jobIdFromState || vagaId;
       const contractorId = vaga?.contractorId || vaga?.contractor?.id;
       if (!providerId || !contractorId || !jobId) {
         toast.error("Não foi possível identificar os dados. Tente novamente.");
         return;
       }

       const res = await apiFetch(`${API_BASE_URL}/contractors/jobs/feedbacks`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           comment: reviewComment.trim(),
           star: reviewStars,
           sender: providerId,
           receiver: contractorId,
           jobId,
           providerAttendedJob: checkoutDone,
           createdAt: new Date().toISOString(),
         }),
       });

       if (!res.ok) {
         const body = await res.json().catch(() => null);
         throw new Error(body?.message || "Erro ao enviar avaliação.");
       }

       setReviewDone(true);
       if (!isAgendada) {
         setVaga(prev => {
           if (!prev) return prev;
           return {
             ...prev,
             timeline: {
               ...prev.timeline,
               feedback: true,
             },
           };
         });
       }

       setShowReviewModal(false);
       setReviewStars(0);
       setReviewComment("");
       toast.success("Avaliação enviada com sucesso!");
     } catch (err: any) {
       toast.error(err.message || "Erro ao enviar avaliação.");
     } finally {
       setReviewLoading(false);
      }
    };

   const defaultTimeline = vaga.timeline || { aceite: false, inicio: false, fim: false, pagamento: false, feedback: false };
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
              <Button size="lg" className="gap-2 text-base bg-warning hover:bg-warning/90 text-white" onClick={handleApply} disabled={applying}>
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
            {isAgendada ? "Agendada" : (statusLabels[status] || status)}
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

        {/* Descrição da Vaga */}
        {vaga.description && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Descrição da Vaga</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {vaga.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contratante */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all"
          onClick={() => contractorId && navigate(`/perfil-contratante/${contractorId}`)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Contratante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border-2 border-primary/20">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                {loadingContractor ? (
                  <p className="text-sm font-semibold truncate">Carregando...</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold truncate">{contractorName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-xs font-medium">{contractorFeedback.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
              {contractorId && <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />}
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
                const showCheckin = isAgendada && step.key === "inicio" && isInProgress && !checkinDone;
                const showCheckout = isAgendada && step.key === "fim" && isInProgress && !checkoutDone;
                const showEntrada = !isAgendada && step.key === "inicio" && canConfirm;
                const canConfirmExit = !isAgendada && (status === "aceita" || status === "accepted") && timeline.inicio && !timeline.fim;
                const showSaida = !isAgendada && step.key === "fim" && canConfirmExit;

                const showReviewBtn = (
                  step.key === "feedback" && (
                    (isAgendada && isInProgress && !reviewDone) ||
                    (!isAgendada && timeline.fim && !timeline.feedback)
                  )
                );

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
                        <Button size="sm" className="gap-1.5" onClick={() => { setCheckinCode(""); setShowCheckinModal(true); }}>
                          <ShieldCheck className="w-4 h-4" /> Check-in
                        </Button>
                      )}
                      {showCheckout && (
                        <Button size="sm" className="gap-1.5" onClick={() => { setCheckoutCode(""); setShowCheckoutModal(true); }}>
                          <ShieldCheck className="w-4 h-4" /> Check-out
                        </Button>
                      )}
                      {showReviewBtn && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => setShowReviewModal(true)}
                        >
                          <Star className="w-4 h-4" /> Avaliação
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

        {/* Modal de Check-in */}
        <Dialog open={showCheckinModal} onOpenChange={setShowCheckinModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">Código de Check-in</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 py-4">
              <p className="text-sm text-muted-foreground text-center">
                Insira o código de 6 dígitos fornecido pelo contratante.
              </p>
              <InputOTP maxLength={6} value={checkinCode} onChange={setCheckinCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                className="w-full gap-2"
                onClick={handleCheckinValidate}
                disabled={checkinLoading || checkinCode.length !== 6}
              >
                {checkinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {checkinLoading ? "Validando..." : "Enviar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Check-out */}
        <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">Código de Check-out</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 py-4">
              <p className="text-sm text-muted-foreground text-center">
                Insira o código de 6 dígitos fornecido pelo contratante.
              </p>
              <InputOTP maxLength={6} value={checkoutCode} onChange={setCheckoutCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                className="w-full gap-2"
                onClick={handleCheckoutValidate}
                disabled={checkoutLoading || checkoutCode.length !== 6}
              >
                {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {checkoutLoading ? "Validando..." : "Enviar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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

        {/* Modal Avaliação */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">Avaliar Contratante</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              <p className="text-sm text-muted-foreground text-center">
                Como foi a experiência com o contratante?
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
              {/* Comment */}
              <div className="w-full space-y-2">
                <label className="text-sm font-medium leading-none">Comentário</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Deixe um comentário sobre o contratante..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  maxLength={500}
                />
              </div>
              <Button
                className="w-full gap-2"
                disabled={reviewLoading || reviewStars === 0}
                onClick={async () => {
                  if (!providerId || !contractorId) {
                    toast.error("Não foi possível identificar os envolvidos.");
                    return;
                  }
                  const jobId = jobIdFromState || vaga?.id || vagaId;
                  if (!jobId) {
                    toast.error("Job não identificado.");
                    return;
                  }
                  setReviewLoading(true);
                  try {
                    const res = await apiFetch(`${API_BASE_URL}/contractors/jobs/feedbacks`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        comment: reviewComment.trim(),
                        star: reviewStars,
                        sender: providerId,
                        receiver: contractorId,
                        jobId,
                        createdAt: new Date().toISOString(),
                      }),
                    });
                    if (!res.ok) {
                      const body = await res.json().catch(() => null);
                      throw new Error(body?.message || "Erro ao enviar avaliação.");
                    }
                    toast.success("Avaliação enviada!");
                    setShowReviewModal(false);
                    setReviewStars(0);
                    setReviewComment("");
                  } catch (err: any) {
                    toast.error(err.message || "Erro ao enviar avaliação.");
                  } finally {
                    setReviewLoading(false);
                  }
                }}
              >
                {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  );
};

export default DetalheVaga;
