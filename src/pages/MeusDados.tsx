import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";

const MeusDados = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [nome, setNome] = useState("Carlos Silva");
  const [email, setEmail] = useState("carlos.silva@email.com");
  const [telefone, setTelefone] = useState("(11) 99999-1234");
  const [cpf] = useState("123.456.789-00");
  const [dataNascimento, setDataNascimento] = useState("1995-03-15");
  const [endereco, setEndereco] = useState("Rua das Flores, 123 - São Paulo, SP");
  const [chavePix, setChavePix] = useState("carlos.silva@email.com");

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoOTP, setCodigoOTP] = useState("");
  const [confirmadoDelete, setConfirmadoDelete] = useState(false);

  const handleSave = () => {
    toast({ title: "Dados atualizados", description: "Suas informações foram salvas com sucesso." });
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

        <Card>
          <CardContent className="p-6 space-y-5">
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
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Chave Pix</Label>
              <Input value={chavePix} onChange={(e) => setChavePix(e.target.value)} />
            </div>

            <Button onClick={handleSave} className="w-full">Salvar Alterações</Button>
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
