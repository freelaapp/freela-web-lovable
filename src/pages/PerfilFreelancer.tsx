import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, MapPin, MessageCircle, Shield, Clock, ChevronLeft, Heart, Share2, Send, Calendar, Briefcase } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useState } from "react";

const freelancerData = {
  id: "1",
  name: "Carlos Silva",
  avatar: "CS",
  role: "Churrasqueiro Profissional",
  location: "São Paulo, SP",
  rating: 4.9,
  reviews: 127,
  jobs: 253,
  memberSince: "Jan 2023",
  verified: true,
  responseTime: "~15 min",
  bio: "Churrasqueiro profissional com mais de 10 anos de experiência em eventos. Especializado em cortes nobres, churrasco argentino e brasileiro. Atendo festas de 10 a 200 pessoas com todo equipamento necessário.",
  skills: ["Churrasco Brasileiro", "Churrasco Argentino", "Cortes Nobres", "Buffet Completo", "Eventos Corporativos"],
  portfolio: [
    { title: "Festa de aniversário - 80 pessoas", rating: 5.0 },
    { title: "Confraternização empresa - 120 pessoas", rating: 4.9 },
    { title: "Casamento ao ar livre - 200 pessoas", rating: 5.0 },
    { title: "Churrasco de Réveillon - 50 pessoas", rating: 4.8 },
  ],
  testimonials: [
    { name: "Ana Oliveira", text: "Carlos é incrível! Cuidou de tudo e os convidados amaram.", rating: 5 },
    { name: "Roberto Souza", text: "Profissional top! Churrasco perfeito, super organizado.", rating: 5 },
    { name: "Maria Santos", text: "Contratei para meu casamento. Foi impecável!", rating: 5 },
  ],
  price: "A partir de R$ 480",
};

const PerfilFreelancer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPropostaDialog, setShowPropostaDialog] = useState(false);
  const [proposta, setProposta] = useState({ data: "", horario: "", horas: "", valor: "", descricao: "" });
  const [propostaEnviada, setPropostaEnviada] = useState(false);

  const handleEnviarProposta = () => {
    setPropostaEnviada(true);
    setTimeout(() => {
      setPropostaEnviada(false);
      setShowPropostaDialog(false);
      setProposta({ data: "", horario: "", horas: "", valor: "", descricao: "" });
    }, 2000);
  };

  return (
    <AppLayout showHeader={false} showFooter={false}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold font-display">Perfil do Freelancer</h1>
          <div className="flex gap-1">
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-5">
          <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-amber shrink-0">
            {freelancerData.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-display font-bold">{freelancerData.name}</h2>
              {freelancerData.verified && (
                <Shield className="w-5 h-5 text-primary fill-primary/20" />
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-1">{freelancerData.role}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground justify-center sm:justify-start flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {freelancerData.location}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" /> {freelancerData.rating} ({freelancerData.reviews})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {freelancerData.responseTime}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: freelancerData.jobs.toString(), label: "Trabalhos" },
            { value: freelancerData.rating.toString(), label: "Avaliação" },
            { value: freelancerData.reviews.toString(), label: "Avaliações" },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="p-4">
                <p className="text-xl font-bold font-display text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bio */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-2">Sobre</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{freelancerData.bio}</p>
          </CardContent>
        </Card>

        {/* Skills / Especialidades */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-3">Especialidades</h3>
            <div className="flex flex-wrap gap-2">
              {freelancerData.skills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 bg-primary-light text-primary text-xs font-medium rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-3">Trabalhos Recentes</h3>
            <div className="space-y-3">
              {freelancerData.portfolio.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="flex items-center gap-1 text-sm text-primary font-semibold">
                    <Star className="w-3.5 h-3.5 fill-primary" /> {item.rating}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Avaliações Recentes */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-3">Avaliações Recentes</h3>
            <div className="space-y-4">
              {freelancerData.testimonials.map((t, i) => (
                <div key={i} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom CTA - Contractor View */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">A partir de</p>
            <p className="text-lg font-bold font-display text-primary">R$ 480</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate("/mensagens")}>
              <MessageCircle className="w-4 h-4" /> Mensagem
            </Button>
            <Button size="lg" className="gap-2" onClick={() => setShowPropostaDialog(true)}>
              <Send className="w-4 h-4" /> Proposta Exclusiva
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog Proposta Exclusiva */}
      <Dialog open={showPropostaDialog} onOpenChange={setShowPropostaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Proposta Exclusiva
            </DialogTitle>
            <p className="text-sm text-muted-foreground">Envie uma proposta direta para {freelancerData.name}</p>
          </DialogHeader>

          {propostaEnviada ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center">
                <Send className="w-8 h-8 text-success" />
              </div>
              <p className="text-lg font-bold font-display text-success">Proposta Enviada!</p>
              <p className="text-sm text-muted-foreground text-center">O freelancer será notificado e poderá aceitar ou negociar.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs"><Calendar className="w-3 h-3" /> Data</Label>
                    <Input type="date" value={proposta.data} onChange={(e) => setProposta(p => ({ ...p, data: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs"><Clock className="w-3 h-3" /> Horário</Label>
                    <Input type="time" value={proposta.horario} onChange={(e) => setProposta(p => ({ ...p, horario: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs"><Clock className="w-3 h-3" /> Horas</Label>
                    <Input type="number" min="1" placeholder="6" value={proposta.horas} onChange={(e) => setProposta(p => ({ ...p, horas: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs"><Briefcase className="w-3 h-3" /> Valor (R$)</Label>
                    <Input type="text" placeholder="R$ 500" value={proposta.valor} onChange={(e) => setProposta(p => ({ ...p, valor: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição do serviço</Label>
                  <textarea
                    placeholder="Descreva o que precisa..."
                    value={proposta.descricao}
                    onChange={(e) => setProposta(p => ({ ...p, descricao: e.target.value }))}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowPropostaDialog(false)}>Cancelar</Button>
                <Button onClick={handleEnviarProposta} className="gap-2">
                  <Send className="w-4 h-4" /> Enviar Proposta
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default PerfilFreelancer;
