import { Star, Quote, Home, Building2, Briefcase } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
  {
    id: 1,
    name: "Mariana Costa",
    role: "Contratante - Evento em Casa",
    avatar: "MC",
    icon: Home,
    iconColor: "bg-primary text-primary-foreground",
    rating: 5,
    text: "Contratei um churrasqueiro pelo Freela para o aniversário do meu marido. Foi incrível! O Carlos chegou pontualmente, trouxe tudo organizado e o churrasco ficou perfeito. Meus convidados amaram e eu pude curtir a festa sem me preocupar com nada. Super recomendo!",
    service: "Churrasqueiro para aniversário"
  },
  {
    id: 2,
    name: "Roberto Almeida",
    role: "Empresário - Dono de Bar",
    avatar: "RA",
    icon: Building2,
    iconColor: "bg-secondary text-secondary-foreground",
    rating: 5,
    text: "Meu bar estava precisando de bartenders extras para o fim de semana e encontrei profissionais incríveis no Freela. A qualidade dos drinks melhorou muito e meus clientes notaram a diferença. Agora uso a plataforma sempre que preciso reforçar a equipe.",
    service: "Bartenders para bar"
  },
  {
    id: 3,
    name: "Felipe Santos",
    role: "Freelancer - Garçom",
    avatar: "FS",
    icon: Briefcase,
    iconColor: "bg-primary text-primary-foreground",
    rating: 5,
    text: "Trabalho como garçom pelo Freela há 8 meses e estou muito satisfeito. Os pagamentos sempre caem certinho na minha conta, consigo escolher os eventos que quero trabalhar e a plataforma é super fácil de usar. Minha renda aumentou bastante!",
    service: "Garçom freelancer"
  }];


  return (
    <section className="section-padding bg-muted/30 py-[60px]">
      <div className="container mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <span className="badge-primary mb-6 inline-block text-base px-5 py-2">
            💬 Depoimentos
          </span>
          <h2 className="mb-6 section-title section-title-center mx-[30px]">
            O que dizem sobre o Freela
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de contratantes e freelancers que transformaram suas experiências com nossa plataforma.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) =>
          <div
            key={testimonial.id}
            className="card-elevated p-6 lg:p-8 card-hover relative">

              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-primary/20">
                <Quote className="w-10 h-10" />
              </div>

              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-full ${testimonial.iconColor} flex items-center justify-center font-bold text-lg shrink-0`}>
                  {testimonial.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground truncate">
                    {testimonial.name}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <testimonial.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{testimonial.role}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) =>
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              )}
              </div>

              {/* Testimonial Text */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                "{testimonial.text}"
              </p>

              {/* Service Tag */}
              <div className="pt-4 border-t border-border">
                <span className="inline-block bg-primary-light text-primary text-xs font-medium px-3 py-1 rounded-full">
                  {testimonial.service}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-card px-6 py-3 rounded-full shadow-sm">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground border-2 border-card">+</div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground border-2 border-card">5K</div>
            </div>
            <span className="text-sm text-muted-foreground">
              Mais de <strong className="text-foreground">5.000 avaliações</strong> com nota 4.8+
            </span>
          </div>
        </div>
      </div>
    </section>);

};

export default TestimonialsSection;