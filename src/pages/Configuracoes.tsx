import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Shield, Mail, Briefcase, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";

const Configuracoes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [notifNovasVagas, setNotifNovasVagas] = useState(true);
  const [notifAvaliacoes, setNotifAvaliacoes] = useState(true);
  const [notifPagamentos, setNotifPagamentos] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  const handleSave = () => {
    toast({ title: "Configurações salvas", description: "Suas preferências foram atualizadas." });
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Configurações</h1>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notificações
            </h3>
            <ToggleRow icon={Briefcase} label="Novas vagas na região" checked={notifNovasVagas} onChange={setNotifNovasVagas} />
            <ToggleRow icon={Bell} label="Avaliações recebidas" checked={notifAvaliacoes} onChange={setNotifAvaliacoes} />
            <ToggleRow icon={Bell} label="Pagamentos e recebimentos" checked={notifPagamentos} onChange={setNotifPagamentos} />
            <div className="border-t pt-3 space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Canais</p>
              <ToggleRow icon={Mail} label="Receber por e-mail" checked={notifEmail} onChange={setNotifEmail} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Legal
            </h3>
            <Link to="/termos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Termos de Uso</p>
            </Link>
            <Link to="/privacidade" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Política de Privacidade</p>
            </Link>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">Salvar Configurações</Button>
      </div>
    </AppLayout>
  );
};

const ToggleRow = ({
  icon: Icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default Configuracoes;
