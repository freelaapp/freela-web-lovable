import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Shield, ChevronLeft, Building2, Home, Calendar, Briefcase, Users, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { getContractorById, PublicContractorProfile } from "@/lib/api";

const ORIGIN_TYPE = "Web";

const PerfilContratante = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicContractorProfile | null>(null);

  useEffect(() => {
    if (!clientId) {
      setError("ID do contratante não fornecido.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getContractorById(clientId);
        setProfile(data);
      } catch (err) {
        console.error("[PerfilContratante] Erro ao buscar perfil:", err);
        setError("Não foi possível carregar o perfil. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [clientId]);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
      ))}
    </div>
  );

  // Helper para gerar iniciais
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .slice(0, 2)
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  // Determina se é PF ou PJ
  const isPJ = profile?.cnpj != null && profile.cnpj !== "";
  const displayName = profile?.companyName || profile?.corporateReason || profile?.nameOperationResponsible || "Contratante";
  const initials = getInitials(displayName);

  // Formata data de criação
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : "2025";

  if (loading) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold font-display">Perfil do Contratante</h1>
            <div className="w-9" />
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout showHeader={false} showFooter={false}>
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold font-display">Perfil do Contratante</h1>
            <div className="w-9" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <p className="text-muted-foreground text-center">{error || "Perfil não encontrado."}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

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
          <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-amber shrink-0 overflow-hidden">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-display font-bold">{displayName}</h2>
              {profile.feedbackStars >= 4 && <Shield className="w-5 h-5 text-primary fill-primary/20" />}
            </div>
            <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
              {isPJ ? (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" /> Empresa{profile.companySegment ? ` • ${profile.companySegment}` : ""}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Home className="w-4 h-4" /> Pessoa Física
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground justify-center sm:justify-start flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {profile.city}, {profile.uf}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" /> {profile.feedbackStars.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Desde {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "—", label: "Eventos", icon: Briefcase },
            { value: profile.feedbackStars.toFixed(1), label: "Avaliação", icon: Star },
            { value: "—", label: "Avaliações", icon: Users },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="p-4">
                <p className="text-xl font-bold font-display text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bio / Descrição */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-2">Sobre</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.nameOperationResponsible
                ? `Responsável pela operação: ${profile.nameOperationResponsible}`
                : "Perfil de contratante verificado."}
            </p>
          </CardContent>
        </Card>

        {/* Fotos do Estabelecimento (PJ only) */}
        {isPJ && (profile.establishmentFacadeImage || profile.establishmentInteriorImage) && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-base mb-3">Fotos do Estabelecimento</h3>
              <div className="grid grid-cols-2 gap-3">
                {profile.establishmentFacadeImage && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <img src={profile.establishmentFacadeImage} alt="Fachada" className="w-full h-full object-cover" />
                  </div>
                )}
                {profile.establishmentInteriorImage && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <img src={profile.establishmentInteriorImage} alt="Ambiente Interno" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Endereço */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-2">Localização</h3>
            <p className="text-sm text-muted-foreground">
              {profile.street}, {profile.number}
              {profile.complement && `, ${profile.complement}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {profile.neighborhood} — {profile.city}, {profile.uf}
            </p>
            <p className="text-sm text-muted-foreground mt-1">CEP: {profile.cep}</p>
          </CardContent>
        </Card>

        {/* Avaliações */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-base mb-3">Avaliação</h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold font-display text-primary">
                {profile.feedbackStars.toFixed(1)}
              </div>
              <div>
                {renderStars(profile.feedbackStars)}
                <p className="text-xs text-muted-foreground mt-1">Baseado em avaliações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PerfilContratante;
