import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const faqs = [
  {
    pergunta: "Como criar uma vaga?",
    resposta: "Acesse o Dashboard e clique em 'Criar Vaga'. Preencha os detalhes como data, horário, tipo de serviço e quantidade de freelancers necessários. A vaga será publicada e freelancers poderão se candidatar.",
  },
  {
    pergunta: "Como funciona o pagamento?",
    resposta: "O pagamento é processado pela plataforma. Após a confirmação do serviço por ambas as partes, o valor é liberado ao freelancer. Você pode acompanhar todos os gastos na sua Carteira.",
  },
  {
    pergunta: "Como avaliar um freelancer?",
    resposta: "Após a conclusão de um serviço, você receberá uma notificação para avaliar o freelancer. Acesse Avaliações no menu ou clique na notificação do dashboard.",
  },
  {
    pergunta: "Posso cancelar um evento?",
    resposta: "Sim, eventos podem ser cancelados com no mínimo 24h de antecedência sem custo. Cancelamentos tardios podem gerar taxas proporcionais.",
  },
  {
    pergunta: "Como aceitar ou recusar candidatos?",
    resposta: "Acesse o detalhe do evento no Dashboard. Na seção 'Freelancers Inscritos' você pode ver o perfil de cada candidato e aceitar ou recusar rapidamente.",
  },
  {
    pergunta: "O que é uma proposta exclusiva?",
    resposta: "A proposta exclusiva permite que você envie uma oferta direta para um freelancer específico, com data, horário e valor personalizados. O freelancer pode aceitar ou negociar.",
  },
];

const AjudaContratante = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const handleSuporte = () => {
    window.open("https://wa.me/5511999999999?text=Olá! Preciso de ajuda como contratante.", "_blank");
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Ajuda</h1>
        </div>

        <Card>
          <CardContent className="p-6 space-y-1">
            <h3 className="text-base font-display font-bold flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-primary" /> Dúvidas Frequentes
            </h3>
            {faqs.map((faq, i) => (
              <div key={i} className="border-b last:border-b-0">
                <button onClick={() => toggle(i)} className="w-full flex items-center justify-between py-4 text-left">
                  <span className="text-sm font-medium pr-4">{faq.pergunta}</span>
                  {openIndex === i ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
                {openIndex === i && <p className="text-sm text-muted-foreground pb-4 animate-fade-in">{faq.resposta}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold">Ainda precisa de ajuda?</h3>
              <p className="text-sm text-muted-foreground mt-1">Fale diretamente com nosso suporte.</p>
            </div>
            <Button onClick={handleSuporte} className="w-full gap-2">
              <MessageCircle className="w-4 h-4" /> Chamar Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AjudaContratante;
