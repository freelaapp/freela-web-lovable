import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, DollarSign, Briefcase, CheckCircle, X, ChevronRight, Star, Shield, MessageCircle, Send, Eye, UserCheck, UserX } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";

const mockEventos = [
  { id: 1, title: "Aniversário 30 anos", date: "22 Fev 2026", time: "14:00 - 22:00", hours: 8, role: "Churrasqueiro", location: "Rua das Flores, 123 - Centro, SP", value: "R$ 650", status: "ativo", freelancersNeeded: 3 },
  { id: 2, title: "Confraternização empresa", date: "15 Mar 2026", time: "18:00 - 00:00", hours: 6, role: "Garçom", location: "Av. Jundiaí, 1000 - Anhangabaú, SP", value: "R$ 1.200", status: "pendente", freelancersNeeded: 5 },
];

const mockCandidatos = [
  { id: "f1", name: "Carlos Silva", avatar: "CS", role: "Churrasqueiro", rating: 4.9, reviews: 127, jobs: 253, verified: true, status: "pendente" as const, price: "R$ 480", responseTime: "~15 min", bio: "Churrasqueiro profissional com mais de 10 anos de experiência." },
  { id: "f2", name: "Juliana Alves", avatar: "JA", role: "Bartender", rating: 4.7, reviews: 89, jobs: 145, verified: true, status: "pendente" as const, price: "R$ 350", responseTime: "~30 min", bio: "Bartender especializada em drinks autorais e coquetéis clássicos." },
  { id: "f3", name: "Pedro Costa", avatar: "PC", role: "Churrasqueiro", rating: 4.5, reviews: 56, jobs: 98, verified: false, status: "aceito" as const, price: "R$ 400", responseTime: "~1h", bio: "Experiente em churrascos para eventos de pequeno e médio porte." },
  { id: "f4", name: "Maria Santos", avatar: "MS", role: "Garçom", rating: 4.8, reviews: 203, jobs: 312, verified: true, status: "recusado" as const, price: "R$ 300", responseTime: "~20 min", bio: "Garçonete profissional com experiência em eventos de alto padrão." },
];

const DetalheEventoContratante = () => {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const evento = mockEventos.find(e => e.id === Number(eventoId));
  const [candidatos, setCandidatos] = useState(mockCandidatos);
  const [selectedFreelancer, setSelectedFreelancer] = useState<typeof mockCandidatos[0] | null>(null);
  const [showPropostaDialog, setShowPropostaDialog] = useState(false);
  const [propostaFreelancer, setPropostaFreelancer] = useState<typeof mockCandidatos[0] | null>(null);
  const [proposta, setProposta] = useState({ valor: "", descricao: "" });
  const [propostaEnviada, setPropostaEnviada] = useState(false);
  const [filter, setFilter] = useState<"todos" | "pendente" | "aceito" | "recusado">("todos");

  if (!evento) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 text-center">
          <p className="text-muted-foreground">Evento não encontrado</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

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
  const aceitos = candidatos.filter(c => c.status === "aceito").length;

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-3xl mx-auto pb-8 space-y-6">
        {/* Header */}
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
            ← Voltar
          </button>
          <h1 className="text-2xl font-display font-bold">{evento.title}</h1>
          <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
            evento.status === "ativo" ? "bg-success-light text-success" : "bg-warning-light text-warning"
          }`}>{evento.status}</span>
        </div>

        {/* Detalhes */}
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Calendar, value: evento.date, label: "Data", color: "text-primary" },
                { icon: Clock, value: evento.time, label: "Horário", color: "text-primary" },
                { icon: DollarSign, value: evento.value, label: "Valor/pessoa", color: "text-success" },
                { icon: Briefcase, value: evento.role, label: "Função", color: "text-primary" },
                { icon: Clock, value: `${evento.hours}h`, label: "Duração", color: "text-accent" },
                { icon: MapPin, value: evento.location.split(" - ")[0], label: "Local", color: "text-primary" },
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
              <span className="text-xs text-muted-foreground">{aceitos}/{evento.freelancersNeeded} aceitos</span>
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
                    setPropostaFreelancer(selectedFreelancer);
                    setSelectedFreelancer(null);
                    setShowPropostaDialog(true);
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

      {/* Dialog Proposta Exclusiva */}
      <Dialog open={showPropostaDialog} onOpenChange={setShowPropostaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Proposta Exclusiva
            </DialogTitle>
            {propostaFreelancer && <p className="text-sm text-muted-foreground">Para {propostaFreelancer.name}</p>}
          </DialogHeader>
          {propostaEnviada ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center">
                <Send className="w-8 h-8 text-success" />
              </div>
              <p className="text-lg font-bold font-display text-success">Proposta Enviada!</p>
              <p className="text-sm text-muted-foreground text-center">O freelancer será notificado.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs"><DollarSign className="w-3 h-3" /> Valor (R$)</Label>
                  <Input type="text" placeholder="R$ 500" value={proposta.valor} onChange={(e) => setProposta(p => ({ ...p, valor: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição / Observações</Label>
                  <textarea
                    placeholder="Detalhes adicionais sobre o serviço..."
                    value={proposta.descricao}
                    onChange={(e) => setProposta(p => ({ ...p, descricao: e.target.value }))}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowPropostaDialog(false)}>Cancelar</Button>
                <Button onClick={handleEnviarProposta} className="gap-2"><Send className="w-4 h-4" /> Enviar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default DetalheEventoContratante;
