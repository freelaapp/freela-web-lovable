import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, DollarSign, Star, Clock, ChevronRight, MapPin, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

const API_BASE_URL = "https://api.freelaservicos.com.br";


const DashboardFreelancer = () => {
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState<string>("--");
  const [vagasDisponiveis, setVagasDisponiveis] = useState<any[]>([]);
  const [vagasAtivas, setVagasAtivas] = useState<any[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(true);
  const [loadingAtivas, setLoadingAtivas] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
        const provData = Array.isArray(provBody?.data) ? provBody.data[0] : provBody?.data;
        const providerId = provData?.id ?? provBody?.id;
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

        // 3. Get active jobs (IDs) then fetch details
        setLoadingAtivas(true);
        const activeRes = await fetch(`${API_BASE_URL}/providers/${providerId}/active-jobs`, {
          method: "GET", credentials: "include", headers,
        });
        const activeBody = await activeRes.json().catch(() => null);
        const activeData = activeBody?.data ?? activeBody;
        const activeIds: string[] = Array.isArray(activeData)
          ? activeData.map((item: any) => typeof item === "string" ? item : item?.id ?? item?.vacancyId)
          : [];

        if (activeIds.length > 0) {
          const activeDetails = await Promise.all(
            activeIds.filter(Boolean).map(async (vacId: string) => {
              try {
                const res = await fetch(`${API_BASE_URL}/vacancies/${vacId}`, {
                  method: "GET", credentials: "include", headers,
                });
                const body = await res.json().catch(() => null);
                return body?.data ?? body ?? null;
              } catch { return null; }
            })
          );
          setVagasAtivas(activeDetails.filter(Boolean));
        } else {
          setVagasAtivas([]);
        }
        setLoadingAtivas(false);

        // 4. Get applied vacancies (IDs)
        setLoadingVagas(true);
        const appliedRes = await fetch(`${API_BASE_URL}/providers/${providerId}/applied-vacancies`, {
          method: "GET", credentials: "include", headers,
        });
        const appliedBody = await appliedRes.json().catch(() => null);
        const appliedData = appliedBody?.data ?? appliedBody;
        const vacancyIds: string[] = Array.isArray(appliedData)
          ? appliedData.map((item: any) => typeof item === "string" ? item : item?.id ?? item?.vacancyId)
          : [];

        // 5. Fetch each vacancy detail
        if (vacancyIds.length > 0) {
          const details = await Promise.all(
            vacancyIds.filter(Boolean).map(async (vacId: string) => {
              try {
                const res = await fetch(`${API_BASE_URL}/vacancies/${vacId}`, {
                  method: "GET", credentials: "include", headers,
                });
                const body = await res.json().catch(() => null);
                return body?.data ?? body ?? null;
              } catch { return null; }
            })
          );
          setVagasDisponiveis(details.filter(Boolean));
        } else {
          setVagasDisponiveis([]);
        }
      } catch (err) {
        console.error("[DashboardFreelancer] error fetching data:", err);
      } finally {
        setLoadingVagas(false);
      }
    };
    fetchData();
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
          {/* Vagas Ativas */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" /> Vagas Ativas
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => navigate("/agenda")}>
                  Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingAtivas ? (
                <p className="text-sm text-muted-foreground text-center py-4">Carregando vagas ativas...</p>
              ) : vagasAtivas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma vaga ativa</p>
              ) : (
                vagasAtivas.slice(0, 3).map((vaga: any) => (
                  <div key={vaga.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer space-y-2" onClick={() => navigate(`/vaga/${vaga.id}`)}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">{vaga.establishment || vaga.description || "Vaga"}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-success-light text-success">Ativa</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {vaga.freelancers?.[0]?.assignment && (
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{vaga.freelancers[0].assignment}</span>
                      )}
                      {vaga.freelancers?.[0]?.jobTime && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{vaga.freelancers[0].jobTime}</span>
                      )}
                      {vaga.freelancers?.[0]?.jobValue && (
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{vaga.freelancers[0].jobValue}</span>
                      )}
                    </div>
                    {vaga.jobDate && <p className="text-xs text-muted-foreground">{vaga.jobDate}</p>}
                  </div>
                ))
              )}
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
              {loadingVagas ? (
                <p className="text-sm text-muted-foreground text-center py-4">Carregando vagas...</p>
              ) : vagasDisponiveis.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma vaga disponível</p>
              ) : (
                vagasDisponiveis.slice(0, 3).map((vaga: any) => (
                  <div key={vaga.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer space-y-2" onClick={() => navigate(`/vaga/${vaga.id}`)}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">{vaga.establishment || vaga.description || "Vaga"}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        vaga.status === "confirmed" || vaga.status === "confirmado"
                          ? "bg-success-light text-success"
                          : "bg-warning-light text-warning"
                      }`}>{vaga.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {vaga.freelancers?.[0]?.assignment && (
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{vaga.freelancers[0].assignment}</span>
                      )}
                      {vaga.freelancers?.[0]?.jobTime && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{vaga.freelancers[0].jobTime}</span>
                      )}
                      {vaga.freelancers?.[0]?.jobValue && (
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{vaga.freelancers[0].jobValue}</span>
                      )}
                    </div>
                    {vaga.jobDate && <p className="text-xs text-muted-foreground">{vaga.jobDate}</p>}
                  </div>
                ))
              )}
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
