import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, History, Star, DollarSign, CalendarPlus, Loader2, Briefcase, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

import { useToast } from "@/hooks/use-toast";
import VagaCard from "@/components/dashboard-contratante/VagaCard";

const API_BASE_URL = import.meta.env.API_BASE_URL;

const statusOrder: Record<string, number> = {
  open: 0,
  "in hiring": 1,
  closed: 2,
  removed: 3,
};

// Interface para vagas de freelancer (dados da API)
interface FreelancerVacancy {
  id: string;
  establishment?: string;
  description?: string;
  jobDate: string;
  status: string;
  freelancers?: Array<{
    assignment: string;
    jobTime?: string;
    jobValue?: string;
  }>;
  _jobId?: string;
  _vacancyId?: string;
}

// Interface para feedback
interface Feedback {
  id: string;
  star: number;
  rating?: number;
  score?: number;
}

// Interface para vagas do contratante (interna)
interface VacancyService {
  assignment: string;
  quantity?: number;
  [key: string]: unknown;
}

interface RawVacancy {
  id: string;
  jobDate: string;
  status: string;
  services?: VacancyService[];
  assignment?: string;
  quantity?: number;
  [key: string]: unknown;
}

interface FlatVacancy {
  id: string;
  assignment: string;
  quantity: number;
  jobDate: string;
  status: string;
  serviceIndex: number;
}

// Freelancer mocks (mantido para compatibilidade, mas não será usado)
const mockVagasFreelancer = [
  { id: 1, title: "Churrasco - Aniversário 30 anos", client: "Ana Oliveira", date: "22 Fev 2026", dateObj: new Date(2026, 1, 22), time: "14h - 22h", location: "São Paulo, SP", status: "aceita", value: "R$ 650" },
  { id: 2, title: "Bartender - Evento Corporativo", client: "Tech Corp", date: "28 Fev 2026", dateObj: new Date(2026, 1, 28), time: "18h - 00h", location: "Campinas, SP", status: "aceita", value: "R$ 1.200" },
  { id: 3, title: "Garçom - Casamento", client: "Maria Santos", date: "08 Mar 2026", dateObj: new Date(2026, 2, 8), time: "16h - 23h", location: "Guarulhos, SP", status: "executado", value: "R$ 800" },
  { id: 4, title: "Churrasco - Confraternização", client: "Empresa X", date: "15 Mar 2026", dateObj: new Date(2026, 2, 15), time: "12h - 18h", location: "São Paulo, SP", status: "aceita", value: "R$ 900" },
  { id: 5, title: "Garçom - Festa de Empresa", client: "Corp ABC", date: "10 Fev 2026", dateObj: new Date(2026, 1, 10), time: "19h - 02h", location: "São Paulo, SP", status: "executado", value: "R$ 550" },
];

const mockHistoricoFreelancer = [
  { id: 101, title: "Churrasco - Réveillon", client: "Pedro Costa", date: "31 Dez 2025", location: "São Paulo, SP", value: "R$ 2.000", rating: 5.0 },
  { id: 102, title: "Bartender - Formatura", client: "Faculdade ABC", date: "20 Dez 2025", location: "Santo André, SP", value: "R$ 1.500", rating: 4.8 },
  { id: 103, title: "Garçom - Casamento", client: "João e Maria", date: "10 Dez 2025", location: "Campinas, SP", value: "R$ 900", rating: 4.9 },
  { id: 104, title: "Churrasco - Aniversário", client: "Carla Lima", date: "28 Nov 2025", location: "Guarulhos, SP", value: "R$ 750", rating: 5.0 },
  { id: 105, title: "Bartender - Evento Corporativo", client: "StartupX", date: "15 Nov 2025", location: "São Paulo, SP", value: "R$ 1.200", rating: 4.7 },
];

const Agenda = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { toast } = useToast();
  const isContratante = role === "contratante";
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [expandedEvento, setExpandedEvento] = useState<number | null>(null);

  // Estados para dados do contratante
  const [apiVacancies, setApiVacancies] = useState<FlatVacancy[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(false);

  // Estados para dados do freelancer
  const [vagasFreelancer, setVagasFreelancer] = useState<FreelancerVacancy[]>([]);
  const [mediaAvaliacao, setMediaAvaliacao] = useState<string>("--");
  const [vagasAplicadasMes, setVagasAplicadasMes] = useState<number>(0);
  const [loadingFreelancerData, setLoadingFreelancerData] = useState(true);

  // Fetch real vacancies for contratante
  useEffect(() => {
    if (!isContratante) return;
    const fetchVacancies = async () => {
      try {
        setLoadingVacancies(true);
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) return;
        let token: string;
        try { token = JSON.parse(tokenRaw); } catch { return; }
        const headers = { "Origin-type": "Web", Authorization: `Bearer ${token}` };

        // Get contractor id
        const cRes = await fetch(`${API_BASE_URL}/users/contractors`, { method: "GET", credentials: "include", headers });
        const cBody = await cRes.json();
        const contractorId = cBody?.data?.id;
        if (!contractorId) return;

        // Get vacancies
        const vRes = await fetch(`${API_BASE_URL}/contractors/${contractorId}/vacancies`, { method: "GET", credentials: "include", headers });
        const vBody = await vRes.json();
        const rawVacancies: RawVacancy[] = Array.isArray(vBody?.data) ? vBody.data : [];

        // Flatten services (same logic as DashboardContratante)
        const flattened: FlatVacancy[] = [];
        for (const v of rawVacancies) {
          if (Array.isArray(v.services) && v.services.length > 0) {
            v.services.forEach((s, idx) => {
              flattened.push({
                id: v.id,
                assignment: s.assignment || "Sem título",
                quantity: s.quantity ?? 1,
                jobDate: v.jobDate,
                status: v.status,
                serviceIndex: idx,
              });
            });
          } else {
            flattened.push({
              id: v.id,
              assignment: v.assignment || "Sem título",
              quantity: v.quantity ?? 1,
              jobDate: v.jobDate,
              status: v.status,
              serviceIndex: 0,
            });
          }
        }

        // Sort: open → in hiring → closed → removed
        flattened.sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));
        setApiVacancies(flattened);
      } catch (err) {
        console.error("Erro ao buscar vagas:", err);
      } finally {
        setLoadingVacancies(false);
      }
    };
    fetchVacancies();
  }, [isContratante]);

  // Fetch freelancer data from API
  useEffect(() => {
    if (isContratante) return;

    const fetchFreelancerData = async () => {
      try {
        setLoadingFreelancerData(true);
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) return;
        const token = JSON.parse(tokenRaw);
        const headers = { "Origin-type": "Web", Authorization: `Bearer ${token}` };

        // 1. Get provider profile (id)
        const provRes = await fetch(`${API_BASE_URL}/users/providers`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        const provBody = await provRes.json();
        const provData = Array.isArray(provBody?.data) ? provBody.data[0] : provBody?.data;
        const providerId = provData?.id ?? provBody?.id;
        if (!providerId) {
          console.error("Provider ID não encontrado");
          setLoadingFreelancerData(false);
          return;
        }

        // 2. Buscar feedbacks e calcular média
        const fbRes = await fetch(`${API_BASE_URL}/providers/${providerId}/jobs/feedbacks`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        const fbBody = await fbRes.json();
        const feedbacks: Feedback[] = Array.isArray(fbBody?.data) ? fbBody.data : [];

        if (feedbacks.length > 0) {
          const avg = feedbacks.reduce((sum: number, f: Feedback) => {
            const star = f.star ?? f.rating ?? f.score ?? 0;
            return sum + star;
          }, 0) / feedbacks.length;
          setMediaAvaliacao(avg.toFixed(1));
        } else {
          setMediaAvaliacao("--");
        }

        // 3. Buscar active jobs
        const activeRes = await fetch(`${API_BASE_URL}/providers/${providerId}/active-jobs`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        const activeBody = await activeRes.json();
        const activeData = activeBody?.data ?? activeBody;
        const activeIds: string[] = Array.isArray(activeData)
          ? activeData.map((item: any) => typeof item === "string" ? item : item?.id ?? item?.vacancyId)
          : [];

        let activeJobsDetails: FreelancerVacancy[] = [];
        if (activeIds.length > 0) {
          const rawActiveItems = Array.isArray(activeData) ? activeData : [];
          const activeDetails = await Promise.all(
            activeIds.filter(Boolean).map(async (vacId: string, idx: number) => {
              try {
                const res = await fetch(`${API_BASE_URL}/vacancies/${vacId}`, {
                  method: "GET",
                  credentials: "include",
                  headers,
                });
                const body = await res.json();
                const detail = body?.data ?? body ?? null;
                if (detail) {
                  const rawItem = rawActiveItems[idx];
                  detail._jobId = rawItem?.jobId ?? rawItem?.id ?? vacId;
                  detail._vacancyId = vacId;
                }
                return detail;
              } catch { return null; }
            })
          );
          activeJobsDetails = activeDetails.filter(Boolean) as FreelancerVacancy[];
        }

        // 4. Buscar future jobs
        const futureRes = await fetch(`${API_BASE_URL}/providers/${providerId}/future-jobs`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        const futureBody = await futureRes.json();
        const futureData = futureBody?.data ?? futureBody;
        const futureIds: string[] = Array.isArray(futureData)
          ? futureData.map((item: any) => typeof item === "string" ? item : item?.id ?? item?.vacancyId)
          : [];

        let futureJobsDetails: FreelancerVacancy[] = [];
        if (futureIds.length > 0) {
          const rawFutureItems = Array.isArray(futureData) ? futureData : [];
          const futureDetails = await Promise.all(
            futureIds.filter(Boolean).map(async (vacId: string, idx: number) => {
              try {
                const res = await fetch(`${API_BASE_URL}/vacancies/${vacId}`, {
                  method: "GET",
                  credentials: "include",
                  headers,
                });
                const body = await res.json();
                const detail = body?.data ?? body ?? null;
                if (detail) {
                  const rawItem = rawFutureItems[idx];
                  detail._jobId = rawItem?.jobId ?? rawItem?.id ?? vacId;
                  detail._vacancyId = vacId;
                }
                return detail;
              } catch { return null; }
            })
          );
          futureJobsDetails = futureDetails.filter(Boolean) as FreelancerVacancy[];
        }

        // 5. Combinar active + future jobs e ordenar por jobDate (crescente)
        const allJobs = [...activeJobsDetails, ...futureJobsDetails];
        allJobs.sort((a, b) => {
          const dateA = new Date(a.jobDate).getTime();
          const dateB = new Date(b.jobDate).getTime();
          return dateA - dateB;
        });
        setVagasFreelancer(allJobs);

        // 6. Buscar applied vacancies e contar as do mês atual
        const appliedRes = await fetch(`${API_BASE_URL}/providers/${providerId}/applied-vacancies`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        const appliedBody = await appliedRes.json();
        const appliedData = appliedBody?.data ?? appliedBody;
        const appliedIds: string[] = Array.isArray(appliedData)
          ? appliedData.map((item: any) => typeof item === "string" ? item : item?.id ?? item?.vacancyId)
          : [];

        let appliedJobsDetails: FreelancerVacancy[] = [];
        if (appliedIds.length > 0) {
          const rawAppliedItems = Array.isArray(appliedData) ? appliedData : [];
          const appliedDetails = await Promise.all(
            appliedIds.filter(Boolean).map(async (vacId: string, idx: number) => {
              try {
                const res = await fetch(`${API_BASE_URL}/vacancies/${vacId}`, {
                  method: "GET",
                  credentials: "include",
                  headers,
                });
                const body = await res.json();
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
          appliedJobsDetails = appliedDetails.filter(Boolean) as FreelancerVacancy[];
        }

        // Contar vagas aplicadas no mês atual
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const countThisMonth = appliedJobsDetails.filter((job: FreelancerVacancy) => {
          if (!job.jobDate) return false;
          const jobDate = new Date(job.jobDate);
          return jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear;
        }).length;

        setVagasAplicadasMes(countThisMonth);

      } catch (err) {
        console.error("Erro ao buscar dados do freelancer:", err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus dados",
          variant: "destructive",
        });
      } finally {
        setLoadingFreelancerData(false);
      }
    };

    fetchFreelancerData();
  }, [isContratante, toast]);

  // Build contratante items with dateObj for calendar
  const contratanteItems = apiVacancies.map(v => ({
    ...v,
    dateObj: new Date(v.jobDate),
  }));

  // Build freelancer items from API com dateObj
  const freelancerItems = vagasFreelancer.map(v => ({
    ...v,
    title: v.establishment || v.description || "Vaga",
    client: v.establishment || v.description || "Cliente",
    date: v.jobDate ? new Date(v.jobDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "--",
    dateObj: new Date(v.jobDate),
    time: v.freelancers?.[0]?.jobTime || "--",
    location: v.establishment || "--",
    status: v.status === "confirmed" || v.status === "confirmado" ? "executado" : "aceita",
    value: v.freelancers?.[0]?.jobValue || "--",
  }));

  const items = isContratante ? contratanteItems : freelancerItems;

  const vagasAbertas = isContratante ? apiVacancies.filter(v => v.status === "open" || v.status === "in hiring") : [];
  const vagasPreenchidas = isContratante ? apiVacancies.filter(v => v.status === "closed") : [];
  const vagasConcluidas = isContratante ? apiVacancies.filter(v => v.status === "removed") : [];

  const pendentes = items.filter(v =>
    isContratante ? (v.status === "open" || v.status === "in hiring") : (v.status === "aceita")
  );
  const finalizados = items.filter(v =>
    isContratante ? (v.status === "closed" || v.status === "removed") : (v.status === "executado")
  );

  const pendenteDates = pendentes.map(v => v.dateObj);
  const finalizadoDates = finalizados.map(v => v.dateObj);

  const itensFiltrados = selectedDate
    ? items.filter(v => v.dateObj.toDateString() === selectedDate.toDateString())
    : null;

  const listaItens = itensFiltrados ?? items;
  const listaTitle = selectedDate
    ? `${isContratante ? "Eventos" : "Vagas"} em ${selectedDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}`
    : isContratante ? "Todos os Eventos" : "Todas as Vagas";

  // Para freelancer: usar dados reais nos stats
  const totalGanhoHistorico = "R$ 6.350"; // TODO: buscar da API se disponível

  const FreelancerItemCard = ({ item }: { item: typeof freelancerItems[0] }) => {
    const isFinalizado = item.status === "executado" || item.status === "finalizado";
    return (
      <div
        className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
        onClick={() => navigate(`/vaga/${item.id}`)}
      >
        <div className={`w-10 h-10 rounded-xl ${isFinalizado ? "bg-green-100 dark:bg-green-900/30" : "bg-primary-light"} flex items-center justify-center shrink-0`}>
          {isFinalizado ? <CheckCircle className="w-5 h-5 text-green-600" /> : <CalendarIcon className="w-5 h-5 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.client} • {item.date}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {item.time} • <MapPin className="w-3 h-3" /> {item.location}
          </p>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <p className={`text-sm font-bold ${isFinalizado ? "text-green-600" : "text-primary"}`}>{item.value}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isFinalizado ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-primary-light text-primary"}`}>
            {item.status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-6xl mx-auto pb-8 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">{isContratante ? "Meus Eventos 📅" : "Minha Agenda 📅"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isContratante ? "Eventos criados e serviços contratados" : "Vagas aceitas e serviços executados"}
          </p>
        </div>

        {/* Stats */}
        {isContratante ? (
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-stretch">
            <div className="flex flex-col gap-3">
              <Card className="flex-1">
                <CardContent className="p-3 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-1.5">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-lg font-bold font-display">{vagasAbertas.length}</p>
                  <p className="text-[10px] text-muted-foreground">Vagas em Aberto</p>
                </CardContent>
              </Card>
              <Card className="flex-1">
                <CardContent className="p-3 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-1.5">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-lg font-bold font-display">{vagasPreenchidas.length}</p>
                  <p className="text-[10px] text-muted-foreground">Vagas Preenchidas</p>
                </CardContent>
              </Card>
              <Card className="flex-1">
                <CardContent className="p-3 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-xl bg-success-light flex items-center justify-center mx-auto mb-1.5">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <p className="text-lg font-bold font-display">{vagasConcluidas.length}</p>
                  <p className="text-[10px] text-muted-foreground">Vagas Concluídas</p>
                </CardContent>
              </Card>
            </div>
            <Card className="h-full">
              <CardContent className="p-4 h-full flex items-center justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="pointer-events-auto w-full [&_table]:w-full [&_th]:w-full [&_td]:w-full [&_.rdp-cell]:w-full [&_.rdp-head_cell]:w-full [&_.rdp-day]:w-full [&_.rdp-day]:h-10"
                  modifiers={{
                    aceita: pendenteDates,
                    executado: finalizadoDates,
                  }}
                  modifiersClassNames={{
                    aceita: "bg-primary/20 text-primary font-bold rounded-full",
                    executado: "bg-green-500/20 text-green-700 dark:text-green-400 font-bold rounded-full",
                  }}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 items-stretch">
            <div className="flex flex-col gap-4">
              <Card className="flex-1">
                <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xl font-bold font-display">{vagasAplicadasMes}</p>
                  <p className="text-xs text-muted-foreground">Aplicadas Mês</p>
                </CardContent>
              </Card>
              <Card className="flex-1">
                <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xl font-bold font-display">{finalizados.length}</p>
                  <p className="text-xs text-muted-foreground">Vagas Finalizadas</p>
                </CardContent>
              </Card>
              <Card className="flex-1">
                <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xl font-bold font-display">{mediaAvaliacao}</p>
                  <p className="text-xs text-muted-foreground">Avaliação</p>
                </CardContent>
              </Card>
            </div>
            <Card className="h-full">
              <CardContent className="p-4 h-full flex items-center justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="pointer-events-auto w-full [&_table]:w-full [&_th]:w-full [&_td]:w-full [&_.rdp-cell]:w-full [&_.rdp-head_cell]:w-full [&_.rdp-day]:w-full [&_.rdp-day]:h-10"
                  modifiers={{
                    aceita: pendenteDates,
                    executado: finalizadoDates,
                  }}
                  modifiersClassNames={{
                    aceita: "bg-primary/20 text-primary font-bold rounded-full",
                    executado: "bg-green-500/20 text-green-700 dark:text-green-400 font-bold rounded-full",
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de vagas/eventos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{listaTitle}</CardTitle>
              {selectedDate && (
                <button onClick={() => setSelectedDate(undefined)} className="text-xs text-primary hover:underline">
                  Ver {isContratante ? "todos" : "todas"}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {loadingVacancies && isContratante ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : loadingFreelancerData && !isContratante ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : listaItens.length > 0 ? (
              isContratante ? (
                (listaItens as typeof contratanteItems).map((item, idx) => (
                  <VagaCard key={`${item.id}-${item.serviceIndex ?? idx}`} id={String(item.id)} assignment={item.assignment} quantity={item.quantity} jobDate={item.jobDate} status={item.status} serviceIndex={item.serviceIndex} />
                ))
              ) : (
                (listaItens as typeof freelancerItems).map(item => <FreelancerItemCard key={item.id} item={item} />)
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                {isContratante ? "Nenhum evento nessa data" : "Nenhuma vaga nessa data"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Histórico - only for freelancer */}
        {!isContratante && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Histórico
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xl font-bold font-display">{mockHistoricoFreelancer.length}</p>
                  <p className="text-xs text-muted-foreground">Concluídos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xl font-bold font-display">{totalGanhoHistorico}</p>
                  <p className="text-xs text-muted-foreground">Total Ganho</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xl font-bold font-display">{mediaAvaliacao}</p>
                  <p className="text-xs text-muted-foreground">Avaliação</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-4 space-y-3">
                {mockHistoricoFreelancer.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.client} • {item.date}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {item.location}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-green-600">{item.value}</p>
                      <span className="flex items-center justify-end gap-0.5 text-[10px] text-primary font-medium mt-0.5">
                        <Star className="w-3 h-3 fill-primary" /> {item.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Agenda;
