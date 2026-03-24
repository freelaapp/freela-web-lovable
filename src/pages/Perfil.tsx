import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, CreditCard, HelpCircle, LogOut, ChevronRight, Star, Shield, Mail, Clock, Briefcase, Camera, Video, ImagePlus, Building2, MapPin, CalendarPlus, Accessibility, Eye, Car, Pencil, Play, Image as ImageIconLucide, X, Check, Loader2 } from "lucide-react";
import EditableAvatar from "@/components/EditableAvatar";
import pcdIcon from "@/assets/pcd-icon.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "@/components/layout/AppLayout";
import { servicosPF } from "@/lib/services";
import { updateProviderAvailability } from "@/lib/api";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.API_BASE_URL;

type ContractorType = "empresas" | "casa_cnpj" | "casa_cpf";

const bufferToDataUrl = (img: any): string | null => {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (img.type === "Buffer" && Array.isArray(img.data)) {
    const bytes = new Uint8Array(img.data);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return `data:image/jpeg;base64,${btoa(binary)}`;
  }
  return null;
};

const freelancerMenuItems = [
{ icon: User, label: "Meus Dados", href: "/meus-dados", description: "Editar perfil e informações" },
{ icon: CreditCard, label: "Financeiro", href: "/carteira", description: "Saldo, ganhos e histórico" },
{ icon: Settings, label: "Configurações", href: "/configuracoes", description: "Privacidade, notificações e conta" },
{ icon: HelpCircle, label: "Ajuda", href: "/ajuda", description: "Dúvidas e suporte" }];


const contratanteMenuItems = [
{ icon: Building2, label: "Meus Dados", href: "/meus-dados-contratante", description: "Dados do estabelecimento" },
{ icon: CreditCard, label: "Financeiro", href: "/carteira", description: "Gastos e histórico de pagamentos" },
{ icon: Settings, label: "Configurações", href: "/configuracoes-contratante", description: "Privacidade, notificações e conta" },
{ icon: HelpCircle, label: "Ajuda", href: "/ajuda-contratante", description: "Dúvidas e suporte" }];


const diasSemana = [
{ key: "seg", label: "Seg" },
{ key: "ter", label: "Ter" },
{ key: "qua", label: "Qua" },
{ key: "qui", label: "Qui" },
{ key: "sex", label: "Sex" },
{ key: "sab", label: "Sáb" },
{ key: "dom", label: "Dom" }];


const horasDisponiveis = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);

type Horarios = Record<string, {de: string;ate: string;}>;

const Perfil = () => {
  const navigate = useNavigate();
  const { logout, role, setRole } = useAuth();
  const isContratante = role === "contratante";
  const [contractorView, setContractorView] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fachadaInputRef = useRef<HTMLInputElement>(null);
  const internoInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [diasAtivos, setDiasAtivos] = useState<string[]>(["seg", "ter", "qua", "qui", "sex"]);
  const [horarios, setHorarios] = useState<Horarios>({
    seg: { de: "08h", ate: "20h" },
    ter: { de: "08h", ate: "20h" },
    qua: { de: "08h", ate: "20h" },
    qui: { de: "08h", ate: "20h" },
    sex: { de: "08h", ate: "20h" },
    sab: { de: "10h", ate: "16h" },
    dom: { de: "10h", ate: "14h" }
  });
  const [horarioDialog, setHorarioDialog] = useState<string | null>(null);
  const [tempDe, setTempDe] = useState("");
  const [tempAte, setTempAte] = useState("");

  // Serviços inline editing
  const [editingServices, setEditingServices] = useState(false);
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>(["garcom", "barman", "churrasqueiro"]);
  const [tempServicos, setTempServicos] = useState<string[]>([]);
  const savedServices = servicosSelecionados;

  // Availability editing
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [savedDiasAtivos, setSavedDiasAtivos] = useState<string[]>(["seg", "ter", "qua", "qui", "sex"]);
  const [savedHorarios, setSavedHorarios] = useState<Horarios>({ ...horarios });

  // Dialog serviços (legacy)
  const [servicosDialog, setServicosDialog] = useState(false);

  // Mídia freelancer
  const [hasVideo, setHasVideo] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);

  // Fotos contratante
  const [fotoFachada, setFotoFachada] = useState<string | null>(null);
  const [fotoInterno, setFotoInterno] = useState<string | null>(null);

  // Bio editing
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("Churrasqueiro profissional com mais de 10 anos de experiência em eventos. Especializado em cortes nobres, churrasco argentino e brasileiro. Atendo festas de 10 a 200 pessoas com todo equipamento necessário.");
  const [tempBio, setTempBio] = useState("");

  // CNH
  const [cnhCategories, setCnhCategories] = useState<string[]>(["B"]);
  const [editingCnh, setEditingCnh] = useState(false);
  const [tempCnh, setTempCnh] = useState<string[]>([]);

  // Contractor API data
  const [contractorType, setContractorType] = useState<ContractorType>("empresas");
  const [contractorLoading, setContractorLoading] = useState(true);
  const [contractorData, setContractorData] = useState<{
    name: string;
    avatarUrl: string | null;
    rating: string;
    segment: string;
    city: string;
    uf: string;
  }>({ name: "", avatarUrl: null, rating: "0", segment: "", city: "", uf: "" });

  // Freelancer API data
  const [freelancerLoading, setFreelancerLoading] = useState(true);
  const [freelancerData, setFreelancerData] = useState<{
    name: string;
    avatarUrl: string | null;
    rating: string;
    city: string;
    uf: string;
    desiredJobVacancy: string;
    isPCD: boolean;
  }>({ name: "", avatarUrl: null, rating: "0", city: "", uf: "", desiredJobVacancy: "", isPCD: false });

  // Fetch freelancer profile
  useEffect(() => {
    if (isContratante) {
      setFreelancerLoading(false);
      return;
    }
    setFreelancerData({ name: "", avatarUrl: null, rating: "0", city: "", uf: "", desiredJobVacancy: "", isPCD: false });
    setDiasAtivos(["seg", "ter", "qua", "qui", "sex"]);
    setHorarios({
      seg: { de: "08h", ate: "20h" },
      ter: { de: "08h", ate: "20h" },
      qua: { de: "08h", ate: "20h" },
      qui: { de: "08h", ate: "20h" },
      sex: { de: "08h", ate: "20h" },
      sab: { de: "10h", ate: "16h" },
      dom: { de: "10h", ate: "14h" }
    });
    setServicosSelecionados(["garcom", "barman", "churrasqueiro"]);

    const abortController = new AbortController();

    const fetchFreelancer = async () => {
      try {
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) { setFreelancerLoading(false); return; }
        const token = JSON.parse(tokenRaw);
        const headers = { "Origin-type": "Web", "Authorization": `Bearer ${token}` };

        const [providerRes, userRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/providers`, {
            method: "GET", credentials: "include", headers, signal: abortController.signal,
          }),
          fetch(`${API_BASE_URL}/users/me`, {
            method: "GET", credentials: "include", headers, signal: abortController.signal,
          }),
        ]);

        let providerData: any = {};
        if (providerRes.ok) {
          const pBody = await providerRes.json();
          const raw = pBody?.data ?? pBody;
          providerData = Array.isArray(raw) ? raw[0] ?? {} : raw;
        }

        let userName = "";
        if (userRes.ok) {
          const uBody = await userRes.json();
          const uData = uBody?.data ?? uBody;
          userName = uData?.name || "";
        }

        const avatar = bufferToDataUrl(providerData.profileImage);

         // Process availability from 'availability' field (JSON string)
         const availabilityData = providerData.availability;
         if (availabilityData) {
           let availability: any = null;
           if (typeof availabilityData === 'string') {
             try {
               availability = JSON.parse(availabilityData);
             } catch (e) {
               console.error('Erro ao parsear availability:', e);
               availability = null;
             }
           } else {
             availability = availabilityData;
           }

           if (availability && availability.diasAtivos && Array.isArray(availability.diasAtivos)) {
             setDiasAtivos(availability.diasAtivos);
             setSavedDiasAtivos(availability.diasAtivos);
           } else {
             setDiasAtivos([]);
             setSavedDiasAtivos([]);
           }

           if (availability && availability.horarios && typeof availability.horarios === 'object') {
             setHorarios(availability.horarios);
             setSavedHorarios(availability.horarios);
           } else {
             setHorarios({});
             setSavedHorarios({});
           }
         } else {
           // Sem campo availability, limpar estados (sem dados fictícios)
           setDiasAtivos([]);
           setSavedDiasAtivos([]);
           setHorarios({});
           setSavedHorarios({});
         }

        const djv = providerData.desiredJobVacancy || "";
        if (djv) {
          const ids = djv.split(",").map((s: string) => s.trim().toLowerCase());
          const matched = servicosPF.filter(sv => ids.some((id: string) => sv.id === id || sv.label.toLowerCase() === id));
          if (matched.length > 0) {
            setServicosSelecionados(matched.map(m => m.id));
          } else {
            setServicosSelecionados(ids);
          }
        }

        setFreelancerData({
          name: userName,
          avatarUrl: avatar,
          rating: providerData.feedbackStars ? String(providerData.feedbackStars) : "0",
          city: providerData.city || "",
          uf: providerData.uf || "",
          desiredJobVacancy: djv,
          isPCD: !!providerData.deficiency,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("[Perfil] freelancer fetch error:", err);
        }
      } finally {
        setFreelancerLoading(false);
      }
    };
    fetchFreelancer();

    return () => abortController.abort();
  }, [role]);

  // Fetch contractor profile when contratante
  useEffect(() => {
    if (!isContratante) {
      setContractorLoading(false);
      return;
    }
    setContractorData({ name: "", avatarUrl: null, rating: "0", segment: "", city: "", uf: "" });
    setFotoFachada(null);
    setFotoInterno(null);

    const abortController = new AbortController();

    const fetchContractor = async () => {
      try {
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) { setContractorLoading(false); return; }
        const token = JSON.parse(tokenRaw);

        const res = await fetch(`${API_BASE_URL}/users/contractors`, {
          method: "GET",
          credentials: "include",
          headers: { "Origin-type": "Web", "Authorization": `Bearer ${token}` },
          signal: abortController.signal,
        });
        if (!res.ok) { setContractorLoading(false); return; }
        const body = await res.json();
        const d = body?.data ?? body;

        let detected: ContractorType = "empresas";
        if (d.cpf && !d.cnpj) detected = "casa_cpf";
        else if (d.cnpj && !d.establishmentFacadeImage && !d.companyName) detected = "casa_cnpj";
        setContractorType(detected);

        const avatar = bufferToDataUrl(d.establishmentFacadeImage) || bufferToDataUrl(d.profileImage);

        const facadeUrl = bufferToDataUrl(d.establishmentFacadeImage);
        if (facadeUrl) setFotoFachada(facadeUrl);
        const interiorUrl = bufferToDataUrl(d.establishmentInteriorImage);
        if (interiorUrl) setFotoInterno(interiorUrl);

        setContractorData({
          name: d.companyName || d.corporateReason || d.name || "",
          avatarUrl: avatar,
          rating: d.feedbackStars ? String(d.feedbackStars) : "0",
          segment: d.companySegment || "",
          city: d.city || "",
          uf: d.uf || "",
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("[Perfil] contractor fetch error:", err);
        }
      } finally {
        setContractorLoading(false);
      }
    };
    fetchContractor();

    return () => abortController.abort();
  }, [role]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/") && fotos.length < 3) {
      setFotos((prev) => [...prev, URL.createObjectURL(file)]);
    }
  };

  const handleFachadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) setFotoFachada(URL.createObjectURL(file));
  };

  const handleInternoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) setFotoInterno(URL.createObjectURL(file));
  };

  const toggleDia = (key: string) => {
    setDiasAtivos((prev) =>
    prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const openHorario = (key: string) => {
    setTempDe(horarios[key]?.de || "08h");
    setTempAte(horarios[key]?.ate || "18h");
    setHorarioDialog(key);
  };

  const saveHorario = () => {
    if (horarioDialog) {
      setHorarios((prev) => ({ ...prev, [horarioDialog]: { de: tempDe, ate: tempAte } }));
      setHorarioDialog(null);
    }
  };

  const openServicos = () => {
    setTempServicos([...servicosSelecionados]);
    setServicosDialog(true);
  };

  const toggleServico = (id: string) => {
    setTempServicos((prev) =>
    prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const saveServicos = () => {
    setServicosSelecionados(tempServicos);
    setServicosDialog(false);
  };

   // Services inline edit helpers
   const startEditingServices = () => {
     setTempServicos([...servicosSelecionados]);
     setEditingServices(true);
   };
   const cancelEditingServices = () => {
     setTempServicos([...servicosSelecionados]);
     setEditingServices(false);
   };
    const saveEditingServices = async () => {
      try {
        // Get auth token
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) {
          toast.error("Sessão expirada. Faça login novamente.");
          return;
        }
        const token = JSON.parse(tokenRaw);
        const headers = { 
          "Origin-type": "Web", 
          "Authorization": `Bearer ${token}` 
        };

        // Send PUT /providers with only desiredJobVacancy
        const payload = {
          desiredJobVacancy: tempServicos.join(",")
        };

        const response = await fetch(`${API_BASE_URL}/providers`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody?.message || "Não foi possível atualizar os serviços.");
        }

        // Update local state with new services
        setServicosSelecionados([...tempServicos]);
        setEditingServices(false);
        
        toast.success("Serviços atualizados com sucesso!");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao atualizar serviços. Tente novamente.";
        toast.error(message);
      }
    };

  // Availability edit helpers
  const startEditingAvailability = () => {
    setSavedDiasAtivos([...diasAtivos]);
    setSavedHorarios({ ...horarios });
    setEditingAvailability(true);
  };
  const cancelEditingAvailability = () => {
    setDiasAtivos([...savedDiasAtivos]);
    setHorarios({ ...savedHorarios });
    setEditingAvailability(false);
  };

  /**
   * Valida horários e persiste no backend
   * Validações:
   * - 'ate' deve ser posterior a 'de'
   * - Formato correto de hora (HHh)
   */
  const saveEditingAvailability = async () => {
    try {
      // Validar todos os dias ativos têm horários válidos
      for (const dia of diasAtivos) {
        const h = horarios[dia];
        if (!h) {
          toast.error(`Dia ${dia} está ativo mas não tem horário configurado.`);
          return;
        }

        // Extrair apenas os dígitos para comparação numérica
        const deNum = parseInt(h.de.replace('h', ''));
        const ateNum = parseInt(h.ate.replace('h', ''));

        if (ateNum <= deNum) {
          toast.error(`Horário inválido para ${dia}: "até" não pode ser menor ou igual a "de"`);
          return;
        }

        if (deNum < 0 || deNum > 23 || ateNum < 0 || ateNum > 23) {
          toast.error(`Horas devem estar entre 00h e 23h`);
          return;
        }
      }

      setSavingAvailability(true);
      await updateProviderAvailability({
        diasAtivos,
        horarios,
      });

      // Atualizar estado salvo com novos valores
      setSavedDiasAtivos([...diasAtivos]);
      setSavedHorarios({ ...horarios });
      setEditingAvailability(false);
      toast.success("Disponibilidade atualizada com sucesso!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar disponibilidade";
      toast.error(message);
    } finally {
      setSavingAvailability(false);
    }
  };

  const formatHorario = (key: string) => {
    const h = horarios[key];
    if (!h) return "--";
    return `${h.de}-${h.ate}`;
  };

  const diaLabel = diasSemana.find((d) => d.key === horarioDialog)?.label || "";
  const menuItems = isContratante ? contratanteMenuItems : freelancerMenuItems;

  const switchRole = () => {
    const newRole = isContratante ? "freelancer" : "contratante";
    setRole(newRole);
    setFreelancerData({ name: "", avatarUrl: null, rating: "0", city: "", uf: "", desiredJobVacancy: "", isPCD: false });
    setContractorData({ name: "", avatarUrl: null, rating: "0", segment: "", city: "", uf: "" });
    navigate(newRole === "contratante" ? "/dashboard-contratante" : "/dashboard-freelancer");
  };

  const isPageLoading = isContratante ? contractorLoading : freelancerLoading;

  if (isPageLoading) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Carregando perfil...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        {/* Contractor View Toggle - freelancer only */}
        {!isContratante &&
        <div className="flex justify-end">
            <button
            onClick={() => setContractorView(!contractorView)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            contractorView ?
            "bg-primary text-primary-foreground" :
            "bg-muted text-muted-foreground"}`
            }>

              <Eye className="w-3.5 h-3.5" />
              Visão Contratante
            </button>
          </div>
        }

        {/* Profile Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="relative shrink-0">
                  <EditableAvatar
                    src={isContratante ? contractorData.avatarUrl : (freelancerData.avatarUrl || avatarUrl)}
                    fallback={isContratante ? (contractorData.name?.[0] || "C") : (freelancerData.name?.[0] || "F")}
                    size="md"
                    onFileSelect={(file) => setAvatarUrl(URL.createObjectURL(file))}
                  />
                   {!isContratante && freelancerData.isPCD && (
                     <img src={pcdIcon} alt="PCD" className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-background bg-background" title="Pessoa com Deficiência" />
                   )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <h2 className="text-lg font-display font-bold truncate">
                      {isContratante ? (contractorData.name || "Contratante") : (freelancerData.name || "Freelancer")}
                    </h2>
                    <Shield className="w-4 h-4 text-primary fill-primary/20 shrink-0" />
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-primary font-medium flex-wrap">
                    <Star className="w-4 h-4 fill-primary shrink-0" /> {isContratante ? contractorData.rating : freelancerData.rating}
                    {isContratante && contractorData.segment ? (
                      <>
                        <span className="text-muted-foreground font-normal ml-1">•</span>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium ml-1">
                          <Building2 className="w-3 h-3" /> {contractorData.segment}
                        </span>
                      </>
                    ) : !isContratante ? (
                      <>
                        <span className="text-muted-foreground font-normal ml-1">•</span>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium ml-1">
                          <Briefcase className="w-3 h-3" /> Freelancer
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {isContratante
                        ? [contractorData.city, contractorData.uf].filter(Boolean).join(", ") || "Não informado"
                        : [freelancerData.city, freelancerData.uf].filter(Boolean).join(", ") || "Não informado"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Sobre mim - hidden for now */}

        {/* Serviços - freelancer only */}
        {!isContratante &&
        <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold">Serviços</p>
                {!contractorView && !editingServices &&
              <button onClick={startEditingServices} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Pencil className="w-3 h-3 text-primary" />
                  </button>
              }
              </div>
              {!editingServices ?
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {savedServices.map((s) =>
              <span key={s} className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
                      {servicosPF.find((sv) => sv.id === s)?.label || s}
                    </span>
              )}
                </div> :

            <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {servicosPF.map((servico) => {
                  const selected = tempServicos.includes(servico.id);
                  return (
                    <button
                      key={servico.id}
                      onClick={() => toggleServico(servico.id)}
                      className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`
                      }>

                          {servico.label}
                        </button>);

                })}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={cancelEditingServices}>
                      <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                    </Button>
                    <Button size="sm" className="flex-1 text-xs" onClick={saveEditingServices}>
                      <Check className="w-3.5 h-3.5 mr-1" /> Salvar
                    </Button>
                  </div>
                </div>
            }
            </CardContent>
          </Card>
        }

        {/* Contratante: Fotos do Estabelecimento - only for empresas */}
        {isContratante && contractorType === "empresas" &&
        <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-display font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Fotos do Estabelecimento
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                onClick={() => fachadaInputRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors overflow-hidden">

                  {fotoFachada ?
                <img src={fotoFachada} alt="Fachada" className="w-full h-full object-cover" /> :

                <>
                      <ImagePlus className="w-6 h-6 text-primary/60" />
                      <span className="text-[10px] text-primary/60 font-medium">Fachada</span>
                    </>
                }
                </button>
                <button
                onClick={() => internoInputRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors overflow-hidden">

                  {fotoInterno ?
                <img src={fotoInterno} alt="Ambiente Interno" className="w-full h-full object-cover" /> :

                <>
                      <ImagePlus className="w-6 h-6 text-primary/60" />
                      <span className="text-[10px] text-primary/60 font-medium">Ambiente Interno</span>
                    </>
                }
                </button>
              </div>
              <input ref={fachadaInputRef} type="file" accept="image/*" className="hidden" onChange={handleFachadaChange} />
              <input ref={internoInputRef} type="file" accept="image/*" className="hidden" onChange={handleInternoChange} />
            </CardContent>
          </Card>
        }


        {/* Freelancer: Disponibilidade */}
        {!isContratante &&
        <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Disponibilidade de horário
                </h3>
                {!contractorView && !editingAvailability &&
              <button onClick={startEditingAvailability} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Pencil className="w-3 h-3 text-primary" />
                  </button>
              }
              </div>
              {!editingAvailability ?
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 sm:gap-3">
                  {diasSemana.map((dia) => {
                const ativo = diasAtivos.includes(dia.key);
                return (
                  <div key={dia.key} className="flex flex-col items-center gap-1">
                        <span
                      className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold shrink-0 ${
                      ativo ?
                      "bg-primary text-primary-foreground" :
                      "bg-muted/50 text-muted-foreground"}`
                      }>
                          {dia.label}
                          {ativo &&
                      <span className="text-[9px] sm:text-[10px] mt-0.5 opacity-90 leading-tight whitespace-nowrap">{formatHorario(dia.key)}</span>
                      }
                        </span>
                      </div>);
                })}
                  </div> :

            <div className="space-y-3">
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {diasSemana.map((dia) => {
                  const ativo = diasAtivos.includes(dia.key);
                  return (
                    <div key={dia.key} className="flex flex-col items-center gap-1">
                          <button
                        onClick={() => toggleDia(dia.key)}
                        className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
                        ativo ?
                        "bg-primary text-primary-foreground border-primary shadow-sm" :
                        "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30"}`
                        }>

                            <span className="text-sm font-bold">{dia.label}</span>
                            {ativo &&
                        <span className="text-[10px] mt-0.5 opacity-90">{formatHorario(dia.key)}</span>
                        }
                          </button>
                          {ativo &&
                      <button
                        onClick={() => openHorario(dia.key)}
                        className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">

                              <Clock className="w-4 h-4 text-primary" />
                            </button>
                      }
                        </div>);

                })}
                  </div>
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={cancelEditingAvailability} disabled={savingAvailability}>
                       <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                     </Button>
                     <Button size="sm" className="flex-1 text-xs" onClick={saveEditingAvailability} disabled={savingAvailability}>
                       {savingAvailability ? (
                         <>
                           <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Salvando
                         </>
                       ) : (
                         <>
                           <Check className="w-3.5 h-3.5 mr-1" /> Salvar
                         </>
                       )}
                     </Button>
                   </div>
                </div>
            }
            </CardContent>
          </Card>
        }

        {/* Mídia - hidden for now */}

        {/* Menu - hidden in contractor view */}
        {!contractorView &&
        <Card>
            <CardContent className="p-2">
              {menuItems.map((item, i) =>
            <Link
              key={i}
              to={item.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">

                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
            )}
            </CardContent>
          </Card>
        }

        {/* Logout - hidden in contractor view */}
        {!contractorView &&
        <Button variant="ghost" onClick={logout} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
            <LogOut className="w-4 h-4" /> Sair da conta
          </Button>
        }
      </div>

      {/* Dialog de horário */}
      <Dialog open={!!horarioDialog} onOpenChange={(open) => !open && setHorarioDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Horário — {diaLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto w-full">
              <div className="space-y-2">
                <label className="text-sm font-medium">De</label>
                <select value={tempDe} onChange={(e) => setTempDe(e.target.value)} className="w-full border rounded-lg px-4 py-3 text-sm bg-background">
                  {horasDisponiveis.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Até</label>
                <select value={tempAte} onChange={(e) => setTempAte(e.target.value)} className="w-full border rounded-lg px-4 py-3 text-sm bg-background">
                  {horasDisponiveis.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setHorarioDialog(null)}>Cancelar</Button>
            <Button onClick={saveHorario}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Serviços Prestados */}
      <Dialog open={servicosDialog} onOpenChange={setServicosDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vagas Desejadas</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {servicosPF.map((servico) =>
            <label
              key={servico.id}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
              tempServicos.includes(servico.id) ?
              "bg-primary/10 border border-primary/30" :
              "bg-muted/30 border border-transparent hover:bg-muted/50"}`
              }>

                <Checkbox checked={tempServicos.includes(servico.id)} onCheckedChange={() => toggleServico(servico.id)} />
                <span className="text-sm font-medium">{servico.label}</span>
              </label>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setServicosDialog(false)}>Cancelar</Button>
            <Button onClick={saveServicos}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>);

};

export default Perfil;