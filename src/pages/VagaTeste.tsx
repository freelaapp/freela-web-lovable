import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, DollarSign, Briefcase, Star, Shield, Eye, UserCheck, UserX, CheckCircle, KeyRound, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useState } from "react";

const mockVacancy = {
  id: "teste-001",
  establishment: "Buffet Villa Real - Rua das Flores, 1200 - São Paulo, SP",
  assignment: "Garçom",
  description: "Evento corporativo para 200 pessoas",
  quantity: 3,
  jobDate: "2026-04-15",
  jobTime: "8 horas",
  jobValue: "R$ 350,00",
  status: "open",
};

type CandidatoStatus = "pendente" | "aceito" | "recusado";

interface MockCandidato {
  id: string;
  providerId: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
  reviews: number;
  jobs: number;
  verified: boolean;
  status: CandidatoStatus;
  price: string;
  bio: string;
}

const mockCandidatos: MockCandidato[] = [
  {
    id: "c1",
    providerId: "p1",
    name: "Lucas Oliveira",
    avatar: "LO",
    role: "Garçom",
    rating: 4.8,
    reviews: 32,
    jobs: 45,
    verified: true,
    status: "pendente" as const,
    price: "R$ 350,00",
    bio: "Experiência em eventos corporativos e sociais. Proativo e pontual.",
  },
  {
    id: "c2",
    providerId: "p2",
    name: "Ana Beatriz Santos",
    avatar: "AS",
    role: "Garçom",
    rating: 4.5,
    reviews: 18,
    jobs: 27,
    verified: true,
    status: "aceito" as const,
    price: "R$ 350,00",
    bio: "5 anos de experiência em buffets e casas de festas.",
  },
  {
    id: "c3",
    providerId: "p3",
    name: "Rafael Costa",
    avatar: "RC",
    role: "Garçom",
    rating: 4.2,
    reviews: 10,
    jobs: 15,
    verified: false,
    status: "pendente" as const,
    price: "R$ 350,00",
    bio: "Novo na plataforma, mas com experiência em restaurantes de alto padrão.",
  },
];

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

const VagaTeste = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"todos" | "pendente" | "aceito" | "recusado">("todos");
  const [candidatos, setCandidatos] = useState(mockCandidatos);
  const [selectedFreelancer, setSelectedFreelancer] = useState<typeof mockCandidatos[0] | null>(null);

  const vacancy = mockVacancy;

  const formattedDate = new Date(vacancy.jobDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const filteredCandidatos = filter === "todos" ? candidatos : candidatos.filter(c => c.status === filter);
  const confirmados = candidatos.filter(c => c.status === "aceito");
  const aceitos = confirmados.length;

  const handleAceitar = (id: string) => {
    setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status: "aceito" as CandidatoStatus } : c));
  };

  const handleRecusar = (id: string) => {
    setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status: "recusado" as CandidatoStatus } : c));
  };

  const timelineStep = 1;

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-3xl mx-auto pb-8 space-y-6">
        {/* Header */}
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
            ← Voltar
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold">{vacancy.establishment}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-warning-light text-warning font-medium">PÁGINA DE TESTE</span>
          </div>
          <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${statusStyles[vacancy.status] || "bg-muted text-muted-foreground"}`}>
            {statusLabels[vacancy.status] || vacancy.status}
          </span>
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
                { icon: MapPin, value: vacancy.establishment, label: "Local", color: "text-primary" },
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

        {/* Freelancers Inscritos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Freelancers Inscritos
              </CardTitle>
              <span className="text-xs text-muted-foreground">{aceitos}/{vacancy.quantity} aceitos</span>
            </div>
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
                <div
                  key={candidato.id}
                  className="relative p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => setSelectedFreelancer(candidato)}
                >
                  <div className="flex items-start gap-3">
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
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{candidato.bio}</p>
                    </div>
                  </div>

                  {/* Action buttons row */}
                  <div className="flex items-center gap-3 mt-3 ml-15" onClick={(e) => e.stopPropagation()}>
                    {candidato.status === "pendente" ? (
                      <>
                        <button
                          className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl bg-success/10 border border-success/20 hover:bg-success/20 transition-colors"
                          onClick={() => handleAceitar(candidato.id)}
                        >
                          <UserCheck className="w-5 h-5 text-success" />
                          <span className="text-[10px] font-medium text-success">Aceitar</span>
                        </button>
                        <button
                          className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors"
                          onClick={() => handleRecusar(candidato.id)}
                        >
                          <UserX className="w-5 h-5 text-destructive" />
                          <span className="text-[10px] font-medium text-destructive">Recusar</span>
                        </button>
                        <button
                          className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                          onClick={() => setSelectedFreelancer(candidato)}
                        >
                          <Eye className="w-5 h-5 text-primary" />
                          <span className="text-[10px] font-medium text-primary">Ver perfil</span>
                        </button>
                      </>
                    ) : candidato.status === "aceito" ? (
                      <>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-success-light text-success">aceito</span>
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                          <DollarSign className="w-3 h-3 mr-1" /> Pagamento
                        </Button>
                        <button
                          className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                          onClick={() => setSelectedFreelancer(candidato)}
                        >
                          <Eye className="w-5 h-5 text-primary" />
                          <span className="text-[10px] font-medium text-primary">Ver perfil</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-destructive/10 text-destructive">recusado</span>
                        <button
                          className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                          onClick={() => setSelectedFreelancer(candidato)}
                        >
                          <Eye className="w-5 h-5 text-primary" />
                          <span className="text-[10px] font-medium text-primary">Ver perfil</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
        </Card>

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

                return (
                  <div key={item.key} className="relative pb-6 last:pb-0">
                    {!isLast && (
                      <div className={`absolute left-[-18px] top-6 w-0.5 h-full ${isDone ? "bg-primary" : "bg-border"}`} />
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`absolute left-[-24px] w-4 h-4 rounded-full border-2 ${
                        isDone ? "bg-primary border-primary" : isInProgress ? "bg-background border-primary" : "bg-background border-border"
                      }`}>
                        {isDone && <CheckCircle className="w-3 h-3 text-primary-foreground absolute top-0 left-0" />}
                      </div>
                      <p className={`text-sm ${isDone ? "text-foreground font-medium" : isInProgress ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                        {item.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Modal Freelancer */}
        {selectedFreelancer && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedFreelancer(null)}>
            <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold">
                    {selectedFreelancer.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-lg">{selectedFreelancer.name}</CardTitle>
                      {selectedFreelancer.verified && <Shield className="w-4 h-4 text-primary fill-primary/20" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedFreelancer.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{selectedFreelancer.rating}</span>
                    <span className="text-xs text-muted-foreground">({selectedFreelancer.reviews} avaliações)</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{selectedFreelancer.jobs} jobs realizados</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Sobre</p>
                  <p className="text-sm text-muted-foreground">{selectedFreelancer.bio}</p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-1" size="sm">
                    <MessageSquare className="w-4 h-4" /> Mensagem
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm" onClick={() => setSelectedFreelancer(null)}>
                    Fechar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default VagaTeste;
