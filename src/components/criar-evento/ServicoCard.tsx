import { Minus, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ServicoCardProps {
  label: string;
  icon: string;
  quantidade: number;
  horaInicio: string;
  horaFim: string;
  onQuantidadeChange: (val: number) => void;
  onHoraInicioChange: (val: string) => void;
  onHoraFimChange: (val: string) => void;
  onRemove: () => void;
  pricePerHour: number;
  minHours: number;
}

const iconMap: Record<string, string> = {
  garcom: "🍽️",
  barman: "🍸",
  barista: "☕",
  cozinheiro: "👨‍🍳",
  "auxiliar-limpeza": "🧹",
  "auxiliar-cozinha": "🥘",
  camareira: "🛏️",
  chapeiro: "🔥",
  cumim: "🍴",
  churrasqueiro: "🥩",
  seguranca: "🛡️",
  hostess: "💁",
  manobrista: "🚗",
  dj: "🎧",
  "musico-sertanejo": "🎵",
  "musico-rock": "🎸",
  "musico-samba-pagode": "🥁",
  "musico-mpb": "🎤",
  "musico-multi": "🎶",
};

export const getServiceIcon = (id: string) => iconMap[id] || "👤";

const calcHours = (inicio: string, fim: string): number => {
  if (!inicio || !fim) return 0;
  const [h1, m1] = inicio.split(":").map(Number);
  const [h2, m2] = fim.split(":").map(Number);
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff <= 0) diff += 24 * 60; // crosses midnight
  return diff / 60;
};

export { calcHours };

const ServicoCard = ({
  label,
  icon,
  quantidade,
  horaInicio,
  horaFim,
  onQuantidadeChange,
  onHoraInicioChange,
  onHoraFimChange,
  onRemove,
  pricePerHour,
  minHours,
}: ServicoCardProps) => {
  const hours = calcHours(horaInicio, horaFim);
  const effectiveHours = Math.max(hours, minHours);
  const valor = pricePerHour * effectiveHours * quantidade;

  return (
    <div className="group relative bg-card border border-border rounded-2xl p-5 transition-all hover:shadow-md hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors text-lg leading-none"
        aria-label="Remover serviço"
      >
        ✕
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <h3 className="font-semibold text-foreground text-lg">{label}</h3>
      </div>

      {/* Controls grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Quantidade */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pessoas</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => onQuantidadeChange(Math.max(1, quantidade - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-xl font-bold text-foreground w-8 text-center">{quantidade}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => onQuantidadeChange(quantidade + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Horário */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3 h-3" /> Horário
          </span>
          <div className="flex items-center gap-1.5">
            <Input
              type="time"
              value={horaInicio}
              onChange={(e) => onHoraInicioChange(e.target.value)}
              className="h-9 text-sm px-2 rounded-xl"
            />
            <span className="text-muted-foreground text-sm">às</span>
            <Input
              type="time"
              value={horaFim}
              onChange={(e) => onHoraFimChange(e.target.value)}
              className="h-9 text-sm px-2 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Footer - cálculo */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {hours > 0 ? (
            <>
              {hours < minHours && (
                <span className="text-amber-600 text-xs">mín. {minHours}h • </span>
              )}
              {effectiveHours}h × {quantidade} pessoa{quantidade > 1 ? "s" : ""}
            </>
          ) : (
            <span className="text-xs">Selecione o horário</span>
          )}
        </div>
        {hours > 0 && (
          <span className="text-lg font-bold text-primary">
            R$ {valor.toFixed(2).replace(".", ",")}
          </span>
        )}
      </div>
    </div>
  );
};

export default ServicoCard;
