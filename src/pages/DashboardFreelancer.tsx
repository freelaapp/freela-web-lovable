import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, DollarSign, Star, Clock, ChevronRight, MapPin, CheckCircle, Calendar, Hourglass } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

const API_BASE_URL = import.meta.env.API_BASE_URL;

// Format date string to DD-MM-YYYY
const formatDateDDMMYYYY = (dateStr: string): string => {
  if (!dateStr || dateStr === "--") return "--";
  // Try parsing ISO or YYYY-MM-DD
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
  // Already formatted or unknown
  return dateStr;
};

interface FlattenedVaga {
  vacancyId: string;
  serviceIndex: number;
  assignment: string;
  jobTime: string;
  jobValue: string;
  jobDate: string;
  establishment: string;
  status: string;
  quantity: number;
}

const DashboardFreelancer = () => {
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState<string>("--");
  const [vagasDisponiveis, setVagasDisponiveis] = useState<FlattenedVaga[]>([]);
  const [vagasAtivas, setVagasAtivas] = useState<any[]>([]);
  const [vagasAgendadas, setVagasAgendadas] = useState<any[]>([]);
  const [vagasPendentes, setVagasPendentes] = useState<any[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(true);
  const [loadingAtivas, setLoadingAtivas] = useState(true);
  const [loadingAgendadas, setLoadingAgendadas] = useState(true);
  const [loadingPendentes, setLoadingPendentes] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userNameLoading, setUserNameLoading] = useState<boolean>(true);
  const [jobsThisMonth, setJobsThisMonth] = useState<number>(0);

   useEffect(() => {
     const fetchData = async () => {
       try {
         const tokenRaw = localStorage.getItem("authToken");
         if (!tokenRaw) return;
         const token = JSON.parse(tokenRaw);
         const headers = { "Origin-type": "Web", Authorization: `Bearer ${token}` };

         // Fetch user name from /users/me
         try {
           const userRes = await fetch(`${API_BASE_URL}/users/me`, {
             method: "GET", credentials: "include", headers,
           });
           const userBody = await userRes.json().catch(() => null);
           if (userRes.ok && userBody?.data?.name) {
             setUserName(userBody.data.name);
           } else if (userBody?.name) {
             setUserName(userBody.name);
           } else {
             // Fallback if name not found in expected places
             setUserName("Usuário");
           }
         } catch (userError) {
           console.warn("[DashboardFreelancer] Failed to fetch user name:", userError);
           setUserName("Usuário"); // Fallback on error
         } finally {
           setUserNameLoading(false); // Always stop loading for user name
         }

         // 1. Get provider profile (id + services/areas)
         const provRes = await fetch(`${API_BASE_URL}/users/providers`, {
           method: "GET", credentials: "include", headers,
         });
         const provBody = await provRes.json().catch(() => null);
         const provData = Array.isArray(provBody?.data) ? provBody.data[0] : provBody?.data;
         const providerId = provData?.id ?? provBody?.id;
         if (!providerId) return;

         // Extract freelancer's service areas from profile (desiredJobVacancy)
         const providerServices: string[] = [];
         const rawServices = provData?.desiredJobVacancy ?? [];
         if (Array.isArray(rawServices)) {
           rawServices.forEach((s: any) => {
             if (typeof s === "string") providerServices.push(s.toLowerCase().trim());
             else if (s?.name) providerServices.push(s.name.toLowerCase().trim());
             else if (s?.assignment) providerServices.push(s.assignment.toLowerCase().trim());
           });
         }

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
         const activeJobsRes = await fetch(`${API_BASE_URL}/providers/${providerId}/active-jobs`, {
           method: "GET", credentials: "include", headers,
         });
         const activeJobsBody = await activeJobsRes.json().catch(() => null);
         const activeJobsData = activeJobsBody?.data ?? activeJobsBody;
         const activeIds: string[] = Array.isArray(activeJobsData)
           ? activeJobsData.map((item: any) => typeof item === "string" ? item : item?.id ?? item?.vacancyId)
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

          // 3b. Get future/scheduled jobs (same logic as active jobs)
          setLoadingAgendadas(true);
          const futureJobsRes = await fetch(`${API_BASE_URL}/providers/${providerId}/future-jobs`, {
            method: "GET", credentials: "include", headers,
          });
          const futureJobsBody = await futureJobsRes.json().catch(() => null);
          const futureJobsData = futureJobsBody?.data ?? futureJobsBody;
          const futureIds: string[] = Array.isArray(futureJobsData)
            ? futureJobsData.map((item: any) => typeof item === "string" ? item : item?.id ?? item?.vacancyId)
            : [];

          if (futureIds.length > 0) {
            // Keep raw items to preserve jobId mapping
            const rawFutureItems = Array.isArray(futureJobsData) ? futureJobsData : [];
            const futureDetails = await Promise.all(
              futureIds.filter(Boolean).map(async (vacId: string, idx: number) => {
                try {
                  const res = await fetch(`${API_BASE_URL}/vacancies/${vacId}`, {
                    method: "GET", credentials: "include", headers,
                  });
                  const body = await res.json().catch(() => null);
                  const detail = body?.data ?? body ?? null;
                  if (detail) {
                    // Attach jobId from the raw future-jobs response
                    const rawItem = rawFutureItems[idx];
                    detail._jobId = rawItem?.jobId ?? rawItem?.id ?? vacId;
                    detail._vacancyId = vacId;
                  }
                  return detail;
                } catch { return null; }
              })
            );
            setVagasAgendadas(futureDetails.filter(Boolean));
          } else {
            setVagasAgendadas([]);
          }
          setLoadingAgendadas(false);

          // 3c. Get applied vacancies (vagas pendentes)
          setLoadingPendentes(true);
          const appliedRes = await fetch(`${API_BASE_URL}/providers/${providerId}/applied-vacancies`, {
            method: "GET", credentials: "include", headers,
          });
          const appliedBody = await appliedRes.json().catch(() => null);
          const appliedData = appliedBody?.data ?? appliedBody;
          const appliedIds: string[] = Array.isArray(appliedData)
            ? appliedData.map((item: any) => typeof item === "string" ? item : item?.id ?? item?.vacancyId)
            : [];

          if (appliedIds.length > 0) {
            const rawAppliedItems = Array.isArray(appliedData) ? appliedData : [];
            const appliedDetails = await Promise.all(
              appliedIds.filter(Boolean).map(async (vacId: string, idx: number) => {
                try {
                  const res = await fetch(`${API_BASE_URL}/vacancies/${vacId}`, {
                    method: "GET", credentials: "include", headers,
                  });
                  const body = await res.json().catch(() => null);
                  const detail = body?.data ?? body ?? null;
                  if (detail) {
                    const rawItem = rawAppliedItems[idx];
                    detail._jobId = rawItem?.jobId ?? rawItem?.id ?? vacId;
                    detail._vacancyId = vacId;
                  }
                  return detail;
                } catch { return null; }
              })
            );
            setVagasPendentes(appliedDetails.filter(Boolean));
          } else {
            setVagasPendentes([]);
          }
          setLoadingPendentes(false);

         // Count jobs for current month from both active and future jobs
         let currentMonthJobs = 0;
         const currentDate = new Date();
         const currentMonth = currentDate.getMonth(); // 0-11
         const currentYear = currentDate.getFullYear();

         // Check active jobs
         if (Array.isArray(activeJobsData)) {
           activeJobsData.forEach((job: any) => {
             if (job.jobDate) {
               const jobDate = new Date(job.jobDate);
               if (
                 jobDate.getMonth() === currentMonth &&
                 jobDate.getFullYear() === currentYear
               ) {
                 currentMonthJobs++;
               }
             }
           });
         }

         // Check future jobs
         if (Array.isArray(futureJobsData)) {
           futureJobsData.forEach((job: any) => {
             if (job.jobDate) {
               const jobDate = new Date(job.jobDate);
               if (
                 jobDate.getMonth() === currentMonth &&
                 jobDate.getFullYear() === currentYear
               ) {
                 currentMonthJobs++;
               }
             }
           });
         }

         setJobsThisMonth(currentMonthJobs);

         // 4. Get filtered vacancies and flatten services
         setLoadingVagas(true);
         const filteredRes = await fetch(`${API_BASE_URL}/providers/${providerId}/filtered-vacancies`, {
           method: "GET", credentials: "include", headers,
         });
         const filteredBody = await filteredRes.json().catch(() => null);
         const filteredData = filteredBody?.data ?? filteredBody;
         const vacancies = Array.isArray(filteredData) ? filteredData : [];

         // Flatten: each service inside each vacancy becomes a card
         // Filter by matching assignment with provider's profile services
         const flattened: FlattenedVaga[] = [];
         vacancies.forEach((vacancy: any) => {
           const services = vacancy.services ?? vacancy.freelancers ?? [];
           if (Array.isArray(services)) {
             services.forEach((svc: any, idx: number) => {
               if (svc.assignment) {
                 flattened.push({
                   vacancyId: vacancy.id,
                   serviceIndex: idx,
                   assignment: svc.assignment,
                   jobTime: svc.jobTime || "--",
                   jobValue: svc.jobValue || "--",
                   jobDate: vacancy.jobDate || "--",
                   establishment: vacancy.establishment || vacancy.description || "",
                   status: vacancy.status || "aberta",
                   quantity: svc.quantity || 1,
                 });
               }
             });
           }
         });

         setVagasDisponiveis(flattened);
       } catch (err) {
         console.error("[DashboardFreelancer] error fetching data:", err);
         // Ensure userNameLoading is false even if we error out before reaching the user fetch finally block
         setUserNameLoading(false);
       } finally {
         setLoadingVagas(false);
       }
     };
     fetchData();
   }, []);

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 space-y-6">
         {/* Greeting */}
         <div>
           <h1 className="text-2xl font-display font-bold">
             Olá, {userNameLoading ? "..." : userName || "Usuário"}! 👋
           </h1>
           <p className="text-muted-foreground text-sm mt-1">Aqui está o resumo dos seus trabalhos</p>
         </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
           {[
             { icon: DollarSign, label: "Ganhos do mês", value: "R$ 3.650", color: "text-success", bg: "bg-success-light", path: "/carteira" },
             { icon: Briefcase, label: "Jobs este mês", value: jobsThisMonth.toString(), color: "text-primary", bg: "bg-primary-light", path: "/agenda" },
             { icon: Star, label: "Avaliação", value: averageRating, color: "text-warning", bg: "bg-warning-light", path: "/avaliacoes" },
           ].map((stat) => (
            <Link key={stat.label} to={stat.path} className="block">
              <Card className="hover:bg-muted/50 transition-colors h-full">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-xl font-bold font-display">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Jobs Grid: Ativas + Disponíveis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Vagas Ativas */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  <Link to="/agenda" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <CheckCircle className="w-5 h-5 text-success" /> Vagas Ativas
                  </Link>
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
                    {vaga.jobDate && <p className="text-xs text-muted-foreground">{formatDateDDMMYYYY(vaga.jobDate)}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Vagas Agendadas */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  <Link to="/agenda" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Calendar className="w-5 h-5 text-primary" /> Vagas Agendadas
                  </Link>
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => navigate("/agenda")}>
                  Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingAgendadas ? (
                <p className="text-sm text-muted-foreground text-center py-4">Carregando vagas agendadas...</p>
              ) : vagasAgendadas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma vaga agendada</p>
              ) : (
                vagasAgendadas.slice(0, 3).map((vaga: any) => (
                  <div key={vaga.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer space-y-2" onClick={() => navigate(`/vaga/${vaga._jobId || vaga.id}`, { state: { source: "agendadas", jobId: vaga._jobId, vacancyId: vaga._vacancyId || vaga.id } })}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">{vaga.establishment || vaga.description || "Vaga"}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary-light text-primary">Agendada</span>
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
                    {vaga.jobDate && <p className="text-xs text-muted-foreground">{formatDateDDMMYYYY(vaga.jobDate)}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Vagas Pendentes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  <span className="flex items-center gap-2">
                    <Hourglass className="w-5 h-5 text-warning" /> Vagas Pendentes
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingPendentes ? (
                <p className="text-sm text-muted-foreground text-center py-4">Carregando vagas pendentes...</p>
              ) : vagasPendentes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma vaga pendente</p>
              ) : (
                vagasPendentes.slice(0, 3).map((vaga: any) => (
                  <div key={vaga.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer space-y-2" onClick={() => navigate(`/vaga/${vaga._jobId || vaga.id}`)}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">{vaga.establishment || vaga.description || "Vaga"}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-warning-light text-warning">Pendente</span>
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
                    {vaga.jobDate && <p className="text-xs text-muted-foreground">{formatDateDDMMYYYY(vaga.jobDate)}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Vagas Disponíveis */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  <Link to="/mapa-vagas" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <MapPin className="w-5 h-5 text-primary" /> Vagas Disponíveis
                  </Link>
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
                vagasDisponiveis.slice(0, 3).map((vaga, idx) => (
                  <div
                    key={`${vaga.vacancyId}-${vaga.serviceIndex}`}
                    className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer space-y-2"
                    onClick={() => navigate(`/vaga/${vaga.vacancyId}`, { state: { serviceIndex: vaga.serviceIndex } })}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">{vaga.assignment}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        vaga.status === "confirmed" || vaga.status === "confirmado"
                          ? "bg-success-light text-success"
                          : "bg-warning-light text-warning"
                      }`}>{vaga.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {vaga.establishment && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{vaga.establishment}</span>
                      )}
                      {vaga.jobTime && vaga.jobTime !== "--" && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{vaga.jobTime}</span>
                      )}
                      {vaga.jobValue && vaga.jobValue !== "--" && (
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{vaga.jobValue}</span>
                      )}
                    </div>
                    {vaga.jobDate && vaga.jobDate !== "--" && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{formatDateDDMMYYYY(vaga.jobDate)}
                      </p>
                    )}
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
