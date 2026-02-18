import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, AlertTriangle, Building2, ImagePlus, MapPin, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";

const MeusDadosContratante = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fachadaRef = useRef<HTMLInputElement>(null);
  const internoRef = useRef<HTMLInputElement>(null);

  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("Freela & Breja");
  const [cnpj] = useState("12.345.678/0001-90");
  const [ramo, setRamo] = useState("Bar e Restaurante");
  const [email, setEmail] = useState("contato@freelaebreja.com.br");
  const [telefone, setTelefone] = useState("(11) 3333-4444");
  const [responsavel, setResponsavel] = useState("Ana Oliveira");
  const [responsavelTelefone, setResponsavelTelefone] = useState("(11) 98888-7777");
  const [endereco, setEndereco] = useState("Rua das Flores, 123 - Centro, São Paulo, SP");
  const [fotoFachada, setFotoFachada] = useState<string | null>(null);
  const [fotoInterno, setFotoInterno] = useState<string | null>(null);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoOTP, setCodigoOTP] = useState("");
  const [confirmadoDelete, setConfirmadoDelete] = useState(false);

  const handleSave = () => {
    toast({ title: "Dados atualizados", description: "As informações do estabelecimento foram salvas." });
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

  const handleFachadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) setFotoFachada(URL.createObjectURL(file));
  };

  const handleInternoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) setFotoInterno(URL.createObjectURL(file));
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Perfil do Restaurante</h1>
        </div>

        {/* Fotos do Estabelecimento */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Fotos do Estabelecimento
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fachadaRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors overflow-hidden"
              >
                {fotoFachada ? (
                  <img src={fotoFachada} alt="Fachada" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6 text-primary/60" />
                    <span className="text-[10px] text-primary/60 font-medium">Fachada</span>
                  </>
                )}
              </button>
              <button
                onClick={() => internoRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors overflow-hidden"
              >
                {fotoInterno ? (
                  <img src={fotoInterno} alt="Ambiente Interno" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6 text-primary/60" />
                    <span className="text-[10px] text-primary/60 font-medium">Ambiente Interno</span>
                  </>
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
              <Label>Nome do Estabelecimento</Label>
              <Input value={nomeEstabelecimento} onChange={(e) => setNomeEstabelecimento(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input value={cnpj} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">O CNPJ não pode ser alterado.</p>
            </div>
            <div className="space-y-2">
              <Label>Ramo de Atividade</Label>
              <Input value={ramo} onChange={(e) => setRamo(e.target.value)} placeholder="Ex: Restaurante, Bar, Buffet..." />
            </div>
            <div className="space-y-2">
              <Label>Responsável pela Operação</Label>
              <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>DDD + Telefone do Responsável</Label>
              <Input
                value={responsavelTelefone}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "").slice(0, 11);
                  let formatted = d;
                  if (d.length > 2) formatted = `(${d.slice(0, 2)}) ${d.slice(2)}`;
                  if (d.length > 7) formatted = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
                  setResponsavelTelefone(formatted);
                }}
                placeholder="(00) 00000-0000"
              />
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
              <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Endereço</Label>
              <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
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
                  Após confirmação, sua conta será apagada em 7 dias.
                </p>
                <Button variant="destructive" size="sm" onClick={() => setDeleteDialog(true)} className="gap-2">
                  <Trash2 className="w-4 h-4" /> Solicitar Exclusão
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Apagar Conta */}
      <Dialog open={deleteDialog} onOpenChange={(open) => {
        if (!open) { setDeleteDialog(false); setCodigoEnviado(false); setCodigoOTP(""); setConfirmadoDelete(false); }
      }}>
        <DialogContent className="max-w-sm">
          {confirmadoDelete ? (
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
                <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
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
                <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleConfirmarDelete} disabled={codigoOTP.length < 6}>Confirmar Exclusão</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default MeusDadosContratante;
