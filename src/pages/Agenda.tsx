import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, History, Star, DollarSign, CalendarPlus, Loader2, Briefcase, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import VagaCard from "@/components/dashboard-contratante/VagaCard";
import { useToast } from "@/hooks/use-toast";
import { getDisplayValue } from "@/lib/values";

const API_BASE_URL = import.meta.env.API_BASE_URL;

const Agenda = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isContratante = role === "contratante";
  const isFreelancer = role === "freelancer";
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [expandedEvento, setExpandedEvento] = useState<number | null>(null);
  
  // State for freelancer data
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Stats for freelancer
  const [vagasFinalizadas, setVagasFinalizadas] = useState(0); // Completed jobs in current month
  const [concluidos, setConcluidos] = useState(0); // All completed jobs
  const [totalGanho, setTotalGanho] = useState("R$ 0,00");
  const [mediaAvaliacao, setMediaAvaliacao] = useState("--");
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch freelancer's provider ID and history data
  useEffect(() => {
    if (isContratante) return;
    
    const fetchFreelancerData = async () => {
      try {
        setLoadingHistory(true);
        setLoadingStats(true);
        
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) return;
        const token = JSON.parse(tokenRaw);
        const headers = { "Origin-type": "Web", Authorization: `Bearer ${token}` };

        // 1. Get provider profile (id)
        const provRes = await fetch(`${API_BASE_URL}/users/providers`, {
          method: "GET", credentials: "include", headers,
        });
        const provBody = await provRes.json().catch(() => null);
        const provData = Array.isArray(provBody?.data) ? provBody.data[0] : provBody?.data;
        const providerIdFromRes = provData?.id ?? provBody?.id;
        
        if (!providerIdFromRes) return;
        setProviderId(providerIdFromRes);

        // 2. Get feedbacks for rating (same logic as dashboard-freelancer)
        const fbRes = await fetch(`${API_BASE_URL}/providers/${providerIdFromRes}/jobs/feedbacks`, {
          method: "GET", credentials: "include", headers,
        });
        const fbBody = await fbRes.json().catch(() => null);
        const feedbacks = fbBody?.data ?? fbBody;

        if (Array.isArray(feedbacks) && feedbacks.length > 0) {
          const avg = feedbacks.reduce((sum: number, f: any) => sum + (f.rating ?? f.score ?? 0), 0) / feedbacks.length;
          setMediaAvaliacao(avg.toFixed(1));
        } else if (typeof feedbacks === "number") {
          setMediaAvaliacao(feedbacks.toFixed(1));
        } else if (typeof fbBody?.data === "number") {
          setMediaAvaliacao(fbBody.data.toFixed(1));
        }

        // 3. Get history data (jobs) for the agenda
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1; // 1-12
        const year = currentDate.getFullYear();
        
        const historyRes = await fetch(`${API_BASE_URL}/providers/${providerIdFromRes}/agenda?month=${month}&year=${year}`, {
          method: "GET", credentials: "include", headers,
        });
        const historyBody = await historyRes.json().catch(() => null);
        const historyDataFromRes = historyBody?.data ?? historyBody;
        
        if (Array.isArray(historyDataFromRes)) {
          setHistoryData(historyDataFromRes);
          
          // Calculate stats based on requirements
          let concluidosCount = 0;
          let finalizadasCount = 0;
          let totalGanhoValue = 0;
          
          historyDataFromRes.forEach((historyItem: any) => {
            const jobs = historyItem.jobs || [];
            
            // Check if historyItem.jobDate is in current month for "vagas finalizadas"
            const historyJobDate = historyItem.jobDate ? new Date(historyItem.jobDate) : null;
            const isCurrentMonth = historyJobDate && 
              historyJobDate.getMonth() === currentDate.getMonth() && 
              historyJobDate.getFullYear() === currentDate.getFullYear();
            
            jobs.forEach((job: any) => {
              if (job.jobStatus === "completed") {
                concluidosCount++;
                
                // For "vagas finalizadas": only count if parent history is in current month
                if (isCurrentMonth) {
                  finalizadasCount++;
                }
                
                // For "total ganho": sum all jobValues
                const jobValue = parseFloat((job.jobValue || "0").replace(/[^\d,-]/g, "").replace(",", "."));
                if (!isNaN(jobValue)) {
                  totalGanhoValue += jobValue;
                }
              }
            });
          });
          
          setConcluidos(concluidosCount);
          setVagasFinalizadas(finalizadasCount);
          setTotalGanho(`R$ ${totalGanhoValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do freelancer:", err);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados da agenda. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoadingHistory(false);
        setLoadingStats(false);
      }
    };

    fetchFreelancerData();
  }, [isContratante]);

  // Fetch real vacancies for contratante (keeping existing logic)
  const [apiVacancies, setApiVacancies] = useState<any[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(false);
  
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
        const rawVacancies = Array.isArray(vBody?.data) ? vBody.data : [];

        // Flatten services (same logic as before)
        const flattened = [];
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

        setApiVacancies(flattened);
      } catch (err) {
        console.error("Erro ao buscar vagas:", err);
      } finally {
        setLoadingVacancies(false);
      }
    };
    
    fetchVacancies();
  }, [isContratante]);

  // Process data for display
  const contratanteItems = apiVacancies.map(v => ({
    ...v,
    dateObj: new Date(v.jobDate),
  }));
  
  // For freelancer, create flattened items from history data
  const freelancerItems = historyData.flatMap((historyItem: any) => {
    const jobs = historyItem.jobs || [];
    return jobs.map((job: any, index: number) => ({
      ...job,
      historyItem, // Keep reference to parent for shared data
      id: `${historyItem.id}-${index}`, // Unique ID for each job
      dateObj: new Date(historyItem.jobDate), // Use history date for calendar filtering
      client: historyItem.client || "Cliente",
      value: job.jobValue || "R$ 0,00",
      status: job.jobStatus,
    }));
  });
  
  const items = isContratante ? contratanteItems : freelancerItems;

  // Statistics for contratante (keeping existing logic)
  const vagasAbertas = isContratante ? apiVacancies.filter(v => v.status === "open" || v.status === "in hiring") : [];
  const vagasPreenchidas = isContratante ? apiVacancies.filter(v => v.status === "closed") : [];
  const vagasConcluidas = isContratante ? apiVacancies.filter(v => v.status === "removed") : [];

  const pendentes = items.filter(v =>
    isContratante ? (v.status === "open" || v.status === "in hiring") : (v.status === "accepted")
  );
  const finalizados = items.filter(v =>
    isContratante ? (v.status === "closed" || v.status === "removed") : (v.status === "completed")
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
                  <p className="text-xl font-bold font-display">{pendentes.length}</p>
                  <p className="text-xs text-muted-foreground">Vagas Pendentes</p>
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

        {/* Stats for freelancer - replace the old stats section */}
        {!isContratante && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="flex-1">
              <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xl font-bold font-display">{concluidos}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xl font-bold font-display">{totalGanho}</p>
                <p className="text-xs text-muted-foreground">Total Ganho</p>
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
            {isContratante ? (
              loadingVacancies ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : listaItens.length > 0 ? (
                (listaItens as any[]).map((item, idx) => (
                  <VagaCard key={`${item.id}-${item.serviceIndex ?? idx}`} id={String(item.id)} assignment={item.assignment} quantity={item.quantity} jobDate={item.jobDate} status={item.status} serviceIndex={item.serviceIndex} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {isContratante ? "Nenhum evento nessa data" : "Nenhuma vaga nessa data"}
                </p>
              )
            ) : (
              loadingHistory || loadingStats ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : listaItens.length > 0 ? (
                (listaItens as any[]).map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate(`/vaga/${item.historyItem.id}`)}
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.status === "completed" ? "bg-green-100 dark:bg-green-900/30" : "bg-primary-light"} flex items-center justify-center shrink-0`}>
                      {item.status === "completed" ? <CheckCircle className="w-5 h-5 text-green-600" /> : <CalendarIcon className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.assignment || item.title || "Trabalho"}</p>
                      <p className="text-xs text-muted-foreground">{item.historyItem.client || "Cliente"} • {item.historyItem.jobDate?.split("T")[0] || ""}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {item.jobTime || "--"} • <MapPin className="w-3 h-3" /> {item.historyItem.location || ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <p className={`text-sm font-bold ${item.status === "completed" ? "text-green-600" : "text-primary"}`}>
                        {getDisplayValue(item.jobValue || "R$ 0,00", false)}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-primary-light text-primary"}`}>
                        {item.status === "completed" ? "Concluído" : item.status === "accepted" ? "Aceita" : "Pendente"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhuma vaga nessa data
                </p>
              )
            )}
          </CardContent>
        </Card>

        {/* Histórico - only for freelancer (keeping existing logic but with real data) */}
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
                  <p className="text-xl font-bold font-display">{concluidos}</p>
                  <p className="text-xs text-muted-foreground">Concluídos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xl font-bold font-display">{totalGanho}</p>
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
                {historyData.map((historyItem: any) => (
                  <div key={historyItem.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{historyItem.title || "Trabalho"}</p>
                      <p className="text-xs text-muted-foreground">{historyItem.client || "Cliente"} • {historyItem.jobDate?.split("T")[0] || ""}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {historyItem.location || ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-green-600">{getDisplayValue(historyItem.value || "R$ 0,00", false)}</p>
                      <span className="flex items-center justify-end gap-0.5 text-[10px] text-primary font-medium mt-0.5">
                        <Star className="w-3 h-3 fill-primary" /> {historyItem.rating || 0}
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