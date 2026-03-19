import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck, CheckCircle, Copy, Eye } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ConfirmarServico = () => {
  const { vagaId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { toast } = useToast();
  const isContratante = role === "contratante";

  // Freelancer state
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"inicio" | "fim" | "concluido">("inicio");
  const [error, setError] = useState("");

  // Contratante state - generated codes
  const [codigoEntrada] = useState("482917");
  const [codigoSaida] = useState("731856");
  const [entradaConfirmada, setEntradaConfirmada] = useState(false);
  const [saidaConfirmada, setSaidaConfirmada] = useState(false);

  // Mock valid codes for freelancer
  const validCodes: Record<string, string> = {
    inicio: codigoEntrada,
    fim: codigoSaida,
  };

  const handleConfirm = () => {
    if (code.length !== 6) {
      setError("Digite o código completo de 6 dígitos");
      return;
    }
    if (code === validCodes[step]) {
      setError("");
      if (step === "inicio") {
        setStep("fim");
        setCode("");
      } else {
        setStep("concluido");
      }
    } else {
      setError("Código inválido. Verifique com o contratante.");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado!", description: "Compartilhe com o freelancer." });
  };

  // Contratante view - show codes
  if (isContratante) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-md mx-auto pb-8 space-y-6">
          <div>
            <button onClick={() => navigate(-1)} className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
              ← Voltar
            </button>
            <h1 className="text-2xl font-display font-bold">Confirmar Serviço</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Compartilhe os códigos com o freelancer para confirmar entrada e saída
            </p>
          </div>

          {/* Código de Entrada */}
          <Card className={entradaConfirmada ? "border-success/30 bg-success-light/10" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Código de Entrada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entradaConfirmada ? (
                <div className="flex items-center gap-3 justify-center py-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                  <span className="text-lg font-bold text-success">Entrada Confirmada</span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Informe este código ao freelancer quando ele chegar para iniciar o serviço:
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex gap-1.5">
                      {codigoEntrada.split("").map((digit, i) => (
                        <div key={i} className="w-12 h-14 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold font-display text-primary">
                          {digit}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full gap-2" onClick={() => copyCode(codigoEntrada)}>
                    <Copy className="w-4 h-4" /> Copiar Código
                  </Button>
                  <Button className="w-full" onClick={() => setEntradaConfirmada(true)}>
                    Simular Confirmação de Entrada
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Código de Saída */}
          <Card className={saidaConfirmada ? "border-success/30 bg-success-light/10" : !entradaConfirmada ? "opacity-50" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Código de Saída
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {saidaConfirmada ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <CheckCircle className="w-12 h-12 text-success" />
                  <span className="text-lg font-bold text-success">Serviço Concluído!</span>
                  <p className="text-sm text-muted-foreground text-center">O pagamento será processado em breve.</p>
                  <Button className="w-full mt-2" onClick={() => navigate("/agenda")}>
                    Voltar para Agenda
                  </Button>
                </div>
              ) : !entradaConfirmada ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Confirme a entrada primeiro para liberar o código de saída.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Informe este código ao freelancer ao final do serviço:
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex gap-1.5">
                      {codigoSaida.split("").map((digit, i) => (
                        <div key={i} className="w-12 h-14 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold font-display text-primary">
                          {digit}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full gap-2" onClick={() => copyCode(codigoSaida)}>
                    <Copy className="w-4 h-4" /> Copiar Código
                  </Button>
                  <Button className="w-full" onClick={() => setSaidaConfirmada(true)}>
                    Simular Confirmação de Saída
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Por que o código?</strong> O sistema de código protege tanto você quanto o freelancer,
                garantindo que o serviço foi prestado conforme combinado.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Freelancer view (original)
  if (step === "concluido") {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-md mx-auto pb-8 space-y-6">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-xl font-display font-bold">Serviço Concluído!</h2>
              <p className="text-sm text-muted-foreground">
                O serviço foi finalizado com sucesso. O pagamento será processado em breve.
              </p>
              <Button className="w-full" onClick={() => navigate(`/vaga/${vagaId}`)}>
                Ver Detalhes da Vaga
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/agenda")}>
                Voltar para Agenda
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-md mx-auto pb-8 space-y-6">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
            ← Voltar
          </button>
          <h1 className="text-2xl font-display font-bold">Confirmar Serviço</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {step === "inicio"
              ? "Insira o código fornecido pelo contratante para iniciar o serviço"
              : "Insira o código para finalizar o serviço"}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {step === "inicio" ? "Código de Entrada" : "Código de Saída"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 justify-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "inicio" ? "bg-primary text-primary-foreground" : "bg-success text-primary-foreground"
              }`}>1</div>
              <div className={`w-12 h-0.5 ${step === "fim" ? "bg-primary" : "bg-border"}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "fim" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>2</div>
            </div>

            <p className="text-center text-sm font-medium">
              {step === "inicio" ? "Início do Serviço" : "Encerramento do Serviço"}
            </p>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Peça o código de 6 dígitos ao contratante. Ele garante a comprovação do seu {step === "inicio" ? "início" : "encerramento"} do serviço.
            </p>

            <Button className="w-full" onClick={handleConfirm} disabled={code.length !== 6}>
              {step === "inicio" ? "Confirmar Entrada" : "Confirmar Saída"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Por que o código?</strong> O sistema de código protege tanto você quanto o contratante,
              garantindo que o serviço foi prestado conforme combinado.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ConfirmarServico;
