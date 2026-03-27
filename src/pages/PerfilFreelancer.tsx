import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Star, MapPin, MessageCircle, Shield, Clock, ChevronLeft, Heart, Share2, Send, Eye, Pencil, Car, X, Check, Play, Image as ImageIcon, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import { apiFetch, fetchImageWithAuth } from "@/lib/api";
import pcdIcon from "@/assets/pcd-icon.jpg";

const API_BASE_URL = import.meta.env.API_BASE_URL;

interface FreelancerProfile {
  id: string;
  name: string;
  avatar: string;
  role: string;
  location: string;
  rating: number;
  reviews: number;
  jobs: number;
  memberSince: string;
  verified: boolean;
  responseTime: string;
  level: "Bronze" | "Prata" | "Ouro";
  profileCompletion: number;
  hasTransport: boolean;
  isPCD: boolean;
  deficiencias: string[];
  bio: string;
  skills: string[];
  availability: string[];
  portfolio: { title: string; rating: number }[];
  testimonials: { name: string; text: string; rating: number }[];
  price: string;
  horarios?: Horarios;
}

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

const horasDisponiveis = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);

type Horarios = Record<string, { de: string; ate: string }>;

const PerfilFreelancer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const readonly = (location.state as Record<string, unknown>)?.readonly === true;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [freelancerData, setFreelancerData] = useState<FreelancerProfile | null>(null);
  const contractorView = readonly;

  // Availability state
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [horarios, setHorarios] = useState<Horarios>({});
  const [savedDays, setSavedDays] = useState<string[]>([]);
  const [savedHorarios, setSavedHorarios] = useState<Horarios>({});

  const [horarioDialog, setHorarioDialog] = useState<string | null>(null);
  const [tempDe, setTempDe] = useState("08h");
  const [tempAte, setTempAte] = useState("18h");

  // Services editing
  const allServices = [
    "Bartender", "Barista", "Churrasqueiro", "Copeiro", "Cozinheiro",
    "Garçom", "Hostess", "Manobrista", "Promoter", "Recepcionista",
    "Segurança", "Sommelier",
  ].sort();

  const [savedServices, setSavedServices] = useState<string[]>([]);
  const [editingServices, setEditingServices] = useState(false);
  const [tempServices, setTempServices] = useState<string[]>([]);

  useEffect(() => {
    if (!id) {
      setError("ID do freelancer não encontrado");
      setLoading(false);
      return;
    }

    const fetchFreelancerData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch provider details
        console.log(`[PerfilFreelancer] Fetching provider: ${id}`);
        const providerRes = await apiFetch(`${API_BASE_URL}/providers/${id}`, { method: "GET" });
        if (!providerRes.ok) {
          console.error(`[PerfilFreelancer] Provider not found, status: ${providerRes.status}`);
          throw new Error(`Erro ao buscar freelancer: ${providerRes.status}`);
        }
        const providerBody = await providerRes.json();
        const providerData = providerBody?.data || providerBody;
          console.log(`[PerfilFreelancer] Provider data:`, providerData);

        if (!providerData || !providerData.id) {
          throw new Error("Freelancer não encontrado");
        }

        const userId = providerData.userId;
        if (!userId) {
          console.error(`[PerfilFreelancer] No userId for provider:`, providerData);
          throw new Error("ID do usuário não encontrado");
        }

        // Fetch user details
        console.log(`[PerfilFreelancer] Fetching user: ${userId}`);
        const userRes = await apiFetch(`${API_BASE_URL}/users/${userId}`, { method: "GET" });
        if (!userRes.ok) {
          console.error(`[PerfilFreelancer] User not found, status: ${userRes.status}`);
          throw new Error(`Erro ao buscar usuário: ${userRes.status}`);
        }
        const userBody = await userRes.json();
        const userData = userBody?.data || userBody;
        console.log(`[PerfilFreelancer] User data:`, userData);

        const name = userData.name || providerData.name || "Freelancer";
        const avatarInitials = name
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        
        const bufferToDataUrl = (img: unknown): string | null => {
          if (!img) return null;
          if (typeof img === "string") {
            if (img.startsWith("data:") || img.startsWith("http") || img.startsWith("/")) return img;
            if (img.startsWith("/9j/") || img.startsWith("iVBOR") || img.startsWith("R0lGO") || img.startsWith("UklGR")) {
              const mime = img.startsWith("/9j/") ? "jpeg" : img.startsWith("iVBOR") ? "png" : img.startsWith("R0lGO") ? "gif" : "webp";
              return `data:image/${mime};base64,${img}`;
            }
            return img;
          }
          if (typeof img === "object" && img !== null) {
            const imgObj = img as Record<string, unknown>;
            if (imgObj.type === "Buffer" && Array.isArray(imgObj.data)) {
              const bytes = new Uint8Array(imgObj.data as number[]);
              let binary = "";
              for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              return `data:image/jpeg;base64,${btoa(binary)}`;
            }
          }
          return null;
        };
        
        const rawProfileUrl =
          bufferToDataUrl(providerData.profileImage) ||
          bufferToDataUrl(userData.profileImage) ||
          providerData.profilePicture ||
          providerData.avatarUrl ||
          providerData.photoUrl ||
          userData.profilePicture ||
          userData.avatarUrl ||
          userData.photoUrl ||
          null;

        const profileImageUrl = (rawProfileUrl && (rawProfileUrl.startsWith("data:") || rawProfileUrl.startsWith("http")))
          ? rawProfileUrl
          : null;

        const parseServicesFromApi = (value: string | undefined): string[] => {
          if (!value) return [];
          return value.split(",").map(s => s.trim()).filter(Boolean);
        };

        const jobsCount = providerData.completedJobs ?? (typeof providerData.jobs === "number" ? providerData.jobs : 0);

        const profile: FreelancerProfile = {
          id: providerData.id || id,
          name,
          avatar: profileImageUrl || avatarInitials,
          role: providerData.specialty || providerData.role || providerData.assignment || providerData.desiredJobVacancy?.split(",")[0]?.trim() || "",
          location: providerData.city && providerData.state
            ? `${providerData.city}, ${providerData.state}`
            : providerData.location || userData.city || "",
          rating: providerData.feedbackStars ?? providerData.rating ?? 0,
          reviews: providerData.feedbackCount ?? (typeof providerData.reviews === "number" ? providerData.reviews : 0),
          jobs: jobsCount,
          memberSince: providerData.createdAt
            ? new Date(providerData.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
            : "",
          verified: providerData.verified ?? providerData.isVerified ?? false,
          responseTime: providerData.responseTime || "~30 min",
          level: providerData.level === "gold" || providerData.level === "Ouro" ? "Ouro"
            : providerData.level === "silver" || providerData.level === "Prata" ? "Prata"
            : "Bronze",
          profileCompletion: providerData.profileCompletion ?? 100,
          hasTransport: providerData.hasTransport ?? false,
          isPCD: providerData.isPCD ?? providerData.pcd ?? false,
          deficiencias: providerData.deficiencias || [],
          bio: providerData.bio || providerData.description || providerData.about || userData.bio || userData.description || "",
          skills: parseServicesFromApi(providerData.desiredJobVacancy || providerData.services || providerData.skills),
          availability: Array.isArray(providerData.diasAtivos) ? providerData.diasAtivos
            : Array.isArray(providerData.availability) ? providerData.availability
            : [],
          portfolio: (Array.isArray(providerData.portfolio) ? providerData.portfolio : []).map((p: Record<string, unknown>) => ({
            title: (p.title as string) || (p.name as string) || (p.description as string) || "",
            rating: (p.rating as number) || (p.stars as number) || 0,
          })),
          testimonials: (Array.isArray(providerData.testimonials) ? providerData.testimonials
            : Array.isArray(providerData.feedback) ? providerData.feedback
            : []).map((t: Record<string, unknown>) => ({
            name: (t.reviewerName as string) || (t.name as string) || (t.author as string) || "Cliente",
            text: (t.comment as string) || (t.text as string) || (t.description as string) || "",
            rating: (t.rating as number) || (t.stars as number) || 5,
          })),
          price: (providerData.price || providerData.startingPrice)
            ? `A partir de R$ ${providerData.price || providerData.startingPrice}`
            : "",
        };

        setFreelancerData(profile);
        console.log(`[PerfilFreelancer] Profile set:`, profile);
        setFreelancerData(profile);
        setSelectedDays([...profile.availability]);
        setSavedDays([...profile.availability]);
        
        const apiHorarios = providerData.horarios as Horarios | undefined;
        const availabilityArray = Array.isArray(profile.availability) ? profile.availability : [];
        const initialHorarios = apiHorarios || (availabilityArray.length > 0 
          ? availabilityArray.reduce(
              (acc: Horarios, day: string) => ({ ...acc, [day]: { de: "08h", ate: "18h" } }),
              {} as Horarios
            )
          : {} as Horarios
        );
        setHorarios(initialHorarios);
        setSavedHorarios(initialHorarios);
        setSavedServices([...profile.skills].sort());
        setTempServices([...profile.skills].sort());
      } catch (err: unknown) {
        console.error("Erro ao buscar perfil do freelancer:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar perfil do freelancer");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerData();
  }, [id]);

  const level = freelancerData ? levelConfig[freelancerData.level] : levelConfig.Bronze;

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const openHorario = (day: string) => {
    const h = horarios[day] || { de: "08h", ate: "18h" };
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

  if (loading) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !freelancerData) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold font-display">Perfil do Freelancer</h1>
            <div />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <p className="text-muted-foreground">{error || "Perfil não encontrado"}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={false} showFooter={false}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold font-display">Perfil do Freelancer</h1>
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
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {freelancerData.avatar && (freelancerData.avatar.startsWith("data:") || freelancerData.avatar.startsWith("http") || freelancerData.avatar.startsWith("/") || freelancerData.avatar.includes(".")) ? (
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-amber shrink-0 overflow-hidden">
                <img src={freelancerData.avatar} alt={freelancerData.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-amber shrink-0">
                {freelancerData.avatar}
              </div>
            )}
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
            {freelancerData.role && (
              <p className="text-sm text-muted-foreground">{freelancerData.role}</p>
            )}
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
          <p className="text-sm text-muted-foreground">{freelancerData.bio || "Sem descrição"}</p>
          <div className="border-t border-border mt-3 pt-3 space-y-2">
            {freelancerData.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{freelancerData.location}</span>
              </div>
            )}
            {freelancerData.hasTransport && (
              <div className="flex items-center gap-3">
                <Car className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Possui transporte</span>
              </div>
            )}
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
              {savedServices.length > 0 ? savedServices.map((s) => (
                <span key={s} className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
                  {s}
                </span>
              )) : (
                <span className="text-xs text-muted-foreground">Nenhum serviço informado</span>
              )}
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
                      {savedHorarios[key].de}-{savedHorarios[key].ate}
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
                            {horarios[key].de}-{horarios[key].ate}
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
        {freelancerData.portfolio.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-base mb-3">Trabalhos Recentes</h3>
              <div className="space-y-3">
                {freelancerData.portfolio.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.rating > 0 && (
                      <span className="flex items-center gap-1 text-sm text-primary font-semibold">
                        <Star className="w-3.5 h-3.5 fill-primary" /> {item.rating}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avaliações Recentes */}
        {freelancerData.testimonials.length > 0 && (
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
        )}

        <div className="h-4" />
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
