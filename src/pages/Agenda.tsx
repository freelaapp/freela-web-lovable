import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, History, Star, DollarSign, Users, CalendarPlus, Briefcase, UserCheck, UserX, Shield, Eye, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useUserRole } from "@/hooks/useUserRole";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import VagaCard from "@/components/dashboard-contratante/VagaCard";

const API_BASE_URL = "https://api.freelaservicos.com.br";

const statusOrder: Record<string, number> = {
  open: 0,
  "in hiring": 1,
  closed: 2,
  removed: 3,
};

// Freelancer mocks
const mockVagasFreelancer = [
  { id: 1, title: "Churrasco - Aniversário 30 anos", client: "Ana Oliveira", date: "22 Fev 2026", dateObj: new Date(2026, 1, 22), time: "14:00 - 22:00", location: "São Paulo, SP", status: "aceita", value: "R$ 650" },
  { id: 2, title: "Bartender - Evento Corporativo", client: "Tech Corp", date: "28 Fev 2026", dateObj: new Date(2026, 1, 28), time: "18:00 - 00:00", location: "Campinas, SP", status: "aceita", value: "R$ 1.200" },
  { id: 3, title: "Garçom - Casamento", client: "Maria Santos", date: "08 Mar 2026", dateObj: new Date(2026, 2, 8), time: "16:00 - 23:00", location: "Guarulhos, SP", status: "executado", value: "R$ 800" },
  { id: 4, title: "Churrasco - Confraternização", client: "Empresa X", date: "15 Mar 2026", dateObj: new Date(2026, 2, 15), time: "12:00 - 18:00", location: "São Paulo, SP", status: "aceita", value: "R$ 900" },
  { id: 5, title: "Garçom - Festa de Empresa", client: "Corp ABC", date: "10 Fev 2026", dateObj: new Date(2026, 1, 10), time: "19:00 - 02:00", location: "São Paulo, SP", status: "executado", value: "R$ 550" },
];

interface ApiVacancy {
  id: string;
  assignment: string;
  quantity: number;
  jobDate: string;
  status: string;
  [key: string]: unknown;
}

const mockHistoricoFreelancer = [
  { id: 101, title: "Churrasco - Réveillon", client: "Pedro Costa", date: "31 Dez 2025", location: "São Paulo, SP", value: "R$ 2.000", rating: 5.0 },
  { id: 102, title: "Bartender - Formatura", client: "Faculdade ABC", date: "20 Dez 2025", location: "Santo André, SP", value: "R$ 1.500", rating: 4.8 },
  { id: 103, title: "Garçom - Casamento", client: "João e Maria", date: "10 Dez 2025", location: "Campinas, SP", value: "R$ 900", rating: 4.9 },
  { id: 104, title: "Churrasco - Aniversário", client: "Carla Lima", date: "28 Nov 2025", location: "Guarulhos, SP", value: "R$ 750", rating: 5.0 },
  { id: 105, title: "Bartender - Evento Corporativo", client: "StartupX", date: "15 Nov 2025", location: "São Paulo, SP", value: "R$ 1.200", rating: 4.7 },
];

const Agenda = () => {
  const navigate = useNavigate();
  const role = useUserRole();
  const { toast } = useToast();
  const isContratante = role === "contratante";
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [expandedEvento, setExpandedEvento] = useState<number | null>(null);
  const [apiVacancies, setApiVacancies] = useState<ApiVacancy[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(false);

  // Fetch real vacancies for contratante
  useEffect(() => {
    if (!isContratante) return;
    const fetchVacancies = async () => {
      try {
        setLoadingVacancies(true);
        const stored = localStorage.getItem("authTokens");
        if (!stored) return;
        const { accessToken: token } = JSON.parse(stored);
        if (!token) return;
        const headers = { "Origin-type": "Web", Authorization: `Bearer ${token}` };

        // Get contractor id
        const cRes = await fetch(`${API_BASE_URL}/users/contractors`, { method: "GET", credentials: "include", headers });
        const cBody = await cRes.json();
        const contractorId = cBody?.data?.id;
        if (!contractorId) return;

        // Get vacancies
        const vRes = await fetch(`${API_BASE_URL}/contractors/${contractorId}/vacancies`, { method: "GET", credentials: "include", headers });
        const vBody = await vRes.json();
        const vacancies: ApiVacancy[] = Array.isArray(vBody?.data) ? vBody.data : [];

        // Sort: open → in hiring → closed → removed
        vacancies.sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));
        setApiVacancies(vacancies);
      } catch (err) {
        console.error("Erro ao buscar vagas:", err);
      } finally {
        setLoadingVacancies(false);
      }
    };
    fetchVacancies();
  }, [isContratante]);

  // Build contratante items with dateObj for calendar
  const contratanteItems = apiVacancies.map(v => ({
    ...v,
    dateObj: new Date(v.jobDate),
  }));

  const freelancerItems = mockVagasFreelancer;
  const items = isContratante ? contratanteItems : freelancerItems;

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

  const totalGanhoHistorico = "R$ 6.350";
  const mediaAvaliacao = "4.9";


  const FreelancerItemCard = ({ item }: { item: typeof items[0] }) => {
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
        {/* Stats + Calendar row */}
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 items-stretch">
          <div className="flex flex-col gap-4">
            <Card className="flex-1">
              <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
                  {isContratante ? <CalendarPlus className="w-5 h-5 text-primary" /> : <CalendarIcon className="w-5 h-5 text-primary" />}
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
            {listaItens.length > 0 ? (
              isContratante ? (
                (listaItens as typeof eventos).map(item => <ContratanteItemCard key={item.id} item={item} />)
              ) : (
                listaItens.map(item => <FreelancerItemCard key={item.id} item={item} />)
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
