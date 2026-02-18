import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Briefcase, Clock, DollarSign, Calendar, Filter, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const allVagas = [
  { id: 201, title: "Aniversário 50 anos", role: "Garçom", hours: 6, value: 120, date: "25 Fev", location: "Vila Mariana, SP", distance: 5, lat: -23.59, lng: -46.63, matchProfile: true },
  { id: 202, title: "Happy Hour Corporativo", role: "Bartender", hours: 5, value: 100, date: "27 Fev", location: "Pinheiros, SP", distance: 8, lat: -23.56, lng: -46.69, matchProfile: true },
  { id: 203, title: "Casamento - Buffet", role: "Churrasqueiro", hours: 8, value: 200, date: "01 Mar", location: "Moema, SP", distance: 12, lat: -23.60, lng: -46.67, matchProfile: true },
  { id: 204, title: "Evento Beneficente", role: "Cozinheiro", hours: 6, value: 120, date: "05 Mar", location: "Itaim Bibi, SP", distance: 15, lat: -23.58, lng: -46.68, matchProfile: false },
  { id: 205, title: "Festa Junina", role: "Garçom", hours: 7, value: 140, date: "10 Mar", location: "Brooklin, SP", distance: 10, lat: -23.62, lng: -46.69, matchProfile: true },
  { id: 206, title: "Brunch Executivo", role: "Barista", hours: 4, value: 80, date: "12 Mar", location: "Jardins, SP", distance: 6, lat: -23.56, lng: -46.66, matchProfile: false },
  { id: 207, title: "Churrasco Família", role: "Churrasqueiro", hours: 6, value: 150, date: "15 Mar", location: "Tatuapé, SP", distance: 18, lat: -23.54, lng: -46.58, matchProfile: true },
  { id: 208, title: "Coquetel Empresarial", role: "Bartender", hours: 5, value: 100, date: "18 Mar", location: "Faria Lima, SP", distance: 7, lat: -23.57, lng: -46.69, matchProfile: true },
  { id: 209, title: "Jantar Beneficente", role: "Garçom", hours: 6, value: 120, date: "20 Mar", location: "Perdizes, SP", distance: 22, lat: -23.53, lng: -46.68, matchProfile: false },
  { id: 210, title: "Festival Gastronômico", role: "Cozinheiro", hours: 10, value: 250, date: "22 Mar", location: "Santo Amaro, SP", distance: 25, lat: -23.65, lng: -46.71, matchProfile: true },
];

const roles = ["Todos", "Garçom", "Bartender", "Churrasqueiro", "Cozinheiro", "Barista"];

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

  // Map center and bounds for São Paulo region
  const centerLat = -23.58;
  const centerLng = -46.66;
  const mapScale = 600; // pixels per degree approx

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
              <MapPin className="w-6 h-6 text-primary" /> Mapa de Vagas
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredVagas.length} vagas encontradas em até {radius}km
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
                {/* Raio */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Raio: {radius}km</Label>
                  <Slider
                    value={[radius]}
                    onValueChange={(v) => setRadius(v[0])}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>1km</span><span>30km</span>
                  </div>
                </div>

                {/* Vaga necessária */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Vaga necessária</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Valor mínimo */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Valor mínimo: R$ {minValue}</Label>
                  <Slider
                    value={[minValue]}
                    onValueChange={(v) => setMinValue(v[0])}
                    min={0}
                    max={300}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Horas máximas */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Máximo de horas: {maxHours}h</Label>
                  <Slider
                    value={[maxHours]}
                    onValueChange={(v) => setMaxHours(v[0])}
                    min={1}
                    max={12}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Dia da vaga */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Dia da vaga</Label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueDates.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vagas para meu perfil */}
                <div className="flex items-center gap-3 pt-5">
                  <Switch checked={onlyProfile} onCheckedChange={setOnlyProfile} id="profile-match" />
                  <Label htmlFor="profile-match" className="text-sm font-medium cursor-pointer">
                    Vagas para meu perfil
                  </Label>
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
              <div
                className="absolute z-20 flex flex-col items-center"
                style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
              >
                <div className="w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg animate-pulse" />
                <span className="text-[9px] font-bold text-primary mt-1 bg-background/80 px-1.5 py-0.5 rounded">Você</span>
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

                    {/* Popup */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-card border border-border rounded-xl shadow-xl p-3 space-y-1.5 animate-fade-in pointer-events-none">
                        <p className="text-sm font-bold truncate">{vaga.title}</p>
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
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium">
                            ✓ Para seu perfil
                          </span>
                        )}
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-border" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2 text-[10px] space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary fill-primary/20" />
                  <span>Para seu perfil</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-muted-foreground fill-muted/20" />
                  <span>Outras vagas</span>
                </div>
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{filteredVagas.length} Vagas Encontradas</CardTitle>
            </div>
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
