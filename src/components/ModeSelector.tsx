import { useMode, ServiceMode } from "@/contexts/ModeContext";
import { Home, Building2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ModeSelector = () => {
  const { mode, setMode } = useMode();
  const navigate = useNavigate();
  const location = useLocation();

  const handleModeChange = (newMode: ServiceMode) => {
    setMode(newMode);
    // If on Home Page or already on /inicio, navigate/refresh with param
    if (location.pathname === "/" || location.pathname === "/inicio") {
      navigate(`/inicio?modo=${newMode}`);
    }
  };

  const modes: { value: ServiceMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: "casa",
      label: "Freela em Casa",
      icon: <Home className="w-4 h-4" />,
      description: "Eventos particulares",
    },
    {
      value: "empresas",
      label: "Freela para Empresas",
      icon: <Building2 className="w-4 h-4" />,
      description: "Contratação corporativa",
    },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => handleModeChange(m.value)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            mode === m.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
          }`}
          title={m.description}
        >
          {m.icon}
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;
