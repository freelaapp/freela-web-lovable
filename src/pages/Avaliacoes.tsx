import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const API_BASE_URL = import.meta.env.API_BASE_URL;
const ORIGIN_TYPE = "Web";

function getAuthToken(): string | null {
  const raw = localStorage.getItem("authToken");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

interface Feedback {
  id: string;
  comment: string;
  star: number;
  sender: string;
  receiver: string;
  jobId: string;
  createdAt: string;
  senderName?: string;
  vacancyId?: string;
}

interface PendingFeedback {
  id: string;
  title: string;
  client: string;
  date: string;
  location: string;
}

const renderStars = (rating: number) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    ))}
  </div>
);

const FeedbackItem = ({ fb, contractorId, onClick }: { fb: Feedback; contractorId?: string; onClick?: () => void }) => (
  <div
    className="p-3 rounded-xl bg-muted/50 space-y-1.5 cursor-pointer hover:bg-muted transition-colors"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold">{fb.senderName || "Freelancer"}</p>
      {renderStars(fb.star)}
    </div>
    <p className="text-xs text-muted-foreground">{formatDate(fb.createdAt)}</p>
    {fb.comment && <p className="text-sm text-foreground/80">"{fb.comment}"</p>}
  </div>
);

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

const Avaliacoes = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isContratante = role === "contratante";

  // Estados para freelancer
  const [pendingFeedbacks, setPendingFeedbacks] = useState<PendingFeedback[]>([]);
  const [jobsFeedbacks, setJobsFeedbacks] = useState<Feedback[]>([]);
  const [givenFeedbacks, setGivenFeedbacks] = useState<Feedback[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingGiven, setLoadingGiven] = useState(false);
  
  // Estados para contratante (já existentes)
  const [recebidasApi, setRecebidasApi] = useState<Feedback[]>([]);
  const [feitasApi, setFeitasApi] = useState<Feedback[]>([]);
  const [loadingRecebidas, setLoadingRecebidas] = useState(false);
  const [loadingFeitas, setLoadingFeitas] = useState(false);
  
  const [showAllModal, setShowAllModal] = useState(false);
  const [showAllFeitasModal, setShowAllFeitasModal] = useState(false);
  const [contractorId, setContractorId] = useState<string>("");
  const [providerId, setProviderId] = useState<string>("");

  // Buscar dados do freelancer
  useEffect(() => {
    if (isContratante) return;

    const fetchFreelancerData = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const headers = { "Origin-type": ORIGIN_TYPE, Authorization: `Bearer ${token}` };

        // 1. Get provider id
        const provRes = await fetch(`${API_BASE_URL}/users/providers`, {
          method: "GET", credentials: "include", headers,
        });
        const provBody = await provRes.json();
        const provData = Array.isArray(provBody?.data) ? provBody.data[0] : provBody?.data;
        const pId = provData?.id ?? provBody?.id;
        if (!pId) return;
        setProviderId(pId);

        // 2. Fetch all feedback endpoints in parallel
        setLoadingPending(true);
        setLoadingJobs(true);
        setLoadingGiven(true);

        const [pendingRes, jobsRes, givenRes] = await Promise.all([
          fetch(`${API_BASE_URL}/providers/${pId}/feedbacks/pending`, {
            method: "GET", credentials: "include", headers,
          }),
          fetch(`${API_BASE_URL}/providers/${pId}/jobs/feedbacks`, {
            method: "GET", credentials: "include", headers,
          }),
          fetch(`${API_BASE_URL}/providers/${pId}/feedbacks/given`, {
            method: "GET", credentials: "include", headers,
          }),
        ]);

        // 3. Process pending feedbacks
        const pendingBody = await pendingRes.json();
        const pendingData = pendingBody?.data ?? pendingBody;
        const pendingList: PendingFeedback[] = Array.isArray(pendingData) ? pendingData.map((item: any) => ({
          id: item.id ?? String(item.vacancyId ?? Math.random()),
          title: item.title || item.assignment || "Vaga",
          client: item.client || item.establishment || "Cliente",
          date: item.date || item.jobDate || "",
          location: item.location || item.address || "",
        })) : [];
        setPendingFeedbacks(pendingList);

        // 4. Process jobs/feedbacks (received)
        const jobsBody = await jobsRes.json();
        const jobsData = jobsBody?.data ?? jobsBody;
        const jobsList: Feedback[] = Array.isArray(jobsData) ? jobsData.map((item: any) => ({
          id: item.id ?? String(item.feedbackId ?? Math.random()),
          comment: item.comment || "",
          star: item.star ?? item.rating ?? 0,
          sender: item.sender ?? "",
          receiver: item.receiver ?? pId,
          jobId: item.jobId ?? item.job?.id ?? "",
          createdAt: item.createdAt || item.created_at || "",
        })) : [];
        setJobsFeedbacks(jobsList);

        // 5. Process given feedbacks
        const givenBody = await givenRes.json();
        const givenData = givenBody?.data ?? givenBody;
        const givenList: Feedback[] = Array.isArray(givenData) ? givenData.map((item: any) => ({
          id: item.id ?? String(item.feedbackId ?? Math.random()),
          comment: item.comment || "",
          star: item.star ?? item.rating ?? 0,
          sender: item.sender ?? "",
          receiver: item.receiver ?? "",
          jobId: item.jobId ?? item.job?.id ?? "",
          createdAt: item.createdAt || item.created_at || "",
        })) : [];
        setGivenFeedbacks(givenList);

      } catch (err) {
        setPendingFeedbacks([]);
        setJobsFeedbacks([]);
        setGivenFeedbacks([]);
      } finally {
        setLoadingPending(false);
        setLoadingJobs(false);
        setLoadingGiven(false);
      }
    };

    fetchFreelancerData();
  }, [isContratante]);

  // Buscar dados do contratante (mantido)
  useEffect(() => {
    if (!isContratante) return;

    const fetchFeedbacks = async () => {
      setLoadingRecebidas(true);
      setLoadingFeitas(true);
      try {
        const token = getAuthToken();
        if (!token) return;

        const headers = { "Origin-type": ORIGIN_TYPE, Authorization: `Bearer ${token}` };

        // 1. Get contractor id
        const contractorRes = await fetch(`${API_BASE_URL}/users/contractors`, {
          method: "GET", credentials: "include", headers,
        });
        const contractorBody = await contractorRes.json();
        if (!contractorBody?.success || !contractorBody?.data?.id) return;
        const cId = contractorBody.data.id;
        setContractorId(cId);
        const contractorId = cId;

        // 2. Fetch recebidas and feitas in parallel
        const [fbRes, feitasRes] = await Promise.all([
          fetch(`${API_BASE_URL}/contractors/${contractorId}/jobs/feedbacks`, {
            method: "GET", credentials: "include", headers,
          }),
          fetch(`${API_BASE_URL}/providers/${contractorId}/jobs/feedbacks`, {
            method: "GET", credentials: "include", headers,
          }),
        ]);

        const fbBody = await fbRes.json();
        const feitasBody = await feitasRes.json();

        // 3. Collect all unique senders from both lists
        const recebidasList: Feedback[] = fbBody?.success && Array.isArray(fbBody?.data) ? fbBody.data : [];
        const feitasList: Feedback[] = feitasBody?.success && Array.isArray(feitasBody?.data) ? feitasBody.data : [];

        const allSenders = [...new Set([
          ...recebidasList.map(f => f.sender),
          ...feitasList.map(f => f.receiver),
        ])];
        const nameMap: Record<string, string> = {};

        await Promise.all(
          allSenders.map(async (userId) => {
            try {
              const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: "GET", credentials: "include", headers,
              });
              const body = await res.json();
              if (body?.success && body?.data?.name) {
                nameMap[userId] = body.data.name;
              }
            } catch { /* ignore */ }
          })
        );

        // 4. Resolve vacancyId for each feedback via GET /jobs/{jobId}
        const allFeedbacks = [...recebidasList, ...feitasList];
        const uniqueJobIds = [...new Set(allFeedbacks.map(f => f.jobId).filter(Boolean))];
        const jobVacancyMap: Record<string, string> = {};

        await Promise.all(
          uniqueJobIds.map(async (jobId) => {
            try {
              const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
                method: "GET", credentials: "include", headers,
              });
              const body = await res.json();
              if (body?.success && body?.data?.vacancyId) {
                jobVacancyMap[jobId] = body.data.vacancyId;
              } else if (body?.data?.vacancyId) {
                jobVacancyMap[jobId] = body.data.vacancyId;
              }
            } catch { /* ignore */ }
          })
        );

        setRecebidasApi(recebidasList.map(f => ({ ...f, senderName: nameMap[f.sender], vacancyId: jobVacancyMap[f.jobId] })));
        setFeitasApi(feitasList.map(f => ({ ...f, senderName: nameMap[f.receiver], vacancyId: jobVacancyMap[f.jobId] })));
      } catch (err) {
        setRecebidasApi([]);
        setFeitasApi([]);
      } finally {
        setLoadingRecebidas(false);
        setLoadingFeitas(false);
      }
    };

    fetchFeedbacks();
  }, [isContratante]);

  // Dados para exibição
  const pendentes = isContratante ? [] : pendingFeedbacks; // Contratante não tem pendentes nessa rota
  const recebidasToShow = isContratante ? recebidasApi.slice(0, 4) : jobsFeedbacks;
  const feitasToShow = isContratante ? feitasApi.slice(0, 4) : givenFeedbacks;
  const allRecebidas = isContratante ? recebidasApi : jobsFeedbacks;
  const allFeitas = isContratante ? feitasApi : givenFeedbacks;

  const navigateToFeedback = (fb: Feedback, type: "recebida" | "feita") => {
    navigate(`/avaliacao/${fb.id}`, {
      state: { jobId: fb.jobId, vacancyId: fb.vacancyId, contractorId, feedbackType: type },
    });
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Minhas Avaliações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isContratante ? "Avalie freelancers e veja seus feedbacks" : "Veja e gerencie seus feedbacks"}
          </p>
        </div>

        {/* Bloco: Avalie seus últimos serviços (Pendentes) - apenas freelancer */}
        {!isContratante && (
          <Card className="border-warning/30 bg-warning-light/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Avalie seus últimos serviços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingPending ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : pendingFeedbacks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum serviço pendente de avaliação</p>
              ) : (
                pendingFeedbacks.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.client} • {s.date}</p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1">
                      Avaliar <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" /> Recebidas
                </CardTitle>
                {isContratante && recebidasApi.length > 4 && (
                  <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setShowAllModal(true)}>
                    Ver todas
                  </Button>
                )}
                {!isContratante && jobsFeedbacks.length > 4 && (
                  <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setShowAllModal(true)}>
                    Ver todas
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isContratante ? (
                loadingRecebidas ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : recebidasApi.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem avaliações</p>
                ) : (
                  recebidasToShow.map(fb => (
                    <FeedbackItem key={fb.id} fb={fb} contractorId={contractorId} onClick={() => navigateToFeedback(fb, "recebida")} />
                  ))
                )
              ) : (
                loadingJobs ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : jobsFeedbacks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem avaliações</p>
                ) : (
                  recebidasToShow.map(fb => (
                    <FeedbackItem key={fb.id} fb={fb} onClick={() => navigateToFeedback(fb, "recebida")} />
                  ))
                )
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" />
                  {isContratante ? "Feitas para freelancers" : "Feitas por mim"}
                </CardTitle>
                {isContratante && feitasApi.length > 4 && (
                  <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setShowAllFeitasModal(true)}>
                    Ver todas
                  </Button>
                )}
                {!isContratante && givenFeedbacks.length > 4 && (
                  <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setShowAllFeitasModal(true)}>
                    Ver todas
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isContratante ? (
                loadingFeitas ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : feitasApi.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem avaliações</p>
                ) : (
                  feitasToShow.map(fb => (
                    <FeedbackItem key={fb.id} fb={fb} contractorId={contractorId} onClick={() => navigateToFeedback(fb, "feita")} />
                  ))
                )
              ) : (
                loadingGiven ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : givenFeedbacks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem avaliações</p>
                ) : (
                  feitasToShow.map(fb => (
                    <FeedbackItem key={fb.id} fb={fb} onClick={() => navigateToFeedback(fb, "feita")} />
                  ))
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Ver Todas */}
      <Dialog open={showAllModal} onOpenChange={setShowAllModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" /> Todas as Avaliações Recebidas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {allRecebidas.map(fb => (
              <FeedbackItem key={fb.id} fb={fb} contractorId={contractorId} onClick={() => navigateToFeedback(fb, "recebida")} />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ver Todas Feitas */}
      <Dialog open={showAllFeitasModal} onOpenChange={setShowAllFeitasModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" /> Todas as Avaliações Feitas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {allFeitas.map(fb => (
              <FeedbackItem key={fb.id} fb={fb} contractorId={contractorId} onClick={() => navigateToFeedback(fb, "feita")} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Avaliacoes;
