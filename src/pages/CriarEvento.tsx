import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, Briefcase, ArrowRight, Calculator, Home, Info } from "lucide-react";
import { useMode } from "@/contexts/ModeContext";
import { servicosPF, calcularValorTotal } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";

const CriarEvento = () => {
  const { isFreelaCasa, mode } = useMode();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    tipoServico: "",
    quantidade: 1,
    horas: 4,
    data: "",
    horario: "",
    endereco: "",
    // Campos apenas para PJ
    valorManual: "",
    descricao: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const servicoSelecionado = useMemo(() => {
    return servicosPF.find(s => s.id === formData.tipoServico);
  }, [formData.tipoServico]);

  const valorCalculado = useMemo(() => {
    if (!servicoSelecionado) return null;
    const hours = Math.max(formData.horas, servicoSelecionado.minHours);
    return calcularValorTotal(
      servicoSelecionado.pricePerHour,
      hours,
      formData.quantidade,
      servicoSelecionado.insuranceFee
    );
  }, [servicoSelecionado, formData.horas, formData.quantidade]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Evento criado com sucesso!",
        description: "Você receberá notificações quando freelancers aceitarem.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto container-padding">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Home className="w-4 h-4" />
                <span>{isFreelaCasa ? "Freela em Casa" : "Freela para Empresas"}</span>
              </div>
              <h1 className="text-3xl font-display font-bold mb-2">
                {isFreelaCasa 
                  ? "Contrate um profissional para seu evento" 
                  : "Criar nova contratação"}
              </h1>
              <p className="text-muted-foreground">
                {isFreelaCasa
                  ? "Preencha os dados do seu evento particular"
                  : "Configure os detalhes da contratação corporativa"}
              </p>
            </div>

            {/* Info Box for PF */}
            {isFreelaCasa && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Evento particular em residência
                  </p>
                  <p className="text-sm text-muted-foreground">
                    O valor é calculado automaticamente. Simples e sem negociação.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Serviço */}
              <div className="space-y-2">
                <Label htmlFor="tipoServico" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Tipo de serviço
                </Label>
                <Select
                  value={formData.tipoServico}
                  onValueChange={(value) => handleChange("tipoServico", value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {isFreelaCasa ? (
                      servicosPF.map((servico) => (
                        <SelectItem key={servico.id} value={servico.id}>
                          {servico.label}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="garcom">Garçom</SelectItem>
                        <SelectItem value="recepcionista">Recepcionista</SelectItem>
                        <SelectItem value="promotor">Promotor de Eventos</SelectItem>
                        <SelectItem value="seguranca">Segurança</SelectItem>
                        <SelectItem value="copeiro">Copeiro</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantidade de Profissionais */}
              <div className="space-y-2">
                <Label htmlFor="quantidade" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Quantidade de profissionais
                </Label>
                <Select
                  value={formData.quantidade.toString()}
                  onValueChange={(value) => handleChange("quantidade", parseInt(value))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "profissional" : "profissionais"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantidade de Horas */}
              <div className="space-y-2">
                <Label htmlFor="horas" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Quantidade de horas
                </Label>
                <Select
                  value={formData.horas.toString()}
                  onValueChange={(value) => handleChange("horas", parseInt(value))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} horas
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data do evento
                  </Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleChange("data", e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário de início
                  </Label>
                  <Input
                    id="horario"
                    type="time"
                    value={formData.horario}
                    onChange={(e) => handleChange("horario", e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="endereco" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {isFreelaCasa ? "Endereço do evento" : "Local do trabalho"}
                </Label>
                <Input
                  id="endereco"
                  type="text"
                  placeholder={isFreelaCasa ? "Sua casa ou local do evento" : "Endereço do estabelecimento"}
                  value={formData.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              {/* Campos extras para PJ */}
              {!isFreelaCasa && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="valorManual">Valor proposto (por profissional)</Label>
                    <Input
                      id="valorManual"
                      type="text"
                      placeholder="R$ 0,00"
                      value={formData.valorManual}
                      onChange={(e) => handleChange("valorManual", e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição do trabalho</Label>
                    <textarea
                      id="descricao"
                      placeholder="Descreva as atividades esperadas..."
                      value={formData.descricao}
                      onChange={(e) => handleChange("descricao", e.target.value)}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </>
              )}

              {/* Cálculo automático para PF */}
              {isFreelaCasa && valorCalculado && servicoSelecionado && (
                <div className="bg-muted rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calculator className="w-4 h-4" />
                    Valor total do serviço
                  </div>
                  {formData.horas < servicoSelecionado.minHours && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                      ⚠️ Jornada mínima de {servicoSelecionado.minHours}h para {servicoSelecionado.label}. O cálculo considera {servicoSelecionado.minHours}h.
                    </p>
                  )}
                  <div className="text-4xl font-display font-bold text-primary">
                    R$ {valorCalculado.total.toFixed(2).replace(".", ",")}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{formData.quantidade} {formData.quantidade === 1 ? "profissional" : "profissionais"} × {Math.max(formData.horas, servicoSelecionado.minHours)} horas</p>
                    <p>Taxa de seguro: R$ {valorCalculado.insurance.toFixed(2).replace(".", ",")}</p>
                    <p className="text-xs">Freelancer recebe: R$ {valorCalculado.freelancerValue.toFixed(2).replace(".", ",")} cada</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-base"
                disabled={isLoading || !formData.tipoServico}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Criando evento...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isFreelaCasa ? "Contratar profissional" : "Publicar contratação"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Link para freelancers */}
            <p className="mt-6 text-center text-muted-foreground">
              Quer ver os profissionais disponíveis?{" "}
              <Link to="/freelancers" className="text-primary font-semibold hover:underline">
                Ver freelancers
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CriarEvento;
