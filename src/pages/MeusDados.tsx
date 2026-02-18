import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, AlertTriangle, Wallet, Edit2, Check, X, Phone, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";

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

const MeusDados = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [nome, setNome] = useState("Carlos Silva");
  const [email, setEmail] = useState("carlos.silva@email.com");
  const [telefone, setTelefone] = useState("(11) 99999-1234");
  const [cpf] = useState("123.456.789-00");
  const [dataNascimento, setDataNascimento] = useState("1995-03-15");
  const [sexo, setSexo] = useState("masculino");

  // PCD
  const [isPCD, setIsPCD] = useState(false);
  const [deficienciasSelecionadas, setDeficienciasSelecionadas] = useState<string[]>([]);

  // Endereço
  const [cep, setCep] = useState("01001-000");
  const [endereco, setEndereco] = useState("Rua das Flores, 123 - São Paulo, SP");

  // Contato de Emergência
  const [contatoEmergNome, setContatoEmergNome] = useState("");
  const [contatoEmergParentesco, setContatoEmergParentesco] = useState("");
  const [contatoEmergTelefone, setContatoEmergTelefone] = useState("");

  // Pix
  const [editandoPix, setEditandoPix] = useState(false);
  const [chavePix, setChavePix] = useState("carlos.silva@email.com");
  const [tempPix, setTempPix] = useState("");

  // Delete account
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoOTP, setCodigoOTP] = useState("");
  const [confirmadoDelete, setConfirmadoDelete] = useState(false);

  const handleSave = () => {
    toast({ title: "Dados atualizados", description: "Suas informações foram salvas com sucesso." });
  };

  const startEditPix = () => {
    setTempPix(chavePix);
    setEditandoPix(true);
  };

  const savePix = () => {
    setChavePix(tempPix);
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

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Meus Dados</h1>
        </div>

        {/* Dados Pessoais */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Informações Pessoais
            </h3>
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={cpf} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">O CPF não pode ser alterado.</p>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} />
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

            {/* CEP + Endereço */}
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
              <Label>Endereço</Label>
              <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
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
                    <Input
                      value={tempPix}
                      onChange={(e) => setTempPix(e.target.value)}
                      className="mt-1 h-8 text-sm"
                      autoFocus
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">{chavePix}</p>
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