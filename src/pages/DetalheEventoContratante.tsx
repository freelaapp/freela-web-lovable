import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, DollarSign, Briefcase, CheckCircle, X, ChevronRight, Star, Shield, MessageCircle, Send, Eye, UserCheck, UserX, Loader2, QrCode, Copy, KeyRound, MessageSquare, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { apiFetch, acceptCandidacy, rejectCandidacy, getProviderDetails, createJobPayment, deleteVacancy, type JobPaymentResponse } from "@/lib/api";
import Pusher from "pusher-js";
import { formatCurrency } from "@/lib/formatters";
import { errorMessages } from "@/lib/error-messages";

const API_BASE_URL = import.meta.env.API_BASE_URL;

interface VacancyService {
  assignment: string;
  quantity: number;
  jobTime: string;
  jobValue: string;
  jobId?: string;
}

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
  services?: VacancyService[];
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAccept, setPendingAccept] = useState<{ id: string; assignment: string; providerId: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Helper: fetch payment details for a job (no auto-schedule)
  const fetchJobPayments = async (jobId: string) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/jobs/${jobId}/payments`, { method: "GET" });
      const body = await res.json().catch(() => null);
      console.log("[Payment] GET /jobs/{jobId}/payments:", body);
      const paymentInfo = body?.data ?? body;
      if (paymentInfo) {
        setPixData(prev => {
          const merged = { ...prev, ...paymentInfo };
          if (!merged.pixQrCode && prev?.pixQrCode) merged.pixQrCode = prev.pixQrCode;
          if (!merged.pixQrCodeImage && prev?.pixQrCodeImage) merged.pixQrCodeImage = prev.pixQrCodeImage;
          return merged;
        });
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

      const jobId = data?.jobId || lastJobIdRef.current;
      if (jobId) {
        await fetchJobPayments(jobId);

        // Payment confirmed → schedule the job and close modal
        try {
          const jobRes = await apiFetch(`${API_BASE_URL}/jobs/${jobId}`, { method: "GET" });
          const jobBody = await jobRes.json().catch(() => null);
          const paid = jobBody?.data?.paid ?? jobBody?.paid;
          console.log("[Pusher] job paid status:", paid);

           if (paid === true || paid === "true") {
             await apiFetch(`${API_BASE_URL}/jobs/${jobId}/schedule`, { method: "PATCH" });
             console.log("[Pusher] job scheduled after payment confirmation");
             setTimelineStep(2);
             setShowPixModal(false);
             toast({ title: "Pagamento confirmado!", description: "O job foi agendado com sucesso." });
           } else {
             toast({ title: "Pagamento atualizado", description: data?.message || `Status: ${data?.status}` });
           }
        } catch (scheduleErr: any) {
          console.error("[Pusher] failed to check/schedule job:", scheduleErr);
        }
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
      const status = (body?.data?.status ?? body?.status ?? "").trim();
      console.log("[JobStatus] job", jobId, "status:", JSON.stringify(status));

      if (status === "unavailable") {
        setTimelineStep(1);
      } else if (status === "schedule") {
        setTimelineStep(2);
      } else if (status === "in progress") {
        setTimelineStep(3);
      } else if (status === "completed" || status === "partially completed") {
        setTimelineStep(4);
      }
    } catch (err) {
      console.error("[JobStatus] error fetching job status:", err);
    }
  };

  // ── Polling: verificar mudanças de status do job a cada 5s ──────────
  const fetchJobStatusRef = useRef(fetchJobStatus);
  fetchJobStatusRef.current = fetchJobStatus;

  useEffect(() => {
    if (!eventoId) return;
    if (timelineStep >= 5) return; // Não fazer polling se já atingiu estado final

    const intervalId = setInterval(() => {
      // Pausar se aba não está visível
      if (document.visibilityState !== "visible") return;

      // Pausar se já atingiu estado final
      if (timelineStep >= 5) return;

      console.log("[Polling] Verificando status do job...");
      fetchJobStatusRef.current(eventoId);
    }, 5000); // 5 segundos

    return () => clearInterval(intervalId);
  }, [eventoId, timelineStep]);

  // Helpers para verificação de limites por serviço
  const getServiceLimit = (assignment: string): number => {
    if (!vacancy?.services) return vacancy?.quantity ?? 1;
    const svc = vacancy.services.find(s => s.assignment === assignment);
    return svc?.quantity ?? vacancy.quantity ?? 1;
  };

  const getAcceptedCountForAssignment = (assignment: string): number => {
    return candidatos.filter(c => c.status === "aceito" && c.role === assignment).length;
  };

  useEffect(() => {
    if (!eventoId) return;

    // Fetch vacancy details
    apiFetch(`${API_BASE_URL}/vacancies/${eventoId}`, { method: "GET" })
      .then(r => r.json())
      .then(body => {
        if (body?.data) {
          const v = body.data as VacancyDetail;
           // Normalizar: se não tem services, criar array com assignment/quantity
           if (!v.services && v.assignment) {
             v.services = [{ assignment: v.assignment, quantity: v.quantity ?? 1, jobTime: "--", jobValue: "--" }];
           }
           // Garantir que services tenha fallbacks
           if (v.services) {
             v.services = v.services.map(s => ({
               assignment: s.assignment || v.assignment || "Sem título",
               quantity: s.quantity ?? v.quantity ?? 1,
               jobTime: s.jobTime || "--",
               jobValue: s.jobValue || "--",
             }));
           }
          setVacancy(v);
        }
      })
      .catch(err => console.error("Erro ao buscar vaga:", err))
      .finally(() => setLoading(false));

     // Fetch candidacies
     setLoadingCandidatos(true);
     apiFetch(`${API_BASE_URL}/vacancies/candidacies?vacancyId=${eventoId}`, { method: "GET" })
       .then(r => r.json())
       .then(async (body) => {
         try {
           const list = Array.isArray(body?.data) ? body.data : [];
           
           // For each candidacy, fetch provider and then user details
           const candidatePromises = list.map(async (c: any) => {
             try {
               // Fetch provider details
               const providerRes = await apiFetch(`${API_BASE_URL}/providers/${c.providerId}`, { method: "GET" });
               const providerBody = await providerRes.json();
               const providerData = providerBody?.data || providerBody;
               
               // Fetch user details
               const userRes = await apiFetch(`${API_BASE_URL}/users/${providerData.userId}`, { method: "GET" });
               const userBody = await userRes.json();
               const userData = userBody?.data || userBody;
               
               return {
                 ...c,
                 providerData,
                 userData
               };
             } catch (err) {
               console.error(`Erro ao buscar dados para candidato ${c.id}:`, err);
               return { ...c, providerData: null, userData: null };
             }
           });
           
           const enrichedCandidates = await Promise.all(candidatePromises);
           
           // Map to Candidato objects
           const mapped: Candidato[] = enrichedCandidates.map((c: any) => {
             const providerData = c.providerData || {};
             const userData = c.userData || {};
             
             return {
               id: c.id || "",
               providerId: c.providerId || "",
               name: userData.name || c.providerName || c.name || "Freelancer",
               avatar: (userData.name || c.providerName || c.name || "FL")
                 .split(" ")
                 .map((w: string) => w[0])
                 .join("")
                 .slice(0, 2)
                 .toUpperCase(),
               role: c.assignment || c.role || "",
               rating: providerData.feedbackStars ?? c.rating ?? 0,
               reviews: c.reviews ?? 0,
               jobs: c.jobs ?? 0,
               verified: c.verified ?? false,
               status: c.status === "accepted" ? "aceito" : c.status === "rejected" ? "recusado" : "pendente",
               price: c.price || c.jobValue || "",
               responseTime: c.responseTime || "",
               bio: c.bio || c.description || "",
             };
           });
           
           const hasAccepted = mapped.some(c => c.status === "aceito");
           if (hasAccepted) {
             setTimelineStep(prev => prev < 1 ? 1 : prev);
           }
           setCandidatos(mapped);
         } catch (err) {
           console.error("Erro ao processar candidatos:", err);
         }
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
      return new Date(vacancy.jobDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
    } catch { return vacancy.jobDate; }
  })();

   const handleAceitar = async (id: string, assignment: string): Promise<boolean> => {
     const limit = getServiceLimit(assignment);
     const accepted = getAcceptedCountForAssignment(assignment);

     if (accepted >= limit) {
       toast({
         title: "Limite atingido",
         description: `Já foram aceitos ${limit} freelancers para a função ${assignment}.`,
         variant: "destructive",
       });
       return false;
     }

     setActionLoadingIds(prev => new Set(prev).add(id));
     try {
       const result = await acceptCandidacy(id);
       setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status: "aceito" as const } : c));
       if (timelineStep < 1) setTimelineStep(1);
       if (result?.vacancy?.status) {
         setVacancy(prev => prev ? { ...prev, status: result.vacancy.status } : prev);
       }
       toast({ title: "Freelancer aceito!", description: "O freelancer será notificado por e-mail." });
       return true;
     } catch (err: any) {
       toast({ title: "Erro ao aceitar", description: err.message || "Tente novamente.", variant: "destructive" });
       return false;
     } finally {
       setActionLoadingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
     }
   };

    const handleRecusar = async (id: string) => {
      setActionLoadingIds(prev => new Set(prev).add(id));
      try {
        const result = await rejectCandidacy(id);
        setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status: "recusado" as const } : c));
        if (result?.vacancy?.status) {
          setVacancy(prev => prev ? { ...prev, status: result.vacancy.status } : prev);
        }
        toast({ title: "Candidatura recusada", description: "O freelancer será notificado por e-mail." });
      } catch (err: any) {
        toast({ title: "Erro ao recusar", description: err.message || "Tente novamente.", variant: "destructive" });
      } finally {
        setActionLoadingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      }
    };

   const openConfirmDialog = (id: string, assignment: string, providerId: string) => {
     setPendingAccept({ id, assignment, providerId });
     setShowConfirmDialog(true);
   };

   const handleConfirmAccept = async () => {
     if (!pendingAccept) return;
     const { id, assignment, providerId } = pendingAccept;
     setShowConfirmDialog(false);
     
     const success = await handleAceitar(id, assignment);
     if (success) {
       // Após aceitar com sucesso, chamar pagamento automaticamente
       try {
         await handlePagamento(providerId, id);
       } catch (err) {
         console.error("Erro ao abrir pagamento após aceite:", err);
       }
     }
     
     setPendingAccept(null);
   };

   const handleDeleteVaga = async () => {
     if (!eventoId) return;
     setShowDeleteDialog(false);
     setDeleteLoading(true);
     try {
       await deleteVacancy(eventoId);
       toast({ title: "Vaga excluída!", description: "A vaga foi removida com sucesso." });
       navigate(-1);
     } catch (err: any) {
       toast({ title: "Erro ao excluir", description: err.message || "Tente novamente.", variant: "destructive" });
     } finally {
       setDeleteLoading(false);
     }
   };

   const handlePagamento = async (providerId: string, candidatoId?: string) => {
     const loadingId = candidatoId || providerId;
     setActionLoadingIds(prev => new Set(prev).add(loadingId));
     try {
       const vacancyId = eventoId ?? "";

       if (!vacancyId) {
         toast({ title: "Erro", description: "Vaga não encontrada.", variant: "destructive" });
         return;
       }

       // Buscar jobId associado à vacancy para usar nas operações subsequentes
       const jobsRes = await apiFetch(`${API_BASE_URL}/vacancies/jobs?vacancyId=${vacancyId}`, { method: "GET" });
       const jobsBody = await jobsRes.json().catch(() => null);
       const jobData = jobsBody?.data ?? jobsBody;
       const jobId = Array.isArray(jobData) ? jobData[0]?.id ?? "" : jobData?.id ?? "";

       if (!jobId) {
         toast({ title: "Erro", description: "Job não encontrado para esta vaga.", variant: "destructive" });
         return;
       }

       // Enviar pagamento com o payload correto para o backend
       const paymentResult = await createJobPayment(vacancyId, {
         method: "pix",
         vacancyId: vacancyId,
       });

       console.log("[Payment] POST result:", JSON.stringify(paymentResult));
       lastJobIdRef.current = jobId;

       // Store POST result immediately (has pixQrCode & pixQrCodeImage)
       setPixData(paymentResult);
       setShowPixModal(true);

       // Fetch extra payment info but do NOT schedule — wait for payment confirmation via Pusher
       fetchJobPayments(jobId);
     } catch (err: any) {
       console.error("[Payment] error:", err);
       toast({ title: "Erro ao criar pagamento", description: err.message || "Tente novamente.", variant: "destructive" });
     } finally {
       setActionLoadingIds(prev => { const next = new Set(prev); next.delete(loadingId); return next; });
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

      // Terminate the job after successful feedback
      const terminateRes = await apiFetch(`${API_BASE_URL}/jobs/${jobId}/terminate`, {
        method: "PATCH",
      });

      if (terminateRes.ok) {
        setTimelineStep(5);
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
           <div className="flex items-center justify-between">
             <div>
               <h1 className="text-2xl font-display font-bold">
                 {vacancy.services?.[0]?.assignment || vacancy.assignment || "Vaga"}
               </h1>
               <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
                 statusStyles[vacancy.status] || "bg-muted text-muted-foreground"
               }`}>{statusLabels[vacancy.status] || vacancy.status}</span>
             </div>
             {candidatos.length === 0 && (
               <Button
                 variant="destructive"
                 size="sm"
                 className="gap-2"
                 onClick={() => setShowDeleteDialog(true)}
               >
                 <Trash2 className="w-4 h-4" />
                 Excluir Vaga
               </Button>
             )}
           </div>
         </div>

         {/* Detalhes - Services Cards */}
         {vacancy.services && vacancy.services.length > 0 ? (
           <>
             {vacancy.services.map((service, serviceIndex) => (
               <Card key={serviceIndex} className="mb-4">
                 <CardContent className="p-5">
                   <div className="grid grid-cols-3 gap-3">
                     {[
                       { icon: Calendar, value: formattedDate, label: "Data", color: "text-primary" },
                       { icon: Clock, value: service.jobTime, label: "Duração", color: "text-primary" },
                       { icon: DollarSign, value: service.jobValue, label: "Valor/pessoa", color: "text-success" },
                       { icon: Users, value: `${service.quantity}`, label: "Freelancers", color: "text-accent" },
                       { icon: MapPin, value: vacancy.establishment, label: "Local", color: "text-primary" },
                     ].map((item, i) => (
                       <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 text-center">
                         <item.icon className={`w-5 h-5 ${item.color}`} />
                         <div>
                            {item.label === "Valor/pessoa" && (
                              <p className="text-xs font-bold truncate max-w-[100px]">
                                {formatCurrency(item.value)}
                              </p>
                            )}
                           {item.label !== "Valor/pessoa" && (
                             <p className="text-xs font-bold truncate max-w-[100px]">{item.value}</p>
                           )}
                           <p className="text-[10px] text-muted-foreground">{item.label}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             ))}
           </>
          ) : (
            /* Fallback to original layout if no services */
            <Card>
             <CardContent className="p-5">
               <div className="grid grid-cols-3 gap-3">
                 {[
                   { icon: Calendar, value: formattedDate, label: "Data", color: "text-primary" },
                   { icon: Clock, value: vacancy.jobTime, label: "Duração", color: "text-primary" },
                   { icon: DollarSign, value: vacancy.jobValue, label: "Valor/pessoa", color: "text-success" },
                   { icon: Users, value: `${vacancy.quantity}`, label: "Freelancers", color: "text-accent" },
                   { icon: MapPin, value: vacancy.establishment, label: "Local", color: "text-primary" },
                 ].map((item, i) => (
                   <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 text-center">
                     <item.icon className={`w-5 h-5 ${item.color}`} />
                     <div>
                        {item.label === "Valor/pessoa" && (
                          <p className="text-xs font-bold truncate max-w-[100px]">
                            {formatCurrency(item.value)}
                          </p>
                        )}
                       {item.label !== "Valor/pessoa" && (
                         <p className="text-xs font-bold truncate max-w-[100px]">{item.value}</p>
                       )}
                       <p className="text-[10px] text-muted-foreground">{item.label}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         )}


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
                  <div key={candidato.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => setSelectedFreelancer(candidato)}>
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
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {candidato.status === "pendente" ? (
                        <>
                           <button
                             className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-success/10 border border-success/20 hover:bg-success/20 transition-colors disabled:opacity-50"
                             disabled={actionLoadingIds.has(candidato.id) || getAcceptedCountForAssignment(candidato.role) >= getServiceLimit(candidato.role)}
                             onClick={() => openConfirmDialog(candidato.id, candidato.role, candidato.providerId)}
                           >
                            {actionLoadingIds.has(candidato.id)
                              ? <Loader2 className="w-4 h-4 animate-spin text-success" />
                              : <UserCheck className="w-4 h-4 text-success" />}
                            <span className="text-[10px] font-medium text-success">Aceitar</span>
                          </button>
                          <button
                            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors disabled:opacity-50"
                            disabled={actionLoadingIds.has(candidato.id)}
                            onClick={() => handleRecusar(candidato.id)}
                          >
                            {actionLoadingIds.has(candidato.id)
                              ? <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                              : <UserX className="w-4 h-4 text-destructive" />}
                            <span className="text-[10px] font-medium text-destructive">Recusar</span>
                          </button>
                          <button
                            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors"
                            onClick={() => setSelectedFreelancer(candidato)}
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[10px] font-medium text-muted-foreground">Ver perfil</span>
                          </button>
                        </>
                       ) : candidato.status === "aceito" ? (
                         <>
                           <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-success-light text-success">aceito</span>
                           <button
                             className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors"
                             onClick={() => setSelectedFreelancer(candidato)}
                           >
                             <Eye className="w-4 h-4 text-muted-foreground" />
                             <span className="text-[10px] font-medium text-muted-foreground">Ver perfil</span>
                           </button>
                         </>
                       ) : (
                        <>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-destructive/10 text-destructive">recusado</span>
                          <button
                            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors"
                            onClick={() => setSelectedFreelancer(candidato)}
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[10px] font-medium text-muted-foreground">Ver perfil</span>
                          </button>
                        </>
                      )}
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
                  <div key={candidato.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => setSelectedFreelancer(candidato)}>
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
                const showCheckOutBtn = item.key === "termino" && isInProgress && confirmados.length > 0 && timelineStep >= 2;
                const showReviewBtn = item.key === "feedback" && isInProgress && confirmados.length > 0;

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
                           onClick={() => confirmados[0] && handlePagamento(confirmados[0].providerId, confirmados[0].id)}
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
                       {showCheckOutBtn && (
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
                       {showReviewBtn && (
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
                 <div className="grid grid-cols-1 gap-2">
                   {[
                     { value: selectedFreelancer.jobs.toString(), label: "Trabalhos" },
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
                 {selectedFreelancer.status === "pendente" ? (
                   <div className="flex gap-2">
                     <Button
                       className="flex-1 gap-2 bg-success hover:bg-success/90"
                       disabled={actionLoadingIds.has(selectedFreelancer.id) || getAcceptedCountForAssignment(selectedFreelancer.role) >= getServiceLimit(selectedFreelancer.role)}
                       onClick={() => openConfirmDialog(selectedFreelancer.id, selectedFreelancer.role, selectedFreelancer.providerId)}
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
                      onClick={() => handleRecusar(selectedFreelancer.id)}
                    >
                      {actionLoadingIds.has(selectedFreelancer.id)
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <UserX className="w-4 h-4" />}
                      Recusar
                    </Button>
                  </div>
                 ) : selectedFreelancer.status === "aceito" ? null : selectedFreelancer.status === "recusado" ? (
                  <Button variant="destructive" className="w-full gap-2 cursor-default" disabled>
                    <UserX className="w-4 h-4" /> Recusado
                  </Button>
                ) : null}

                <Button variant="outline" className="w-full gap-2" onClick={() => { setSelectedFreelancer(null); navigate(`/freelancer/${selectedFreelancer.id}`); }}>
                  <Eye className="w-4 h-4" /> Ver Perfil Completo <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
       </DialogContent>
       </Dialog>

       {/* Dialog de Confirmação de Aceite */}
       <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
         <DialogContent className="max-w-sm">
           <DialogHeader>
             <DialogTitle className="text-center">Confirmar o aceite do Freelancer?</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col items-center gap-4 py-4">
             <svg id="Layer_1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" className="w-16 h-16 text-warning">
               <path d="m461.187 249.255c-8.72-8.914-24.606-11.035-38.082 2.148l-63.037 61.367-23.318-23.27c-7.749-7.738-17.435-10.771-26.572-8.314a24.466 24.466 0 0 0 -17.242 17.265c-2.444 9.142.6 18.822 8.349 26.563l37.567 37.5a29.9 29.9 0 0 0 41.884.228l77.452-75.446c13.49-13.196 11.719-29.126 2.999-38.041zm-12.778 28.019-77.452 75.446a15.856 15.856 0 0 1 -22.214-.116l-37.565-37.5c-3.26-3.256-5.01-6.8-5.06-10.245a10.4 10.4 0 0 1 10.349-10.5h.139c3.447.046 6.992 1.791 10.253 5.048l28.2 28.15a7 7 0 0 0 9.828.062l67.993-66.192c7.28-7.121 14.435-6.326 18.3-2.378s4.499 11.115-2.771 18.225zm22.955-72.8a128.273 128.273 0 0 0 -91.288-37.774c-.391 0-.786 0-1.178 0-70.05.62-127.494 58.115-128.05 128.167a129.371 129.371 0 0 0 37.671 92.239l-24.263 26.382a12.155 12.155 0 0 0 8.9 20.38 12.28 12.28 0 0 0 2.953-.361l62.091-15.307a129.237 129.237 0 0 0 133.164-213.727zm-86.655 206.576a115.181 115.181 0 0 1 -43.778-6.729 7 7 0 0 0 -4.053-.213l-58.16 14.339 24.763-26.927a7 7 0 0 0 -.468-9.941 115.353 115.353 0 0 1 -38.165-86.6c.5-62.461 51.714-113.726 114.173-114.279h1.051a115.221 115.221 0 0 1 115.21 116.077c-.439 60.629-50.042 111.892-110.573 114.273zm-161.228-112.51a129.369 129.369 0 0 0 37.671-92.24c-.556-70.053-58-127.548-128.05-128.167-.394 0-.785-.006-1.178-.006a129.224 129.224 0 1 0 41.874 251.5l62.1 15.31a12.357 12.357 0 0 0 2.951.36 12.155 12.155 0 0 0 8.9-20.38zm-48.359 17a7.008 7.008 0 0 0 -4.053.213 115.129 115.129 0 0 1 -43.778 6.728c-60.531-2.381-110.134-53.643-110.573-114.275a115.221 115.221 0 0 1 115.21-116.077h1.051c62.459.552 113.677 51.817 114.173 114.279a115.349 115.349 0 0 1 -38.165 86.6 7 7 0 0 0 -.468 9.942l24.764 26.927zm-40.933-207.73a58.45 58.45 0 0 0 -60.7 58.407c0 15.029 11.332 22.893 22.527 22.893s22.526-7.864 22.526-22.893a13.4 13.4 0 1 1 19.633 11.865 53.362 53.362 0 0 0 -28.762 47.12v8.226c0 15.116 11.332 23.024 22.527 23.024s22.526-7.908 22.526-23.024v-8.228a8.44 8.44 0 0 1 4.759-7.287 58.065 58.065 0 0 0 31.122-53.953 58.676 58.676 0 0 0 -56.158-56.151zm18.49 97.727a22.39 22.39 0 0 0 -12.217 19.663v8.226c0 8.589-7.1 9.024-8.526 9.024s-8.527-.435-8.527-9.024v-8.226a39.4 39.4 0 0 1 21.3-34.742 27.4 27.4 0 0 0 -11.7-51.619q-.543-.021-1.081-.021a27.4 27.4 0 0 0 -27.392 27.4c0 8.464-7.1 8.893-8.526 8.893s-8.527-.429-8.527-8.893a44.45 44.45 0 0 1 46.175-44.418 44.454 44.454 0 0 1 19.021 83.737zm-20.743 55.485a24.039 24.039 0 1 0 24.038 24.038 24.066 24.066 0 0 0 -24.038-24.039zm0 34.077a10.039 10.039 0 1 1 10.038-10.039 10.051 10.051 0 0 1 -10.038 10.04z"/>
             </svg>
             <p className="text-sm text-muted-foreground text-center">
               Ao Confirmar o freelancer você será redirecionado ao pagamento da vaga, esse valor ficará retido até a conclusão do serviço. Caso aconteça algum tipo de problema com o serviço, esse valor será estornado para sua conta.
             </p>
             <div className="flex gap-3 w-full">
               <Button
                 variant="outline"
                 className="flex-1"
                 onClick={() => setShowConfirmDialog(false)}
               >
                 Não
               </Button>
               <Button
                 className="flex-1 bg-success hover:bg-success/90"
                 onClick={handleConfirmAccept}
                 disabled={actionLoadingIds.has(pendingAccept?.id || "")}
               >
                 {actionLoadingIds.has(pendingAccept?.id || "")
                   ? <Loader2 className="w-4 h-4 animate-spin" />
                   : "Sim"
                 }
               </Button>
             </div>
           </div>
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

      {/* ── Modal Excluir Vaga ──────────────────────────────────── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Excluir Vaga?</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={handleDeleteVaga}
                disabled={deleteLoading}
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
};

export default DetalheEventoContratante;
