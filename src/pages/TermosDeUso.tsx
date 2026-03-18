import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";

const TermosDeUso = () => {
  const navigate = useNavigate();

  return (
    <AppLayout showBottomNav={false}>
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto container-padding max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <article className="prose prose-neutral max-w-none [&_h1]:text-2xl [&_h1]:md:text-3xl [&_h1]:font-display [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-10 [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4 [&_li]:text-muted-foreground [&_li]:leading-relaxed [&_ul]:mb-4 [&_ul]:space-y-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-3 [&_td]:text-sm [&_td]:text-muted-foreground [&_th]:border [&_th]:border-border [&_th]:p-3 [&_th]:text-sm [&_th]:font-semibold [&_th]:bg-muted">
            <div className="bg-card rounded-2xl border border-border p-8 md:p-12 shadow-sm">
              <h1 className="!mt-0">TERMOS DE USO DA PLATAFORMA FREELA SERVIÇOS</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
                <span>Versão: 01/2025</span>
                <span>Última atualização: 28/09/2025</span>
                <span>Vigência: 05/10/2025</span>
              </div>

              <p>FREELA SERVIÇOS DE APLICATIVOS LTDA, sociedade empresária limitada, inscrita no CNPJ sob o nº 49.745.133/0001-86, com sede na Rua dos Bandeirantes nº 370, Sala 1, Bairro Ponte de Campinas, CEP 13201-130, Município de Jundiaí, Estado de São Paulo ("FreeLa", "Plataforma" ou "Nós"), estabelece os presentes Termos de Uso ("Termos" ou "Contrato"), que regulam o acesso e a utilização do site, aplicativos móveis e demais interfaces digitais operadas pela FreeLa, bem como os serviços de intermediação tecnológica disponibilizados aos seus usuários, nos termos abaixo.</p>

              <p>Para os fins destes Termos:</p>
              <ul className="list-disc pl-6">
                <li>(i) <strong>Usuário Contratante</strong> é a pessoa jurídica (ou, excepcionalmente, pessoa física em nome próprio), atuante nos segmentos de bares, restaurantes, hotéis, motéis, buffets, empresas e promotores de eventos, dentre outros, que utiliza a Plataforma para localizar, contatar, contratar e pagar profissionais autônomos;</li>
                <li>(ii) <strong>Usuário Profissional Autônomo ou Freelancer</strong> é a pessoa física (maior de 18 anos) devidamente cadastrada, que oferta e executa serviços de natureza eventual/independente ao Usuário Contratante, sem subordinação à FreeLa; e</li>
                <li>(iii) <strong>Usuário</strong> é qualquer pessoa que acesse ou utilize a Plataforma, abrangendo Contratantes e Freelancers.</li>
              </ul>

              <h2>1. Natureza e objeto dos Termos</h2>
              <p>1.1. Estes Termos constituem contrato de adesão eletrônico que disciplina a relação jurídica entre FreeLa e Usuários enquanto plataforma de intermediação. A FreeLa não presta os serviços finais contratados entre Usuários nem integra o contrato de prestação de serviços celebrado diretamente entre Contratante e Freelancer.</p>
              <p>1.2. O objeto destes Termos é regular o acesso à Plataforma e a utilização das suas funcionalidades de busca, anúncio, matching, comunicação, suporte à contratação e, quando aplicável, mediação de cobrança/processamento de pagamentos, incluindo regras de cadastro, conduta, moderação, avaliações, disputas internas e sanções.</p>

              <h2>2. Considerandos</h2>
              <p>2.1. Considerando que a FreeLa opera tecnologia de intermediação em ambiente digital, disponibilizando meios para que Usuários se encontrem, negociem e transacionem, sem ingerência na execução do serviço, sem definição de jornada, escala, métodos, metas, treinamento, uniforme ou supervisão operacional do Freelancer;</p>
              <p>2.2. Considerando que a relação principal contratual e econômica se estabelece diretamente entre Contratante e Freelancer, cabendo a cada qual cumprir as leis que regem sua atividade;</p>
              <p>2.3. Considerando que a FreeLa, por força de seu modelo, retém remuneração pela intermediação e poderá cobrar taxas específicas pelo processamento de pagamentos e saques, conforme política econômica vigente;</p>
              <p>2.4. Considerando a necessidade de proteção de dados pessoais nos termos da Lei nº 13.709/2018 (LGPD), do Marco Civil da Internet, do Código de Defesa do Consumidor (CDC) quando aplicável, e demais normas pertinentes;</p>
              <p>2.5. Considerando o interesse em assegurar clareza, previsibilidade e agilidade operacionais;</p>
              <p>2.6. Considerando a atuação da FreeLa em todo o território nacional (Brasil);</p>
              <p>2.7. Considerando a necessidade de garantir isonomia entre Usuários, preservar a integridade do ecossistema e alocar riscos de forma compatível com o papel de cada parte.</p>

              <h2>3. Estrutura documental</h2>
              <p>3.1. Estes Termos são documento guarda-chuva e integram, por referência, os seguintes Apêndices internos:</p>
              <ul className="list-disc pl-6">
                <li><strong>Apêndice A</strong> — Política Econômica (Pagamentos, Repasses, Cancelamentos & No-Show)</li>
                <li><strong>Apêndice B</strong> — Diretrizes da Comunidade & Segurança</li>
                <li><strong>Apêndice C</strong> — Anexo Trabalhista de Intermediação</li>
              </ul>

              <h2>5. Quadro-Resumo</h2>
              <div className="overflow-x-auto">
                <table>
                  <tbody>
                    <tr><td className="font-semibold !text-foreground">Modelo</td><td>Marketplace de intermediação tecnológica — a FreeLa não é parte dos contratos entre Usuários.</td></tr>
                    <tr><td className="font-semibold !text-foreground">Relação trabalhista</td><td>Inexistente entre FreeLa e Freelancers; eventual vínculo reconhecido dar-se-á entre Contratante e Freelancer.</td></tr>
                    <tr><td className="font-semibold !text-foreground">Remuneração da FreeLa</td><td>Retenção de 20% sobre o valor pago pelo Contratante, além de taxas de cartão e saque.</td></tr>
                    <tr><td className="font-semibold !text-foreground">Pagamentos & repasses</td><td>Regras de escrow/garantia, prazos de repasse (D+5), chargeback e antifraude — ver Apêndice A.</td></tr>
                    <tr><td className="font-semibold !text-foreground">Cancelamentos & no-show</td><td>Janelas, multas e compensações — ver Apêndice A.</td></tr>
                    <tr><td className="font-semibold !text-foreground">Conduta & segurança</td><td>Proibições, critérios de avaliação e sanções — ver Apêndice B.</td></tr>
                    <tr><td className="font-semibold !text-foreground">Limitação de responsabilidade</td><td>Serviço "as is/as available", exclusão de danos indiretos.</td></tr>
                    <tr><td className="font-semibold !text-foreground">Dados pessoais (LGPD)</td><td>Finalidades, bases legais e direitos — ver Política de Privacidade & Cookies.</td></tr>
                    <tr><td className="font-semibold !text-foreground">Lei e foro</td><td>Leis brasileiras e Foro de Jundiaí/SP.</td></tr>
                  </tbody>
                </table>
              </div>

              <h2>Título I — Escopo, Aceite e Elegibilidade</h2>

              <h3>6. Escopo e Vinculação Contratual</h3>
              <p>6.1. Os presentes Termos regulam o acesso e a utilização da Plataforma e das funcionalidades de intermediação tecnológica.</p>
              <p>6.2. A FreeLa não presta os serviços finais contratados entre Usuários e atua exclusivamente como provedora de tecnologia de intermediação.</p>

              <h3>7. Aceite Eletrônico (Clickwrap) e Prova</h3>
              <p>7.1. A adesão aos Termos ocorre mediante marcação da opção "Li e Aceito", que importa consentimento integral, com registro eletrônico de data, hora, endereço IP e identificador do dispositivo.</p>
              <p>7.2. O aceite eletrônico equivale a assinatura física do Usuário, constituindo prova plena da manifestação de vontade.</p>

              <h3>8. Elegibilidade, Capacidade e Representação</h3>
              <p>8.1. Pessoa Física (Freelancer ou Contratante): somente é elegível quem for maior de 18 anos e civilmente capaz.</p>
              <p>8.2. Pessoa Jurídica (Contratante): o cadastro deve ser realizado por representante legal com poderes suficientes.</p>
              <p>8.3. Cada pessoa poderá manter uma única conta. É proibida a cessão, venda, aluguel ou compartilhamento de contas.</p>

              <h2>Título II — Natureza de Intermediação & Ausência de Vínculo</h2>

              <h3>12. Intermediação Tecnológica</h3>
              <p>12.1. A FreeLa atua exclusivamente como plataforma de intermediação tecnológica.</p>
              <p>12.2. A FreeLa não presta o serviço final contratado entre os Usuários, não integra o respectivo contrato de prestação de serviços.</p>

              <h3>14. Inexistência de vínculo empregatício</h3>
              <p>14.1. Entre a FreeLa e os Freelancers não se estabelece relação de emprego, sociedade, joint venture, consórcio, franquia, associação ou parceria de fato.</p>
              <p>14.2. Não há subordinação jurídica, habitualidade, pessoalidade ou exclusividade impostas pela FreeLa.</p>

              <h2>Título III — Cadastro, KYC e Contas</h2>

              <h3>22. Disposições Gerais</h3>
              <p>22.1. O acesso às funcionalidades condiciona-se à realização de cadastro prévio e aprovação nos procedimentos de verificação cadastral (KYC/KYB) e PLD/FT.</p>

              <h3>23. Dados e Documentos Exigidos</h3>
              <p>23.1. Pessoa Física: nome completo, CPF, data de nascimento, endereço, telefone e e-mail verificados, selfie com prova de vida, documento de identificação com foto, comprovante de residência, dados bancários/PIX.</p>
              <p>23.2. Pessoa Jurídica: CNPJ, razão social, nome fantasia, endereço, inscrições fiscais, alvarás/licenças, contrato/estatuto social.</p>

              <h3>25. Conta, Autenticação e Segurança</h3>
              <p>25.1. A conta é pessoal, individual e intransferível. Um Usuário = uma conta.</p>
              <p>25.2. O Usuário é responsável por todas as operações efetuadas com suas credenciais.</p>

              <h2>Título IV — Matching, Publicação e Condutas</h2>

              <h3>31. Publicação de Oportunidades</h3>
              <p>31.1. O Contratante poderá publicar oportunidades de serviços autônomos, devendo descrever com clareza e veracidade: local, data, função, atividades, remuneração, regras internas e informações de segurança.</p>

              <h3>33. Conteúdo Proibido</h3>
              <p>33.1. É proibido publicar vagas CLT/estágio, conteúdos discriminatórios, dados pessoais de terceiros sem autorização, contatos externos para desintermediação, entre outros conteúdos ilícitos.</p>

              <h2>Título V — Moderação, Avaliações, Sanções e Disputas</h2>

              <h3>40. Moderação</h3>
              <p>40.1. A FreeLa poderá moderar conteúdos, perfis, anúncios, propostas e mensagens para proteger a segurança do ecossistema.</p>

              <h3>41. Avaliações</h3>
              <p>41.1. As avaliações devem ser fiéis, objetivas e respeitosas.</p>
              <p>41.2. Janela de contestação de 7 dias corridos, com análise em até 10 dias úteis.</p>

              <h3>43. Sanções Graduadas</h3>
              <p>43.1. A FreeLa poderá aplicar: (a) alerta/advertência; (b) limitação de funcionalidades; (c) suspensão temporária; (d) remoção de conteúdos; (e) multas e retenções; (f) banimento definitivo.</p>

              <h2>Título VI — Obrigações Legais das Partes</h2>

              <h3>50. Tributos e Documentos Fiscais</h3>
              <p>50.1. O Freelancer obriga-se a emitir documento fiscal ao Contratante. O Contratante é responsável por reter e recolher tributos quando legalmente exigível.</p>

              <h3>51. Segurança e Saúde — EPIs, NRs</h3>
              <p>51.1. O Contratante deverá garantir ambiente seguro, EPIs adequados, instruções de segurança e cumprimento das NRs pertinentes.</p>

              <h2>Título IX — Vigência, Suspensão e Término</h2>

              <h3>76. Vigência</h3>
              <p>76.1. Estes Termos vigoram por prazo indeterminado a partir do aceite eletrônico.</p>

              <h3>78. Encerramento por Iniciativa do Usuário</h3>
              <p>78.1. O Usuário poderá encerrar sua conta a qualquer tempo, desde que inexistam pendências.</p>

              <h2>Título X — Lei Aplicável e Foro</h2>

              <h3>85. Lei Aplicável</h3>
              <p>85.1. Estes Termos regem-se pelas leis da República Federativa do Brasil.</p>

              <h3>86. Eleição de Foro</h3>
              <p>86.1. Fica eleito o Foro da Comarca de Jundiaí/SP, exceto nas hipóteses de competência legal inderrogável.</p>

              <h2>Apêndice A — Política Econômica</h2>

              <h3>1. Definições operacionais</h3>
              <ul className="list-disc pl-6">
                <li><strong>Valor do Serviço (VS):</strong> preço bruto pactuado entre Contratante e Freelancer.</li>
                <li><strong>Taxa de Intermediação (TI):</strong> 20% sobre o VS.</li>
                <li><strong>Tarifa de Cartão (TC):</strong> custo do processamento de pagamento eletrônico.</li>
                <li><strong>Tarifa de Saque (TS):</strong> custo por saque/transferência.</li>
                <li><strong>Escrow:</strong> custódia temporária do valor pago.</li>
                <li><strong>D+5:</strong> prazo de repasse em dias úteis após liberação.</li>
              </ul>

              <h3>4. Cancelamentos e No-Show</h3>
              <div className="overflow-x-auto">
                <table>
                  <tbody>
                    <tr><td className="font-semibold !text-foreground">+24h pelo Contratante</td><td>Devolução de 100% do VS; TI não devida.</td></tr>
                    <tr><td className="font-semibold !text-foreground">+24h pelo Freelancer</td><td>Sem multa; registro reputacional.</td></tr>
                    <tr><td className="font-semibold !text-foreground">-24h pelo Contratante</td><td>Multa de 50% do VS ao Freelancer; TI devida (20%).</td></tr>
                    <tr><td className="font-semibold !text-foreground">-24h pelo Freelancer</td><td>Multa de 50% do VS; TI devida (20%).</td></tr>
                    <tr><td className="font-semibold !text-foreground">No-show do Contratante</td><td>Multa 100% do VS + mínimo 4h; repasse 100% ao Freelancer.</td></tr>
                    <tr><td className="font-semibold !text-foreground">No-show do Freelancer</td><td>Multa 100% do VS; sem repasse; possibilidade de ban.</td></tr>
                  </tbody>
                </table>
              </div>

              <h2>Apêndice B — Diretrizes da Comunidade & Segurança</h2>
              <p>Regras de conduta, prevenção de assédio/discriminação, proibições (violência, armas, drogas ilícitas), critérios de avaliação e descredenciamento.</p>

              <h2>Apêndice C — Anexo Trabalhista de Intermediação</h2>
              <p>Declarações de autonomia do Freelancer, ausência de vínculo e de subordinação à FreeLa, alocação de deveres ao Contratante (EPIs/NRs/ambiente), e regras de indenidade à FreeLa quando a relação empregatícia vier a ser reconhecida entre Contratante e Freelancer.</p>

              <div className="mt-12 pt-8 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  FREELA SERVIÇOS DE APLICATIVOS LTDA — CNPJ 49.745.133/0001-86
                </p>
                <p className="text-sm text-muted-foreground">
                  Rua dos Bandeirantes nº 370, Sala 1 — Jundiaí/SP — CEP 13201-130
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </AppLayout>
  );
};

export default TermosDeUso;
