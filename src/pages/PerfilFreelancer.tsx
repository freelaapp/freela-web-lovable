import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Star, MapPin, MessageCircle, Shield, Clock, ChevronLeft, Heart, Share2, Send, Eye, Pencil, Car, X, Check, Play, Image as ImageIcon } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useState } from "react";
import pcdIcon from "@/assets/pcd-icon.jpg";

const freelancerData = {
  id: "1",
  name: "Carlos Silva",
  avatar: "CS",
  role: "Churrasqueiro Profissional",
  location: "São Paulo, SP",
  rating: 4.9,
  reviews: 127,
  jobs: 253,
  memberSince: "Jan 2023",
  verified: true,
  responseTime: "~15 min",
  level: "Ouro" as "Bronze" | "Prata" | "Ouro",
  profileCompletion: 85,
  hasTransport: true,
  isPCD: false,
  deficiencias: [] as string[],
  bio: "Churrasqueiro profissional com mais de 10 anos de experiência em eventos. Especializado em cortes nobres, churrasco argentino e brasileiro. Atendo festas de 10 a 200 pessoas com todo equipamento necessário.",
  skills: ["Churrasco Brasileiro", "Churrasco Argentino", "Cortes Nobres", "Buffet Completo", "Eventos Corporativos"],
  availability: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  portfolio: [
    { title: "Festa de aniversário - 80 pessoas", rating: 5.0 },
    { title: "Confraternização empresa - 120 pessoas", rating: 4.9 },
    { title: "Casamento ao ar livre - 200 pessoas", rating: 5.0 },
    { title: "Churrasco de Réveillon - 50 pessoas", rating: 4.8 },
  ],
  testimonials: [
    { name: "Ana Oliveira", text: "Carlos é incrível! Cuidou de tudo e os convidados amaram.", rating: 5 },
    { name: "Roberto Souza", text: "Profissional top! Churrasco perfeito, super organizado.", rating: 5 },
    { name: "Maria Santos", text: "Contratei para meu casamento. Foi impecável!", rating: 5 },
  ],
  price: "A partir de R$ 480",
};

const levelConfig = {
  Bronze: { color: "text-orange-700", bg: "bg-orange-100" },
  Prata: { color: "text-gray-500", bg: "bg-gray-100" },
  Ouro: { color: "text-primary", bg: "bg-primary/10" },
};

const diasSemana = [
  { key: "Seg", label: "Seg" },
  { key: "Ter", label: "Ter" },
  { key: "Qua", label: "Qua" },
  { key: "Qui", label: "Qui" },
  { key: "Sex", label: "Sex" },
  { key: "Sáb", label: "Sáb" },
  { key: "Dom", label: "Dom" },
];

const horasDisponiveis = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

type Horarios = Record<string, { de: string; ate: string }>;

const PerfilFreelancer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const level = levelConfig[freelancerData.level];
  const [contractorView, setContractorView] = useState(false);

  // Availability state
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([...freelancerData.availability]);
  const [horarios, setHorarios] = useState<Horarios>(
    freelancerData.availability.reduce((acc, day) => ({ ...acc, [day]: { de: "08:00", ate: "18:00" } }), {} as Horarios)
  );
  const [savedDays, setSavedDays] = useState<string[]>([...freelancerData.availability]);
  const [savedHorarios, setSavedHorarios] = useState<Horarios>(
    freelancerData.availability.reduce((acc, day) => ({ ...acc, [day]: { de: "08:00", ate: "18:00" } }), {} as Horarios)
  );

  const [horarioDialog, setHorarioDialog] = useState<string | null>(null);
  const [tempDe, setTempDe] = useState("08:00");
  const [tempAte, setTempAte] = useState("18:00");

  // Services editing
  const allServices = [
    "Bartender", "Barista", "Churrasqueiro", "Copeiro", "Cozinheiro",
    "Garçom", "Hostess", "Manobrista", "Promoter", "Recepcionista",
    "Segurança", "Sommelier",
  ].sort();

  const [savedServices, setSavedServices] = useState<string[]>([...freelancerData.skills].sort());
  const [editingServices, setEditingServices] = useState(false);
  const [tempServices, setTempServices] = useState<string[]>([...savedServices]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const openHorario = (day: string) => {
    const h = horarios[day] || { de: "08:00", ate: "18:00" };
    setTempDe(h.de);
    setTempAte(h.ate);
    setHorarioDialog(day);
  };

  const saveHorario = () => {
    if (horarioDialog) {
      setHorarios((prev) => ({ ...prev, [horarioDialog]: { de: tempDe, ate: tempAte } }));
      setHorarioDialog(null);
    }
  };

  const startEditing = () => {
    setSelectedDays([...savedDays]);
    setHorarios({ ...savedHorarios });
    setEditingAvailability(true);
  };

  const cancelEditing = () => {
    setSelectedDays([...savedDays]);
    setHorarios({ ...savedHorarios });
    setEditingAvailability(false);
  };

  const saveAvailability = () => {
    setSavedDays([...selectedDays]);
    setSavedHorarios({ ...horarios });
    setEditingAvailability(false);
  };

  const toggleService = (s: string) => {
    setTempServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const startEditingServices = () => {
    setTempServices([...savedServices]);
    setEditingServices(true);
  };

  const cancelEditingServices = () => {
    setTempServices([...savedServices]);
    setEditingServices(false);
  };

  const saveServices = () => {
    setSavedServices([...tempServices].sort());
    setEditingServices(false);
  };

  const sortedServices = (selected: string[]) => {
    return [...allServices].sort((a, b) => {
      const aSelected = selected.includes(a);
      const bSelected = selected.includes(b);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.localeCompare(b);
    });
  };

  return (
    <AppLayout showHeader={false} showFooter={false}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold font-display">Meu Perfil</h1>
          <div className="flex gap-1">
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Contractor view toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setContractorView(!contractorView)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              contractorView
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Visão Contratante
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-amber shrink-0">
              {freelancerData.avatar}
            </div>
            {!contractorView && (
              <button className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center shadow-sm">
                <Pencil className="w-3 h-3 text-primary" />
              </button>
            )}
            {freelancerData.isPCD && (
              <img src={pcdIcon} alt="PCD" className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full shadow-sm object-cover" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-bold">{freelancerData.name}</h2>
              {freelancerData.verified && (
                <Shield className="w-5 h-5 text-primary fill-primary/20" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-sm font-bold">{freelancerData.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">• {freelancerData.jobs} trabalhos</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${level.bg} ${level.color}`}>
                ⭐ {freelancerData.level}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Completion - hidden in contractor view or at 100% */}
        {!contractorView && freelancerData.profileCompletion < 100 && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Perfil {freelancerData.profileCompletion}% completo</span>
              <button className="text-xs text-primary font-semibold">Completar</button>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${freelancerData.profileCompletion}%` }}
              />
            </div>
          </div>
        )}

        {/* Description + Location & Transport */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-xs font-semibold mb-1.5">Sobre mim</p>
          <p className="text-sm text-muted-foreground">{freelancerData.bio}</p>
          <div className="border-t border-border mt-3 pt-3 space-y-2">
            <div className="flex items-center gap-3">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{freelancerData.location}</span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold">Serviços</p>
            {!contractorView && !editingServices && (
              <button onClick={startEditingServices} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <Pencil className="w-3 h-3 text-primary" />
              </button>
            )}
          </div>

          {!editingServices ? (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {savedServices.map((s) => (
                <span key={s} className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {sortedServices(tempServices).map((s) => {
                  const selected = tempServices.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleService(s)}
                      className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                        selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={cancelEditingServices}>
                  <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                </Button>
                <Button size="sm" className="flex-1 text-xs" onClick={saveServices}>
                  <Check className="w-3.5 h-3.5 mr-1" /> Salvar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold">Disponibilidade</p>
            {!contractorView && !editingAvailability && (
              <button onClick={startEditing} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <Pencil className="w-3 h-3 text-primary" />
              </button>
            )}
          </div>

          {!editingAvailability ? (
            <div className="grid grid-cols-7 gap-1.5">
              {diasSemana.map(({ key }) => (
                <div key={key} className="flex flex-col items-center gap-0.5">
                  <span
                    className={`w-full py-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center ${
                      savedDays.includes(key)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {key}
                  </span>
                  {savedDays.includes(key) && savedHorarios[key] && (
                    <span className="text-[8px] text-muted-foreground leading-tight">
                      {savedHorarios[key].de.replace(":00", "h")}-{savedHorarios[key].ate.replace(":00", "h")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-1.5">
                {diasSemana.map(({ key, label }) => {
                  const ativo = selectedDays.includes(key);
                  return (
                    <div key={key} className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => toggleDay(key)}
                        className={`w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition-all border-2 text-[11px] font-semibold ${
                          ativo
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted text-muted-foreground border-transparent"
                        }`}
                      >
                        {label}
                        {ativo && horarios[key] && (
                          <span className="text-[7px] mt-0.5 opacity-80">
                            {horarios[key].de.replace(":00", "")}-{horarios[key].ate.replace(":00", "")}
                          </span>
                        )}
                      </button>
                      {ativo && (
                        <button
                          onClick={() => openHorario(key)}
                          className="w-6 h-6 rounded-full bg-muted/80 flex items-center justify-center"
                        >
                          <Clock className="w-2.5 h-2.5 text-primary" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={cancelEditing}>
                  <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                </Button>
                <Button size="sm" className="flex-1 text-xs" onClick={saveAvailability}>
                  <Check className="w-3.5 h-3.5 mr-1" /> Salvar
                </Button>
              </div>
            </div>
          )}
        </div>


        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: freelancerData.jobs.toString(), label: "Trabalhos" },
            { value: freelancerData.rating.toString(), label: "Avaliação" },
            { value: freelancerData.reviews.toString(), label: "Avaliações" },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="p-4">
                <p className="text-xl font-bold font-display text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Portfolio */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-3">Trabalhos Recentes</h3>
            <div className="space-y-3">
              {freelancerData.portfolio.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="flex items-center gap-1 text-sm text-primary font-semibold">
                    <Star className="w-3.5 h-3.5 fill-primary" /> {item.rating}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Avaliações Recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">Avaliações Recentes</h2>
            <button className="text-xs text-primary font-semibold">Ver todas</button>
          </div>
          <div className="space-y-2.5">
            {freelancerData.testimonials.map((t, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 text-primary fill-primary" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer for bottom bar */}
        <div className="h-20" />
      </div>

      {/* Fixed Bottom CTA - Contractor View */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">A partir de</p>
            <p className="text-lg font-bold font-display text-primary">R$ 480</p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => navigate("/criar-evento")}>
            <Send className="w-4 h-4" /> Contratar
          </Button>
        </div>
      </div>

      {/* Time picker dialog */}
      <Dialog open={!!horarioDialog} onOpenChange={(open) => !open && setHorarioDialog(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Horário — {horarioDialog}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">De</label>
              <select value={tempDe} onChange={(e) => setTempDe(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                {horasDisponiveis.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Até</label>
              <select value={tempAte} onChange={(e) => setTempAte(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                {horasDisponiveis.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setHorarioDialog(null)}>Cancelar</Button>
            <Button onClick={saveHorario}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default PerfilFreelancer;
