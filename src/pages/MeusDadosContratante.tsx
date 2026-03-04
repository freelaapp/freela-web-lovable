import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, AlertTriangle, Building2, ImagePlus, MapPin, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];
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
  try {
    const stored = localStorage.getItem("contractorType");
    if (stored === "empresas" || stored === "casa_cnpj" || stored === "casa_cpf") return stored;
  } catch {}
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
          <Select value={estado} onValueChange={onEstadoChange}>
            <SelectTrigger>
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {estadosBR.map((uf) => (
                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

// ── Snapshot type for change detection ───────────────────────
interface FieldSnapshot {
  cep: string; rua: string; complemento: string; bairro: string;
  numero: string; cidade: string; estado: string;
  cnpj: string; razaoSocial: string;
  ramo: string; nomeEstabelecimento: string;
  responsavel: string; responsavelTelefone: string;
  cpf: string; dataNascimento: string;
}

const makeSnapshot = (s: FieldSnapshot) => JSON.stringify(s);

// ── Main Component ───────────────────────────────────────────
const MeusDadosContratante = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fachadaRef = useRef<HTMLInputElement>(null);
  const internoRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<ContractorType>(detectContractorType);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // ViaCEP metadata
  const [viacepMeta, setViacepMeta] = useState<{ ibge: string; gia: string; ddd: string; siafi: string }>({
    ibge: "", gia: "", ddd: "", siafi: "",
  });

  // Empresas & Casa CNPJ shared
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");

  // Empresas only
  const [ramo, setRamo] = useState("");
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [responsavelTelefone, setResponsavelTelefone] = useState("");
  const [fotoFachada, setFotoFachada] = useState<string | null>(null);
  const [fotoInterno, setFotoInterno] = useState<string | null>(null);

  // File objects for upload
  const [fachadaFile, setFachadaFile] = useState<File | null>(null);
  const [internoFile, setInternoFile] = useState<File | null>(null);

  // Casa CPF only
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  const [deleteDialog, setDeleteDialog] = useState(false);

  // Change detection: snapshot of original values
  const [originalSnapshot, setOriginalSnapshot] = useState("");
  const [originalFotoFachada, setOriginalFotoFachada] = useState<string | null>(null);
  const [originalFotoInterno, setOriginalFotoInterno] = useState<string | null>(null);

  const getCurrentSnapshot = useCallback((): string => {
    return makeSnapshot({
      cep, rua, complemento, bairro, numero, cidade, estado,
      cnpj, razaoSocial, ramo, nomeEstabelecimento,
      responsavel, responsavelTelefone, cpf, dataNascimento,
    });
  }, [cep, rua, complemento, bairro, numero, cidade, estado, cnpj, razaoSocial, ramo, nomeEstabelecimento, responsavel, responsavelTelefone, cpf, dataNascimento]);

  // ── Fetch contractor profile from API ──────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authUserRaw = localStorage.getItem("authUser");
        const tokenRaw = localStorage.getItem("authToken");
        if (!authUserRaw || !tokenRaw) {
          setLoading(false);
          return;
        }
        const userId = JSON.parse(authUserRaw)?.id;
        const token = JSON.parse(tokenRaw);
        if (!userId || !token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`https://api.freelaservicos.com.br/users/contractors`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Origin-type": "Web",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("[MeusDados] Fetch failed:", res.status);
          setLoading(false);
          return;
        }

        const body = await res.json();
        const d = body?.data ?? body;

        // Detect contractor type from API data
        let detectedType: ContractorType = "empresas";
        if (d.cpf && !d.cnpj) {
          detectedType = "casa_cpf";
        } else if (d.cnpj && !d.establishmentFacadeImage && !d.companyName) {
          detectedType = "casa_cnpj";
        } else if (d.cnpj) {
          detectedType = "empresas";
        }
        setType(detectedType);
        localStorage.setItem("contractorType", detectedType);

        // Fotos (Buffer → base64 data URL)
        const bufferToDataUrl = (img: any): string | null => {
          if (!img) return null;
          if (typeof img === "string") return img;
          if (img.type === "Buffer" && Array.isArray(img.data)) {
            const bytes = new Uint8Array(img.data);
            let binary = "";
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            return `data:image/jpeg;base64,${btoa(binary)}`;
          }
          return null;
        };

        const facadeUrl = bufferToDataUrl(d.establishmentFacadeImage);
        if (facadeUrl) { setFotoFachada(facadeUrl); setOriginalFotoFachada(facadeUrl); }

        const interiorUrl = bufferToDataUrl(d.establishmentInteriorImage);
        if (interiorUrl) { setFotoInterno(interiorUrl); setOriginalFotoInterno(interiorUrl); }

        // Collect values for snapshot
        const snapValues: FieldSnapshot = {
          cep: d.cep ? maskCEP(d.cep) : "",
          rua: d.street || "",
          complemento: d.complement || "",
          bairro: d.neighborhood || "",
          numero: d.number || "",
          cidade: d.city || "",
          estado: d.uf || "",
          cnpj: d.cnpj || "",
          razaoSocial: d.corporateReason || "",
          ramo: d.companySegment || "",
          nomeEstabelecimento: d.companyName || "",
          responsavel: d.nameOperationResponsible || "",
          responsavelTelefone: d.phoneOperationResponsible ? formatPhone(d.phoneOperationResponsible) : "",
          cpf: d.cpf || "",
          dataNascimento: d.birthdate || d.birthDate || "",
        };

        // Set all fields
        setCnpj(snapValues.cnpj);
        setRazaoSocial(snapValues.razaoSocial);
        setRamo(snapValues.ramo);
        setNomeEstabelecimento(snapValues.nomeEstabelecimento);
        setResponsavel(snapValues.responsavel);
        setResponsavelTelefone(snapValues.responsavelTelefone);
        setCpf(snapValues.cpf);
        setDataNascimento(snapValues.dataNascimento);
        setCep(snapValues.cep);
        setRua(snapValues.rua);
        setNumero(snapValues.numero);
        setComplemento(snapValues.complemento);
        setBairro(snapValues.bairro);
        setCidade(snapValues.cidade);
        setEstado(snapValues.estado);

        // Store ViaCEP meta from API if available
        if (d.ibge || d.gia || d.ddd || d.siafi) {
          setViacepMeta({
            ibge: d.ibge || "",
            gia: d.gia || "",
            ddd: d.ddd || "",
            siafi: d.siafi || "",
          });
        }

        // Save original snapshot for change detection
        setOriginalSnapshot(makeSnapshot(snapValues));
      } catch (err) {
        console.error("[MeusDados] Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
        setViacepMeta({
          ibge: data.ibge || "",
          gia: data.gia || "",
          ddd: data.ddd || "",
          siafi: data.siafi || "",
        });
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

  // ── Save handler ───────────────────────────────────────────
  const handleSave = async () => {
    // Check for changes
    const currentSnap = getCurrentSnapshot();
    const hasFieldChanges = currentSnap !== originalSnapshot;
    const hasFachadaChange = fachadaFile !== null;
    const hasInternoChange = internoFile !== null;

    if (!hasFieldChanges && !hasFachadaChange && !hasInternoChange) {
      toast({ title: "Nenhuma alteração detectada", description: "Nenhum campo foi modificado." });
      return;
    }

    setSaving(true);
    try {
      const tokenRaw = localStorage.getItem("authToken");
      if (!tokenRaw) {
        toast({ title: "Erro", description: "Token de autenticação não encontrado.", variant: "destructive" });
        setSaving(false);
        return;
      }
      const token = JSON.parse(tokenRaw);

      const cepDigits = cep.replace(/\D/g, "");
      const addressFields = {
        cep: cepDigits,
        street: rua,
        complement: complemento,
        neighborhood: bairro,
        number: numero,
        city: cidade,
        uf: estado,
        ibge: viacepMeta.ibge,
        gia: viacepMeta.gia,
        ddd: viacepMeta.ddd,
        siafi: viacepMeta.siafi,
      };

      const formData = new FormData();
      Object.entries(addressFields).forEach(([k, v]) => formData.append(k, v));

      if (type === "casa_cpf") {
        formData.append("cpf", cpf);
        formData.append("birthdate", dataNascimento);
      } else if (type === "casa_cnpj") {
        formData.append("cnpj", cnpj);
        formData.append("corporateReason", razaoSocial);
      } else if (type === "empresas") {
        formData.append("cnpj", cnpj);
        formData.append("corporateReason", razaoSocial);
        formData.append("companySegment", ramo);
        formData.append("companyName", nomeEstabelecimento);
        formData.append("nameOperationResponsible", responsavel);
        formData.append("phoneOperationResponsible", responsavelTelefone.replace(/\D/g, ""));
        if (fachadaFile) formData.append("establishmentFacadeImage", fachadaFile);
        if (internoFile) formData.append("establishmentInteriorImage", internoFile);
      }

      const res = await fetch("https://api.freelaservicos.com.br/contractors/", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Origin-type": "Web",
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok || res.status === 200 || res.status === 201) {
        toast({ title: "Dados atualizados", description: "As informações foram salvas com sucesso." });
        // Update snapshot to current values
        setOriginalSnapshot(currentSnap);
        if (fachadaFile) { setOriginalFotoFachada(fotoFachada); setFachadaFile(null); }
        if (internoFile) { setOriginalFotoInterno(fotoInterno); setInternoFile(null); }
      } else {
        const errBody = await res.text();
        console.error("[MeusDados] Save failed:", res.status, errBody);
        toast({ title: "Erro ao salvar", description: "Não foi possível atualizar os dados. Tente novamente.", variant: "destructive" });
      }
    } catch (err) {
      console.error("[MeusDados] Save error:", err);
      toast({ title: "Erro ao salvar", description: "Ocorreu um erro inesperado. Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFachadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFotoFachada(URL.createObjectURL(file));
      setFachadaFile(file);
    }
  };

  const handleInternoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFotoInterno(URL.createObjectURL(file));
      setInternoFile(file);
    }
  };

  const pageTitle = type === "empresas"
    ? "Perfil do Estabelecimento"
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

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
        <>
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
        <Button onClick={handleSave} className="w-full" disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...</> : "Salvar Alterações"}
        </Button>

        {/* Delete */}
        <DeleteAccountCard onOpen={() => setDeleteDialog(true)} />
        </>
        )}
      </div>

      <DeleteAccountDialog email={email} open={deleteDialog} onOpenChange={setDeleteDialog} />
    </AppLayout>
  );
};

export default MeusDadosContratante;
