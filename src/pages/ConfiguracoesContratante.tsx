import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Shield, Moon, Smartphone, Users, FileText, Loader2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { getContractorSettings, updateContractorSettings, UpsertSettingsPayload } from "@/lib/api";

// ── Tipos ──────────────────────────────────────────────────────
interface SettingsState {
  notifCandidaturas: boolean;
  notifMensagens: boolean;
  notifAvaliacoes: boolean;
  notifPagamentos: boolean;
  notifEmail: boolean;
  notifPush: boolean;
  perfilPublico: boolean;
}

// ── Modo Escuro via localStorage (sem API) ─────────────────────
const DARK_MODE_KEY = "freela_dark_mode";

const getDarkMode = (): boolean => {
  const stored = localStorage.getItem(DARK_MODE_KEY);
  if (stored !== null) return stored === "true";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const setDarkMode = (value: boolean) => {
  localStorage.setItem(DARK_MODE_KEY, String(value));
  document.documentElement.classList.toggle("dark", value);
};

// ── Estado inicial ──────────────────────────────────────────────
const DEFAULT_SETTINGS: SettingsState = {
  notifCandidaturas: true,
  notifMensagens: true,
  notifAvaliacoes: true,
  notifPagamentos: true,
  notifEmail: true,
  notifPush: true,
  perfilPublico: true,
};

// ── Component ───────────────────────────────────────────────────
const ConfiguracoesContratante = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [modoEscuro, setModoEscuro] = useState(getDarkMode);

  // Aplicar tema escuro ao carregar
  useEffect(() => {
    document.documentElement.classList.toggle("dark", modoEscuro);
  }, [modoEscuro]);

  // Carregar contractorId e settings da API
  useEffect(() => {
    const loadData = async () => {
      try {
        const tokenRaw = localStorage.getItem("authToken");
        if (!tokenRaw) {
          toast({ title: "Erro", description: "Sessão não encontrada.", variant: "destructive" });
          setLoading(false);
          return;
        }

        const token = JSON.parse(tokenRaw);

        // Buscar contractorId via /users/contractors
        const contractorRes = await fetch(`${import.meta.env.API_BASE_URL}/users/contractors`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Origin-type": "Web",
            Authorization: `Bearer ${token}`,
          },
        });

        const contractorBody = await contractorRes.json();
        const cid = contractorBody?.data?.id;

        if (!cid) {
          console.warn("[ConfiguracoesContratante] Contractor ID não encontrado");
          setLoading(false);
          return;
        }

        setContractorId(cid);

        // Buscar settings da API
        const settingsData = await getContractorSettings(cid);
        setSettings({
          notifCandidaturas: settingsData.notifCandidaturas,
          notifMensagens: settingsData.notifMensagens,
          notifAvaliacoes: settingsData.notifAvaliacoes,
          notifPagamentos: settingsData.notifPagamentos,
          notifEmail: settingsData.notifEmail,
          notifPush: settingsData.notifPush,
          perfilPublico: settingsData.perfilPublico,
        });
      } catch (err) {
        console.error("[ConfiguracoesContratante] Erro ao carregar dados:", err);
        // Mantém defaults em caso de erro
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleToggle = (key: keyof SettingsState, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDarkModeToggle = (value: boolean) => {
    setModoEscuro(value);
    setDarkMode(value);
    toast({
      title: value ? "Modo escuro ativado" : "Modo claro ativado",
      description: "Preferência salva localmente",
    });
  };

  const handleSave = async () => {
    if (!contractorId) {
      toast({ title: "Erro", description: "ID do contratante não encontrado.", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      const payload: UpsertSettingsPayload = {
        notifCandidaturas: settings.notifCandidaturas,
        notifMensagens: settings.notifMensagens,
        notifAvaliacoes: settings.notifAvaliacoes,
        notifPagamentos: settings.notifPagamentos,
        notifEmail: settings.notifEmail,
        notifPush: settings.notifPush,
        perfilPublico: settings.perfilPublico,
      };

      await updateContractorSettings(contractorId, payload);

      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas.",
      });
    } catch (err) {
      console.error("[ConfiguracoesContratante] Erro ao salvar:", err);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout showFooter={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Configurações</h1>
        </div>

        {/* Notificações */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-display font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notificações
            </h3>
            <ToggleRow
              icon={Users}
              label="Novas candidaturas em vagas"
              checked={settings.notifCandidaturas}
              onChange={(v) => handleToggle("notifCandidaturas", v)}
            />
            <ToggleRow
              icon={Bell}
              label="Mensagens recebidas"
              checked={settings.notifMensagens}
              onChange={(v) => handleToggle("notifMensagens", v)}
            />
            <ToggleRow
              icon={Bell}
              label="Avaliações recebidas"
              checked={settings.notifAvaliacoes}
              onChange={(v) => handleToggle("notifAvaliacoes", v)}
            />
            <ToggleRow
              icon={Bell}
              label="Pagamentos realizados"
              checked={settings.notifPagamentos}
              onChange={(v) => handleToggle("notifPagamentos", v)}
            />
            <div className="border-t pt-3 space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Canais</p>
              <ToggleRow
                icon={Smartphone}
                label="Notificações push"
                checked={settings.notifPush}
                onChange={(v) => handleToggle("notifPush", v)}
              />
              <ToggleRow
                icon={Mail}
                label="Receber por e-mail"
                checked={settings.notifEmail}
                onChange={(v) => handleToggle("notifEmail", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacidade */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-display font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Privacidade
            </h3>
            <ToggleRow
              icon={Shield}
              label="Perfil público"
              desc="其他人可以看到您的個人資料"
              checked={settings.perfilPublico}
              onChange={(v) => handleToggle("perfilPublico", v)}
            />
          </CardContent>
        </Card>

        {/* Aparência - Modo Escuro (localStorage) */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-display font-semibold flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" /> Aparência
            </h3>
            <ToggleRow
              icon={Moon}
              label="Modo escuro"
              desc="Altera o tema do aplicativo"
              checked={modoEscuro}
              onChange={handleDarkModeToggle}
            />
          </CardContent>
        </Card>

        {/* Legal */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-display font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Legal
            </h3>
            <a
              href="/termos"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Termos de Uso</p>
            </a>
            <a
              href="/privacidade"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <Shield className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Política de Privacidade</p>
            </a>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <Button onClick={handleSave} className="w-full" disabled={saving || !contractorId}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Configurações"
          )}
        </Button>

        {/* Badge de status */}
        <p className="text-xs text-muted-foreground text-center">
          Modo escuro salvo localmente • Outras configurações sincronizadas
        </p>
      </div>
    </AppLayout>
  );
};

// ── Componente auxiliar ─────────────────────────────────────────
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
  onChange: (value: boolean) => void;
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
