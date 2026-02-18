import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Briefcase, Clock, DollarSign, Calendar, Filter, X, ChevronRight, Home, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type VagaType = "casa" | "empresas";

const allVagas = [
  { id: 201, title: "Aniversário 50 anos", role: "Garçom", hours: 6, value: 120, date: "25 Fev", location: "Centro, Jundiaí", distance: 3, lat: -23.186, lng: -46.884, matchProfile: true, type: "casa" as VagaType },
  { id: 202, title: "Happy Hour Corporativo", role: "Bartender", hours: 5, value: 100, date: "27 Fev", location: "Anhangabaú, Jundiaí", distance: 5, lat: -23.192, lng: -46.878, matchProfile: true, type: "empresas" as VagaType },
  { id: 203, title: "Casamento - Buffet", role: "Churrasqueiro", hours: 8, value: 200, date: "01 Mar", location: "Eloy Chaves, Jundiaí", distance: 8, lat: -23.172, lng: -46.912, matchProfile: true, type: "casa" as VagaType },
  { id: 204, title: "Evento Beneficente", role: "Cozinheiro", hours: 6, value: 120, date: "05 Mar", location: "Vila Arens, Jundiaí", distance: 4, lat: -23.195, lng: -46.895, matchProfile: false, type: "empresas" as VagaType },
  { id: 205, title: "Festa Junina", role: "Garçom", hours: 7, value: 140, date: "10 Mar", location: "Ponte São João, Jundiaí", distance: 7, lat: -23.210, lng: -46.870, matchProfile: true, type: "casa" as VagaType },
  { id: 206, title: "Brunch Executivo", role: "Barista", hours: 4, value: 80, date: "12 Mar", location: "Jardim Bonfiglioli, Jundiaí", distance: 6, lat: -23.178, lng: -46.860, matchProfile: false, type: "empresas" as VagaType },
  { id: 207, title: "Churrasco Família", role: "Churrasqueiro", hours: 6, value: 150, date: "15 Mar", location: "Várzea Paulista", distance: 12, lat: -23.215, lng: -46.830, matchProfile: true, type: "casa" as VagaType },
  { id: 208, title: "Coquetel Empresarial", role: "Bartender", hours: 5, value: 100, date: "18 Mar", location: "Vila Progresso, Jundiaí", distance: 5, lat: -23.180, lng: -46.905, matchProfile: true, type: "empresas" as VagaType },
  { id: 209, title: "Jantar Beneficente", role: "Garçom", hours: 6, value: 120, date: "20 Mar", location: "Itupeva", distance: 18, lat: -23.153, lng: -46.940, matchProfile: false, type: "casa" as VagaType },
  { id: 210, title: "Festival Gastronômico", role: "Cozinheiro", hours: 10, value: 250, date: "22 Mar", location: "Campo Limpo Paulista", distance: 22, lat: -23.205, lng: -46.790, matchProfile: true, type: "empresas" as VagaType },
];

const roles = ["Todos", "Garçom", "Bartender", "Churrasqueiro", "Cozinheiro", "Barista"];

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

const MapaVagas = () => {
  const navigate = useNavigate();
  const [radius, setRadius] = useState(30);
  const [hoveredVaga, setHoveredVaga] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState("Todos");
  const [minValue, setMinValue] = useState(0);
  const [maxHours, setMaxHours] = useState(12);
  const [selectedDate, setSelectedDate] = useState("Todos");
  const [onlyProfile, setOnlyProfile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const uniqueDates = ["Todos", ...Array.from(new Set(allVagas.map(v => v.date)))];

  const filteredVagas = useMemo(() => {
    return allVagas.filter(v => {
      if (v.distance > radius) return false;
      if (selectedRole !== "Todos" && v.role !== selectedRole) return false;
      if (v.value < minValue) return false;
      if (v.hours > maxHours) return false;
      if (selectedDate !== "Todos" && v.date !== selectedDate) return false;
      if (onlyProfile && !v.matchProfile) return false;
      return true;
    });
  }, [radius, selectedRole, minValue, maxHours, selectedDate, onlyProfile]);

  // Map center: Jundiaí, SP
  const centerLat = -23.188;
  const centerLng = -46.884;
  const mapScale = 800;

  const vagaToPosition = (vaga: typeof allVagas[0]) => {
    const x = 50 + (vaga.lng - centerLng) * mapScale;
    const y = 50 + (vaga.lat - centerLat) * mapScale;
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
              {filteredVagas.length} vagas em Jundiaí e região • até {radius}km
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
                    <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Valor mínimo: R$ {minValue}</Label>
                  <Slider value={[minValue]} onValueChange={(v) => setMinValue(v[0])} min={0} max={300} step={10} className="w-full" />
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
                <div className="flex items-center gap-3 pt-5">
                  <Switch checked={onlyProfile} onCheckedChange={setOnlyProfile} id="profile-match" />
                  <Label htmlFor="profile-match" className="text-sm font-medium cursor-pointer">Vagas para meu perfil</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative w-full h-[400px] lg:h-[500px] bg-muted/30 overflow-hidden select-none">
              {/* Grid background */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Street-like lines for Jundiaí reference */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                <line x1="20%" y1="30%" x2="80%" y2="30%" stroke="currentColor" strokeWidth="2" />
                <line x1="30%" y1="20%" x2="30%" y2="80%" stroke="currentColor" strokeWidth="2" />
                <line x1="50%" y1="15%" x2="50%" y2="85%" stroke="currentColor" strokeWidth="3" />
                <line x1="15%" y1="50%" x2="85%" y2="50%" stroke="currentColor" strokeWidth="3" />
                <line x1="70%" y1="20%" x2="70%" y2="75%" stroke="currentColor" strokeWidth="1.5" />
                <line x1="25%" y1="65%" x2="75%" y2="65%" stroke="currentColor" strokeWidth="1.5" />
                <line x1="40%" y1="10%" x2="60%" y2="90%" stroke="currentColor" strokeWidth="1" />
              </svg>

              {/* City label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/10 text-4xl font-bold pointer-events-none select-none">
                JUNDIAÍ
              </div>

              {/* Radius circle */}
              <div
                className="absolute rounded-full border-2 border-primary/30 bg-primary/5 transition-all duration-300"
                style={{
                  width: `${radiusPixels * 2}%`,
                  height: `${radiusPixels * 2}%`,
                  left: `${50 - radiusPixels}%`,
                  top: `${50 - radiusPixels}%`,
                }}
              />

              {/* Center marker (You) */}
              <div className="absolute z-20 flex flex-col items-center" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
                <div className="w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg animate-pulse" />
                <span className="text-[9px] font-bold text-primary mt-1 bg-background/80 px-1.5 py-0.5 rounded">Você • Jundiaí</span>
              </div>

              {/* Pins */}
              {filteredVagas.map(vaga => {
                const pos = vagaToPosition(vaga);
                const isHovered = hoveredVaga === vaga.id;
                return (
                  <div
                    key={vaga.id}
                    className="absolute z-10 cursor-pointer transition-all duration-200"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: `translate(-50%, -100%) ${isHovered ? "scale(1.3)" : "scale(1)"}`,
                      zIndex: isHovered ? 30 : 10,
                    }}
                    onMouseEnter={() => setHoveredVaga(vaga.id)}
                    onMouseLeave={() => setHoveredVaga(null)}
                    onClick={() => navigate(`/vaga/${vaga.id}`)}
                  >
                    <MapPin
                      className={`w-7 h-7 drop-shadow-md transition-colors ${
                        vaga.matchProfile ? "text-primary fill-primary/20" : "text-muted-foreground fill-muted/20"
                      } ${isHovered ? "text-primary fill-primary/40" : ""}`}
                    />

                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-card border border-border rounded-xl shadow-xl p-3 space-y-1.5 animate-fade-in pointer-events-none">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold truncate flex-1">{vaga.title}</p>
                          {vaga.type === "casa" ? (
                            <Home className="w-3.5 h-3.5 text-primary shrink-0" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{vaga.role}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{vaga.hours}h</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">R$ {vaga.value}</span>
                          <span className="text-[10px] text-muted-foreground">{vaga.distance}km</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{vaga.location} • {vaga.date}</p>
                        {vaga.matchProfile && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium">✓ Para seu perfil</span>
                        )}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-border" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2 text-[10px] space-y-1">
                <div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-primary fill-primary/20" /><span>Para seu perfil</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-muted-foreground fill-muted/20" /><span>Outras vagas</span></div>
                <div className="border-t border-border my-1" />
                <div className="flex items-center gap-2"><Home className="w-3 h-3 text-primary" /><span>Freela em Casa</span></div>
                <div className="flex items-center gap-2"><Building2 className="w-3 h-3 text-accent" /><span>Freela para Empresas</span></div>
              </div>

              {/* Radius label */}
              <div className="absolute top-3 right-3 bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2 text-xs font-medium">
                Raio: {radius}km
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{filteredVagas.length} Vagas Encontradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredVagas.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">Nenhuma vaga encontrada com os filtros selecionados</p>
              )}
              {filteredVagas.map(vaga => (
                <div
                  key={vaga.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                    hoveredVaga === vaga.id ? "bg-primary/10 ring-1 ring-primary/20" : "bg-muted/50 hover:bg-muted"
                  }`}
                  onMouseEnter={() => setHoveredVaga(vaga.id)}
                  onMouseLeave={() => setHoveredVaga(null)}
                  onClick={() => navigate(`/vaga/${vaga.id}`)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    vaga.matchProfile ? "bg-primary-light" : "bg-muted"
                  }`}>
                    <MapPin className={`w-4 h-4 ${vaga.matchProfile ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{vaga.title}</p>
                      <TypeIcon type={vaga.type} />
                      {vaga.matchProfile && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary-light text-primary font-medium shrink-0">Seu perfil</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{vaga.role}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{vaga.hours}h</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{vaga.date}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">R$ {vaga.value}</p>
                    <p className="text-[10px] text-muted-foreground">{vaga.distance}km</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MapaVagas;
