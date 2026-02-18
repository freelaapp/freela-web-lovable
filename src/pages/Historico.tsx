import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Calendar, Star, DollarSign, MapPin } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const mockHistorico = [
  { id: 1, title: "Churrasco - Réveillon", client: "Pedro Costa", date: "31 Dez 2025", location: "São Paulo, SP", value: "R$ 2.000", rating: 5.0 },
  { id: 2, title: "Bartender - Formatura", client: "Faculdade ABC", date: "20 Dez 2025", location: "Santo André, SP", value: "R$ 1.500", rating: 4.8 },
  { id: 3, title: "Garçom - Casamento", client: "João e Maria", date: "10 Dez 2025", location: "Campinas, SP", value: "R$ 900", rating: 4.9 },
  { id: 4, title: "Churrasco - Aniversário", client: "Carla Lima", date: "28 Nov 2025", location: "Guarulhos, SP", value: "R$ 750", rating: 5.0 },
  { id: 5, title: "Bartender - Evento Corporativo", client: "StartupX", date: "15 Nov 2025", location: "São Paulo, SP", value: "R$ 1.200", rating: 4.7 },
];

const Historico = () => {
  const totalGanho = "R$ 6.350";
  const mediaAvaliacao = "4.9";

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Histórico 📋</h1>
          <p className="text-muted-foreground text-sm mt-1">Vagas concluídas e seu desempenho</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
                <History className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl font-bold font-display">{mockHistorico.length}</p>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <p className="text-xl font-bold font-display">{totalGanho}</p>
              <p className="text-xs text-muted-foreground">Total Ganho</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-warning" />
              </div>
              <p className="text-xl font-bold font-display">{mediaAvaliacao}</p>
              <p className="text-xs text-muted-foreground">Avaliação</p>
            </CardContent>
          </Card>
        </div>

        {/* Histórico List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Trabalhos Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockHistorico.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.client} • {item.date}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-success">{item.value}</p>
                  <span className="flex items-center justify-end gap-0.5 text-[10px] text-primary font-medium mt-0.5">
                    <Star className="w-3 h-3 fill-primary" /> {item.rating}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Historico;
