import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const API_BASE_URL = "https://api.freelaservicos.com.br";
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

const renderStars = (rating: number) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    ))}
  </div>
);

// Freelancer mock data
const freelancerPendentes = [
  { id: 1, title: "Churrasco - Réveillon", client: "Pedro Costa", date: "31 Dez 2025", location: "São Paulo, SP" },
  { id: 2, title: "Bartender - Formatura", client: "Faculdade ABC", date: "20 Dez 2025", location: "Santo André, SP" },
];

const freelancerRecebidas = [
  { id: 1, client: "Ana Oliveira", date: "31 Dez 2025", rating: 5, comment: "Carlos foi impecável! Super pontual e muito profissional." },
  { id: 2, client: "Tech Corp", date: "20 Dez 2025", rating: 5, comment: "Ótimo profissional, recomendo a todos." },
  { id: 3, client: "Maria Santos", date: "10 Dez 2025", rating: 4, comment: "Muito bom, apenas chegou um pouco atrasado." },
];

const freelancerFeitas = [
  { id: 4, name: "Restaurante Sabor & Arte", date: "31 Dez 2025", rating: 4, comment: "Boa estrutura, equipe organizada." },
  { id: 5, name: "Buffet Estrela", date: "20 Dez 2025", rating: 5, comment: "Excelente local para trabalhar!" },
  { id: 6, name: "Bar do João", date: "10 Dez 2025", rating: 3, comment: "Ambiente ok, mas a cozinha poderia ser mais limpa." },
];

// Contratante mock data
const contratantePendentes = [
  { id: 1, title: "Churrasco - Réveillon", client: "Carlos Silva (Churrasqueiro)", date: "31 Dez 2025", location: "São Paulo, SP" },
  { id: 2, title: "Bartender - Aniversário", client: "Juliana Alves (Bartender)", date: "22 Fev 2026", location: "Jundiaí, SP" },
];

const contratanteFeitas = [
  { id: 4, name: "Carlos Silva - Churrasqueiro", date: "31 Dez 2025", rating: 5, comment: "Profissional excepcional, cuidou de tudo com perfeição." },
  { id: 5, name: "Juliana Alves - Bartender", date: "20 Dez 2025", rating: 5, comment: "Drinks incríveis, super profissional!" },
  { id: 6, name: "Pedro Lima - Garçom", date: "10 Dez 2025", rating: 4, comment: "Bom profissional, pontual e educado." },
];

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

const FeedbackItem = ({ fb }: { fb: Feedback }) => (
  <div className="p-3 rounded-xl bg-muted/50 space-y-1.5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold">{fb.senderName || "Freelancer"}</p>
      {renderStars(fb.star)}
    </div>
    <p className="text-xs text-muted-foreground">{formatDate(fb.createdAt)}</p>
    {fb.comment && <p className="text-sm text-foreground/80">"{fb.comment}"</p>}
  </div>
);

const Avaliacoes = () => {
  const navigate = useNavigate();
  const role = useUserRole();
  const isContratante = role === "contratante";

  const [recebidasApi, setRecebidasApi] = useState<Feedback[]>([]);
  const [feitasApi, setFeitasApi] = useState<Feedback[]>([]);
  const [loadingRecebidas, setLoadingRecebidas] = useState(false);
  const [loadingFeitas, setLoadingFeitas] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showAllFeitasModal, setShowAllFeitasModal] = useState(false);

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
        const contractorId = contractorBody.data.id;

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

        setRecebidasApi(recebidasList.map(f => ({ ...f, senderName: nameMap[f.sender] })));
        setFeitasApi(feitasList.map(f => ({ ...f, senderName: nameMap[f.receiver] })));
      } catch (err) {
        console.error("Erro ao buscar feedbacks:", err);
        setRecebidasApi([]);
        setFeitasApi([]);
      } finally {
        setLoadingRecebidas(false);
        setLoadingFeitas(false);
      }
    };

    fetchFeedbacks();
  }, [isContratante]);

  const pendentes = isContratante ? contratantePendentes : freelancerPendentes;
  const recebidas = isContratante ? null : freelancerRecebidas; // null = use API for contratante
  const feitas = isContratante ? contratanteFeitas : freelancerFeitas;

  const recebidasToShow = isContratante ? recebidasApi.slice(0, 4) : freelancerRecebidas;

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Minhas Avaliações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isContratante ? "Avalie freelancers e veja seus feedbacks" : "Veja e gerencie seus feedbacks"}
          </p>
        </div>

        {pendentes.length > 0 && (
          <Card className="border-warning/30 bg-warning-light/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                {isContratante ? "Avalie seus freelancers" : "Avalie seus últimos serviços"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendentes.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.client} • {s.date}</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1">
                    Avaliar <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}
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
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isContratante ? (
                loadingRecebidas ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : recebidasApi.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem avaliações</p>
                ) : (
                  recebidasToShow.map(fb => <FeedbackItem key={fb.id} fb={fb} />)
                )
              ) : (
                (recebidas ?? []).map(av => (
                  <div
                    key={av.id}
                    className="p-3 rounded-xl bg-muted/50 space-y-1.5 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/avaliacao/${av.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{av.client}</p>
                      {renderStars(av.rating)}
                    </div>
                    <p className="text-xs text-muted-foreground">{av.date}</p>
                    <p className="text-sm text-foreground/80">"{av.comment}"</p>
                  </div>
                ))
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
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isContratante ? (
                loadingFeitas ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : feitasApi.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem avaliações</p>
                ) : (
                  feitasApi.slice(0, 4).map(fb => <FeedbackItem key={fb.id} fb={fb} />)
                )
              ) : (
                feitas.map(av => (
                  <div
                    key={av.id}
                    className="p-3 rounded-xl bg-muted/50 space-y-1.5 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/avaliacao/${av.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{av.name}</p>
                      {renderStars(av.rating)}
                    </div>
                    <p className="text-xs text-muted-foreground">{av.date}</p>
                    <p className="text-sm text-foreground/80">"{av.comment}"</p>
                  </div>
                ))
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
            {recebidasApi.map(fb => <FeedbackItem key={fb.id} fb={fb} />)}
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
            {feitasApi.map(fb => <FeedbackItem key={fb.id} fb={fb} />)}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Avaliacoes;
