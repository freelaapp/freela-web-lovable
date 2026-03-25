import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Briefcase, ArrowRight, Calculator, Home, Info, FileText, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useMode } from "@/contexts/ModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { servicosPF, calcularValorTotal } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import CriarEventoEmpresas from "@/components/criar-evento/CriarEventoEmpresas";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const horasDisponiveis = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);

const CriarEvento = () => {
  const { isFreelaCasa, mode } = useMode();
  const { role } = useAuth();
  const isEmpresasMode = !isFreelaCasa || role === "contratante";
  const [searchParams] = useSearchParams();
  const freelancerExclusivo = searchParams.get("para");
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    tipoServico: "",
    quantidade: 1,
    horas: 4,
    data: "",
    horario: "",
    endereco: "",
    descricao: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const servicoSelecionado = useMemo(() => {
    return servicosPF.find(s => s.id === formData.tipoServico);
  }, [formData.tipoServico]);

  const minHours = useMemo(() => {
    if (!servicoSelecionado) return 0;
    return isFreelaCasa ? servicoSelecionado.minHoursCasa : servicoSelecionado.minHoursEmpresa;
  }, [servicoSelecionado, isFreelaCasa]);

    const valorCalculado = useMemo(() => {
      if (!servicoSelecionado) return null;
      const hours = Math.max(formData.horas, minHours);
      const baseCalc = calcularValorTotal(
        servicoSelecionado.pricePerHour,
        hours,
        formData.quantidade
      );
      
      // Add R$ 1,00 for Pix payment (secure)
      const totalComPix = baseCalc.total + 1.00;
      
      console.log('[CriarEvento] Debug calculation:', {
        pricePerHour: servicoSelecionado.pricePerHour,
        hours,
        quantidade: formData.quantidade,
        baseTotal: baseCalc.total,
        totalComPix: totalComPix.toFixed(2)
      });
      
      return {
        ...baseCalc,
        total: totalComPix
      };
    }, [servicoSelecionado, formData.horas, formData.quantidade, minHours]);

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
          {/* Empresas mode: new dynamic layout */}
          {isEmpresasMode ? (
            <CriarEventoEmpresas />
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Home className="w-4 h-4" />
                  <span>Freela em Casa</span>
                </div>
                {freelancerExclusivo ? (
                  <>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4 flex items-start gap-3">
                      <Users className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Proposta exclusiva para <span className="text-primary font-bold">{freelancerExclusivo}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Este evento será enviado diretamente para o freelancer selecionado.
                        </p>
                      </div>
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-2">
                      Criar evento para {freelancerExclusivo}
                    </h1>
                    <p className="text-muted-foreground">
                      Preencha os dados do evento. O freelancer receberá a proposta diretamente.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-display font-bold mb-2">
                      Contrate um profissional para seu evento
                    </h1>
                    <p className="text-muted-foreground">
                      Preencha os dados do seu evento particular
                    </p>
                  </>
                )}
              </div>

              {/* Info Box for PF */}
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
                      {servicosPF.map((servico) => (
                        <SelectItem key={servico.id} value={servico.id}>
                          {servico.label}
                        </SelectItem>
                      ))}
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
                      <CalendarIcon className="w-4 h-4" />
                      Data do evento
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal",
                            !formData.data && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.data
                            ? format(new Date(formData.data + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
                            : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.data ? new Date(formData.data + "T12:00:00") : undefined}
                          onSelect={(date) => {
                            if (date) handleChange("data", format(date, "yyyy-MM-dd"));
                          }}
                          initialFocus
                          className="pointer-events-auto"
                          captionLayout="dropdown-buttons"
                          fromYear={new Date().getFullYear()}
                          toYear={new Date().getFullYear() + 2}
                          locale={ptBR}
                          labels={{
                            labelMonthDropdown: () => "Mês",
                            labelYearDropdown: () => "Ano",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horario" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Horário de início
                    </Label>
                    <Select
                      value={formData.horario}
                      onValueChange={(value) => handleChange("horario", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {horasDisponiveis.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-2">
                  <Label htmlFor="endereco" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereço do evento
                  </Label>
                  <Input
                    id="endereco"
                    type="text"
                    placeholder="Sua casa ou local do evento"
                    value={formData.endereco}
                    onChange={(e) => handleChange("endereco", e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                   {/* Cálculo automático para PF */}
                     {valorCalculado && servicoSelecionado && (
                       <div className="bg-muted rounded-xl p-6 space-y-4">
                         <div className="flex items-center gap-2 text-sm font-medium">
                           <Calculator className="w-4 h-4" />
                           Valor total do serviço
                         </div>
                         {formData.horas < minHours && (
                           <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                             ⚠️ Jornada mínima de {minHours}h para {servicoSelecionado.label}. O cálculo considera {minHours}h.
                           </p>
                         )}
                         <div className="text-4xl font-display font-bold text-primary">
                           {formatCurrency(valorCalculado.total)}
                         </div>
                         <div className="text-sm text-muted-foreground space-y-2">
                           <p>{formData.quantidade} {formData.quantidade === 1 ? "profissional" : "profissionais"} × {Math.max(formData.horas, minHours)} horas</p>
                           <p className="text-xs">Freelancer recebe: {formatCurrency(valorCalculado.freelancerValue)} cada</p>
                           <p className="text-xs">Pagamento via Pix (seguro): R$ 1,00</p>
                         </div>
                       </div>
                     )}

                {/* Descrição da Vaga */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Descrição da vaga
                  </Label>
                  <Textarea
                    placeholder="Descreva detalhes importantes para os freelancers, como vestimenta, regras e comportamento esperado."
                    value={formData.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Informativo */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Contratação</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400/80">
                      Você pode criar vagas 1 hora antes do início à 3 meses antes do início.
                    </p>
                  </div>
                </div>

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
                      Contratar profissional
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CriarEvento;
