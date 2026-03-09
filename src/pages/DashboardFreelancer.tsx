import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, DollarSign, Star, Calendar, Clock, ChevronRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

const API_BASE_URL = "https://api.freelaservicos.com.br";

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
  const [averageRating, setAverageRating] = useState<string>("--");

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) return;
        const token = JSON.parse(tokenRaw);
        const headers = { "Origin-type": "Web", Authorization: `Bearer ${token}` };

        // 1. Get provider id
        const provRes = await fetch(`${API_BASE_URL}/users/providers`, {
          method: "GET", credentials: "include", headers,
        });
        const provBody = await provRes.json().catch(() => null);
        const providerId = provBody?.data?.id ?? provBody?.id;
        if (!providerId) return;

        // 2. Get feedbacks
        const fbRes = await fetch(`${API_BASE_URL}/providers/${providerId}/jobs/feedbacks`, {
          method: "GET", credentials: "include", headers,
        });
        const fbBody = await fbRes.json().catch(() => null);
        const feedbacks = fbBody?.data ?? fbBody;

        if (Array.isArray(feedbacks) && feedbacks.length > 0) {
          const avg = feedbacks.reduce((sum: number, f: any) => sum + (f.rating ?? f.score ?? 0), 0) / feedbacks.length;
          setAverageRating(avg.toFixed(1));
        } else if (typeof feedbacks === "number") {
          setAverageRating(feedbacks.toFixed(1));
        } else if (typeof fbBody?.data === "number") {
          setAverageRating(fbBody.data.toFixed(1));
        }
      } catch (err) {
        console.error("[DashboardFreelancer] error fetching rating:", err);
      }
    };
    fetchRating();
  }, []);

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
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: DollarSign, label: "Ganhos do mês", value: "R$ 3.650", color: "text-success", bg: "bg-success-light" },
            { icon: Briefcase, label: "Jobs este mês", value: "8", color: "text-primary", bg: "bg-primary-light" },
            { icon: Star, label: "Avaliação", value: averageRating, color: "text-warning", bg: "bg-warning-light" },
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

          {/* Vagas Disponíveis */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Vagas Disponíveis
                </CardTitle>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium">Para seu perfil</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockVagasRegiao.slice(0, 3).map((vaga) => (
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
              <Button variant="outline" className="w-full text-xs gap-2 mt-2" onClick={() => navigate("/mapa-vagas")}>
                <MapPin className="w-4 h-4" /> Ver todas no mapa
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
};

export default DashboardFreelancer;
