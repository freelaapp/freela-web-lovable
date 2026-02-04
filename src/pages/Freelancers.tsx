import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Filter, Music, MapPin } from "lucide-react";
import { useMode } from "@/contexts/ModeContext";
import { servicosPF, estilosMusicais } from "@/lib/services";
import { Badge } from "@/components/ui/badge";

// Dados mock de freelancers
const freelancersMock = [
  {
    id: "1",
    nome: "Carlos Silva",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    cargo: "churrasqueiro",
    avaliacao: 4.9,
    avaliacoes: 47,
    estilosMusicais: [],
    cidade: "São Paulo, SP",
    bio: "Especialista em churrasco para eventos há mais de 10 anos.",
  },
  {
    id: "2",
    nome: "Ana Beatriz",
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    cargo: "barman",
    avaliacao: 4.8,
    avaliacoes: 62,
    estilosMusicais: [],
    cidade: "Rio de Janeiro, RJ",
    bio: "Bartender profissional com especialização em drinks clássicos e autorais.",
  },
  {
    id: "3",
    nome: "João Pedro",
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    cargo: "musico",
    avaliacao: 5.0,
    avaliacoes: 89,
    estilosMusicais: ["sertanejo", "mpb", "pop"],
    cidade: "Belo Horizonte, MG",
    bio: "Cantor e violonista com repertório variado para todos os públicos.",
  },
  {
    id: "4",
    nome: "Maria Clara",
    foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    cargo: "cozinheira",
    avaliacao: 4.7,
    avaliacoes: 34,
    estilosMusicais: [],
    cidade: "Curitiba, PR",
    bio: "Chef especializada em culinária brasileira e internacional.",
  },
  {
    id: "5",
    nome: "Lucas Mendes",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    cargo: "garcom",
    avaliacao: 4.9,
    avaliacoes: 78,
    estilosMusicais: [],
    cidade: "Porto Alegre, RS",
    bio: "Experiência em eventos de alto padrão e festas particulares.",
  },
  {
    id: "6",
    nome: "Fernanda Lima",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    cargo: "musico",
    avaliacao: 4.8,
    avaliacoes: 56,
    estilosMusicais: ["pagode", "samba", "forro"],
    cidade: "Salvador, BA",
    bio: "Cantora e percussionista especializada em música brasileira.",
  },
];

const Freelancers = () => {
  const { isFreelaCasa } = useMode();
  const [filtroServico, setFiltroServico] = useState<string>("todos");
  const [filtroEstilo, setFiltroEstilo] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const getCargoLabel = (cargoId: string) => {
    const servico = servicosPF.find(s => s.id === cargoId);
    return servico?.label || cargoId;
  };

  const getEstiloLabel = (estiloId: string) => {
    const estilo = estilosMusicais.find(e => e.id === estiloId);
    return estilo?.label || estiloId;
  };

  const freelancersFiltrados = freelancersMock.filter(f => {
    const matchServico = filtroServico === "todos" || f.cargo === filtroServico;
    const matchEstilo = filtroEstilo === "todos" || f.estilosMusicais.includes(filtroEstilo);
    const matchBusca = f.nome.toLowerCase().includes(busca.toLowerCase());
    return matchServico && matchEstilo && matchBusca;
  });

  const mostrarFiltroMusica = filtroServico === "musico" || filtroServico === "todos";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto container-padding">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">
              {isFreelaCasa ? "Freelancers disponíveis" : "Profissionais cadastrados"}
            </h1>
            <p className="text-muted-foreground">
              {isFreelaCasa
                ? "Encontre o profissional ideal para seu evento"
                : "Gerencie e visualize profissionais disponíveis"}
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-card border border-border rounded-xl p-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {/* Filtro por serviço */}
              <Select value={filtroServico} onValueChange={setFiltroServico}>
                <SelectTrigger className="w-full sm:w-[200px] h-11">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os serviços</SelectItem>
                  {servicosPF.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id}>
                      {servico.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por estilo musical */}
              {mostrarFiltroMusica && (
                <Select value={filtroEstilo} onValueChange={setFiltroEstilo}>
                  <SelectTrigger className="w-full sm:w-[200px] h-11">
                    <Music className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Estilo musical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os estilos</SelectItem>
                    {estilosMusicais.map((estilo) => (
                      <SelectItem key={estilo.id} value={estilo.id}>
                        {estilo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Lista de Freelancers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancersFiltrados.map((freelancer) => (
              <div
                key={freelancer.id}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg"
              >
                {/* Foto e Info básica */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={freelancer.foto}
                    alt={freelancer.nome}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{freelancer.nome}</h3>
                    <p className="text-primary font-medium text-sm">
                      {getCargoLabel(freelancer.cargo)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-semibold text-sm">{freelancer.avaliacao}</span>
                      <span className="text-muted-foreground text-sm">
                        ({freelancer.avaliacoes} avaliações)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cidade */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{freelancer.cidade}</span>
                </div>

                {/* Estilos musicais (apenas para músicos) */}
                {freelancer.cargo === "musico" && freelancer.estilosMusicais.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {freelancer.estilosMusicais.map((estilo) => (
                      <Badge key={estilo} variant="secondary" className="text-xs">
                        {getEstiloLabel(estilo)}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Bio - Apenas para modo empresas */}
                {!isFreelaCasa && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {freelancer.bio}
                  </p>
                )}

                {/* Botão */}
                <Button variant="outline" className="w-full">
                  Ver perfil
                </Button>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {freelancersFiltrados.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                Nenhum freelancer encontrado com os filtros selecionados
              </p>
              <Button variant="outline" onClick={() => {
                setFiltroServico("todos");
                setFiltroEstilo("todos");
                setBusca("");
              }}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Freelancers;
