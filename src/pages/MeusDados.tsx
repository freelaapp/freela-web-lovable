import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, AlertTriangle, Wallet, Edit2, Check, X, Phone, User, MapPin, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";

const API_BASE_URL = "https://api.freelaservicos.com.br";
const ORIGIN_TYPE = "Web";

const tiposDeficiencia = [
  { id: "auditiva", label: "Deficiência Auditiva" },
  { id: "visual", label: "Deficiência Visual" },
  { id: "intelectual", label: "Deficiência Intelectual" },
  { id: "mental", label: "Deficiência Mental/Psicossocial" },
];

const grausParentesco = [
  "Pais", "Irmãos(ãs)", "Cônjuge", "Tios(as) e Avós(ôs)", "Amigos(as)",
];

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "Origin-type": ORIGIN_TYPE,
  Authorization: `Bearer ${token}`,
});

const MeusDados = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);

  // Dados de Usuário (/users/me)
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Dados do Provider (/users/providers)
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [providerId, setProviderId] = useState("");

  // PCD
  const [isPCD, setIsPCD] = useState(false);
  const [deficienciasSelecionadas, setDeficienciasSelecionadas] = useState<string[]>([]);

  // Endereço
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // Contato de Emergência
  const [contatoEmergNome, setContatoEmergNome] = useState("");
  const [contatoEmergParentesco, setContatoEmergParentesco] = useState("");
  const [contatoEmergTelefone, setContatoEmergTelefone] = useState("");

  // Pix
  const [editandoPix, setEditandoPix] = useState(false);
  const [chavePixType, setChavePixType] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [tempPixType, setTempPixType] = useState("");
  const [tempPix, setTempPix] = useState("");

  // Delete account
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoOTP, setCodigoOTP] = useState("");
  const [confirmadoDelete, setConfirmadoDelete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const raw = localStorage.getItem("authToken");
      if (!raw) return;
      const token = JSON.parse(raw) as string;
      const headers = getHeaders(token);

      try {
        // Fetch /users/me and /users/providers in parallel
        const [meRes, provRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/me`, { method: "GET", credentials: "include", headers }),
          fetch(`${API_BASE_URL}/users/providers`, { method: "GET", credentials: "include", headers }),
        ]);

        if (meRes.ok) {
          const meBody = await meRes.json();
          const me = meBody?.data ?? meBody;
          setNome(me?.name ?? "");
          setEmail(me?.email ?? "");
          setTelefone(me?.phoneNumber ?? "");
        }

        let pId = "";
        if (provRes.ok) {
          const provBody = await provRes.json();
          const rawProv = provBody?.data ?? provBody;
          const prov = Array.isArray(rawProv) ? rawProv[0] ?? {} : rawProv;

          pId = prov.id ?? "";
          setProviderId(pId);
          setCpf(prov.cpf ?? "");
          setDataNascimento(prov.birthdate ? prov.birthdate.split("T")[0] : "");
          setSexo(prov.gender ?? "");
          setIsPCD(!!prov.deficiency);

          // Endereço
          setCep(prov.cep ?? "");
          setRua(prov.street ?? "");
          setComplemento(prov.complement ?? "");
          setBairro(prov.neighborhood ?? "");
          setNumero(prov.number ?? "");
          setCidade(prov.city ?? "");
          setEstado(prov.uf ?? "");

          // Contato de Emergência
          setContatoEmergNome(prov.emergencyContactName ?? "");
          setContatoEmergTelefone(prov.emergencyContactNumber ?? "");
          setContatoEmergParentesco(prov.emergencyContactRelationship ?? "");
        }

        // Fetch PIX keys
        if (pId) {
          const pixRes = await fetch(`${API_BASE_URL}/providers/pix-keys`, {
            method: "GET",
            credentials: "include",
            headers,
          });
          if (pixRes.ok) {
            const pixBody = await pixRes.json();
            const pixList = pixBody?.data ?? pixBody;
            if (Array.isArray(pixList)) {
              const myPix = pixList.find((p: any) => p.providerId === pId);
              if (myPix) {
                setChavePixType(myPix.type ?? "");
                setChavePix(myPix.key ?? "");
              }
            }
          }
        }
      } catch (err) {
        console.error("[MeusDados] erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = () => {
    toast({ title: "Dados atualizados", description: "Suas informações foram salvas com sucesso." });
  };

  const startEditPix = () => {
    setTempPix(chavePix);
    setTempPixType(chavePixType);
    setEditandoPix(true);
  };

  const savePix = () => {
    setChavePix(tempPix);
    setChavePixType(tempPixType);
    setEditandoPix(false);
    toast({ title: "Pix atualizado", description: "Sua chave Pix foi alterada com sucesso." });
  };

  const handleEnviarCodigo = () => {
    setCodigoEnviado(true);
    toast({ title: "Código enviado", description: "Verifique seu e-mail para o código de confirmação." });
  };

  const handleConfirmarDelete = () => {
    if (codigoOTP.length === 6) {
      setConfirmadoDelete(true);
      setTimeout(() => {
        setDeleteDialog(false);
        setConfirmadoDelete(false);
        setCodigoEnviado(false);
        setCodigoOTP("");
      }, 5000);
    }
  };

  if (loading) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Meus Dados</h1>
        </div>

        {/* Dados de Usuário */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Dados de Usuário
            </h3>
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Número de Celular</Label>
              <Input value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} />
            </div>
            <Button onClick={handleSave} className="w-full">Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Dados de Perfil */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Dados de Perfil
            </h3>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={cpf} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">O CPF não pode ser alterado.</p>
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select value={sexo} onValueChange={setSexo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="prefiro-nao-dizer">Prefiro não dizer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PCD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Necessidade Especial (PCD)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{isPCD ? "Sim" : "Não"}</span>
                  <Switch checked={isPCD} onCheckedChange={setIsPCD} />
                </div>
              </div>
              {isPCD && (
                <div className="space-y-2 pl-1">
                  <Label className="text-sm text-muted-foreground">Tipo de deficiência</Label>
                  <div className="space-y-2">
                    {tiposDeficiencia.map((tipo) => (
                      <div key={tipo.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`pcd-${tipo.id}`}
                          checked={deficienciasSelecionadas.includes(tipo.id)}
                          onCheckedChange={(checked) => {
                            setDeficienciasSelecionadas((prev) =>
                              checked ? [...prev, tipo.id] : prev.filter((d) => d !== tipo.id)
                            );
                          }}
                        />
                        <Label htmlFor={`pcd-${tipo.id}`} className="text-sm font-normal cursor-pointer">
                          {tipo.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleSave} className="w-full">Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Endereço
            </h3>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                value={cep}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setCep(d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Rua</Label>
              <Input value={rua} onChange={(e) => setRua(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número</Label>
                <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input value={bairro} onChange={(e) => setBairro(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input value={estado} onChange={(e) => setEstado(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Contato de Emergência */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" /> Contato de Emergência
            </h3>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Nome do contato"
                value={contatoEmergNome}
                onChange={(e) => setContatoEmergNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Grau de Parentesco</Label>
              <Select value={contatoEmergParentesco} onValueChange={setContatoEmergParentesco}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {grausParentesco.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>DDD + Número</Label>
              <Input
                placeholder="(00) 00000-0000"
                value={contatoEmergTelefone}
                onChange={(e) => setContatoEmergTelefone(maskPhone(e.target.value))}
              />
            </div>
            <Button onClick={handleSave} className="w-full" variant="outline">Salvar Contato</Button>
          </CardContent>
        </Card>

        {/* Chave Pix */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Chave Pix</p>
                  {editandoPix ? (
                    <div className="mt-1 space-y-2">
                      <Input
                        placeholder="Tipo (CPF, E-mail, Celular, Aleatória)"
                        value={tempPixType}
                        onChange={(e) => setTempPixType(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        placeholder="Chave"
                        value={tempPix}
                        onChange={(e) => setTempPix(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div>
                      {chavePixType && (
                        <p className="text-xs text-muted-foreground">Tipo: {chavePixType}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{chavePix || "Não informada"}</p>
                    </div>
                  )}
                </div>
              </div>
              {editandoPix ? (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditandoPix(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={savePix}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startEditPix}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Apagar Conta */}
        <Card className="border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h3 className="text-sm font-bold text-destructive">Apagar Conta</h3>
                <p className="text-xs text-muted-foreground">
                  Ao solicitar a exclusão, um código será enviado para seu e-mail. 
                  Após confirmação, sua conta será apagada em 7 dias, a menos que você faça login novamente.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialog(true)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Solicitar Exclusão
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Apagar Conta */}
      <Dialog open={deleteDialog} onOpenChange={(open) => {
        if (!open) {
          setDeleteDialog(false);
          setCodigoEnviado(false);
          setCodigoOTP("");
          setConfirmadoDelete(false);
        }
      }}>
        <DialogContent className="max-w-sm">
          {confirmadoDelete ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Exclusão Solicitada</DialogTitle>
                <DialogDescription className="text-center">
                  Sua conta será apagada em 7 dias. Se você fizer login novamente nesse período, a exclusão será cancelada automaticamente.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : !codigoEnviado ? (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Enviaremos um código de verificação para <strong>{email}</strong> para confirmar a exclusão da sua conta.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleEnviarCodigo}>Enviar Código</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Insira o Código</DialogTitle>
                <DialogDescription>
                  Digite o código de 6 dígitos enviado para {email}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-4">
                <InputOTP maxLength={6} value={codigoOTP} onChange={setCodigoOTP}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmarDelete}
                  disabled={codigoOTP.length < 6}
                >
                  Confirmar Exclusão
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default MeusDados;
