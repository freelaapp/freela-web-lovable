import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, ChefHat, Wine, Music, Sparkles, UtensilsCrossed, Disc3 } from "lucide-react";
import { useMode } from "@/contexts/ModeContext";
import { Link } from "react-router-dom";

const categorias = [
  { id: "churrasqueiro", label: "Churrasqueiro", icon: ChefHat, disponiveis: 2847, cor: "bg-orange-500/10 text-orange-600" },
  { id: "barman", label: "Barman", icon: Wine, disponiveis: 1923, cor: "bg-purple-500/10 text-purple-600" },
  { id: "cozinheira", label: "Cozinheira(o)", icon: UtensilsCrossed, disponiveis: 3412, cor: "bg-red-500/10 text-red-600" },
  { id: "auxiliar-limpeza", label: "Auxiliar de Limpeza", icon: Sparkles, disponiveis: 4156, cor: "bg-cyan-500/10 text-cyan-600" },
  { id: "garcom", label: "Garçom", icon: Users, disponiveis: 5234, cor: "bg-green-500/10 text-green-600" },
  { id: "musico", label: "Músico", icon: Music, disponiveis: 1287, cor: "bg-yellow-500/10 text-yellow-600" },
  { id: "dj", label: "DJ", icon: Disc3, disponiveis: 876, cor: "bg-pink-500/10 text-pink-600" },
];

const Freelancers = () => {
  const { isFreelaCasa } = useMode();
  const [busca, setBusca] = useState("");

  const categoriasFiltradas = categorias.filter(c =>
    c.label.toLowerCase().includes(busca.toLowerCase())
  );

  const totalDisponiveis = categorias.reduce((acc, c) => acc + c.disponiveis, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto container-padding">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold mb-2">
              Profissionais disponíveis
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>No raio de <strong className="text-foreground">30 km</strong> da sua localização</span>
            </div>
          </div>

          {/* Total */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-primary">
                {totalDisponiveis.toLocaleString("pt-BR")}+
              </p>
              <p className="text-sm text-muted-foreground">
                freelancers disponíveis na sua região
              </p>
            </div>
          </div>

          {/* Busca */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por tipo de profissional..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Grid de categorias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriasFiltradas.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/freelancers/${cat.id}`}
                  className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${cat.cor} flex items-center justify-center shrink-0`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{cat.label}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Raio de 30 km</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-display font-bold text-primary">
                        {cat.disponiveis.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">disponíveis agora</p>
                    </div>
                    <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Ver profissionais
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty state */}
          {categoriasFiltradas.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                Nenhuma categoria encontrada
              </p>
              <Button variant="outline" onClick={() => setBusca("")}>
                Limpar busca
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
