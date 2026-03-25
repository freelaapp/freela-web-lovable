import { Clock, Users, Briefcase, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface VagaCardProps {
  id: string;
  assignment: string;
  quantity: number;
  jobDate: string;
  status: string;
  serviceIndex?: number;
  onDelete?: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
}

const statusLabels: Record<string, string> = {
  open: "Aberta",
  "in hiring": "Em contratação",
  closed: "Preenchida",
  removed: "Concluída",
};

const statusStyles: Record<string, string> = {
  open: "bg-success-light text-success",
  "in hiring": "bg-warning-light text-warning",
  closed: "bg-primary-light text-primary",
  removed: "bg-muted text-muted-foreground",
};

const VagaCard = ({ id, assignment, quantity, jobDate, status, serviceIndex = 0, onDelete, isDeleting = false }: VagaCardProps) => {
  const navigate = useNavigate();

  const formattedDate = (() => {
    try {
      return new Date(jobDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return jobDate;
    }
  })();

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
      onClick={() => navigate(`/evento/${id}`, { state: { serviceIndex } })}
    >
      <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
        <Briefcase className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{assignment}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
          <Clock className="w-3 h-3" /> {formattedDate}
          <span>•</span>
          <Users className="w-3 h-3" /> {quantity} freelancer{quantity !== 1 ? "s" : ""}
        </p>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${statusStyles[status] || "bg-muted text-muted-foreground"}`}>
        {statusLabels[status] || status}
      </span>
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          disabled={isDeleting}
          onClick={async (e) => {
            e.stopPropagation();
            await onDelete(id);
          }}
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      )}
    </div>
  );
};

export default VagaCard;
