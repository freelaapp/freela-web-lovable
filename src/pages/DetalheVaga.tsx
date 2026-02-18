import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, User, MessageCircle, ShieldCheck, CheckCircle, DollarSign, Home, Building2, Briefcase, ExternalLink, Ban, Check, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AppLayout from "@/components/layout/AppLayout";

type VagaType = "casa" | "empresas";

const allVagas = [
  { id: 1, title: "Churrasco - Aniversário 30 anos", client: "Ana Oliveira", clientId: "c1", phone: "(11) 99999-1234", address: "Rua das Flores, 123 - Centro, Jundiaí, SP", date: "22 Fev 2026", time: "14:00 - 22:00", hours: 8, role: "Churrasqueiro", location: "Jundiaí, SP", status: "aceita", value: "R$ 650", type: "casa" as VagaType, timeline: { aceite: true, inicio: false, fim: false, pagamento: false } },
  { id: 2, title: "Bartender - Evento Corporativo", client: "Tech Corp", clientId: "c2", phone: "(11) 98888-5678", address: "Av. Jundiaí, 1000 - Anhangabaú, Jundiaí, SP", date: "28 Fev 2026", time: "18:00 - 00:00", hours: 6, role: "Bartender", location: "Jundiaí, SP", status: "aceita", value: "R$ 1.200", type: "empresas" as VagaType, timeline: { aceite: true, inicio: false, fim: false, pagamento: false } },
  { id: 3, title: "Garçom - Casamento", client: "Maria Santos", clientId: "c3", phone: "(11) 97777-9012", address: "Salão de Festas Aurora, Rua Central, 500 - Eloy Chaves, Jundiaí, SP", date: "08 Mar 2026", time: "16:00 - 23:00", hours: 7, role: "Garçom", location: "Jundiaí, SP", status: "preenchida", value: "R$ 800", type: "casa" as VagaType, timeline: { aceite: true, inicio: true, fim: true, pagamento: true } },
  { id: 4, title: "Churrasco - Confraternização", client: "Empresa X", clientId: "c4", phone: "(11) 96666-3456", address: "Chácara Boa Vista, Estrada Rural, 200 - Vila Arens, Jundiaí, SP", date: "15 Mar 2026", time: "12:00 - 18:00", hours: 6, role: "Churrasqueiro", location: "Jundiaí, SP", status: "aceita", value: "R$ 900", type: "empresas" as VagaType, timeline: { aceite: true, inicio: false, fim: false, pagamento: false } },
  { id: 101, title: "Churrasco - Réveillon", client: "Pedro Costa", clientId: "c5", phone: "(11) 95555-7890", address: "Rua Beira Rio, 100 - Jundiaí, SP", date: "31 Dez 2025", time: "20:00 - 04:00", hours: 8, role: "Churrasqueiro", location: "Jundiaí, SP", status: "concluida", value: "R$ 2.000", type: "casa" as VagaType, timeline: { aceite: true, inicio: true, fim: true, pagamento: true } },
  { id: 102, title: "Bartender - Formatura", client: "Faculdade ABC", clientId: "c6", phone: "(11) 94444-1234", address: "Centro de Convenções, Rua Universitária, 50 - Ponte São João, Jundiaí, SP", date: "20 Dez 2025", time: "19:00 - 03:00", hours: 8, role: "Bartender", location: "Jundiaí, SP", status: "concluida", value: "R$ 1.500", type: "empresas" as VagaType, timeline: { aceite: true, inicio: true, fim: true, pagamento: true } },
  { id: 201, title: "Aniversário 50 anos", client: "Roberto Lima", clientId: "c7", phone: "(11) 93333-5678", address: "Rua dos Lírios, 45 - Centro, Jundiaí, SP", date: "25 Fev 2026", time: "18:00 - 00:00", hours: 6, role: "Garçom", location: "Centro, Jundiaí", status: "aberta", value: "R$ 120", type: "casa" as VagaType, timeline: { aceite: false, inicio: false, fim: false, pagamento: false } },
  { id: 202, title: "Happy Hour Corporativo", client: "StartUp Inc", clientId: "c8", phone: "(11) 92222-9012", address: "Rua Barão de Jundiaí, 300 - Anhangabaú, Jundiaí, SP", date: "27 Fev 2026", time: "17:00 - 22:00", hours: 5, role: "Bartender", location: "Anhangabaú, Jundiaí", status: "aberta", value: "R$ 100", type: "empresas" as VagaType, timeline: { aceite: false, inicio: false, fim: false, pagamento: false } },
  { id: 203, title: "Casamento - Buffet", client: "Juliana Mendes", clientId: "c9", phone: "(11) 91111-3456", address: "Espaço Garden, Av. Eloy Chaves, 800 - Jundiaí, SP", date: "01 Mar 2026", time: "14:00 - 22:00", hours: 8, role: "Churrasqueiro", location: "Eloy Chaves, Jundiaí", status: "aberta", value: "R$ 200", type: "casa" as VagaType, timeline: { aceite: false, inicio: false, fim: false, pagamento: false } },
  { id: 204, title: "Evento Beneficente", client: "ONG Esperança", clientId: "c10", phone: "(11) 90000-7890", address: "Centro Comunitário, Rua Vila Arens, 150 - Jundiaí, SP", date: "05 Mar 2026", time: "10:00 - 16:00", hours: 6, role: "Cozinheiro", location: "Vila Arens, Jundiaí", status: "aberta", value: "R$ 120", type: "empresas" as VagaType, timeline: { aceite: false, inicio: false, fim: false, pagamento: false } },
];

const timelineSteps = [
  { key: "aceite", label: "Aceite da Vaga", icon: CheckCircle },
  { key: "inicio", label: "Início do Trabalho", icon: Clock },
  { key: "fim", label: "Final do Trabalho", icon: CheckCircle },
  { key: "pagamento", label: "Pagamento", icon: DollarSign },
];

const DetalheVaga = () => {
  const { vagaId } = useParams();
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const vaga = allVagas.find(v => v.id === Number(vagaId));

  if (!vaga) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 text-center">
          <p className="text-muted-foreground">Vaga não encontrada</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  const canConfirm = vaga.status === "aceita" && !vaga.timeline.inicio;
  const userRole = "Bartender";
  const isCompatible = vaga.role === userRole;
  const isOpen = vaga.status === "aberta";

  const handleApply = () => {
    setApplied(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-3xl mx-auto pb-8 space-y-6">
        {/* Header */}
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
            ← Voltar
          </button>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold">{vaga.title}</h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">
                    {vaga.type === "casa" ? (
                      <Home className="w-5 h-5 text-primary" />
                    ) : (
                      <Building2 className="w-5 h-5 text-accent" />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {vaga.type === "casa" ? "Freela em Casa" : "Freela para Empresas"}
                </TooltipContent>
              </Tooltip>
            </div>
            {isOpen && !applied && isCompatible && (
              <Button size="lg" className="gap-2 text-base" onClick={handleApply}>
                <CheckCircle className="w-5 h-5" /> Se Aplicar
              </Button>
            )}
            {isOpen && applied && (
              <Button
                size="lg"
                className="gap-2 text-base bg-emerald-500 text-white hover:bg-destructive transition-colors group"
                onClick={() => setApplied(false)}
              >
                <Check className="w-5 h-5 group-hover:hidden" />
                <X className="w-5 h-5 hidden group-hover:block" />
                <span className="group-hover:hidden">Aplicado</span>
                <span className="hidden group-hover:inline">Cancelar Aplicação</span>
              </Button>
            )}
            {isOpen && !applied && !isCompatible && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="lg" className="gap-2 text-base" disabled variant="secondary">
                    <Ban className="w-5 h-5" /> Perfil Indisponível
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Vaga incompatível com seu perfil</TooltipContent>
              </Tooltip>
            )}
          </div>
          <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
            vaga.status === "aceita" ? "bg-primary-light text-primary" :
            vaga.status === "preenchida" ? "bg-success-light text-success" :
            vaga.status === "aberta" ? "bg-warning-light text-warning" :
            "bg-muted text-muted-foreground"
          }`}>
            {vaga.status === "concluida" ? "concluída" : vaga.status}
          </span>
        </div>

        {/* Detalhes do Evento - Grid 3x2 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Detalhes do Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <Calendar className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{vaga.date}</p>
                  <p className="text-[10px] text-muted-foreground">Data</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <Clock className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{vaga.time}</p>
                  <p className="text-[10px] text-muted-foreground">Horário</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-success-light/50 hover:bg-success-light transition-colors cursor-default text-center">
                <DollarSign className="w-6 h-6 text-success" />
                <div>
                  <p className="text-sm font-bold text-success">{vaga.value}</p>
                  <p className="text-[10px] text-muted-foreground">Valor</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <Briefcase className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{vaga.role}</p>
                  <p className="text-[10px] text-muted-foreground">Função</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <Clock className="w-6 h-6 text-accent" />
                <div>
                  <p className="text-sm font-bold">{vaga.hours}h</p>
                  <p className="text-[10px] text-muted-foreground">Duração</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <MapPin className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold truncate max-w-[120px]">{vaga.location}</p>
                  <p className="text-[10px] text-muted-foreground">Local</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contratante */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Contratante</CardTitle>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/perfil-contratante/${vaga.clientId}`)}>
                Ver perfil <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border-2 border-primary/20">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">{vaga.client}</p>
                <p className="text-xs text-muted-foreground">{vaga.type === "casa" ? "Pessoa Física" : "Empresa"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm">{vaga.phone}</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm">{vaga.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/mensagens")}>
            <MessageCircle className="w-4 h-4" /> Mensagem
          </Button>
          {canConfirm && (
            <Button className="gap-2" onClick={() => navigate(`/confirmar-servico/${vaga.id}`)}>
              <ShieldCheck className="w-4 h-4" /> Confirmar Entrada
            </Button>
          )}
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              {timelineSteps.map((step, i) => {
                const done = vaga.timeline[step.key as keyof typeof vaga.timeline];
                const isLast = i === timelineSteps.length - 1;
                return (
                  <div key={step.key} className="relative pb-6 last:pb-0">
                    {!isLast && (
                      <div className={`absolute left-[-16px] top-8 w-0.5 h-[calc(100%-16px)] ${done ? "bg-primary" : "bg-border"}`} />
                    )}
                    <div className={`absolute left-[-22px] top-1 w-3 h-3 rounded-full border-2 ${
                      done ? "bg-primary border-primary" : "bg-background border-border"
                    }`} />
                    <div>
                      <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                      <p className="text-xs text-muted-foreground">{done ? "✓ Concluído" : "Pendente"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        {/* Popup de sucesso */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-sm text-center border-emerald-500 bg-emerald-50">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-700">Aplicação Concluída</h2>
              <p className="text-sm text-emerald-600">Sua candidatura foi enviada com sucesso!</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default DetalheVaga;
