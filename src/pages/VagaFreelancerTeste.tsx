import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, DollarSign, Briefcase, User, CheckCircle, Check, ExternalLink, Shield, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const mockVaga = {
  id: "teste-free-001",
  establishment: "Buffet Villa Real",
  address: "Rua das Flores, 1200 - Centro, Jundiaí - SP, 13201-000",
  description: "Evento corporativo para 200 pessoas com serviço completo de buffet e coquetel.",
  assignment: "Garçom",
  jobDate: "2026-04-15",
  jobTime: "8 horas",
  jobValue: "R$ 350,00",
  status: "open",
  contractorName: "Maria Silva Eventos",
  contractorId: "contractor-001",
  contractorRating: 4.7,
  contractorReviews: 23,
  contractorJobs: 58,
  contractorVerified: true,
};

const defaultTimelineSteps = [
  { key: "aceite", label: "Aceite da Vaga" },
  { key: "inicio", label: "Início do Trabalho" },
  { key: "fim", label: "Final do Trabalho" },
  { key: "pagamento", label: "Pagamento" },
];

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

const VagaFreelancerTeste = () => {
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const vaga = mockVaga;
  const formattedDate = formatDate(vaga.jobDate);

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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-display font-bold">{vaga.assignment}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-warning-light text-warning font-medium">PÁGINA DE TESTE</span>
          </div>
          <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium bg-success-light text-success">
            Aberta
          </span>
        </div>

        {/* Detalhes do Evento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Detalhes do Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <Calendar className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{formattedDate}</p>
                  <p className="text-[10px] text-muted-foreground">Data</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <Clock className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{vaga.jobTime}</p>
                  <p className="text-[10px] text-muted-foreground">Duração</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-success-light/50 hover:bg-success-light transition-colors cursor-default text-center">
                <DollarSign className="w-6 h-6 text-success" />
                <div>
                  <p className="text-sm font-bold text-success">{vaga.jobValue}</p>
                  <p className="text-[10px] text-muted-foreground">Valor</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center">
                <Briefcase className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{vaga.assignment}</p>
                  <p className="text-[10px] text-muted-foreground">Função</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default text-center col-span-2">
                <MapPin className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold truncate max-w-[250px]">{vaga.address}</p>
                  <p className="text-[10px] text-muted-foreground">Local</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Descrição */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{vaga.description}</p>
          </CardContent>
        </Card>

        {/* Contratante */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all"
          onClick={() => navigate(`/perfil-contratante/${vaga.contractorId}`)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Contratante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border-2 border-primary/20">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold">{vaga.contractorName}</p>
                  {vaga.contractorVerified && <Shield className="w-3.5 h-3.5 text-primary fill-primary/20" />}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-xs font-medium">{vaga.contractorRating}</span>
                  <span className="text-xs text-muted-foreground">({vaga.contractorReviews} avaliações)</span>
                  <span className="text-xs text-muted-foreground ml-1">• {vaga.contractorJobs} eventos</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Linha do Tempo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              {defaultTimelineSteps.map((step, i) => {
                const isLast = i === defaultTimelineSteps.length - 1;
                const isDone = false;
                const isInProgress = i === 0 && !applied;
                const isPending = !isDone && !isInProgress;

                return (
                  <div key={step.key} className="relative pb-6 last:pb-0">
                    {!isLast && (
                      <div className={`absolute left-[-18px] top-6 w-0.5 h-full ${isDone ? "bg-primary" : "bg-border"}`} />
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`absolute left-[-24px] w-4 h-4 rounded-full border-2 ${
                        isDone ? "bg-primary border-primary" : isInProgress ? "bg-background border-primary" : "bg-background border-border"
                      }`}>
                        {isDone && <CheckCircle className="w-3 h-3 text-primary-foreground absolute top-0 left-0" />}
                      </div>
                      <p className={`text-sm ${isDone ? "text-foreground font-medium" : isInProgress ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Botão de ação */}
        <div className="sticky bottom-20 lg:bottom-4 z-10">
          {!applied ? (
            <Button size="lg" className="w-full gap-2 text-base shadow-lg" onClick={handleApply}>
              <CheckCircle className="w-5 h-5" /> Se Aplicar
            </Button>
          ) : (
            <Button size="lg" className="w-full gap-2 text-base bg-emerald-500 hover:bg-emerald-500 text-white cursor-default shadow-lg" disabled>
              <Check className="w-5 h-5" /> Aplicado
            </Button>
          )}
        </div>

        {/* Success toast overlay */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
            <div className="bg-background rounded-2xl p-8 shadow-xl flex flex-col items-center gap-4 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="text-lg font-display font-bold">Candidatura enviada!</p>
              <p className="text-sm text-muted-foreground text-center max-w-[250px]">
                Você se candidatou para esta vaga. Aguarde a resposta do contratante.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default VagaFreelancerTeste;
