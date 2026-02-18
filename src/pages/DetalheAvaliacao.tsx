import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Clock, MapPin, Briefcase, DollarSign, AlertTriangle, CheckCircle, Upload, X, Image, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/layout/AppLayout";

const mockAvaliacoes = [
  {
    id: 1, type: "recebida",
    client: "Ana Oliveira", date: "31 Dez 2025", rating: 5,
    comment: "Carlos foi impecável! Super pontual e muito profissional.",
    service: { title: "Churrasco - Réveillon", role: "Churrasqueiro", location: "Jundiaí, SP", time: "20:00 - 04:00", hours: 8, value: "R$ 2.000" },
  },
  {
    id: 2, type: "recebida",
    client: "Tech Corp", date: "20 Dez 2025", rating: 5,
    comment: "Ótimo profissional, recomendo a todos.",
    service: { title: "Bartender - Formatura", role: "Bartender", location: "Jundiaí, SP", time: "19:00 - 03:00", hours: 8, value: "R$ 1.500" },
  },
  {
    id: 3, type: "recebida",
    client: "Maria Santos", date: "10 Dez 2025", rating: 4,
    comment: "Muito bom, apenas chegou um pouco atrasado.",
    service: { title: "Garçom - Casamento", role: "Garçom", location: "Jundiaí, SP", time: "16:00 - 23:00", hours: 7, value: "R$ 800" },
  },
  {
    id: 4, type: "feita",
    client: "Restaurante Sabor & Arte", date: "31 Dez 2025", rating: 4,
    comment: "Boa estrutura, equipe organizada. Apenas o estacionamento era difícil.",
    service: { title: "Churrasco - Réveillon", role: "Churrasqueiro", location: "Jundiaí, SP", time: "20:00 - 04:00", hours: 8, value: "R$ 2.000" },
  },
  {
    id: 5, type: "feita",
    client: "Buffet Estrela", date: "20 Dez 2025", rating: 5,
    comment: "Excelente local para trabalhar, muito bem organizado!",
    service: { title: "Bartender - Formatura", role: "Bartender", location: "Jundiaí, SP", time: "19:00 - 03:00", hours: 8, value: "R$ 1.500" },
  },
  {
    id: 6, type: "feita",
    client: "Bar do João", date: "10 Dez 2025", rating: 3,
    comment: "Ambiente ok, mas a cozinha poderia ser mais limpa.",
    service: { title: "Evento Especial", role: "Cozinheiro", location: "Jundiaí, SP", time: "18:00 - 00:00", hours: 6, value: "R$ 600" },
  },
];

const renderStars = (rating: number) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-5 h-5 ${i <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    ))}
  </div>
);

const DetalheAvaliacao = () => {
  const { avaliacaoId } = useParams();
  const navigate = useNavigate();
  const [showContestar, setShowContestar] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const avaliacao = mockAvaliacoes.find(a => a.id === Number(avaliacaoId));

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        navigate("/avaliacoes");
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  if (!avaliacao) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 text-center">
          <p className="text-muted-foreground">Avaliação não encontrada</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEnviar = () => {
    setShowContestar(false);
    setShowSuccess(true);
    setJustificativa("");
    setFiles([]);
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-3xl mx-auto pb-8 space-y-6">
        <button onClick={() => navigate("/avaliacoes")} className="text-sm text-primary flex items-center gap-1 hover:underline">
          ← Voltar para Avaliações
        </button>

        <div>
          <h1 className="text-2xl font-display font-bold">
            {avaliacao.type === "recebida" ? "Avaliação Recebida" : "Avaliação Feita"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">de {avaliacao.client} • {avaliacao.date}</p>
        </div>

        {/* Dados do Serviço */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Dados do Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                <Briefcase className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{avaliacao.service.title}</p>
                  <p className="text-[10px] text-muted-foreground">Evento</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                <Calendar className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{avaliacao.date}</p>
                  <p className="text-[10px] text-muted-foreground">Data</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-success-light/50 text-center">
                <DollarSign className="w-6 h-6 text-success" />
                <div>
                  <p className="text-sm font-bold text-success">{avaliacao.service.value}</p>
                  <p className="text-[10px] text-muted-foreground">Valor</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                <Briefcase className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{avaliacao.service.role}</p>
                  <p className="text-[10px] text-muted-foreground">Função</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                <Clock className="w-6 h-6 text-accent" />
                <div>
                  <p className="text-sm font-bold">{avaliacao.service.hours}h</p>
                  <p className="text-[10px] text-muted-foreground">Duração</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                <MapPin className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm font-bold">{avaliacao.service.location}</p>
                  <p className="text-[10px] text-muted-foreground">Local</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avaliação */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" /> Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {renderStars(avaliacao.rating)}
              <span className="text-sm font-bold">{avaliacao.rating}/5</span>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-foreground/80 italic">"{avaliacao.comment}"</p>
            </div>
            <p className="text-xs text-muted-foreground">Avaliado por: {avaliacao.client}</p>
          </CardContent>
        </Card>

        {/* Botão Contestar */}
        <Button
          variant="destructive"
          className="w-full gap-2 text-base"
          size="lg"
          onClick={() => setShowContestar(true)}
        >
          <AlertTriangle className="w-5 h-5" /> Contestar Avaliação
        </Button>

        {/* Dialog Contestar */}
        <Dialog open={showContestar} onOpenChange={setShowContestar}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" /> Contestar Avaliação
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Justificativa</label>
                <Textarea
                  placeholder="Explique o motivo da contestação..."
                  value={justificativa}
                  onChange={e => setJustificativa(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Anexar fotos ou vídeos (opcional)</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-muted transition-colors text-sm">
                    <Image className="w-4 h-4" /> Fotos
                    <Input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-muted transition-colors text-sm">
                    <Video className="w-4 h-4" /> Vídeos
                    <Input type="file" accept="video/*" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-lg">
                        <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1">{file.name}</span>
                        <button onClick={() => removeFile(i)} className="text-destructive hover:text-destructive/80">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowContestar(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleEnviar} disabled={!justificativa.trim()}>
                Enviar Contestação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Popup sucesso - 7 segundos */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-sm text-center border-emerald-500 bg-emerald-50">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-emerald-700">Contestação Enviada</h2>
              <p className="text-sm text-emerald-600">
                O suporte do Freela foi acionado para moderar o caso. Você será notificado sobre o resultado.
              </p>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2">
                <div className="bg-emerald-500 h-1.5 rounded-full animate-[shrink_7s_linear_forwards]" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default DetalheAvaliacao;
