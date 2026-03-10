import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, DollarSign, Briefcase, CheckCircle, X, ChevronRight, Star, Shield, MessageCircle, Send, Eye, UserCheck, UserX, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";

const API_BASE_URL = "https://api.freelaservicos.com.br";
const ORIGIN_TYPE = "Web";

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

  useEffect(() => {
    if (!eventoId) return;
    const tokenRaw = localStorage.getItem("authToken");
    if (!tokenRaw) return;
    let token: string;
    try { token = JSON.parse(tokenRaw); } catch { return; }

    const headers = { "Origin-type": ORIGIN_TYPE, Authorization: `Bearer ${token}` };

    fetch(`${API_BASE_URL}/vacancies/${eventoId}`, { method: "GET", credentials: "include", headers })
      .then(r => r.json())
      .then(body => {
        if (body?.data) {
          setVacancy(body.data);
        }
      })
      .catch(err => console.error("Erro ao buscar vaga:", err))
      .finally(() => setLoading(false));
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

  const handleAceitar = (id: string) => {
    setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status: "aceito" as const } : c));
    toast({ title: "Freelancer aceito!", description: "O freelancer será notificado." });
  };

  const handleRecusar = (id: string) => {
    setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status: "recusado" as const } : c));
    toast({ title: "Candidatura recusada", description: "O freelancer foi notificado." });
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
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => handleAceitar(candidato.id)}>
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleRecusar(candidato.id)}>
                            <UserX className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          candidato.status === "aceito" ? "bg-success-light text-success" : "bg-destructive/10 text-destructive"
                        }`}>{candidato.status}</span>
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
                    <Button className="flex-1 gap-2 bg-success hover:bg-success/90" onClick={() => { handleAceitar(selectedFreelancer.id); setSelectedFreelancer(null); }}>
                      <UserCheck className="w-4 h-4" /> Aceitar
                    </Button>
                    <Button variant="destructive" className="flex-1 gap-2" onClick={() => { handleRecusar(selectedFreelancer.id); setSelectedFreelancer(null); }}>
                      <UserX className="w-4 h-4" /> Recusar
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

    </AppLayout>
  );
};

export default DetalheEventoContratante;
