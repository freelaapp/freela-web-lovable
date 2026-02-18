import { Link, useLocation } from "react-router-dom";
import { Home, Search, MessageCircle, User, Calendar, Star } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const BottomNav = () => {
  const location = useLocation();
  const role = useUserRole();

  const freelancerTabs = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/freelancers", icon: Search, label: "Buscar" },
    { href: "/mensagens", icon: MessageCircle, label: "Mensagens" },
    { href: "/perfil", icon: User, label: "Perfil" },
  ];

  const contratanteTabs = [
    { href: "/dashboard-contratante", icon: Home, label: "Início" },
    { href: "/freelancers", icon: Search, label: "Freelancers" },
    { href: "/mensagens", icon: MessageCircle, label: "Mensagens" },
    { href: "/perfil", icon: User, label: "Perfil" },
  ];

  const tabs = role === "contratante" ? contratanteTabs : freelancerTabs;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            to={tab.href}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors duration-200 ${
              isActive(tab.href)
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <tab.icon className={`w-5 h-5 ${isActive(tab.href) ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
