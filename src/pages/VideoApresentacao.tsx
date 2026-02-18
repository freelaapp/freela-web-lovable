import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, Clock, ArrowRight, ArrowLeft, Upload } from "lucide-react";
import logoFreela from "@/assets/logo-freela.png";
import { useToast } from "@/hooks/use-toast";

const VideoApresentacao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [video, setVideo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideo(file);
    }
  };

  const handleEnviar = () => {
    if (!video) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast({ title: "Vídeo enviado!", description: "Seu perfil ficou ainda mais completo." });
      navigate("/dashboard-freelancer");
    }, 2000);
  };

  const handlePular = () => {
    navigate("/dashboard-freelancer");
  };

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center container-padding py-12 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 p-2 rounded-full bg-card shadow-md border border-border hover:bg-muted transition-colors"
        aria-label="Voltar">

        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>
      <img alt="Freela Serviços" className="h-14 mb-10" src="/lovable-uploads/8e9ea4aa-b6c7-49f5-9a45-b521e7f13075.png" />

      <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12 max-w-lg w-full text-center border border-border">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Video className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-bold mb-3">Vídeo de Apresentação</h1>
        <p className="text-muted-foreground mb-6">
          Grave um curto vídeo de apresentação. Isso aumentará suas chances de ser chamado para uma vaga.
        </p>

        {/* Roteiro / Dicas */}
        <div className="bg-muted/60 rounded-xl p-5 mb-8 text-left space-y-4 border border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            📋 O que incluir no vídeo:
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Seu <strong className="text-foreground">nome</strong></li>
            <li>Sua <strong className="text-foreground">idade</strong></li>
            <li><strong className="text-foreground">Cidade e estado</strong> onde atua</li>
            <li>Quais são suas <strong className="text-foreground">especialidades</strong></li>
            <li>Qual serviço você <strong className="text-foreground">mais gosta</strong> de fazer</li>
          </ul>

          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 pt-2">
            🎬 Exemplo de roteiro:
          </h2>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            "Olá, meu nome é <strong className="text-foreground">Ana</strong>, tenho <strong className="text-foreground">28 anos</strong> e moro em <strong className="text-foreground">São Paulo, SP</strong>. 
            Trabalho como <strong className="text-foreground">bartender e garçonete</strong> há 5 anos em eventos corporativos, casamentos e festas. 
            O que eu mais gosto de fazer é <strong className="text-foreground">drinks autorais</strong> — adoro surpreender os convidados com sabores criativos!"
          </p>
        </div>

        {video ?
        <div className="space-y-4 mb-8">
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <Video className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm text-foreground truncate">{video.name}</span>
              <button
              type="button"
              onClick={() => setVideo(null)}
              className="ml-auto text-muted-foreground hover:text-destructive text-sm">

                Remover
              </button>
            </div>
            <Button onClick={handleEnviar} className="w-full h-12" size="lg" disabled={isUploading}>
              {isUploading ?
            <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Enviando...
                </span> :

            <span className="flex items-center gap-2">
                  Enviar vídeo <ArrowRight className="w-4 h-4" />
                </span>
            }
            </Button>
          </div> :

        <div className="space-y-4 mb-8">
            <label className="block">
              <Button variant="outline" className="w-full h-14 border-2 border-dashed" asChild>
                <span className="flex items-center gap-2 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  Adicionar vídeo agora
                </span>
              </Button>
              <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoChange} />

            </label>
          </div>
        }

        <button
          type="button"
          onClick={handlePular}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">

          <Clock className="w-4 h-4" />
          Talvez depois
        </button>
      </div>
    </div>);

};

export default VideoApresentacao;