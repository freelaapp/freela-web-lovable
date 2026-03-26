import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { WheelDatePicker } from "@/components/ui/wheel-date-picker";

interface HistoryItem {
  nome: string;
  dia: string;
  valor: number;
  date: Date;
}

interface ChartPoint {
  dia: string;
  valor: number;
}

const API_BASE = import.meta.env.API_BASE_URL;

const Carteira = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useAuth();
  const isContratante = role === "contratante";

  const [filtroInicio, setFiltroInicio] = useState("");
  const [filtroFim, setFiltroFim] = useState("");
  const [totalPending, setTotalPending] = useState(0);
  const [totalConfirmed, setTotalConfirmed] = useState(0);
  const [historico, setHistorico] = useState<HistoryItem[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) return;
        const token = JSON.parse(tokenRaw);

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        if (isContratante) {
          // ── Contratante ──────────────────────────────────────
          // Fetch contractor profile
          const profileRes = await apiFetch(`${API_BASE}/users/contractors`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const profileBody = await profileRes.json();
          const profileData = profileBody?.data || profileBody;
          const contractorId = Array.isArray(profileData) ? profileData[0]?.id : profileData?.id;

          if (!contractorId) { setLoading(false); return; }

          // Fetch vacancies (includes completed ones with job info)
          const vacRes = await apiFetch(`${API_BASE}/contractors/${contractorId}/vacancies`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const vacBody = await vacRes.json();
          const vacancies = Array.isArray(vacBody?.data) ? vacBody.data : [];

          // Build history from completed/closed vacancies
          const items: HistoryItem[] = [];
          for (const v of vacancies) {
            if (v.status !== "completed" && v.status !== "closed" && v.status !== "concluída") continue;
            const services = Array.isArray(v.services) ? v.services : [];
            const date = v.jobDate ? new Date(v.jobDate) : v.createdAt ? new Date(v.createdAt) : null;
            if (!date) continue;

            for (const svc of services) {
              const valorCentavos = typeof svc.jobValue === "number" ? svc.jobValue
                : typeof svc.value === "number" ? svc.value
                : 0;
              items.push({
                nome: svc.assignment || v.establishment || v.description || "Serviço",
                dia: date.toLocaleDateString("pt-BR"),
                valor: valorCentavos / 100,
                date,
              });
            }
          }
          items.sort((a, b) => b.date.getTime() - a.date.getTime());
          setHistorico(items);
          setChartData(buildChartData(items));

          // Fetch monthly-earnings for totals
          try {
            const earningsRes = await apiFetch(
              `${API_BASE}/contractors/${contractorId}/monthly-earnings?month=${month}&year=${year}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const earningsBody = await earningsRes.json();
            const summary = earningsBody?.data?.summary;
            setTotalPending(summary?.totalPending ?? 0);
            setTotalConfirmed(summary?.totalConfirmed ?? summary?.totalAll ?? 0);
          } catch {
            // Fallback: sum from vacancies
            const total = items.reduce((s, i) => s + i.valor, 0);
            setTotalConfirmed(total);
          }

        } else {
          // ── Freelancer ──────────────────────────────────────
          // Fetch provider profile
          const provRes = await apiFetch(`${API_BASE}/users/providers`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const provBody = await provRes.json();
          const provData = Array.isArray(provBody?.data) ? provBody.data[0] : provBody?.data;
          const providerId = provData?.id ?? provBody?.id;

          if (!providerId) { setLoading(false); return; }

          // Fetch monthly-earnings for totals
          try {
            const earningsRes = await apiFetch(
              `${API_BASE}/providers/${providerId}/monthly-earnings?month=${month}&year=${year}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const earningsBody = await earningsRes.json();
            const summary = earningsBody?.data?.summary;
            setTotalPending(summary?.totalPending ?? 0);
            setTotalConfirmed(summary?.totalConfirmed ?? 0);
          } catch (err) {
            console.error("[Carteira] Error fetching monthly earnings:", err);
          }

          // Fetch filtered-vacancies for history + chart
          const vacRes = await apiFetch(`${API_BASE}/providers/${providerId}/filtered-vacancies`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const vacBody = await vacRes.json();
          const vacancies = Array.isArray(vacBody?.data) ? vacBody.data : [];

          // Build history from completed vacancies
          const items: HistoryItem[] = [];
          for (const v of vacancies) {
            if (v.status !== "completed" && v.status !== "closed" && v.status !== "concluída") continue;
            const services = Array.isArray(v.services) ? v.services : [];
            const date = v.jobDate ? new Date(v.jobDate) : v.createdAt ? new Date(v.createdAt) : null;
            if (!date) continue;

            for (const svc of services) {
              const valorCentavos = typeof svc.jobValue === "number" ? svc.jobValue
                : typeof svc.value === "number" ? svc.value
                : typeof svc.jobValue === "string" ? parseFloat(svc.jobValue.replace(/[^\d.,]/g, "").replace(",", "."))
                : 0;
              items.push({
                nome: v.establishment || v.description || svc.assignment || "Serviço",
                dia: date.toLocaleDateString("pt-BR"),
                valor: valorCentavos / 100,
                date,
              });
            }
          }
          items.sort((a, b) => b.date.getTime() - a.date.getTime());
          setHistorico(items);
          setChartData(buildChartData(items));
        }
      } catch (err) {
        console.error("[Carteira] Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isContratante]);

  // Filter history by date range
  const filteredHistorico = historico.filter((item) => {
    if (filtroInicio) {
      const inicio = new Date(filtroInicio);
      if (item.date < inicio) return false;
    }
    if (filtroFim) {
      const fim = new Date(filtroFim);
      fim.setHours(23, 59, 59);
      if (item.date > fim) return false;
    }
    return true;
  });

  // Build display chart: use real data or zeroed month if empty
  const displayChartData: ChartPoint[] = chartData.length > 0
    ? chartData
    : buildZeroedMonth();

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
                   {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : formatCurrency(totalPending)}
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
                   {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : formatCurrency(totalConfirmed)}
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
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">De</p>
              <WheelDatePicker value={filtroInicio} onChange={setFiltroInicio} />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Até</p>
              <WheelDatePicker value={filtroFim} onChange={setFiltroFim} />
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayChartData}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isContratante ? "hsl(var(--destructive))" : "hsl(var(--primary))"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isContratante ? "hsl(var(--destructive))" : "hsl(var(--primary))"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                      formatter={(value: number) => [formatCurrency(value), isContratante ? "Gasto" : "Ganho"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke={isContratante ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                      strokeWidth={2}
                      fill="url(#colorValor)"
                      dot={{ r: 4, fill: isContratante ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-display font-bold">
              Histórico de Pagamentos
            </h3>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredHistorico.length > 0 ? (
              <div className="space-y-2">
                {filteredHistorico.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="text-sm font-medium">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">{item.dia}</p>
                    </div>
                     <p className={`text-sm font-bold ${isContratante ? "text-destructive" : "text-primary"}`}>
                       {isContratante ? "- " : ""}{formatCurrency(item.valor)}
                     </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum pagamento encontrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

// ── Helpers ──────────────────────────────────────────────

function buildChartData(items: HistoryItem[]): ChartPoint[] {
  if (items.length === 0) return [];

  // Group by date (DD/MM) and sum values
  const grouped = new Map<string, number>();
  for (const item of items) {
    const key = item.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    grouped.set(key, (grouped.get(key) || 0) + item.valor);
  }

  // Convert to sorted array
  const points: ChartPoint[] = [];
  for (const [dia, valor] of grouped) {
    points.push({ dia, valor });
  }

  // Sort by date ascending
  points.sort((a, b) => {
    const [da, ma] = a.dia.split("/").map(Number);
    const [db, mb] = b.dia.split("/").map(Number);
    if (ma !== mb) return ma - mb;
    return da - db;
  });

  return points;
}

function buildZeroedMonth(): ChartPoint[] {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const points: ChartPoint[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), d);
    points.push({
      dia: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      valor: 0,
    });
  }
  return points;
}

export default Carteira;
