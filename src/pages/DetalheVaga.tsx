import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, User, MessageCircle, ShieldCheck, CheckCircle, DollarSign, ChevronRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const allVagas = [
  { id: 1, title: "Churrasco - Aniversário 30 anos", client: "Ana Oliveira", phone: "(11) 99999-1234", address: "Rua das Flores, 123 - Vila Mariana, São Paulo, SP", date: "22 Fev 2026", time: "14:00 - 22:00", location: "São Paulo, SP", status: "aceita", value: "R$ 650", timeline: { aceite: true, inicio: false, fim: false, pagamento: false } },
  { id: 2, title: "Bartender - Evento Corporativo", client: "Tech Corp", phone: "(11) 98888-5678", address: "Av. Paulista, 1000 - Bela Vista, São Paulo, SP", date: "28 Fev 2026", time: "18:00 - 00:00", location: "Campinas, SP", status: "aceita", value: "R$ 1.200", timeline: { aceite: true, inicio: false, fim: false, pagamento: false } },
  { id: 3, title: "Garçom - Casamento", client: "Maria Santos", phone: "(11) 97777-9012", address: "Salão de Festas Aurora, Rua Central, 500 - Guarulhos, SP", date: "08 Mar 2026", time: "16:00 - 23:00", location: "Guarulhos, SP", status: "preenchida", value: "R$ 800", timeline: { aceite: true, inicio: true, fim: true, pagamento: true } },
  { id: 4, title: "Churrasco - Confraternização", client: "Empresa X", phone: "(11) 96666-3456", address: "Chácara Boa Vista, Estrada Rural, 200 - Osasco, SP", date: "15 Mar 2026", time: "12:00 - 18:00", location: "Osasco, SP", status: "aceita", value: "R$ 900", timeline: { aceite: true, inicio: false, fim: false, pagamento: false } },
  // Histórico
  { id: 101, title: "Churrasco - Réveillon", client: "Pedro Costa", phone: "(11) 95555-7890", address: "Praia Grande, Av. Beira Mar, 100 - SP", date: "31 Dez 2025", time: "20:00 - 04:00", location: "São Paulo, SP", status: "concluida", value: "R$ 2.000", timeline: { aceite: true, inicio: true, fim: true, pagamento: true } },
  { id: 102, title: "Bartender - Formatura", client: "Faculdade ABC", phone: "(11) 94444-1234", address: "Centro de Convenções, Rua Universitária, 50 - Santo André, SP", date: "20 Dez 2025", time: "19:00 - 03:00", location: "Santo André, SP", status: "concluida", value: "R$ 1.500", timeline: { aceite: true, inicio: true, fim: true, pagamento: true } },
  // Vagas disponíveis na região
  { id: 201, title: "Aniversário 50 anos", client: "Roberto Lima", phone: "(11) 93333-5678", address: "Rua dos Lírios, 45 - Vila Mariana, SP", date: "25 Fev 2026", time: "18:00 - 00:00", location: "Vila Mariana, SP", status: "aberta", value: "R$ 120", timeline: { aceite: false, inicio: false, fim: false, pagamento: false } },
  { id: 202, title: "Happy Hour Corporativo", client: "StartUp Inc", phone: "(11) 92222-9012", address: "Rua Oscar Freire, 300 - Pinheiros, SP", date: "27 Fev 2026", time: "17:00 - 22:00", location: "Pinheiros, SP", status: "aberta", value: "R$ 100", timeline: { aceite: false, inicio: false, fim: false, pagamento: false } },
  { id: 203, title: "Casamento - Buffet", client: "Juliana Mendes", phone: "(11) 91111-3456", address: "Espaço Garden, Av. Moema, 800 - Moema, SP", date: "01 Mar 2026", time: "14:00 - 22:00", location: "Moema, SP", status: "aberta", value: "R$ 200", timeline: { aceite: false, inicio: false, fim: false, pagamento: false } },
  { id: 204, title: "Evento Beneficente", client: "ONG Esperança", phone: "(11) 90000-7890", address: "Centro Comunitário, Rua Itaim, 150 - Itaim Bibi, SP", date: "05 Mar 2026", time: "10:00 - 16:00", location: "Itaim Bibi, SP", status: "aberta", value: "R$ 120", timeline: { aceite: false, inicio: false, fim: false, pagamento: false } },
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

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-3xl mx-auto pb-8 space-y-6">
        {/* Header */}
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
            ← Voltar
          </button>
          <h1 className="text-2xl font-display font-bold">{vaga.title}</h1>
          <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
            vaga.status === "aceita" ? "bg-primary-light text-primary" :
            vaga.status === "preenchida" ? "bg-success-light text-success" :
            vaga.status === "aberta" ? "bg-warning-light text-warning" :
            "bg-muted text-muted-foreground"
          }`}>
            {vaga.status === "concluida" ? "concluída" : vaga.status}
          </span>
        </div>

        {/* Info do Evento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Detalhes do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold">{vaga.date}</p>
                <p className="text-xs text-muted-foreground">Data</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold">{vaga.time}</p>
                <p className="text-xs text-muted-foreground">Horário</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-success shrink-0" />
              <div>
                <p className="text-sm font-semibold text-success">{vaga.value}</p>
                <p className="text-xs text-muted-foreground">Valor</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contratante */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Contratante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm font-semibold">{vaga.client}</p>
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
                    {/* Line */}
                    {!isLast && (
                      <div className={`absolute left-[-16px] top-8 w-0.5 h-[calc(100%-16px)] ${done ? "bg-primary" : "bg-border"}`} />
                    )}
                    {/* Dot */}
                    <div className={`absolute left-[-22px] top-1 w-3 h-3 rounded-full border-2 ${
                      done ? "bg-primary border-primary" : "bg-background border-border"
                    }`} />
                    <div>
                      <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {done ? "✓ Concluído" : "Pendente"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DetalheVaga;
