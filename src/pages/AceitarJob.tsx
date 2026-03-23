import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Home,
  User,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dados mock do job
const jobMock = {
  id: "1",
  tipo: "casa", // "casa" ou "empresas"
  servico: "Churrasqueiro",
  cliente: {
    nome: "João Santos",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
  data: "15 de Fevereiro de 2026",
  horario: "14h",
  duracao: "6 horas",
  endereco: "Rua das Flores, 123 - Jardim Paulista, São Paulo - SP",
  valorFreelancer: 480.00,
  quantidade: 1,
};

const AceitarJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isEventoParticular = jobMock.tipo === "casa";

  const handleAceitar = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Trabalho aceito!",
        description: "Você receberá mais detalhes por email e notificação.",
      });
      navigate("/");
    }, 1500);
  };

  const handleRecusar = async () => {
    toast({
      title: "Trabalho recusado",
      description: "Sem problemas! Continue buscando outras oportunidades.",
      variant: "destructive",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto container-padding">
          <div className="max-w-2xl mx-auto">
            {/* Back link */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">
                Nova oportunidade de trabalho
              </h1>
              <p className="text-muted-foreground">
                Confira os detalhes e decida se deseja aceitar
              </p>
            </div>

            {/* Aviso de evento particular */}
            {isEventoParticular && (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Home className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-warning-foreground">
                    Evento particular em residência
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Este é um evento em casa de pessoa física. Sem impacto no seu score.
                  </p>
                </div>
              </div>
            )}

            {/* Card do Job */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Header do card */}
              <div className="bg-muted px-6 py-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <img
                    src={jobMock.cliente.foto}
                    alt={jobMock.cliente.nome}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">Contratante</p>
                    <p className="font-semibold">{jobMock.cliente.nome}</p>
                  </div>
                </div>
              </div>

              {/* Detalhes */}
              <div className="p-6 space-y-6">
                {/* Serviço */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Serviço</p>
                    <p className="font-semibold text-lg">{jobMock.servico}</p>
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-semibold">{jobMock.data}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horário</p>
                      <p className="font-semibold">{jobMock.horario} ({jobMock.duracao})</p>
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço do evento</p>
                    <p className="font-semibold">{jobMock.endereco}</p>
                  </div>
                </div>

                {/* Valor */}
                <div className="bg-success/10 border border-success/30 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-success">Valor que você irá receber</p>
                      <p className="text-2xl font-bold text-success">
                        {jobMock.valorFreelancer.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14"
                  onClick={handleRecusar}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Recusar
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-14"
                  onClick={handleAceitar}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Aceitando...
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Aceitar trabalho
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Aviso adicional */}
            <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>
                Ao aceitar, você se compromete a estar no local no horário combinado. 
                Cancelamentos sem justificativa podem afetar sua reputação na plataforma.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AceitarJob;
