import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Wallet, TrendingUp, Clock, Edit2, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ganhosMock = [
  { dia: "01/02", valor: 150 },
  { dia: "03/02", valor: 200 },
  { dia: "06/02", valor: 0 },
  { dia: "08/02", valor: 320 },
  { dia: "10/02", valor: 180 },
  { dia: "12/02", valor: 250 },
  { dia: "14/02", valor: 400 },
  { dia: "16/02", valor: 150 },
  { dia: "18/02", valor: 300 },
];

const historicoMock = [
  { contratante: "Bar do João", dia: "18/02/2026", valor: 300 },
  { contratante: "Restaurante Sabor", dia: "14/02/2026", valor: 400 },
  { contratante: "Buffet Festa Linda", dia: "12/02/2026", valor: 250 },
  { contratante: "Casa de Eventos Sol", dia: "10/02/2026", valor: 180 },
  { contratante: "Churrascaria Fogo", dia: "08/02/2026", valor: 320 },
  { contratante: "Pub Night Club", dia: "03/02/2026", valor: 200 },
  { contratante: "Restaurante Bella", dia: "01/02/2026", valor: 150 },
];

const Carteira = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [editandoPix, setEditandoPix] = useState(false);
  const [chavePix, setChavePix] = useState("carlos.silva@email.com");
  const [tempPix, setTempPix] = useState("");
  const [filtroInicio, setFiltroInicio] = useState("");
  const [filtroFim, setFiltroFim] = useState("");

  const saldoALiberar = 480;
  const totalPago = 1800;

  const startEditPix = () => {
    setTempPix(chavePix);
    setEditandoPix(true);
  };

  const savePix = () => {
    setChavePix(tempPix);
    setEditandoPix(false);
    toast({ title: "Pix atualizado", description: "Sua chave Pix foi alterada com sucesso." });
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Carteira</h1>
        </div>

        {/* Saldos */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">A liberar</p>
              <p className="text-xl font-bold text-secondary">R$ {saldoALiberar.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Total recebido</p>
              <p className="text-xl font-bold text-primary">R$ {totalPago.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-display font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Ganhos por dia
            </h3>
            <div className="flex gap-2">
              <Input type="date" value={filtroInicio} onChange={(e) => setFiltroInicio(e.target.value)} placeholder="De" className="text-xs" />
              <Input type="date" value={filtroFim} onChange={(e) => setFiltroFim(e.target.value)} placeholder="Até" className="text-xs" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ganhosMock}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Ganho"]}
                  />
                  <Line type="monotone" dataKey="valor" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pix */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Chave Pix</p>
                  {editandoPix ? (
                    <Input
                      value={tempPix}
                      onChange={(e) => setTempPix(e.target.value)}
                      className="mt-1 h-8 text-sm"
                      autoFocus
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">{chavePix}</p>
                  )}
                </div>
              </div>
              {editandoPix ? (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditandoPix(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={savePix}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startEditPix}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-display font-bold">Histórico de Pagamentos</h3>
            <div className="space-y-2">
              {historicoMock.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">{item.contratante}</p>
                    <p className="text-xs text-muted-foreground">{item.dia}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">R$ {item.valor.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Carteira;
