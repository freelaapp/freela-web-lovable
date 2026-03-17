import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Users, Mail, FileText, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";

const ConfiguracoesContratante = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [notifCandidaturas, setNotifCandidaturas] = useState(true);
  const [notifMensagens, setNotifMensagens] = useState(true);
  const [notifAvaliacoes, setNotifAvaliacoes] = useState(true);
  const [notifPagamentos, setNotifPagamentos] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifPush, setNotifPush] = useState(true);

  const [perfilPublico, setPerfilPublico] = useState(true);
  const [modoEscuro, setModoEscuro] = useState(false);

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
            <ToggleRow icon={Users} label="Novas candidaturas em vagas" checked={notifCandidaturas} onChange={setNotifCandidaturas} />
            <ToggleRow icon={MessageSquare} label="Mensagens recebidas" checked={notifMensagens} onChange={setNotifMensagens} />
            <ToggleRow icon={Bell} label="Avaliações recebidas" checked={notifAvaliacoes} onChange={setNotifAvaliacoes} />
            <ToggleRow icon={Bell} label="Pagamentos realizados" checked={notifPagamentos} onChange={setNotifPagamentos} />
            <div className="border-t pt-3 space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Canais</p>
              <ToggleRow icon={Mail} label="Receber por e-mail" checked={notifEmail} onChange={setNotifEmail} />
              <ToggleRow icon={Smartphone} label="Notificações push" checked={notifPush} onChange={setNotifPush} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Privacidade
            </h3>
            <ToggleRow icon={Globe} label="Perfil público" desc="Freelancers podem ver seu perfil" checked={perfilPublico} onChange={setPerfilPublico} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Preferências
            </h3>
            <ToggleRow icon={Moon} label="Modo escuro" checked={modoEscuro} onChange={setModoEscuro} />
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

const ToggleRow = ({ icon: Icon, label, desc, checked, onChange }: {
  icon: React.ElementType; label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void;
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

export default ConfiguracoesContratante;
