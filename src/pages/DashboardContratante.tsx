import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Users, Clock, ChevronRight, Star, DollarSign, AlertCircle, Calendar, MapPin, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const mockStats = {
  totalGasto: "R$ 12.450",
  eventosRealizados: 12,
  freelancersContratados: 34,
  avaliacaoMedia: 4.8,
};

const mockProximosEventos = [
  { id: 1, title: "Aniversário 30 anos", date: "22 Fev 2026", time: "14:00", freelancers: 3, status: "confirmado", role: "Churrasqueiro" },
  { id: 2, title: "Confraternização empresa", date: "15 Mar 2026", time: "18:00", freelancers: 5, status: "pendente", role: "Garçom" },
];

const mockMeusEventos = [
  { id: 1, title: "Aniversário 30 anos", date: "22 Fev 2026", freelancers: 3, status: "ativo" },
  { id: 2, title: "Confraternização empresa", date: "15 Mar 2026", freelancers: 5, status: "rascunho" },
  { id: 3, title: "Churrasco de Réveillon", date: "31 Dez 2025", freelancers: 2, status: "concluído" },
];

const mockAvaliacoesPendentes = [
  { id: 1, freelancer: "Carlos Silva", role: "Churrasqueiro", event: "Churrasco de Réveillon", date: "31 Dez 2025" },
  { id: 2, freelancer: "Juliana Alves", role: "Bartender", event: "Confraternização", date: "20 Dez 2025" },
];

const DashboardContratante = () => {
  const navigate = useNavigate();

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 space-y-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Olá, Ana! 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie seus eventos e freelancers</p>
          </div>
          <Button asChild size="xl" className="gap-2">
            <Link to="/criar-evento">
              <CalendarPlus className="w-5 h-5" /> Criar Evento
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: DollarSign, label: "Total Gasto", value: mockStats.totalGasto, bg: "bg-success-light", color: "text-success" },
            { icon: CalendarPlus, label: "Eventos", value: mockStats.eventosRealizados.toString(), bg: "bg-primary-light", color: "text-primary" },
            { icon: Users, label: "Contratados", value: mockStats.freelancersContratados.toString(), bg: "bg-accent/10", color: "text-accent" },
            { icon: Star, label: "Avaliação", value: mockStats.avaliacaoMedia.toString(), bg: "bg-warning-light", color: "text-warning" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Avaliações Pendentes */}
        {mockAvaliacoesPendentes.length > 0 && (
          <Card className="border-warning/30 bg-warning-light/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" /> Avalie seus freelancers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAvaliacoesPendentes.map((av) => (
                <div key={av.id} className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                    {av.freelancer.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{av.freelancer}</p>
                    <p className="text-xs text-muted-foreground">{av.role} • {av.event}</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1" onClick={() => navigate("/avaliacoes")}>
                    Avaliar <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Próximos Eventos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockProximosEventos.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate(`/vaga/${event.id}`)}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                    <Clock className="w-3 h-3" /> {event.date} às {event.time}
                    <span>•</span>
                    <Briefcase className="w-3 h-3" /> {event.role}
                    <span>•</span>
                    <Users className="w-3 h-3" /> {event.freelancers} freelancers
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  event.status === "confirmado" ? "bg-success-light text-success" : "bg-warning-light text-warning"
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Meus Eventos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Meus Eventos</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-xs" asChild>
                <Link to="/agenda">
                  Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockMeusEventos.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate(`/vaga/${event.id}`)}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <CalendarPlus className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {event.date} • <Users className="w-3 h-3" /> {event.freelancers} freelancers
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  event.status === "ativo" ? "bg-success-light text-success"
                    : event.status === "rascunho" ? "bg-warning-light text-warning"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DashboardContratante;
