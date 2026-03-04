import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, AlertTriangle, Building2, ImagePlus, MapPin, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";

// ── Helpers ──────────────────────────────────────────────────
const maskCEP = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d)/, "$1-$2");
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// ── Type detection ───────────────────────────────────────────
type ContractorType = "empresas" | "casa_cnpj" | "casa_cpf";

function detectContractorType(): ContractorType {
  // Try to detect from stored registration/contractor data
  try {
    const stored = localStorage.getItem("contractorType");
    if (stored === "empresas" || stored === "casa_cnpj" || stored === "casa_cpf") return stored;
  } catch {}
  // Fallback: check pendingRegisterData or default
  return "empresas";
}

// ── Address Fields Component ─────────────────────────────────
interface AddressFieldsProps {
  cep: string;
  rua: string;
  complemento: string;
  bairro: string;
  numero: string;
  cidade: string;
  estado: string;
  cepLoading: boolean;
  onCepChange: (v: string) => void;
  onRuaChange: (v: string) => void;
  onComplementoChange: (v: string) => void;
  onBairroChange: (v: string) => void;
  onNumeroChange: (v: string) => void;
  onCidadeChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
}

const AddressFields = ({
  cep, rua, complemento, bairro, numero, cidade, estado, cepLoading,
  onCepChange, onRuaChange, onComplementoChange, onBairroChange,
  onNumeroChange, onCidadeChange, onEstadoChange,
}: AddressFieldsProps) => (
  <Card>
    <CardContent className="p-6 space-y-4">
      <h3 className="text-base font-display font-bold flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" /> Endereço
      </h3>
      <div className="space-y-2">
        <Label>CEP</Label>
        <Input value={cep} onChange={(e) => onCepChange(e.target.value)} placeholder="00000-000" />
        {cepLoading && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Buscando endereço...
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Rua</Label>
        <Input value={rua} onChange={(e) => onRuaChange(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Número</Label>
          <Input value={numero} onChange={(e) => onNumeroChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Complemento</Label>
          <Input value={complemento} onChange={(e) => onComplementoChange(e.target.value)} placeholder="Opcional" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Bairro</Label>
        <Input value={bairro} onChange={(e) => onBairroChange(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input value={cidade} onChange={(e) => onCidadeChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Input value={estado} onChange={(e) => onEstadoChange(e.target.value)} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ── Delete Account Dialog ────────────────────────────────────
interface DeleteAccountProps {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountDialog = ({ email, open, onOpenChange }: DeleteAccountProps) => {
  const { toast } = useToast();
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoOTP, setCodigoOTP] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  const reset = () => { setCodigoEnviado(false); setCodigoOTP(""); setConfirmado(false); };

  const handleEnviarCodigo = () => {
    setCodigoEnviado(true);
    toast({ title: "Código enviado", description: "Verifique seu e-mail para o código de confirmação." });
  };

  const handleConfirmar = () => {
    if (codigoOTP.length === 6) {
      setConfirmado(true);
      setTimeout(() => { onOpenChange(false); reset(); }, 5000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onOpenChange(false); reset(); } }}>
      <DialogContent className="max-w-sm">
        {confirmado ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">Exclusão Solicitada</DialogTitle>
              <DialogDescription className="text-center">Sua conta será apagada em 7 dias.</DialogDescription>
            </DialogHeader>
          </div>
        ) : !codigoEnviado ? (
          <>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>Enviaremos um código para <strong>{email}</strong>.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleEnviarCodigo}>Enviar Código</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Insira o Código</DialogTitle>
              <DialogDescription>Digite o código de 6 dígitos enviado para {email}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <InputOTP maxLength={6} value={codigoOTP} onChange={setCodigoOTP}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                  <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleConfirmar} disabled={codigoOTP.length < 6}>Confirmar Exclusão</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Delete Account Card ──────────────────────────────────────
const DeleteAccountCard = ({ onOpen }: { onOpen: () => void }) => (
  <Card className="border-destructive/30">
    <CardContent className="p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-bold text-destructive">Apagar Conta</h3>
          <p className="text-xs text-muted-foreground">
            Ao solicitar a exclusão, um código será enviado para seu e-mail.
            Após confirmação, sua conta será apagada em 7 dias.
          </p>
          <Button variant="destructive" size="sm" onClick={onOpen} className="gap-2">
            <Trash2 className="w-4 h-4" /> Solicitar Exclusão
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ── Main Component ───────────────────────────────────────────
const MeusDadosContratante = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fachadaRef = useRef<HTMLInputElement>(null);
  const internoRef = useRef<HTMLInputElement>(null);

  const [type] = useState<ContractorType>(detectContractorType);

  // Common fields
  const [email] = useState("contato@freelaebreja.com.br");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  // Empresas & Casa CNPJ shared
  const [cnpj] = useState("12.345.678/0001-90");
  const [razaoSocial] = useState("Freela e Breja LTDA");

  // Empresas only
  const [ramo, setRamo] = useState("Bar e Restaurante");
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("Freela & Breja");
  const [responsavel, setResponsavel] = useState("Ana Oliveira");
  const [responsavelTelefone, setResponsavelTelefone] = useState("(11) 98888-7777");
  const [fotoFachada, setFotoFachada] = useState<string | null>(null);
  const [fotoInterno, setFotoInterno] = useState<string | null>(null);

  // Casa CPF only
  const [cpf] = useState("123.456.789-00");
  const [dataNascimento] = useState("15/03/1990");

  const [deleteDialog, setDeleteDialog] = useState(false);

  // ViaCEP
  const buscarCep = useCallback(async (digits: string) => {
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
      }
    } catch { /* silently fail */ }
    finally { setCepLoading(false); }
  }, []);

  const handleCepChange = (value: string) => {
    const masked = maskCEP(value);
    setCep(masked);
    const digits = value.replace(/\D/g, "");
    if (digits.length === 8) buscarCep(digits);
  };

  const handleSave = () => {
    toast({ title: "Dados atualizados", description: "As informações foram salvas com sucesso." });
  };

  const handleFachadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) setFotoFachada(URL.createObjectURL(file));
  };

  const handleInternoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) setFotoInterno(URL.createObjectURL(file));
  };

  const pageTitle = type === "empresas"
    ? "Perfil do Estabelecimento"
    : type === "casa_cnpj"
    ? "Meus Dados"
    : "Meus Dados";

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">{pageTitle}</h1>
        </div>

        {/* ═══ EMPRESAS ═══ */}
        {type === "empresas" && (
          <>
            {/* Fotos */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-base font-display font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" /> Fotos do Estabelecimento
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => fachadaRef.current?.click()}
                    className="aspect-video rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors overflow-hidden">
                    {fotoFachada ? (
                      <img src={fotoFachada} alt="Fachada" className="w-full h-full object-cover" />
                    ) : (
                      <><ImagePlus className="w-6 h-6 text-primary/60" /><span className="text-[10px] text-primary/60 font-medium">Fachada</span></>
                    )}
                  </button>
                  <button onClick={() => internoRef.current?.click()}
                    className="aspect-video rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors overflow-hidden">
                    {fotoInterno ? (
                      <img src={fotoInterno} alt="Ambiente Interno" className="w-full h-full object-cover" />
                    ) : (
                      <><ImagePlus className="w-6 h-6 text-primary/60" /><span className="text-[10px] text-primary/60 font-medium">Ambiente Interno</span></>
                    )}
                  </button>
                </div>
                <input ref={fachadaRef} type="file" accept="image/*" className="hidden" onChange={handleFachadaChange} />
                <input ref={internoRef} type="file" accept="image/*" className="hidden" onChange={handleInternoChange} />
              </CardContent>
            </Card>

            {/* Dados do Estabelecimento */}
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input value={cnpj} disabled className="opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">O CNPJ não pode ser alterado.</p>
                </div>
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input value={razaoSocial} disabled className="opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">A Razão Social não pode ser alterada.</p>
                </div>
                <div className="space-y-2">
                  <Label>Ramo de Atividade</Label>
                  <Input value={ramo} onChange={(e) => setRamo(e.target.value)} placeholder="Ex: Restaurante, Bar, Buffet..." />
                </div>
                <div className="space-y-2">
                  <Label>Nome do Estabelecimento</Label>
                  <Input value={nomeEstabelecimento} onChange={(e) => setNomeEstabelecimento(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Responsável pela Operação</Label>
                  <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>DDD + Telefone do Responsável</Label>
                  <Input
                    value={responsavelTelefone}
                    onChange={(e) => setResponsavelTelefone(formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ═══ CASA CNPJ ═══ */}
        {type === "casa_cnpj" && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input value={cnpj} disabled className="opacity-60 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">O CNPJ não pode ser alterado.</p>
              </div>
              <div className="space-y-2">
                <Label>Razão Social</Label>
                <Input value={razaoSocial} disabled className="opacity-60 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">A Razão Social não pode ser alterada.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══ CASA CPF ═══ */}
        {type === "casa_cpf" && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={cpf} disabled className="opacity-60 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">O CPF não pode ser alterado.</p>
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input value={dataNascimento} disabled className="opacity-60 cursor-not-allowed" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Endereço – all variants */}
        <AddressFields
          cep={cep} rua={rua} complemento={complemento} bairro={bairro}
          numero={numero} cidade={cidade} estado={estado} cepLoading={cepLoading}
          onCepChange={handleCepChange} onRuaChange={setRua} onComplementoChange={setComplemento}
          onBairroChange={setBairro} onNumeroChange={setNumero} onCidadeChange={setCidade}
          onEstadoChange={setEstado}
        />

        {/* Save */}
        <Button onClick={handleSave} className="w-full">Salvar Alterações</Button>

        {/* Delete */}
        <DeleteAccountCard onOpen={() => setDeleteDialog(true)} />
      </div>

      <DeleteAccountDialog email={email} open={deleteDialog} onOpenChange={setDeleteDialog} />
    </AppLayout>
  );
};

export default MeusDadosContratante;
