import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Briefcase, Clock, DollarSign, Calendar, Filter, X, ChevronRight, Home, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/formatters";
import { getDisplayValue } from "@/lib/values";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.API_BASE_URL;

type VagaType = "casa" | "empresas";

// Interface para serviço individual (achatado)
interface FlatService {
  id: string;
  vacancyId: string;
  assignment: string;
  jobTime: string;
  jobValue: string;
  value: number; // valor numérico extraído
  jobDate: string;
  establishment: string;
  status: string;
  serviceIndex: number;
  lat?: number;
  lng?: number;
  distance?: number;
  matchProfile?: boolean;
  type?: VagaType;
}

const MapaVagas = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isFreelancer = role === "freelancer";
  const [apiServices, setApiServices] = useState<FlatService[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [radius, setRadius] = useState<number>(30);
  const [hoveredVaga, setHoveredVaga] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("Todos");
  const [minValue, setMinValue] = useState<number>(0);
  const [maxHours, setMaxHours] = useState<number>(12);
  const [selectedDate, setSelectedDate] = useState<string>("Todos");
  const [showFilters, setShowFilters] = useState(false);

  const TypeIcon = ({ type, size = "sm" }: { type: VagaType; size?: "sm" | "md" }) => {
    const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default">
            {type === "casa" ? (
              <Home className={`${cls} text-primary`} />
            ) : (
              <Building2 className={`${cls} text-accent`} />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {type === "casa" ? "Freela em Casa" : "Freela para Empresas"}
        </TooltipContent>
      </Tooltip>
    );
  };

  // Buscar dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) return;
        const token = JSON.parse(tokenRaw);
        const headers = { "Origin-type": "Web", Authorization: `Bearer ${token}` };

        // Get provider profile (id)
        const provRes = await fetch(`${API_BASE_URL}/users/providers`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        const provBody = await provRes.json();
        const provData = Array.isArray(provBody?.data) ? provBody.data[0] : provBody?.data;
        const providerId = provData?.id ?? provBody?.id;
        if (!providerId) return;

        // Get filtered vacancies
        const vacRes = await fetch(`${API_BASE_URL}/providers/${providerId}/filtered-vacancies`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        const vacBody = await vacRes.json();
        const vacancies = Array.isArray(vacBody?.data) ? vacBody.data : [];

        // Buscar detalhes de cada vaga individualmente para pegar o jobValue correto
        const uniqueVacancyIds: string[] = [...new Set(vacancies.map((v: any) => v.id).filter(Boolean))];
        const vacancyDetailMap: Record<string, any> = {};
        await Promise.all(
          uniqueVacancyIds.map(async (vid) => {
            try {
              const res = await fetch(`${API_BASE_URL}/vacancies/${vid}`, {
                method: "GET",
                credentials: "include",
                headers,
              });
              const body = await res.json().catch(() => null);
              vacancyDetailMap[vid] = body?.data ?? body;
            } catch {
              // ignora falhas individuais
            }
          })
        );

        // Função para converter valor monetário para número
        const parseMoney = (val: any): number => {
          if (typeof val === 'number') return val;
          if (typeof val !== 'string') return 0;
          const cleaned = val.replace(/[^\d,.]/g, '').replace(',', '.');
          const num = parseFloat(cleaned);
          return isNaN(num) ? 0 : num;
        };

        // Flatten services usando dados detalhados para jobValue
        const flattened: FlatService[] = [];
        vacancies.forEach((vacancy: any) => {
          const detail = vacancyDetailMap[vacancy.id];
          const services = detail?.services ?? detail?.freelancers ?? vacancy.services ?? vacancy.freelancers ?? [];
          if (Array.isArray(services)) {
            services.forEach((svc: any, idx: number) => {
              if (svc.assignment) {
                const jobTimeStr = svc.jobTime || "";

                const jobValueStr = svc.jobValue || "";
                const value = parseMoney(jobValueStr);

                flattened.push({
                  id: `${vacancy.id}-${idx}`,
                  vacancyId: vacancy.id,
                  assignment: svc.assignment,
                  jobTime: jobTimeStr,
                  jobValue: jobValueStr || "--",
                  value: value,
                  jobDate: detail?.jobDate ?? vacancy.jobDate ?? "",
                  establishment: detail?.establishment ?? vacancy.establishment ?? vacancy.description ?? "",
                  status: detail?.status ?? vacancy.status ?? "aberta",
                  serviceIndex: idx,
                  lat: -23.188 + (Math.random() - 0.5) * 0.05,
                  lng: -46.884 + (Math.random() - 0.5) * 0.05,
                  distance: Math.random() * 25 + 1,
                  matchProfile: false,
                  type: Math.random() > 0.5 ? "casa" : "empresas",
                });
              }
            });
          }
        });

        setApiServices(flattened);
      } catch (err) {
        console.error("[MapaVagas] Erro ao buscar vagas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Extrair lista única de datas
  const uniqueDates = useMemo(() => {
    const dates = ["Todos", ...Array.from(new Set(apiServices.map(v => 
      v.jobDate ? new Date(v.jobDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "Sem data"
    )))];
    return dates;
  }, [apiServices]);

  // Extrair lista única de roles (assignments)
  const uniqueRoles = useMemo(() => {
    const roles = ["Todos", ...Array.from(new Set(apiServices.map(v => v.assignment)))];
    return roles.sort();
  }, [apiServices]);

  // Função para extrair horas de uma string de horário
  const extractHours = (jobTime: string): number => {
    const hoursMatch = jobTime.match(/(\d+)h\s*-\s*(\d+)h/);
    if (hoursMatch) {
      const start = parseInt(hoursMatch[1]);
      const end = parseInt(hoursMatch[2]);
      return end - start;
    }
    return 8; // valor padrão
  };

  // Filtrar vagas
  const filteredVagas = useMemo(() => {
    return apiServices.filter(v => {
      if (v.distance! > radius) return false;
      if (selectedRole !== "Todos" && v.assignment !== selectedRole) return false;
      if (v.value < minValue) return false;
      const hours = extractHours(v.jobTime);
      if (hours > maxHours) return false;
      if (selectedDate !== "Todos") {
        const vagaDate = v.jobDate ? new Date(v.jobDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "";
        if (vagaDate !== selectedDate) return false;
      }
      return true;
    });
  }, [apiServices, radius, selectedRole, minValue, maxHours, selectedDate]);

  // Map center: Jundiaí, SP
  const centerLat = -23.188;
  const centerLng = -46.884;
  const mapScale = 800;

  const vagaToPosition = (vaga: FlatService) => {
    const x = 50 + (vaga.lng! - centerLng) * mapScale;
    const y = 50 + (vaga.lat! - centerLat) * mapScale;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const radiusPixels = (radius / 30) * 42;

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-6xl mx-auto pb-8 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" /> Vagas
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {loading ? "Carregando vagas..." : `${filteredVagas.length} vagas em Jundiaí e região • até ${radius}km`}
            </p>
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            Filtros
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="animate-fade-in">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Raio: {radius}km</Label>
                  <Slider value={[radius]} onValueChange={(v) => setRadius(v[0])} min={1} max={30} step={1} className="w-full" />
                  <div className="flex justify-between text-[10px] text-muted-foreground"><span>1km</span><span>30km</span></div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Vaga necessária</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{uniqueRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Valor mínimo: R$ {minValue}</Label>
                  <Slider value={[minValue]} onValueChange={(v) => setMinValue(v[0])} min={0} max={500} step={10} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Máximo de horas: {maxHours}h</Label>
                  <Slider value={[maxHours]} onValueChange={(v) => setMaxHours(v[0])} min={1} max={12} step={1} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Dia da vaga</Label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{uniqueDates.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {/* REMOVIDO: Filtro "Vagas para meu perfil" */}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {loading ? "Carregando..." : `${filteredVagas.length} Vagas Encontradas`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <p className="text-center text-muted-foreground text-sm py-8">Carregando vagas...</p>
              ) : filteredVagas.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">Nenhuma vaga encontrada com os filtros selecionados</p>
              ) : (
                filteredVagas.map(vaga => {
                  const hours = extractHours(vaga.jobTime);
                  const position = vagaToPosition(vaga);
                  return (
                    <div
                      key={vaga.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                        hoveredVaga === vaga.id ? "bg-primary/10 ring-1 ring-primary/20" : "bg-muted/50 hover:bg-muted"
                      }`}
                      onMouseEnter={() => setHoveredVaga(vaga.id)}
                      onMouseLeave={() => setHoveredVaga(null)}
                      onClick={() => navigate(`/vaga/${vaga.vacancyId}`, { state: { serviceIndex: vaga.serviceIndex } })}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        vaga.matchProfile ? "bg-primary-light" : "bg-muted"
                      }`}>
                        <MapPin className={`w-4 h-4 ${vaga.matchProfile ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{vaga.establishment || vaga.assignment}</p>
                          <TypeIcon type={vaga.type || "casa"} />
                          {vaga.matchProfile && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary-light text-primary font-medium shrink-0">Seu perfil</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{vaga.assignment}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{hours}h</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{vaga.jobDate ? new Date(vaga.jobDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "--"}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{getDisplayValue(vaga.jobValue, false)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MapaVagas;
