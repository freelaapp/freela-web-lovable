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

const formatHours = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}:${String(m).padStart(2, "0")}h` : `${h}h`;
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
    <div className="group relative bg-card border border-border rounded-xl p-3.5 transition-all hover:shadow-md hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-destructive transition-colors text-sm leading-none"
        aria-label="Remover serviço"
      >
        ✕
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-foreground text-sm">{label}</h3>
      </div>

      {/* Controls grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Quantidade */}
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Pessoas</span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => onQuantidadeChange(Math.max(1, quantidade - 1))}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-base font-bold text-foreground w-6 text-center">{quantidade}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => onQuantidadeChange(quantidade + 1)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Horário */}
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> Horário
          </span>
          <div className="flex items-center gap-1 min-w-0">
            <Input
              type="time"
              step="300"
              value={horaInicio}
              onChange={(e) => onHoraInicioChange(e.target.value)}
              className="h-7 text-[11px] px-1 rounded-lg min-w-0 flex-1"
            />
            <span className="text-muted-foreground text-[10px] shrink-0">às</span>
            <Input
              type="time"
              step="300"
              value={horaFim}
              onChange={(e) => onHoraFimChange(e.target.value)}
              className="h-7 text-[11px] px-1 rounded-lg min-w-0 flex-1"
            />
          </div>
        </div>
      </div>

      {/* Footer - cálculo */}
      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {hours > 0 ? (
            <>
              {hours < minHours && (
                <span className="text-amber-600 text-[10px]">mín. {minHours}h • </span>
              )}
              {formatHours(effectiveHours)} × {quantidade} pessoa{quantidade > 1 ? "s" : ""}
            </>
          ) : (
            <span className="text-[10px]">Selecione o horário</span>
          )}
        </div>
        {hours > 0 && (
          <span className="text-sm font-bold text-primary">
            R$ {valor.toFixed(2).replace(".", ",")}
          </span>
        )}
      </div>
    </div>
  );
};

export default ServicoCard;
