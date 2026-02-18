import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, CheckCircle, Users } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const mockVagas = [
  { id: 1, title: "Churrasco - Aniversário 30 anos", client: "Ana Oliveira", date: "22 Fev 2026", time: "14:00 - 22:00", location: "São Paulo, SP", status: "aceita", value: "R$ 650" },
  { id: 2, title: "Bartender - Evento Corporativo", client: "Tech Corp", date: "28 Fev 2026", time: "18:00 - 00:00", location: "Campinas, SP", status: "aceita", value: "R$ 1.200" },
  { id: 3, title: "Garçom - Casamento", client: "Maria Santos", date: "08 Mar 2026", time: "16:00 - 23:00", location: "Guarulhos, SP", status: "preenchida", value: "R$ 800" },
  { id: 4, title: "Churrasco - Confraternização", client: "Empresa X", date: "15 Mar 2026", time: "12:00 - 18:00", location: "Osasco, SP", status: "aceita", value: "R$ 900" },
];

const Agenda = () => {
  const vagasAceitas = mockVagas.filter(v => v.status === "aceita");
  const vagasPreenchidas = mockVagas.filter(v => v.status === "preenchida");

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-5xl mx-auto pb-8 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Minha Agenda 📅</h1>
          <p className="text-muted-foreground text-sm mt-1">Vagas aceitas e preenchidas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl font-bold font-display">{vagasAceitas.length}</p>
              <p className="text-xs text-muted-foreground">Vagas Aceitas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <p className="text-xl font-bold font-display">{vagasPreenchidas.length}</p>
              <p className="text-xs text-muted-foreground">Vagas Preenchidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Vagas Aceitas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Vagas Aceitas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vagasAceitas.map((vaga) => (
              <div key={vaga.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{vaga.title}</p>
                  <p className="text-xs text-muted-foreground">{vaga.client} • {vaga.date}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {vaga.time} • <MapPin className="w-3 h-3" /> {vaga.location}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{vaga.value}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary-light text-primary">
                    aceita
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vagas Preenchidas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" /> Vagas Preenchidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vagasPreenchidas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma vaga preenchida no momento</p>
            ) : (
              vagasPreenchidas.map((vaga) => (
                <div key={vaga.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{vaga.title}</p>
                    <p className="text-xs text-muted-foreground">{vaga.client} • {vaga.date}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {vaga.time} • <MapPin className="w-3 h-3" /> {vaga.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-success">{vaga.value}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-success-light text-success">
                      preenchida
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Agenda;
