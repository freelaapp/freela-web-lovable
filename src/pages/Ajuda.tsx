import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const faqs = [
  {
    pergunta: "Como me cadastrar como freelancer?",
    resposta: "Basta acessar a página de cadastro, selecionar o perfil de Freelancer, preencher seus dados pessoais e escolher os serviços que você presta. Após a confirmação do e-mail, seu perfil estará ativo.",
  },
  {
    pergunta: "Como funciona o pagamento?",
    resposta: "O pagamento é realizado pelo contratante após a conclusão do serviço. O valor fica retido na plataforma até a confirmação do serviço por ambas as partes e é liberado via Pix na sua conta cadastrada.",
  },
  {
    pergunta: "Posso cancelar um serviço aceito?",
    resposta: "Sim, mas o cancelamento deve ser feito com no mínimo 24h de antecedência. Cancelamentos recorrentes podem impactar sua avaliação na plataforma.",
  },
  {
    pergunta: "Como altero minha disponibilidade?",
    resposta: "Acesse seu Perfil e na seção 'Disponibilidade e Serviço' você pode selecionar os dias da semana e ajustar os horários disponíveis para cada dia.",
  },
  {
    pergunta: "Como funciona o sistema de avaliação?",
    resposta: "Após cada serviço concluído, tanto o freelancer quanto o contratante podem avaliar a experiência com notas de 1 a 5 estrelas e um comentário. Sua nota média aparece no seu perfil.",
  },
  {
    pergunta: "Como apagar minha conta?",
    resposta: "Acesse Meus Dados no perfil e role até a opção 'Apagar Conta'. Um código será enviado para seu e-mail. Após confirmar, a conta será excluída em 7 dias. Se fizer login nesse período, a exclusão é cancelada.",
  },
  {
    pergunta: "Posso ser freelancer e contratante ao mesmo tempo?",
    resposta: "Sim! Você pode alternar entre os perfis de freelancer e contratante diretamente na plataforma, utilizando a mesma conta.",
  },
];

const Ajuda = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const handleSuporte = () => {
    window.location.href = "mailto:contato@freelaservicos.com.br?subject=Suporte - Preciso de ajuda com o Freela";
  };

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="text-sm font-medium pr-4">{faq.pergunta}</span>
                  {openIndex === i ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openIndex === i && (
                  <p className="text-sm text-muted-foreground pb-4 animate-fade-in">
                    {faq.resposta}
                  </p>
                )}
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
              <p className="text-sm text-muted-foreground mt-1">
                Fale diretamente com nosso suporte pelo chat.
              </p>
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

export default Ajuda;
