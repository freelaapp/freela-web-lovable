import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Clock, MapPin, Briefcase, DollarSign, AlertTriangle, CheckCircle, Upload, X, Image, Video, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/layout/AppLayout";
import { errorMessages } from "@/lib/error-messages";

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

interface FeedbackDetail {
  id: string;
  comment: string;
  star: number;
  sender: string;
  receiver: string;
  jobId: string;
  createdAt: string;
}

interface LocationState {
  jobId?: string;
  vacancyId?: string;
  contractorId?: string;
  feedbackType?: "recebida" | "feita";
}

const renderStars = (rating: number) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-5 h-5 ${i <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    ))}
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

const DetalheAvaliacao = () => {
  const { avaliacaoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [vacancy, setVacancy] = useState<VacancyDetail | null>(null);
  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [senderName, setSenderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showContestar, setShowContestar] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      const token = getAuthToken();
      if (!token) {
        setError(errorMessages.sessionExpired);
        setLoading(false);
        return;
      }

      const { jobId, vacancyId, contractorId } = state;
      if (!jobId || !vacancyId || !contractorId) {
        setError("Dados insuficientes para carregar a avaliação.");
        setLoading(false);
        return;
      }

      const headers = { "Origin-type": ORIGIN_TYPE, Authorization: `Bearer ${token}` };

      try {
        // Fetch vacancy details and feedbacks in parallel
        const [vacRes, fbRes] = await Promise.all([
          fetch(`${API_BASE_URL}/vacancies/${vacancyId}`, { method: "GET", credentials: "include", headers }),
          fetch(`${API_BASE_URL}/contractors/${contractorId}/jobs/${jobId}/feedbacks`, { method: "GET", credentials: "include", headers }),
        ]);

        const vacBody = await vacRes.json().catch(() => null);
        const fbBody = await fbRes.json().catch(() => null);

        // Set vacancy
        if (vacBody?.data) {
          setVacancy(vacBody.data);
        }

        // Find the specific feedback by avaliacaoId
        const feedbacksList: FeedbackDetail[] = fbBody?.success && Array.isArray(fbBody?.data) ? fbBody.data : [];
        const found = feedbacksList.find(f => f.id === avaliacaoId);
        if (found) {
          setFeedback(found);

          // Fetch sender name
          const senderId = state.feedbackType === "feita" ? found.receiver : found.sender;
          if (senderId) {
            try {
              const userRes = await fetch(`${API_BASE_URL}/users/${senderId}`, { method: "GET", credentials: "include", headers });
              const userBody = await userRes.json();
              if (userBody?.success && userBody?.data?.name) {
                setSenderName(userBody.data.name);
              }
            } catch { /* ignore */ }
          }
        } else {
          setError("Avaliação não encontrada.");
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
        setError("Erro ao carregar os dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [avaliacaoId, state.jobId, state.vacancyId, state.contractorId]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        navigate("/avaliacoes");
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  if (loading) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !feedback) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 text-center">
          <p className="text-muted-foreground">{error || "Avaliação não encontrada"}</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEnviar = () => {
    setShowContestar(false);
    setShowSuccess(true);
    setJustificativa("");
    setFiles([]);
  };

  const feedbackType = state.feedbackType || "recebida";

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-3xl mx-auto pb-8 space-y-6">
        <button onClick={() => navigate("/avaliacoes")} className="text-sm text-primary flex items-center gap-1 hover:underline">
          ← Voltar para Avaliações
        </button>

        <div>
          <h1 className="text-2xl font-display font-bold">
            {feedbackType === "recebida" ? "Avaliação Recebida" : "Avaliação Feita"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            de {senderName || "Usuário"} • {formatDate(feedback.createdAt)}
          </p>
        </div>

        {/* Dados do Serviço */}
        {vacancy && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Dados do Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm font-bold">{vacancy.assignment || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Função</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                  <Calendar className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm font-bold">{vacancy.jobDate ? formatDate(vacancy.jobDate) : "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Data</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-success-light/50 text-center">
                  <DollarSign className="w-6 h-6 text-success" />
                  <div>
                    <p className="text-sm font-bold text-success">{vacancy.jobValue ? `R$ ${vacancy.jobValue}` : "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Valor</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm font-bold">{vacancy.establishment || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Estabelecimento</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                  <Clock className="w-6 h-6 text-accent" />
                  <div>
                    <p className="text-sm font-bold">{vacancy.jobTime || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Horário</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                  <MapPin className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm font-bold">{vacancy.quantity} freelancer{vacancy.quantity !== 1 ? "s" : ""}</p>
                    <p className="text-[10px] text-muted-foreground">Qtd</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avaliação */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" /> Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {renderStars(feedback.star)}
              <span className="text-sm font-bold">{feedback.star}/5</span>
            </div>
            {feedback.comment && (
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-foreground/80 italic">"{feedback.comment}"</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Avaliado por: {senderName || "Usuário"}</p>
          </CardContent>
        </Card>

        {/* Botão Contestar */}
        <Button
          variant="destructive"
          className="w-full gap-2 text-base"
          size="lg"
          onClick={() => setShowContestar(true)}
        >
          <AlertTriangle className="w-5 h-5" /> Contestar Avaliação
        </Button>

        {/* Dialog Contestar */}
        <Dialog open={showContestar} onOpenChange={setShowContestar}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" /> Contestar Avaliação
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Justificativa</label>
                <Textarea
                  placeholder="Explique o motivo da contestação..."
                  value={justificativa}
                  onChange={e => setJustificativa(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Anexar fotos ou vídeos (opcional)</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-muted transition-colors text-sm">
                    <Image className="w-4 h-4" /> Fotos
                    <Input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-muted transition-colors text-sm">
                    <Video className="w-4 h-4" /> Vídeos
                    <Input type="file" accept="video/*" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-lg">
                        <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1">{file.name}</span>
                        <button onClick={() => removeFile(i)} className="text-destructive hover:text-destructive/80">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowContestar(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleEnviar} disabled={!justificativa.trim()}>
                Enviar Contestação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Popup sucesso - 7 segundos */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-sm text-center border-emerald-500 bg-emerald-50">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-emerald-700">Contestação Enviada</h2>
              <p className="text-sm text-emerald-600">
                O suporte do Freela foi acionado para moderar o caso. Você será notificado sobre o resultado.
              </p>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2">
                <div className="bg-emerald-500 h-1.5 rounded-full animate-[shrink_7s_linear_forwards]" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default DetalheAvaliacao;
