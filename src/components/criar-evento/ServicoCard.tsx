import { Minus, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  /** Hora mínima permitida para início (formato "HH:00"). Usado quando o evento é hoje. */
  horaMinima?: string;
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
  const h1 = parseInt(inicio.replace("h", ""));
  const h2 = parseInt(fim.replace("h", ""));
  let diff = h2 - h1;
  if (diff <= 0) diff += 24;
  return diff;
};

const formatHours = (hours: number): string => {
  return `${hours}h`;
};

export { calcHours };

/** Gera array de horas fechadas: ["00h", "01h", ..., "23h"] */
const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);

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
  horaMinima,
}: ServicoCardProps) => {
  const hours = calcHours(horaInicio, horaFim);
  const effectiveHours = Math.max(hours, minHours);
  const valor = pricePerHour * effectiveHours * quantidade;
  const isBelowMin = hours > 0 && hours < minHours;

  // Horas disponíveis para início: todas >= horaMinima (se fornecida)
  const horasInicio = horaMinima
    ? HORAS.filter((h) => h >= horaMinima)
    : HORAS;

  // Horas disponíveis para fim: apenas horas posteriores à hora de início
  const horasFim = horaInicio
    ? HORAS.filter((h) => {
        const hi = parseInt(horaInicio.replace("h", ""));
        const hf = parseInt(h.replace("h", ""));
        // Permite wrap-around (ex: início 22h → fim pode ser 01h do dia seguinte)
        return hf !== hi;
      })
    : HORAS;

  return (
    <div className={`group relative bg-card border rounded-xl p-3.5 transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 ${isBelowMin ? "border-destructive/50" : "border-border hover:border-primary/30"}`}>
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
            {/* Hora de início */}
            <div className="flex-1 min-w-0">
              <Select value={horaInicio} onValueChange={onHoraInicioChange}>
                <SelectTrigger className="h-7 text-[11px] px-2 rounded-lg w-full">
                  <SelectValue placeholder="--:--" />
                </SelectTrigger>
                <SelectContent>
                  {horasInicio.map((h) => (
                    <SelectItem key={h} value={h} className="text-xs">
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-muted-foreground text-[10px] shrink-0">às</span>
            {/* Hora de fim */}
            <div className="flex-1 min-w-0">
              <Select value={horaFim} onValueChange={onHoraFimChange} disabled={!horaInicio}>
                <SelectTrigger className="h-7 text-[11px] px-2 rounded-lg w-full">
                  <SelectValue placeholder="--:--" />
                </SelectTrigger>
                <SelectContent>
                  {horasFim.map((h) => (
                    <SelectItem key={h} value={h} className="text-xs">
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Min hours warning */}
      {isBelowMin && (
        <p className="mt-2 text-[11px] text-destructive font-medium">
          *O mínimo de horas permitido é {minHours}h
        </p>
      )}

      {/* Footer - cálculo */}
      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {hours > 0 ? (
            <>
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
