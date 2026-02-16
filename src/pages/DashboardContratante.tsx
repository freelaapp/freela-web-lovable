import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Users, Clock, ChevronRight, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const mockEvents = [
  { id: 1, title: "Aniversário 30 anos", date: "22 Fev 2026", freelancers: 3, status: "ativo" },
  { id: 2, title: "Confraternização empresa", date: "15 Mar 2026", freelancers: 5, status: "rascunho" },
  { id: 3, title: "Churrasco de Réveillon", date: "31 Dez 2025", freelancers: 2, status: "concluído" },
];

const mockFreelancers = [
  { id: 1, name: "Carlos Silva", role: "Churrasqueiro", rating: 4.9, avatar: "CS" },
  { id: 2, name: "Juliana Alves", role: "Bartender", rating: 4.8, avatar: "JA" },
  { id: 3, name: "Pedro Lima", role: "Garçom", rating: 4.7, avatar: "PL" },
];

const DashboardContratante = () => {
  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 space-y-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Olá, Ana! 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie seus eventos e freelancers</p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/criar-evento">
              <CalendarPlus className="w-4 h-4" /> Criar Evento
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: CalendarPlus, label: "Eventos", value: "12", bg: "bg-primary-light", color: "text-primary" },
            { icon: Users, label: "Contratados", value: "34", bg: "bg-success-light", color: "text-success" },
            { icon: Star, label: "Avaliação", value: "4.8", bg: "bg-warning-light", color: "text-warning" },
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

        {/* Events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Meus Eventos</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
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

        {/* Recent Freelancers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Freelancers Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {mockFreelancers.map((f) => (
                <Link
                  key={f.id}
                  to={`/freelancer/${f.id}`}
                  className="flex flex-col items-center gap-2 min-w-[90px] p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {f.avatar}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold truncate w-20">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.role}</p>
                    <span className="flex items-center justify-center gap-0.5 text-[10px] text-primary font-medium mt-0.5">
                      <Star className="w-3 h-3 fill-primary" /> {f.rating}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DashboardContratante;
