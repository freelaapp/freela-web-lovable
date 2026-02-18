import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, CreditCard, HelpCircle, LogOut, ChevronRight, Star, Shield, Mail, Clock, Briefcase, Camera, Video, ImagePlus, Building2, MapPin, CalendarPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "@/components/layout/AppLayout";
import { servicosPF } from "@/lib/services";
import { useUserRole, setUserRole } from "@/hooks/useUserRole";

const freelancerMenuItems = [
  { icon: User, label: "Meus Dados", href: "/meus-dados", description: "Editar perfil e informações" },
  { icon: CreditCard, label: "Carteira", href: "/carteira", description: "Saldo, ganhos e histórico" },
  { icon: Settings, label: "Configurações", href: "/configuracoes", description: "Privacidade, notificações e conta" },
  { icon: HelpCircle, label: "Ajuda", href: "/ajuda", description: "Dúvidas e suporte" },
];

const contratanteMenuItems = [
  { icon: User, label: "Meus Dados", href: "/meus-dados", description: "Editar perfil e informações" },
  { icon: CreditCard, label: "Carteira", href: "/carteira", description: "Gastos e histórico de pagamentos" },
  { icon: CalendarPlus, label: "Criar Evento", href: "/criar-evento", description: "Contratar freelancers" },
  { icon: Settings, label: "Configurações", href: "/configuracoes", description: "Privacidade, notificações e conta" },
  { icon: HelpCircle, label: "Ajuda", href: "/ajuda", description: "Dúvidas e suporte" },
];

const diasSemana = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

const horasDisponiveis = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

type Horarios = Record<string, { de: string; ate: string }>;

const Perfil = () => {
  const navigate = useNavigate();
  const role = useUserRole();
  const isContratante = role === "contratante";
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fachadaInputRef = useRef<HTMLInputElement>(null);
  const internoInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [diasAtivos, setDiasAtivos] = useState<string[]>(["seg", "ter", "qua", "qui", "sex"]);
  const [horarios, setHorarios] = useState<Horarios>({
    seg: { de: "08:00", ate: "20:00" },
    ter: { de: "08:00", ate: "20:00" },
    qua: { de: "08:00", ate: "20:00" },
    qui: { de: "08:00", ate: "20:00" },
    sex: { de: "08:00", ate: "20:00" },
    sab: { de: "10:00", ate: "16:00" },
    dom: { de: "10:00", ate: "14:00" },
  });
  const [horarioDialog, setHorarioDialog] = useState<string | null>(null);
  const [tempDe, setTempDe] = useState("");
  const [tempAte, setTempAte] = useState("");

  // Serviços prestados (freelancer only)
  const [servicosDialog, setServicosDialog] = useState(false);
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>(["garcom", "barman", "churrasqueiro"]);
  const [tempServicos, setTempServicos] = useState<string[]>([]);

  // Mídia freelancer
  const [hasVideo, setHasVideo] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);

  // Fotos contratante
  const [fotoFachada, setFotoFachada] = useState<string | null>(null);
  const [fotoInterno, setFotoInterno] = useState<string | null>(null);

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
    setTempDe(horarios[key]?.de || "08:00");
    setTempAte(horarios[key]?.ate || "18:00");
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

  const formatHorario = (key: string) => {
    const h = horarios[key];
    if (!h) return "--";
    return `${h.de.replace(":00", "h")}-${h.ate.replace(":00", "h")}`;
  };

  const diaLabel = diasSemana.find((d) => d.key === horarioDialog)?.label || "";
  const menuItems = isContratante ? contratanteMenuItems : freelancerMenuItems;

  const switchRole = () => {
    const newRole = isContratante ? "freelancer" : "contratante";
    setUserRole(newRole);
    navigate(newRole === "contratante" ? "/dashboard-contratante" : "/dashboard-freelancer");
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0 group overflow-hidden"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{isContratante ? "AO" : "CS"}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg font-display font-bold">{isContratante ? "Ana Oliveira" : "Carlos Silva"}</h2>
                  <Shield className="w-4 h-4 text-primary fill-primary/20" />
                </div>
                <div className="flex items-center gap-1 text-sm text-primary font-medium">
                  <Star className="w-4 h-4 fill-primary" /> {isContratante ? "4.9" : "4.8"}
                  <span className="text-muted-foreground font-normal ml-1">•</span>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium ml-1">
                    {isContratante ? (
                      <><Building2 className="w-3 h-3" /> Contratante</>
                    ) : (
                      <><Briefcase className="w-3 h-3" /> Freelancer</>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{isContratante ? "ana.oliveira@email.com" : "carlos.silva@email.com"}</span>
                </div>
                {isContratante ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>São Paulo, SP</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>Pix • •••• 5678</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Switch Role */}
        <Button variant="outline" className="w-full gap-2" onClick={switchRole}>
          {isContratante ? (
            <><Briefcase className="w-4 h-4" /> Ir para Painel Freelancer</>
          ) : (
            <><Building2 className="w-4 h-4" /> Ir para Painel Contratante</>
          )}
        </Button>

        {/* Contratante: Fotos do Estabelecimento */}
        {isContratante && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-display font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Fotos do Estabelecimento
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fachadaInputRef.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors overflow-hidden"
                >
                  {fotoFachada ? (
                    <img src={fotoFachada} alt="Fachada" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="w-6 h-6 text-primary/60" />
                      <span className="text-[10px] text-primary/60 font-medium">Fachada</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => internoInputRef.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors overflow-hidden"
                >
                  {fotoInterno ? (
                    <img src={fotoInterno} alt="Ambiente Interno" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="w-6 h-6 text-primary/60" />
                      <span className="text-[10px] text-primary/60 font-medium">Ambiente Interno</span>
                    </>
                  )}
                </button>
              </div>
              <input ref={fachadaInputRef} type="file" accept="image/*" className="hidden" onChange={handleFachadaChange} />
              <input ref={internoInputRef} type="file" accept="image/*" className="hidden" onChange={handleInternoChange} />
            </CardContent>
          </Card>
        )}

        {/* Freelancer: Mídia */}
        {!isContratante && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-display font-bold flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Mídia
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => navigate(hasVideo ? "#" : "/video-apresentacao")}
                  className="aspect-square rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors relative overflow-hidden"
                >
                  {hasVideo ? (
                    <>
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <Video className="w-8 h-8 text-primary" />
                      </div>
                      <span className="absolute bottom-1 text-[10px] font-medium text-primary">Vídeo</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-6 h-6 text-primary/60" />
                      <span className="text-[10px] text-primary/60 font-medium">+ Vídeo</span>
                    </>
                  )}
                </button>
                {fotos.map((foto, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={foto} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {Array.from({ length: 3 - fotos.length }).map((_, i) => (
                  <button
                    key={`empty-${i}`}
                    onClick={() => photoInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex flex-col items-center justify-center gap-1 hover:bg-muted/50 transition-colors"
                  >
                    <ImagePlus className="w-5 h-5 text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground/40">Foto</span>
                  </button>
                ))}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} />
            </CardContent>
          </Card>
        )}

        {/* Freelancer: Disponibilidade */}
        {!isContratante && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-display font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Disponibilidade e Serviço
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {diasSemana.map((dia) => {
                  const ativo = diasAtivos.includes(dia.key);
                  return (
                    <div key={dia.key} className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => toggleDia(dia.key)}
                        className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
                          ativo
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30"
                        }`}
                      >
                        <span className="text-sm font-bold">{dia.label}</span>
                        {ativo && (
                          <span className="text-[10px] mt-0.5 opacity-90">{formatHorario(dia.key)}</span>
                        )}
                      </button>
                      {ativo && (
                        <button
                          onClick={() => openHorario(dia.key)}
                          className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                        >
                          <Clock className="w-4 h-4 text-primary" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full" onClick={openServicos}>
                <Briefcase className="w-4 h-4 mr-2" />
                Serviços Prestados ({servicosSelecionados.length})
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Menu */}
        <Card>
          <CardContent className="p-2">
            {menuItems.map((item, i) => (
              <Link
                key={i}
                to={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
          <LogOut className="w-4 h-4" /> Sair da conta
        </Button>
      </div>

      {/* Dialog de horário */}
      <Dialog open={!!horarioDialog} onOpenChange={(open) => !open && setHorarioDialog(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Horário — {diaLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">De</label>
              <select value={tempDe} onChange={(e) => setTempDe(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                {horasDisponiveis.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Até</label>
              <select value={tempAte} onChange={(e) => setTempAte(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
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

      {/* Dialog de Serviços Prestados */}
      <Dialog open={servicosDialog} onOpenChange={setServicosDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Serviços Prestados</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {servicosPF.map((servico) => (
              <label
                key={servico.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  tempServicos.includes(servico.id)
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-muted/30 border border-transparent hover:bg-muted/50"
                }`}
              >
                <Checkbox checked={tempServicos.includes(servico.id)} onCheckedChange={() => toggleServico(servico.id)} />
                <span className="text-sm font-medium">{servico.label}</span>
              </label>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setServicosDialog(false)}>Cancelar</Button>
            <Button onClick={saveServicos}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Perfil;
