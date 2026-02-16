import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, DollarSign, Star, Calendar, Clock, ChevronRight, TrendingUp } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const mockJobs = [
  { id: 1, title: "Churrasco - Aniversário", client: "Ana Oliveira", date: "22 Fev", status: "confirmado", value: "R$ 650" },
  { id: 2, title: "Churrasco - Corporativo", client: "Tech Corp", date: "28 Fev", status: "pendente", value: "R$ 1.200" },
  { id: 3, title: "Churrasco - Casamento", client: "Maria Santos", date: "08 Mar", status: "confirmado", value: "R$ 1.800" },
];

const DashboardFreelancer = () => {
  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-display font-bold">Olá, Carlos! 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Aqui está o resumo dos seus trabalhos</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: DollarSign, label: "Ganhos do mês", value: "R$ 3.650", color: "text-success", bg: "bg-success-light" },
            { icon: Briefcase, label: "Jobs este mês", value: "8", color: "text-primary", bg: "bg-primary-light" },
            { icon: Star, label: "Avaliação", value: "4.9", color: "text-warning", bg: "bg-warning-light" },
            { icon: TrendingUp, label: "Visualizações", value: "342", color: "text-accent", bg: "bg-primary-light" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Próximos Trabalhos</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockJobs.map((job) => (
              <div key={job.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.client} • {job.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{job.value}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    job.status === "confirmado" 
                      ? "bg-success-light text-success" 
                      : "bg-warning-light text-warning"
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-xs">Minha Agenda</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Star className="w-5 h-5 text-primary" />
            <span className="text-xs">Minhas Avaliações</span>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardFreelancer;
