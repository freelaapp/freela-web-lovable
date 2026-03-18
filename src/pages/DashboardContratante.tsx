import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Users, ChevronRight, Star, DollarSign, AlertCircle, Briefcase, CheckCircle, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { getContractorProfile } from "@/lib/api";
import VagasBlock from "@/components/dashboard-contratante/VagasBlock";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.freelaservicos.com.br";
const ORIGIN_TYPE = "Web";

interface VacancyService {
  assignment: string;
  quantity?: number;
  jobTime?: string;
  jobValue?: string;
  [key: string]: unknown;
}

interface RawVacancy {
  id: string;
  jobDate: string;
  status: string;
  createdAt?: string;
  services?: VacancyService[];
  assignment?: string;
  quantity?: number;
  [key: string]: unknown;
}

interface FlatVacancy {
  id: string;
  assignment: string;
  quantity: number;
  jobDate: string;
  status: string;
  createdAt?: string;
  serviceIndex: number;
}

interface ActiveJob {
  id: string;
  status: string;
  freelancerName?: string;
  freelancerRole?: string;
  vacancyTitle?: string;
  [key: string]: unknown;
}

const DashboardContratante = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [totalGasto, setTotalGasto] = useState("R$ 0");
  const [totalVagas, setTotalVagas] = useState(0);
  const [mediaAvaliacao, setMediaAvaliacao] = useState("0");
  const [vacancies, setVacancies] = useState<FlatVacancy[]>([]);
  const [jobsPendentesAvaliacao, setJobsPendentesAvaliacao] = useState<ActiveJob[]>([]);

  useEffect(() => {
    const tokenRaw = localStorage.getItem("authToken");
    if (!tokenRaw) return;
    let token: string;
    try { token = JSON.parse(tokenRaw); } catch { return; }

    const headers = { "Origin-type": ORIGIN_TYPE, Authorization: `Bearer ${token}` };

    fetch(`${API_BASE_URL}/users/me`, { method: "GET", credentials: "include", headers })
      .then(r => r.json())
      .then(body => { if (body?.success && body?.data?.name) setUserName(body.data.name); })
      .catch(err => console.error("Erro ao buscar usuário:", err));

    getContractorProfile(token)
      .then(async (profile) => {
        const contractorId = profile.id;

        const vacRes = await fetch(`${API_BASE_URL}/contractors/${contractorId}/vacancies`, {
          method: "GET", credentials: "include", headers,
        });
        const vacBody = await vacRes.json();
        if (!vacRes.ok || !vacBody?.data) {
          console.error("Erro ao buscar vagas:", vacBody);
          return;
        }

        const rawVacancies: RawVacancy[] = Array.isArray(vacBody.data) ? vacBody.data : [];
        const flattened: FlatVacancy[] = [];
        for (const v of rawVacancies) {
          if (Array.isArray(v.services) && v.services.length > 0) {
            v.services.forEach((s, idx) => {
              flattened.push({
                id: v.id,
                assignment: s.assignment || "Sem título",
                quantity: s.quantity ?? 1,
                jobDate: v.jobDate,
                status: v.status,
                createdAt: v.createdAt,
                serviceIndex: idx,
              });
            });
          } else {
            flattened.push({
              id: v.id,
              assignment: v.assignment || "Sem título",
              quantity: v.quantity ?? 1,
              jobDate: v.jobDate,
              status: v.status,
              createdAt: v.createdAt,
              serviceIndex: 0,
            });
          }
        }
        setVacancies(flattened);
        setTotalVagas(flattened.length);

        // Total gasto (mês atual)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentMonthVacancies = rawVacancies.filter((v) => {
          if (!v.createdAt) return false;
          const d = new Date(v.createdAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        if (currentMonthVacancies.length > 0) {
          const values = await Promise.all(
            currentMonthVacancies.map(async (v) => {
              try {
                const jobRes = await fetch(`${API_BASE_URL}/jobs/${v.id}`, { method: "GET", credentials: "include", headers });
                const jobBody = await jobRes.json();
                if (jobRes.ok && jobBody?.data?.value != null) return Number(jobBody.data.value) || 0;
              } catch (e) { console.error(`Erro ao buscar job ${v.id}:`, e); }
              return 0;
            })
          );
          const sum = values.reduce((a, b) => a + b, 0);
          setTotalGasto(`R$ ${sum.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`);
        }

        // Feedbacks
        try {
          const fbRes = await fetch(`${API_BASE_URL}/contractors/${contractorId}/jobs/feedbacks`, { method: "GET", credentials: "include", headers });
          const fbBody = await fbRes.json();
          if (fbRes.ok && Array.isArray(fbBody?.data) && fbBody.data.length > 0) {
            const total = fbBody.data.reduce((acc: number, fb: any) => acc + (Number(fb.star) || 0), 0);
            setMediaAvaliacao((total / fbBody.data.length).toFixed(1));
          }
        } catch (e) { console.error("Erro ao buscar feedbacks:", e); }

        // Jobs pendentes de avaliação — filtra por status "completed"
        try {
          const activeJobsRes = await fetch(`${API_BASE_URL}/contractors/${contractorId}/active-jobs`, { method: "GET", credentials: "include", headers });
          const activeJobsBody = await activeJobsRes.json();
          if (activeJobsRes.ok && Array.isArray(activeJobsBody?.data)) {
            const pendentes = activeJobsBody.data.filter((job: ActiveJob) => job.status === "completed");
            setJobsPendentesAvaliacao(pendentes);
          }
        } catch (e) { console.error("Erro ao buscar active-jobs:", e); }
      })
      .catch(err => console.error("Erro ao buscar dados do contratante:", err));
  }, []);

  const vagasAbertas = vacancies.filter(v => v.status === "open" || v.status === "in hiring");
  const vagasPreenchidas = vacancies.filter(v => v.status === "closed");
  const vagasConcluidas = vacancies.filter(v => v.status === "removed");

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 space-y-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Olá, {userName || "Contratante"}! 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie suas vagas e freelancers</p>
          </div>
          <Button asChild size="xl" className="gap-2">
            <Link to="/criar-evento">
              <CalendarPlus className="w-5 h-5" /> Criar Vaga
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: DollarSign, label: "Total Gasto", value: totalGasto, bg: "bg-success-light", color: "text-success" },
            { icon: CalendarPlus, label: "Vagas", value: totalVagas.toString(), bg: "bg-primary-light", color: "text-primary" },
            { icon: Star, label: "Avaliação", value: mediaAvaliacao, bg: "bg-warning-light", color: "text-warning" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Avaliações Pendentes */}
        {jobsPendentesAvaliacao.length > 0 && (
          <Card className="border-warning/30 bg-warning-light/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" /> Avalie seus freelancers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobsPendentesAvaliacao.map((job) => {
                const nome = job.freelancerName || "Freelancer";
                const initials = nome.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();
                return (
                  <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {[job.freelancerRole, job.vacancyTitle].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1" onClick={() => navigate("/avaliacoes")}>
                      Avaliar <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Vagas em Aberto */}
        <VagasBlock
          title="Vagas em Aberto"
          icon={<Briefcase className="w-5 h-5 text-primary" />}
          vacancies={vagasAbertas}
        />

        {/* Vagas Preenchidas */}
        <VagasBlock
          title="Vagas Preenchidas"
          icon={<Users className="w-5 h-5 text-primary" />}
          vacancies={vagasPreenchidas}
        />

        {/* Vagas Concluídas */}
        <VagasBlock
          title="Vagas Concluídas"
          icon={<CheckCircle className="w-5 h-5 text-primary" />}
          vacancies={vagasConcluidas}
        />
      </div>
    </AppLayout>
  );
};

export default DashboardContratante;
