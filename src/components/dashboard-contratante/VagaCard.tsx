import { Clock, Users, Briefcase } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface VagaCardProps {
  id: string;
  assignment: string;
  quantity: number;
  jobDate: string;
  status: string;
  serviceIndex?: number;
}

const statusLabels: Record<string, string> = {
  open: "Aberta",
  pending: "Pendente",
  accepted: "Aceita",
  rejected: "Recusada",
  confirmed: "Confirmada",
  closed: "Preenchida",
  removed: "Concluída",
  completed: "Concluída",
  "in hiring": "Em contratação",
};

const statusStyles: Record<string, string> = {
  open: "bg-success-light text-success",
  pending: "bg-warning-light text-warning",
  accepted: "bg-success-light text-success",
  rejected: "bg-destructive/10 text-destructive",
  confirmed: "bg-success-light text-success",
  closed: "bg-primary-light text-primary",
  removed: "bg-muted text-muted-foreground",
  completed: "bg-muted text-muted-foreground",
  "in hiring": "bg-warning-light text-warning",
};

const VagaCard = ({ id, assignment, quantity, jobDate, status, serviceIndex = 0 }: VagaCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const formattedDate = (() => {
    try {
      return new Date(jobDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return jobDate;
    }
  })();

  const handleClick = () => {
    const currentState = location.state as Record<string, unknown> || {};
    navigate(`/evento/${id}`, { 
      state: { 
        ...currentState,
        serviceIndex 
      } 
    });
  };

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
      onClick={handleClick}
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
    </div>
  );
};

export default VagaCard;
