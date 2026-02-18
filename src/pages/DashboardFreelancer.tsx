import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, DollarSign, Star, Calendar, Clock, ChevronRight, TrendingUp, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const mockAvaliacoesFeitas = [
  { id: 1, restaurant: "Restaurante Sabor & Arte", date: "31 Dez 2025", rating: 4, comment: "Boa estrutura, equipe organizada. Apenas o estacionamento era difícil." },
  { id: 2, restaurant: "Buffet Estrela", date: "20 Dez 2025", rating: 5, comment: "Excelente local para trabalhar, muito bem organizado!" },
  { id: 3, restaurant: "Bar do João", date: "10 Dez 2025", rating: 3, comment: "Ambiente ok, mas a cozinha poderia ser mais limpa." },
];

const mockAvaliacoesRecebidas = [
  { id: 1, client: "Ana Oliveira", date: "31 Dez 2025", rating: 5, comment: "Carlos foi impecável! Super pontual e muito profissional." },
  { id: 2, client: "Tech Corp", date: "20 Dez 2025", rating: 5, comment: "Ótimo profissional, recomendo a todos." },
  { id: 3, client: "Maria Santos", date: "10 Dez 2025", rating: 4, comment: "Muito bom, apenas chegou um pouco atrasado." },
];

const mockJobs = [
  { id: 1, title: "Churrasco - Aniversário", client: "Ana Oliveira", date: "22 Fev", status: "confirmado", value: "R$ 650" },
  { id: 2, title: "Churrasco - Corporativo", client: "Tech Corp", date: "28 Fev", status: "pendente", value: "R$ 1.200" },
  { id: 3, title: "Churrasco - Casamento", client: "Maria Santos", date: "08 Mar", status: "confirmado", value: "R$ 1.800" },
];

const mockVagasRegiao = [
  { id: 201, title: "Aniversário 50 anos", role: "Garçom", hours: 6, value: "R$ 120", date: "25 Fev", location: "Vila Mariana, SP", distance: "5km" },
  { id: 202, title: "Happy Hour Corporativo", role: "Bartender", hours: 5, value: "R$ 100", date: "27 Fev", location: "Pinheiros, SP", distance: "8km" },
  { id: 203, title: "Casamento - Buffet", role: "Churrasqueiro", hours: 8, value: "R$ 200", date: "01 Mar", location: "Moema, SP", distance: "12km" },
  { id: 204, title: "Evento Beneficente", role: "Cozinheiro", hours: 6, value: "R$ 120", date: "05 Mar", location: "Itaim Bibi, SP", distance: "15km" },
];

const DashboardFreelancer = () => {
  const navigate = useNavigate();

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
      ))}
    </div>
  );

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

        {/* Jobs Grid: Próximos + Vagas Disponíveis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Próximos Trabalhos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Próximos Trabalhos</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => navigate("/agenda")}>
                  Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/vaga/${job.id}`)}>
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
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

          {/* Vagas Disponíveis na Região */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Vagas na Região
                </CardTitle>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium">até 30km</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockVagasRegiao.map((vaga) => (
                <div key={vaga.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer space-y-2" onClick={() => navigate(`/vaga/${vaga.id}`)}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">{vaga.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-success-light text-success font-medium">{vaga.distance}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{vaga.role}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{vaga.hours}h</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{vaga.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{vaga.location} • {vaga.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/agenda")}>
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-xs">Minha Agenda</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Star className="w-5 h-5 text-primary" />
            <span className="text-xs">Minhas Avaliações</span>
          </Button>
        </div>

        {/* Avaliações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" /> Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recebidas" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="recebidas" className="flex-1">Recebidas</TabsTrigger>
                <TabsTrigger value="feitas" className="flex-1">Feitas por mim</TabsTrigger>
              </TabsList>

              <TabsContent value="recebidas" className="space-y-3 mt-3">
                {mockAvaliacoesRecebidas.map(av => (
                  <div key={av.id} className="p-3 rounded-xl bg-muted/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{av.client}</p>
                      {renderStars(av.rating)}
                    </div>
                    <p className="text-xs text-muted-foreground">{av.date}</p>
                    <p className="text-sm text-foreground/80">"{av.comment}"</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="feitas" className="space-y-3 mt-3">
                {mockAvaliacoesFeitas.map(av => (
                  <div key={av.id} className="p-3 rounded-xl bg-muted/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{av.restaurant}</p>
                      {renderStars(av.rating)}
                    </div>
                    <p className="text-xs text-muted-foreground">{av.date}</p>
                    <p className="text-sm text-foreground/80">"{av.comment}"</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DashboardFreelancer;
