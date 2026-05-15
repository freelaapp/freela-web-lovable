import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import limpezaImg from "@/assets/freela-casa/limpeza.jpg";
import manutencaoImg from "@/assets/freela-casa/manutencao.jpg";
import jardimImg from "@/assets/freela-casa/jardim.jpg";
import eventosCasaImg from "@/assets/freela-casa/eventos-casa.jpg";
import eventosCorpImg from "@/assets/freela-casa/eventos-corp.jpg";
import belezaImg from "@/assets/freela-casa/beleza.jpg";

const cards = [
  {
    title: "Limpeza e Organização",
    description: "Diaristas, limpeza pós-obra, passadeira e organização residencial.",
    image: limpezaImg,
    link: "/freela-em-casa/limpeza-organizacao",
  },
  {
    title: "Manutenção Residencial",
    description: "Encanador, eletricista, pintor, montador, chaveiro e ar-condicionado.",
    image: manutencaoImg,
    link: "/freela-em-casa/manutencao-residencial",
  },
  {
    title: "Jardim e Piscina",
    description: "Jardineiro e piscineiro para cuidados com áreas externas.",
    image: jardimImg,
    link: "/freela-em-casa/jardim-piscina",
  },
  {
    title: "Eventos em Casa",
    description: "Garçom, churrasqueiro, cozinheiro, barman e equipe de apoio.",
    image: eventosCasaImg,
    link: "/freela-em-casa/eventos-em-casa",
  },
  {
    title: "Eventos Corporativos",
    description: "Profissionais para eventos empresariais, confraternizações e coffee breaks.",
    image: eventosCorpImg,
    link: "/freela-em-casa/eventos-corporativos",
  },
  {
    title: "Beleza e Relaxamento",
    description: "Manicure, pedicure, cabeleireiro, maquiagem e massagem em casa.",
    image: belezaImg,
    link: "/freela-em-casa/beleza-relaxamento",
  },
];

const FreelaCasaCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <section className="section-padding bg-background py-[60px]">
      <div className="container mx-auto container-padding">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <span className="badge-primary mb-6 inline-block text-base px-5 py-2">
            🏠 Freela em Casa
          </span>
          <h2 className="mb-6 section-title section-title-center">
            Contrate serviços para sua casa ou evento com praticidade
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o tipo de serviço, encontre profissionais disponíveis e resolva tudo pelo Freela.
          </p>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: false }}
          className="w-full max-w-7xl mx-auto px-4 sm:px-10"
        >
          <CarouselContent className="-ml-4">
            {cards.map((card) => (
              <CarouselItem
                key={card.title}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-border/50">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      width={800}
                      height={600}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-semibold text-lg mb-2 text-card-foreground">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {card.description}
                    </p>
                    <Button asChild variant="cta" className="w-full">
                      <Link to={card.link}>
                        Contratar agora
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                current === i ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="text-center mt-10 flex flex-col items-center gap-5">
          <p className="inline-flex items-center gap-2 text-muted-foreground text-sm md:text-base">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Profissionais avaliados, contratação simples e pagamento seguro pelo app.
          </p>
          <Button asChild size="lg" variant="cta">
            <Link to="/freela-em-casa">
              Conhecer o Freela em Casa
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FreelaCasaCarousel;
