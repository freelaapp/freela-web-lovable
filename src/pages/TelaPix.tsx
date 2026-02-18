import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, QrCode, Shield, Clock, CheckCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const TelaPix = () => {
  const navigate = useNavigate();
  const [showPixDialog, setShowPixDialog] = useState(false);

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Pagamento via Pix</h1>
        </div>

        {/* Explicação */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold">Como funciona o pagamento</h2>
                <p className="text-sm text-muted-foreground">Pagamento seguro e rápido via Pix</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { icon: QrCode, title: "1. QR Code gerado automaticamente", desc: "Ao criar uma vaga, o QR Code Pix é gerado para pagamento imediato." },
                { icon: Shield, title: "2. Pagamento seguro", desc: "O valor fica retido em custódia até a conclusão do trabalho." },
                { icon: Clock, title: "3. Liberação após conclusão", desc: "O freelancer recebe o pagamento após a confirmação de saída do serviço." },
                { icon: CheckCircle, title: "4. Transparência total", desc: "Tanto contratante quanto freelancer acompanham o status do pagamento em tempo real." },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <step.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Simular pagamento */}
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-base font-display font-bold">Simular Pagamento Pix</h3>
            <p className="text-sm text-muted-foreground">
              Veja como será a tela de pagamento ao criar uma vaga
            </p>
            <Button onClick={() => setShowPixDialog(true)} className="gap-2">
              <QrCode className="w-4 h-4" /> Ver QR Code de exemplo
            </Button>
          </CardContent>
        </Card>

        {/* Informativo OpenPix */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">Sobre o processamento</h3>
                <p className="text-sm text-muted-foreground">
                  O pagamento é realizado através da <strong className="text-foreground">OpenPix</strong>, 
                  garantindo segurança e agilidade nas transações. O valor pago pelo contratante fica 
                  em custódia e é <strong className="text-foreground">liberado ao freelancer somente após a 
                  conclusão do trabalho</strong>, protegendo ambas as partes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Pagamento Pix */}
      <Dialog open={showPixDialog} onOpenChange={setShowPixDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Pagamento via Pix</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {/* QR Code placeholder */}
            <div className="w-56 h-56 bg-foreground rounded-xl flex items-center justify-center p-4">
              <div className="w-full h-full bg-background rounded-lg flex items-center justify-center relative">
                <div className="absolute inset-4 grid grid-cols-8 grid-rows-8 gap-0.5">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-[1px] ${
                        Math.random() > 0.45 ? "bg-foreground" : "bg-background"
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute bg-background p-1.5 rounded-md z-10">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-2xl font-display font-bold text-primary">R$ 1.200,00</p>
              <p className="text-xs text-muted-foreground">Valor de exemplo</p>
            </div>

            <div className="w-full space-y-2">
              <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => {
                navigator.clipboard.writeText("00020126360014br.gov.bcb.pix0114exemplo@freela5204000053039865802BR");
              }}>
                📋 Copiar código Pix
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-3 w-full">
              <p className="text-xs text-muted-foreground text-center">
                O pagamento é processado pela <strong>OpenPix</strong> e será liberado ao freelancer 
                após a conclusão do trabalho.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default TelaPix;