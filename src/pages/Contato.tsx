import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  {
    q: "O cadastro é gratuito?",
    a: "Sim! O cadastro é 100% gratuito tanto para quem contrata quanto para freelancers.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "O valor é pré-fixado pela plataforma. O pagamento é feito de forma segura pelo Freela.",
  },
  {
    q: "Posso cancelar uma contratação?",
    a: "Sim, respeitando os prazos de cancelamento definidos para cada tipo de serviço.",
  },
  {
    q: "Como me cadastro como freelancer?",
    a: "Basta criar uma conta, preencher seu perfil com suas habilidades e experiência, e definir sua disponibilidade.",
  },
];

const Contato = () => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({
        title: "Mensagem enviada!",
        description: "Retornaremos em breve. Obrigado pelo contato.",
      });
    }, 1500);
  };

  return (
    <AppLayout>
      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20">
        <div className="container mx-auto container-padding text-center">
          <h1 className="text-secondary mb-4 hero-text-shadow">Contato</h1>
          <p className="text-xl text-secondary/80 max-w-2xl mx-auto">
            Estamos aqui para ajudar. Entre em contato ou tire suas dúvidas.
          </p>
        </div>
      </section>

      {/* Contact info + Form */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Info */}
            <div>
              <h3 className="text-foreground mb-6">Fale conosco</h3>
              <div className="space-y-6 mb-10">
                {[
                  { icon: Mail, label: "E-mail", value: "contato@freela.com.br", href: "mailto:contato@freela.com.br" },
                  { icon: Phone, label: "Telefone", value: "(11) 99999-9999", href: "tel:+5511999999999" },
                  { icon: MessageCircle, label: "WhatsApp", value: "(11) 99999-9999", href: "https://wa.me/5511999999999" },
                  { icon: MapPin, label: "Endereço", value: "São Paulo, SP - Brasil", href: undefined },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-foreground font-medium hover:text-primary transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-foreground font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-foreground mb-4">Horário de atendimento</h4>
              <p className="text-muted-foreground">Seg a Sex: 8h às 18h</p>
              <p className="text-muted-foreground">Sáb: 9h às 13h</p>
            </div>

            {/* Form */}
            <div className="card-elevated p-8">
              <h4 className="text-foreground mb-6">Envie sua mensagem</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input placeholder="Seu nome" required className="input-focus" />
                </div>
                <div>
                  <Input type="email" placeholder="Seu e-mail" required className="input-focus" />
                </div>
                <div>
                  <Input placeholder="Assunto" required className="input-focus" />
                </div>
                <div>
                  <Textarea placeholder="Sua mensagem" rows={5} required className="input-focus" />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? "Enviando..." : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar mensagem
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-muted/50">
        <div className="container mx-auto container-padding">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Perguntas frequentes</span>
            </div>
            <h2 className="text-foreground">Dúvidas comuns</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.q} className="card-elevated p-6">
                <h5 className="text-foreground mb-2">{faq.q}</h5>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Contato;
