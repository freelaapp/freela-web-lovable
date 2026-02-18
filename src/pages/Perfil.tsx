import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Star, Shield } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { icon: User, label: "Meus Dados", href: "#", description: "Editar perfil e informações" },
  { icon: CreditCard, label: "Pagamentos", href: "#", description: "Cartões e histórico" },
  { icon: Bell, label: "Notificações", href: "#", description: "Preferências de alerta" },
  { icon: Settings, label: "Configurações", href: "#", description: "Privacidade e conta" },
  { icon: HelpCircle, label: "Ajuda", href: "#", description: "Central de suporte" },
];

const Perfil = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold mb-3">
              AS
            </div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-display font-bold">Ana Souza</h2>
              <Shield className="w-4 h-4 text-primary fill-primary/20" />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">ana.souza@email.com</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-primary font-medium">
              <Star className="w-4 h-4 fill-primary" /> 4.8 • Contratante
            </div>
            <Button variant="outline" size="sm" className="mt-4">
              Editar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Menu */}
        <Card>
          <CardContent className="p-2">
            {menuItems.map((item, i) => (
              <Link
                key={i}
                to={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Dashboards */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
            <Link to="/dashboard-freelancer">
              <User className="w-5 h-5 text-primary" />
              <span className="text-xs">Área Freelancer</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
            <Link to="/dashboard-contratante">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-xs">Área Contratante</span>
            </Link>
          </Button>
        </div>

        {/* Logout */}
        <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
          <LogOut className="w-4 h-4" /> Sair da conta
        </Button>
      </div>
    </AppLayout>
  );
};

export default Perfil;
