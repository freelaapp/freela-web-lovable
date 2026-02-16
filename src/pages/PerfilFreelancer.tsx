import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Calendar, MessageCircle, Shield, Clock, ChevronLeft, Heart, Share2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const freelancerData = {
  id: "1",
  name: "Carlos Silva",
  avatar: "CS",
  role: "Churrasqueiro Profissional",
  location: "São Paulo, SP",
  rating: 4.9,
  reviews: 127,
  jobs: 253,
  memberSince: "Jan 2023",
  verified: true,
  responseTime: "~15 min",
  bio: "Churrasqueiro profissional com mais de 10 anos de experiência em eventos. Especializado em cortes nobres, churrasco argentino e brasileiro. Atendo festas de 10 a 200 pessoas com todo equipamento necessário.",
  skills: ["Churrasco Brasileiro", "Churrasco Argentino", "Cortes Nobres", "Buffet Completo", "Eventos Corporativos"],
  portfolio: [
    { title: "Festa de aniversário - 80 pessoas", rating: 5.0 },
    { title: "Confraternização empresa - 120 pessoas", rating: 4.9 },
    { title: "Casamento ao ar livre - 200 pessoas", rating: 5.0 },
    { title: "Churrasco de Réveillon - 50 pessoas", rating: 4.8 },
  ],
  testimonials: [
    { name: "Ana Oliveira", text: "Carlos é incrível! Cuidou de tudo e os convidados amaram.", rating: 5 },
    { name: "Roberto Souza", text: "Profissional top! Churrasco perfeito, super organizado.", rating: 5 },
    { name: "Maria Santos", text: "Contratei para meu casamento. Foi impecável!", rating: 5 },
  ],
  price: "A partir de R$ 480",
};

const PerfilFreelancer = () => {
  const { id } = useParams();

  return (
    <AppLayout showHeader={false} showFooter={false}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/freelancers" className="p-2 -ml-2 text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-semibold font-display">Perfil</h1>
          <div className="flex gap-1">
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-5">
          <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-amber shrink-0">
            {freelancerData.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-display font-bold">{freelancerData.name}</h2>
              {freelancerData.verified && (
                <Shield className="w-5 h-5 text-primary fill-primary/20" />
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-1">{freelancerData.role}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground justify-center sm:justify-start flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {freelancerData.location}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" /> {freelancerData.rating} ({freelancerData.reviews})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {freelancerData.responseTime}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: freelancerData.jobs.toString(), label: "Trabalhos" },
            { value: freelancerData.rating.toString(), label: "Avaliação" },
            { value: freelancerData.reviews.toString(), label: "Avaliações" },
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
            <p className="text-sm text-muted-foreground leading-relaxed">{freelancerData.bio}</p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-3">Especialidades</h3>
            <div className="flex flex-wrap gap-2">
              {freelancerData.skills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 bg-primary-light text-primary text-xs font-medium rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-3">Trabalhos Recentes</h3>
            <div className="space-y-3">
              {freelancerData.portfolio.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="flex items-center gap-1 text-sm text-primary font-semibold">
                    <Star className="w-3.5 h-3.5 fill-primary" /> {item.rating}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-3">Avaliações</h3>
            <div className="space-y-4">
              {freelancerData.testimonials.map((t, i) => (
                <div key={i} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">A partir de</p>
            <p className="text-lg font-bold font-display text-primary">R$ 480</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="gap-2">
              <MessageCircle className="w-4 h-4" /> Mensagem
            </Button>
            <Button size="lg" className="gap-2">
              Contratar
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PerfilFreelancer;
