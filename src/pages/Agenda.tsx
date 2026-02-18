import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const mockVagas = [
  { id: 1, title: "Churrasco - Aniversário 30 anos", client: "Ana Oliveira", date: "22 Fev 2026", dateObj: new Date(2026, 1, 22), time: "14:00 - 22:00", location: "São Paulo, SP", status: "aceita", value: "R$ 650" },
  { id: 2, title: "Bartender - Evento Corporativo", client: "Tech Corp", date: "28 Fev 2026", dateObj: new Date(2026, 1, 28), time: "18:00 - 00:00", location: "Campinas, SP", status: "aceita", value: "R$ 1.200" },
  { id: 3, title: "Garçom - Casamento", client: "Maria Santos", date: "08 Mar 2026", dateObj: new Date(2026, 2, 8), time: "16:00 - 23:00", location: "Guarulhos, SP", status: "preenchida", value: "R$ 800" },
  { id: 4, title: "Churrasco - Confraternização", client: "Empresa X", date: "15 Mar 2026", dateObj: new Date(2026, 2, 15), time: "12:00 - 18:00", location: "Osasco, SP", status: "aceita", value: "R$ 900" },
];

const Agenda = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const vagasAceitas = mockVagas.filter(v => v.status === "aceita");
  const vagasPreenchidas = mockVagas.filter(v => v.status === "preenchida");

  // Dates that have jobs
  const jobDates = mockVagas.map(v => v.dateObj);

  // Filter vagas by selected date
  const vagasFiltradas = selectedDate
    ? mockVagas.filter(v => v.dateObj.toDateString() === selectedDate.toDateString())
    : null;

  const VagaCard = ({ vaga, color }: { vaga: typeof mockVagas[0]; color: "primary" | "success" }) => (
    <div
      key={vaga.id}
      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
      onClick={() => navigate(`/vaga/${vaga.id}`)}
    >
      <div className={`w-12 h-12 rounded-xl ${color === "primary" ? "bg-primary-light" : "bg-success-light"} flex items-center justify-center shrink-0`}>
        {color === "primary" ? <CalendarIcon className="w-5 h-5 text-primary" /> : <CheckCircle className="w-5 h-5 text-success" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{vaga.title}</p>
        <p className="text-xs text-muted-foreground">{vaga.client} • {vaga.date}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3" /> {vaga.time} • <MapPin className="w-3 h-3" /> {vaga.location}
        </p>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <p className={`text-sm font-bold ${color === "primary" ? "text-primary" : "text-success"}`}>{vaga.value}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${color === "primary" ? "bg-primary-light text-primary" : "bg-success-light text-success"}`}>
          {vaga.status}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );

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
                <CalendarIcon className="w-5 h-5 text-primary" />
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

        <Tabs defaultValue="calendario" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="calendario" className="flex-1">Calendário</TabsTrigger>
            <TabsTrigger value="lista" className="flex-1">Lista</TabsTrigger>
          </TabsList>

          {/* Aba Calendário */}
          <TabsContent value="calendario" className="space-y-4">
            <Card>
              <CardContent className="p-4 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="pointer-events-auto"
                  modifiers={{ hasJob: jobDates }}
                  modifiersClassNames={{ hasJob: "bg-primary/20 text-primary font-bold rounded-full" }}
                />
              </CardContent>
            </Card>

            {vagasFiltradas && vagasFiltradas.length > 0 ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Vagas em {selectedDate?.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vagasFiltradas.map(vaga => (
                    <VagaCard key={vaga.id} vaga={vaga} color={vaga.status === "aceita" ? "primary" : "success"} />
                  ))}
                </CardContent>
              </Card>
            ) : selectedDate ? (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Nenhuma vaga nessa data
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Selecione uma data para ver as vagas
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Lista */}
          <TabsContent value="lista" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" /> Vagas Aceitas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vagasAceitas.map(vaga => (
                  <VagaCard key={vaga.id} vaga={vaga} color="primary" />
                ))}
              </CardContent>
            </Card>

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
                  vagasPreenchidas.map(vaga => (
                    <VagaCard key={vaga.id} vaga={vaga} color="success" />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Agenda;
