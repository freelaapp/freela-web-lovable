import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

// Freelancer mocks
const ganhosFreelancerMock = [
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

const historicoFreelancerMock = [
  { nome: "Bar do João", dia: "18/02/2026", valor: 300 },
  { nome: "Restaurante Sabor", dia: "14/02/2026", valor: 400 },
  { nome: "Buffet Festa Linda", dia: "12/02/2026", valor: 250 },
  { nome: "Casa de Eventos Sol", dia: "10/02/2026", valor: 180 },
  { nome: "Churrascaria Fogo", dia: "08/02/2026", valor: 320 },
  { nome: "Pub Night Club", dia: "03/02/2026", valor: 200 },
  { nome: "Restaurante Bella", dia: "01/02/2026", valor: 150 },
];

// Contratante mocks
const gastosContratanteMock = [
  { dia: "01/02", valor: 650 },
  { dia: "05/02", valor: 0 },
  { dia: "08/02", valor: 1200 },
  { dia: "12/02", valor: 800 },
  { dia: "15/02", valor: 0 },
  { dia: "18/02", valor: 1950 },
];

const historicoContratanteMock = [
  { nome: "Carlos Silva - Churrasqueiro", dia: "18/02/2026", valor: 650 },
  { nome: "Juliana Alves - Bartender", dia: "18/02/2026", valor: 600 },
  { nome: "Pedro Lima - Garçom", dia: "18/02/2026", valor: 700 },
  { nome: "Carlos Silva - Churrasqueiro", dia: "12/02/2026", valor: 800 },
  { nome: "Bartender Equipe - 2 profissionais", dia: "08/02/2026", valor: 1200 },
  { nome: "Garçom - Festa", dia: "01/02/2026", valor: 650 },
];

const Carteira = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useAuth();
  const isContratante = role === "contratante";

  const [filtroInicio, setFiltroInicio] = useState("");
  const [filtroFim, setFiltroFim] = useState("");
  const [totalPending, setTotalPending] = useState(0);
  const [totalConfirmed, setTotalConfirmed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch totalPending from monthly-earnings endpoint
  useEffect(() => {
    const fetchTotalPending = async () => {
      try {
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) return;
        const token = JSON.parse(tokenRaw);
        
        // Fetch provider profile to get providerId
        const provRes = await apiFetch(`${import.meta.env.API_BASE_URL}/users/providers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const provBody = await provRes.json();
        const provData = Array.isArray(provBody?.data) ? provBody.data[0] : provBody?.data;
        const providerId = provData?.id ?? provBody?.id;
        
        if (!providerId) {
          setTotalPending(0);
          setLoading(false);
          return;
        }

        // Get current month and year
        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const year = now.getFullYear();

        // Fetch monthly earnings
        const earningsRes = await apiFetch(
          `${import.meta.env.API_BASE_URL}/providers/${providerId}/monthly-earnings?month=${month}&year=${year}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const earningsBody = await earningsRes.json();
        
        // Extract totalPending and totalConfirmed from data.summary
        const summary = earningsBody?.data?.summary;
        const totalPendingValue = summary?.totalPending;
        const totalConfirmedValue = summary?.totalConfirmed;
        
        if (typeof totalPendingValue === "number") {
          setTotalPending(totalPendingValue);
        } else {
          setTotalPending(0);
        }
        
        if (typeof totalConfirmedValue === "number") {
          setTotalConfirmed(totalConfirmedValue);
        } else {
          setTotalConfirmed(0);
        }
      } catch (err) {
        console.error("[Carteira] Error fetching totalPending:", err);
        setTotalPending(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalPending();
  }, [role]); // Re-fetch when role changes

  // Freelancer values (keeping mocks for other values)
  const saldoALiberarFreelancer = 480;
  const totalPagoFreelancer = 1800;

  // Contratante values (keeping mocks for other values)
  const totalGastoContratante = 4600;
  const valorALiberarContratante = 1950;

  const ganhosMock = isContratante ? gastosContratanteMock : ganhosFreelancerMock;
  const historicoMock = isContratante ? historicoContratanteMock : historicoFreelancerMock;

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
                <p className="text-xs text-muted-foreground">Pagamentos futuros</p>
                <p className="text-xl font-bold text-secondary">
                  R$ {loading ? "..." : totalPending.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                {isContratante ? (
                  <TrendingDown className="w-5 h-5 text-destructive mx-auto mb-1" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                )}
                <p className="text-xs text-muted-foreground">{isContratante ? "Total gasto" : "Total recebido"}</p>
                <p className={`text-xl font-bold ${isContratante ? "text-destructive" : "text-primary"}`}>
                  R$ {loading ? "..." : (isContratante ? totalGastoContratante : totalConfirmed).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

        {/* Gráfico */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-display font-bold flex items-center gap-2">
              {isContratante ? (
                <><TrendingDown className="w-4 h-4 text-destructive" /> Gastos por dia</>
              ) : (
                <><TrendingUp className="w-4 h-4 text-primary" /> Ganhos por dia</>
              )}
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
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, isContratante ? "Gasto" : "Ganho"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke={isContratante ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                    strokeWidth={2}
                    dot={{ r: 4, fill: isContratante ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-display font-bold">
              {isContratante ? "Histórico de Pagamentos" : "Histórico de Pagamentos"}
            </h3>
            <div className="space-y-2">
              {historicoMock.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">{item.nome}</p>
                    <p className="text-xs text-muted-foreground">{item.dia}</p>
                  </div>
                  <p className={`text-sm font-bold ${isContratante ? "text-destructive" : "text-primary"}`}>
                    {isContratante ? "- " : ""}R$ {item.valor.toFixed(2)}
                  </p>
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
