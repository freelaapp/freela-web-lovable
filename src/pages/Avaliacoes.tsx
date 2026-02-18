import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { useUserRole } from "@/hooks/useUserRole";

const renderStars = (rating: number) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    ))}
  </div>
);

// Freelancer mock data
const freelancerPendentes = [
  { id: 1, title: "Churrasco - Réveillon", client: "Pedro Costa", date: "31 Dez 2025", location: "São Paulo, SP" },
  { id: 2, title: "Bartender - Formatura", client: "Faculdade ABC", date: "20 Dez 2025", location: "Santo André, SP" },
];

const freelancerRecebidas = [
  { id: 1, client: "Ana Oliveira", date: "31 Dez 2025", rating: 5, comment: "Carlos foi impecável! Super pontual e muito profissional." },
  { id: 2, client: "Tech Corp", date: "20 Dez 2025", rating: 5, comment: "Ótimo profissional, recomendo a todos." },
  { id: 3, client: "Maria Santos", date: "10 Dez 2025", rating: 4, comment: "Muito bom, apenas chegou um pouco atrasado." },
];

const freelancerFeitas = [
  { id: 4, name: "Restaurante Sabor & Arte", date: "31 Dez 2025", rating: 4, comment: "Boa estrutura, equipe organizada." },
  { id: 5, name: "Buffet Estrela", date: "20 Dez 2025", rating: 5, comment: "Excelente local para trabalhar!" },
  { id: 6, name: "Bar do João", date: "10 Dez 2025", rating: 3, comment: "Ambiente ok, mas a cozinha poderia ser mais limpa." },
];

// Contratante mock data
const contratantePendentes = [
  { id: 1, title: "Churrasco - Réveillon", client: "Carlos Silva (Churrasqueiro)", date: "31 Dez 2025", location: "São Paulo, SP" },
  { id: 2, title: "Bartender - Aniversário", client: "Juliana Alves (Bartender)", date: "22 Fev 2026", location: "Jundiaí, SP" },
];

const contratanteRecebidas = [
  { id: 1, client: "Carlos Silva", date: "31 Dez 2025", rating: 5, comment: "Ótimo contratante, pagou no prazo e foi muito cordial." },
  { id: 2, client: "Pedro Lima", date: "20 Dez 2025", rating: 4, comment: "Tudo certo, evento bem organizado." },
];

const contratanteFeitas = [
  { id: 4, name: "Carlos Silva - Churrasqueiro", date: "31 Dez 2025", rating: 5, comment: "Profissional excepcional, cuidou de tudo com perfeição." },
  { id: 5, name: "Juliana Alves - Bartender", date: "20 Dez 2025", rating: 5, comment: "Drinks incríveis, super profissional!" },
  { id: 6, name: "Pedro Lima - Garçom", date: "10 Dez 2025", rating: 4, comment: "Bom profissional, pontual e educado." },
];

const Avaliacoes = () => {
  const navigate = useNavigate();
  const role = useUserRole();
  const isContratante = role === "contratante";

  const pendentes = isContratante ? contratantePendentes : freelancerPendentes;
  const recebidas = isContratante ? contratanteRecebidas : freelancerRecebidas;
  const feitas = isContratante ? contratanteFeitas : freelancerFeitas;

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Minhas Avaliações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isContratante ? "Avalie freelancers e veja seus feedbacks" : "Veja e gerencie seus feedbacks"}
          </p>
        </div>

        {pendentes.length > 0 && (
          <Card className="border-warning/30 bg-warning-light/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                {isContratante ? "Avalie seus freelancers" : "Avalie seus últimos serviços"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendentes.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.client} • {s.date}</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1">
                    Avaliar <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" /> Recebidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recebidas.map(av => (
                <div
                  key={av.id}
                  className="p-3 rounded-xl bg-muted/50 space-y-1.5 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => navigate(`/avaliacao/${av.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{av.client}</p>
                    {renderStars(av.rating)}
                  </div>
                  <p className="text-xs text-muted-foreground">{av.date}</p>
                  <p className="text-sm text-foreground/80">"{av.comment}"</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                {isContratante ? "Feitas para freelancers" : "Feitas por mim"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {feitas.map(av => (
                <div
                  key={av.id}
                  className="p-3 rounded-xl bg-muted/50 space-y-1.5 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => navigate(`/avaliacao/${av.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{av.name}</p>
                    {renderStars(av.rating)}
                  </div>
                  <p className="text-xs text-muted-foreground">{av.date}</p>
                  <p className="text-sm text-foreground/80">"{av.comment}"</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Avaliacoes;
