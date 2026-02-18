import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, MessageCircle, Shield, ChevronLeft, Building2, Home, Phone, Calendar, Briefcase, Users } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const contratantesData: Record<string, {
  id: string;
  name: string;
  avatar: string;
  type: "pf" | "pj";
  category?: string;
  location: string;
  rating: number;
  reviews: number;
  eventsCreated: number;
  memberSince: string;
  verified: boolean;
  phone: string;
  bio: string;
  photos: string[];
  recentEvents: { title: string; date: string; role: string }[];
  testimonials: { name: string; text: string; rating: number }[];
}> = {
  c1: {
    id: "c1", name: "Ana Oliveira", avatar: "AO", type: "pf",
    location: "Jundiaí, SP", rating: 4.8, reviews: 15, eventsCreated: 23,
    memberSince: "Mar 2024", verified: true, phone: "(11) 99999-1234",
    bio: "Adoro organizar festas e eventos para família e amigos. Sempre busco os melhores profissionais para garantir que tudo saia perfeito.",
    photos: [],
    recentEvents: [
      { title: "Aniversário 30 anos", date: "22 Fev 2026", role: "Churrasqueiro" },
      { title: "Chá de bebê", date: "10 Jan 2026", role: "Garçom" },
    ],
    testimonials: [
      { name: "Carlos Silva", text: "Excelente contratante, muito organizada e pontual no pagamento.", rating: 5 },
      { name: "Pedro Santos", text: "Comunicação clara e evento muito bem planejado.", rating: 5 },
    ],
  },
  c2: {
    id: "c2", name: "Tech Corp", avatar: "TC", type: "pj", category: "Tecnologia",
    location: "Jundiaí, SP", rating: 4.9, reviews: 42, eventsCreated: 58,
    memberSince: "Jan 2023", verified: true, phone: "(11) 98888-5678",
    bio: "Empresa de tecnologia que realiza eventos corporativos frequentes, incluindo confraternizações, happy hours e workshops para colaboradores.",
    photos: ["/lovable-uploads/6bc76b0e-48cd-43dd-9799-173f81a4f62b.png", "/lovable-uploads/8e9ea4aa-b6c7-49f5-9a45-b521e7f13075.png"],
    recentEvents: [
      { title: "Evento Corporativo", date: "28 Fev 2026", role: "Bartender" },
      { title: "Confraternização de fim de ano", date: "20 Dez 2025", role: "Churrasqueiro" },
      { title: "Happy Hour Mensal", date: "15 Nov 2025", role: "Bartender" },
    ],
    testimonials: [
      { name: "Ana Costa", text: "Empresa séria, pagamento sempre em dia e eventos muito bem organizados.", rating: 5 },
      { name: "Roberto Lima", text: "Ótima experiência, equipe muito profissional.", rating: 5 },
      { name: "Julia Mendes", text: "Sempre contratam com antecedência e dão todo suporte necessário.", rating: 4 },
    ],
  },
  c3: {
    id: "c3", name: "Maria Santos", avatar: "MS", type: "pf",
    location: "Jundiaí, SP", rating: 5.0, reviews: 8, eventsCreated: 5,
    memberSince: "Jun 2025", verified: true, phone: "(11) 97777-9012",
    bio: "Organizando meu casamento dos sonhos! Procuro profissionais dedicados e com experiência em eventos especiais.",
    photos: [],
    recentEvents: [
      { title: "Casamento", date: "08 Mar 2026", role: "Garçom" },
    ],
    testimonials: [
      { name: "Felipe Souza", text: "Muito atenciosa e cuidadosa com cada detalhe.", rating: 5 },
    ],
  },
  c7: {
    id: "c7", name: "Roberto Lima", avatar: "RL", type: "pf",
    location: "Centro, Jundiaí", rating: 4.7, reviews: 12, eventsCreated: 9,
    memberSince: "Ago 2024", verified: true, phone: "(11) 93333-5678",
    bio: "Festeiro de carteirinha! Gosto de reunir amigos e família em churrascos e comemorações.",
    photos: [],
    recentEvents: [
      { title: "Aniversário 50 anos", date: "25 Fev 2026", role: "Garçom" },
      { title: "Churrasco de Natal", date: "25 Dez 2025", role: "Churrasqueiro" },
    ],
    testimonials: [
      { name: "Marcos Silva", text: "Muito gente boa, pagamento rápido e evento divertido.", rating: 5 },
      { name: "Ana Paula", text: "Ótimo anfitrião, tudo muito bem organizado.", rating: 4 },
    ],
  },
  c8: {
    id: "c8", name: "StartUp Inc", avatar: "SI", type: "pj", category: "Startup / Coworking",
    location: "Anhangabaú, Jundiaí", rating: 4.6, reviews: 18, eventsCreated: 31,
    memberSince: "Fev 2024", verified: true, phone: "(11) 92222-9012",
    bio: "Startup inovadora com foco em cultura e bem-estar dos colaboradores. Realizamos eventos semanais e mensais.",
    photos: ["/lovable-uploads/6c415550-33af-4ed9-96f3-fab4c495fbbe.png"],
    recentEvents: [
      { title: "Happy Hour Corporativo", date: "27 Fev 2026", role: "Bartender" },
      { title: "Workshop & Almoço", date: "10 Fev 2026", role: "Cozinheiro" },
    ],
    testimonials: [
      { name: "Carla Dias", text: "Ambiente descontraído e equipe muito receptiva.", rating: 5 },
      { name: "Bruno Alves", text: "Pagamento rápido e comunicação excelente.", rating: 4 },
    ],
  },
  c9: {
    id: "c9", name: "Juliana Mendes", avatar: "JM", type: "pf",
    location: "Eloy Chaves, Jundiaí", rating: 4.9, reviews: 6, eventsCreated: 3,
    memberSince: "Set 2025", verified: false, phone: "(11) 91111-3456",
    bio: "Preparando o casamento e alguns eventos familiares. Valorizo profissionais comprometidos e pontuais.",
    photos: [],
    recentEvents: [
      { title: "Casamento - Buffet", date: "01 Mar 2026", role: "Churrasqueiro" },
    ],
    testimonials: [
      { name: "Lucas Rocha", text: "Muito educada e organizada, recomendo trabalhar com ela.", rating: 5 },
    ],
  },
  c10: {
    id: "c10", name: "ONG Esperança", avatar: "OE", type: "pj", category: "ONG / Social",
    location: "Vila Arens, Jundiaí", rating: 4.5, reviews: 22, eventsCreated: 40,
    memberSince: "Jan 2022", verified: true, phone: "(11) 90000-7890",
    bio: "Organização sem fins lucrativos que promove eventos beneficentes para a comunidade local. Sempre precisamos de profissionais voluntários e contratados.",
    photos: [],
    recentEvents: [
      { title: "Evento Beneficente", date: "05 Mar 2026", role: "Cozinheiro" },
      { title: "Almoço Solidário", date: "15 Jan 2026", role: "Garçom" },
    ],
    testimonials: [
      { name: "Patrícia Lima", text: "Causa nobre e equipe muito querida. Trabalho com prazer.", rating: 5 },
      { name: "André Costa", text: "Organização excelente mesmo com recursos limitados.", rating: 4 },
    ],
  },
};

// Fallback for unknown IDs
const defaultContratante = {
  id: "unknown", name: "Contratante", avatar: "??", type: "pf" as const,
  location: "São Paulo, SP", rating: 4.5, reviews: 0, eventsCreated: 0,
  memberSince: "2025", verified: false, phone: "-", bio: "Informações não disponíveis.",
  photos: [] as string[], recentEvents: [] as { title: string; date: string; role: string }[],
  testimonials: [] as { name: string; text: string; rating: number }[],
};

const PerfilContratante = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const data = contratantesData[clientId || ""] || defaultContratante;

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
      ))}
    </div>
  );

  return (
    <AppLayout showHeader={false} showFooter={false}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold font-display">Perfil do Contratante</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-5">
          <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-amber shrink-0">
            {data.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-display font-bold">{data.name}</h2>
              {data.verified && <Shield className="w-5 h-5 text-primary fill-primary/20" />}
            </div>
            <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
              {data.type === "pj" ? (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" /> Empresa{data.category ? ` • ${data.category}` : ""}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Home className="w-4 h-4" /> Pessoa Física
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground justify-center sm:justify-start flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.location}</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" /> {data.rating} ({data.reviews})
              </span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Desde {data.memberSince}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: data.eventsCreated.toString(), label: "Eventos", icon: Briefcase },
            { value: data.rating.toString(), label: "Avaliação", icon: Star },
            { value: data.reviews.toString(), label: "Avaliações", icon: Users },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="p-4">
                <p className="text-xl font-bold font-display text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bio */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-2">Sobre</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.bio}</p>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-3">Contato</h3>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm">{data.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Fotos do Estabelecimento (PJ only) */}
        {data.type === "pj" && data.photos.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-base mb-3">Fotos do Estabelecimento</h3>
              <div className="grid grid-cols-2 gap-3">
                {data.photos.map((photo, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Eventos Recentes */}
        {data.recentEvents.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-base mb-3">Eventos Recentes</h3>
              <div className="space-y-3">
                {data.recentEvents.map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.role} • {event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avaliações */}
        {data.testimonials.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-base mb-3">Avaliações de Freelancers</h3>
              <div className="space-y-4">
                {data.testimonials.map((t, i) => (
                  <div key={i} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{t.name}</span>
                      {renderStars(t.rating)}
                    </div>
                    <p className="text-sm text-muted-foreground">{t.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex justify-center gap-3">
          <Button variant="outline" size="lg" className="gap-2 flex-1 max-w-xs" onClick={() => navigate("/mensagens")}>
            <MessageCircle className="w-4 h-4" /> Enviar Mensagem
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PerfilContratante;
