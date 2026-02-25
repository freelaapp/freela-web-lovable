import { Link } from "react-router-dom";
import { CheckCircle, ArrowLeft, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

const ObrigadoContratante = () => {
  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center container-padding py-12">
      <div className="bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
          Obrigado pelo seu cadastro!
        </h1>

        <p className="text-muted-foreground mb-3">
          Nossa plataforma ainda não está ativa, mas já recebemos seu <strong className="text-foreground">pré-cadastro</strong> e garantimos a sua vaga!
        </p>

        <p className="text-muted-foreground mb-8">
          Assim que ocorrer o lançamento, você será notificado. Fique ligado! 🚀
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="https://forms.gle/Gdf4YDR898giJprQ8"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="cta" size="lg" className="w-full gap-2">
              <ClipboardList className="w-4 h-4" />
              Ajude-nos com uma pesquisa de campo
            </Button>
          </a>

          <Link to="/">
            <Button variant="outline" size="lg" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para a Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ObrigadoContratante;
