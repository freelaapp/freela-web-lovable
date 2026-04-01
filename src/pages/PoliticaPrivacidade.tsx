import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";

const PoliticaPrivacidade = () => {
  return (
    <AppLayout showBottomNav={false}>
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto container-padding max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/cadastro">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao cadastro
            </Link>
          </Button>

          <article className="prose prose-neutral max-w-none [&_h1]:text-2xl [&_h1]:md:text-3xl [&_h1]:font-display [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-10 [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4 [&_li]:text-muted-foreground [&_li]:leading-relaxed [&_ul]:mb-4 [&_ul]:space-y-2">
            <div className="bg-card rounded-2xl border border-border p-8 md:p-12 shadow-sm">
              <h1 className="!mt-0">POLÍTICA DE PRIVACIDADE E COOKIES — FREELA</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
                <span>Versão: 01/2025</span>
                <span>Última atualização: 28/09/2025</span>
                <span>Vigência: 05/10/2025</span>
              </div>

              <p><strong>CONTROLADORA:</strong> FREELA SERVIÇOS DE APLICATIVOS LTDA, inscrita no CNPJ sob o nº 49.745.133/0001-86, com sede na Rua dos Bandeirantes nº 370, Sala 1, Bairro Ponte de Campinas, CEP 13201-130, Município de Jundiaí, Estado de São Paulo.</p>

              <h2>1. Preâmbulo e Escopo</h2>

              <h3>1.1. Quem somos</h3>
              <p>A FreeLa Serviços de Aplicativos Ltda. atua como intermediadora tecnológica entre estabelecimentos tomadores de serviços (bares, restaurantes, hotéis, motéis, buffets, empresas de eventos e correlatos) e profissionais autônomos ("freelancers"), por meio de seu site, aplicativo móvel e demais canais digitais.</p>

              <h3>1.2. O que esta Política cobre</h3>
              <p>Esta Política disciplina o tratamento de dados pessoais na navegação e uso da Plataforma, abrangendo: site e app, integrações de pagamento, KYC/KYB/PLD-FT, ferramentas de analytics/SDKs e cookies, atendimento ao usuário e comunicações eletrônicas.</p>

              <h3>1.3. Escopo material e titulares</h3>
              <p>O escopo alcança: (a) Contratantes; (b) Freelancers; (c) visitantes não logados; e (d) representantes de pessoas jurídicas que interajam com a FreeLa.</p>

              <h3>1.4. Base legal geral</h3>
              <p>Os tratamentos observam a Lei nº 13.709/2018 (LGPD), o Marco Civil da Internet (Lei nº 12.965/2014) e demais normas aplicáveis. As bases legais incluem: execução de contrato, cumprimento de obrigação legal, exercício regular de direitos, legítimo interesse e consentimento.</p>

              <h2>2. Definições Essenciais</h2>
              <ul className="list-disc pl-6">
                <li><strong>Dados Pessoais:</strong> qualquer informação relacionada a pessoa natural identificada ou identificável (nome, CPF, e-mail, telefone, IP, etc.).</li>
                <li><strong>Dados Pessoais Sensíveis:</strong> dados referentes a origem racial/étnica, convicção religiosa, saúde, vida sexual, dados genéticos ou biométricos.</li>
                <li><strong>Tratamento:</strong> toda operação realizada com dados pessoais (coleta, armazenamento, uso, compartilhamento, eliminação, etc.).</li>
                <li><strong>Controladora:</strong> FreeLa Serviços de Aplicativos Ltda.</li>
                <li><strong>Operadora:</strong> terceiros que tratam dados em nome da Controladora (cloud, KYC, PSPs, analytics).</li>
                <li><strong>Titular:</strong> pessoa natural a quem se referem os dados pessoais.</li>
                <li><strong>Encarregado(a)/DPO:</strong> canal de comunicação entre a Controladora, Titulares e ANPD.</li>
                <li><strong>Anonimização:</strong> dados que perdem possibilidade de associação a um indivíduo.</li>
                <li><strong>Cookies/SDKs:</strong> arquivos ou bibliotecas que armazenam informações do dispositivo.</li>
              </ul>

              <h2>3. Quem é quem no tratamento</h2>

              <h3>3.1. FreeLa como Controladora</h3>
              <p>A FreeLa atua como Controladora dos dados pessoais tratados para operar a Plataforma, definindo finalidades e meios dos tratamentos de cadastro, KYC, matching, moderação, pagamentos, avaliações e segurança.</p>

              <h3>3.2. Operadores/Suboperadores</h3>
              <p>Terceiros contratados sob cláusulas de proteção de dados: provedores de nuvem, KYC/KYB/antifraude, PSPs/arranjos de pagamento, analytics/SDKs, CRM/comunicação e suporte/atendimento.</p>

              <h2>4. Quais dados coletamos</h2>

              <h3>4.1. Dados fornecidos pelo Titular</h3>
              <ul className="list-disc pl-6">
                <li>Identificação: nome, CPF/CNPJ, data de nascimento, e-mail, telefone, endereço.</li>
                <li>Conta: credenciais de acesso, preferências de comunicação.</li>
                <li>Perfil profissional (Freelancer): área de atuação, qualificações, certificações, fotos.</li>
                <li>Dados financeiros: chave PIX, banco/agência/conta (tokenizados via PSP).</li>
              </ul>

              <h3>4.2. Dados gerados pelo uso</h3>
              <ul className="list-disc pl-6">
                <li>Logs de acesso: IP, data/hora, user-agent, páginas acessadas.</li>
                <li>Dinâmica de contratação: check-in/check-out, confirmações, comprovantes.</li>
                <li>Mensagens in-app e registros de interação.</li>
                <li>Avaliações/ratings e reputação.</li>
              </ul>

              <h3>4.3. Dados de pagamento</h3>
              <ul className="list-disc pl-6">
                <li>Tokens de cartão/PSP (a FreeLa não armazena o número completo do cartão).</li>
                <li>Status de transação: autorização, captura, liquidação, estorno, chargeback.</li>
              </ul>

              <h3>4.5. Cookies e SDKs</h3>
              <ul className="list-disc pl-6">
                <li>Cookies essenciais (autenticação, segurança).</li>
                <li>Medição/analytics (métricas de navegação).</li>
                <li>Publicidade/comunicação (apenas com consentimento).</li>
              </ul>

              <h2>5. Para que tratamos (finalidades e bases legais)</h2>

              <h3>5.1. Execução do contrato</h3>
              <p>Criação e autenticação de contas, matching, publicação/aceite de propostas, chat in-app, processamento de pagamentos e repasses, suporte e atendimento.</p>

              <h3>5.2. Obrigação legal ou regulatória</h3>
              <p>Guarda de registros de acesso (Marco Civil), contabilidade e fiscal, cooperação com autoridades, PLD-FT.</p>

              <h3>5.3. Interesse legítimo</h3>
              <p>Segurança e antifraude, KYC/KYB, medição e melhoria de produto, prevenção à desintermediação, reputação/ratings, comunicações operacionais.</p>

              <h3>5.4. Consentimento</h3>
              <p>Cookies/SDKs não essenciais, push promocionais, marketing, biometria (selfie/liveness).</p>

              <h2>6. Cookies & SDKs</h2>

              <h3>6.1. Como utilizamos</h3>
              <p>A FreeLa emprega cookies e SDKs para funcionamento essencial, segurança, medição de audiência e, mediante consentimento, publicidade.</p>

              <h3>6.2. Cookies estritamente necessários</h3>
              <p>Sessão autenticada, proteção contra fraudes, distribuição de tráfego, preferências técnicas essenciais.</p>

              <h2>7. Com quem compartilhamos</h2>

              <h3>7.1. Princípios gerais</h3>
              <p>O compartilhamento observa os princípios da finalidade, necessidade, minimização, segurança e responsabilização.</p>

              <h3>7.2. Operadores/Suboperadores</h3>
              <p>Fornecedores contratados comprometidos por acordos de proteção de dados e medidas técnicas adequadas.</p>

              <h2>8. Retenção e Eliminação</h2>
              <ul className="list-disc pl-6">
                <li>Logs de acesso: mínimo 6 meses (Marco Civil).</li>
                <li>Documentos fiscais: 5 anos.</li>
                <li>Mensagens e check-in/out: até 6 meses após o serviço.</li>
                <li>Avaliações: enquanto conta ativa; anonimizados após exclusão.</li>
                <li>Contas inativas: anonimização após 12 meses sem atividade.</li>
              </ul>

              <h2>9. Segurança da Informação</h2>
              <p>Criptografia em trânsito e em repouso, segregação de ambientes, controle de acesso e mínimo privilégio, proteção de dados de pagamento via tokenização, pseudonimização/anonimização quando possível.</p>

              <h2>10. Direitos do Titular (LGPD, art. 18)</h2>
              <ul className="list-disc pl-6">
                <li>Confirmação de tratamento e acesso aos dados.</li>
                <li>Correção de dados incompletos ou inexatos.</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                <li>Portabilidade dos dados.</li>
                <li>Informação sobre compartilhamento.</li>
                <li>Revogação do consentimento.</li>
                <li>Contestação de decisões automatizadas.</li>
              </ul>

              <h3>10.8. Como exercer seus direitos</h3>
              <p>Solicitações podem ser encaminhadas ao Encarregado(a)/DPO pelos canais oficiais. Prazo de resposta: até 15 dias úteis. Verificação de identidade poderá ser solicitada por segurança.</p>

              <h2>11. Comunicações de Marketing</h2>
              <p>Comunicações transacionais (confirmações, recibos, avisos de segurança) não dependem de consentimento. Comunicações promocionais dependem de opt-in e são revogáveis a qualquer tempo via link "descadastrar" ou configurações do app.</p>

              <h2>12. Decisões Automatizadas</h2>
              <p>A Plataforma utiliza sistemas automatizados para matching e reputação. Decisões automatizadas com impacto relevante asseguram informação clara e direito de revisão humana.</p>

              <h2>14. Mudanças nesta Política</h2>
              <p>A FreeLa poderá atualizar esta Política, indicando versão e data de vigência. Mudanças materiais serão comunicadas por aviso destacado. A continuidade de uso indica ciência das alterações.</p>

              <h2>16. Lei e Foro</h2>
              <p>16.1. Esta Política é regida pela legislação brasileira, especialmente a LGPD e o Marco Civil da Internet.</p>
              <p>16.2. Foro da Comarca de Jundiaí/SP, ressalvado o foro do consumidor quando aplicável o CDC.</p>

              <h2>17. Disposições Finais</h2>
              <p>17.1. Esta Política integra-se aos Termos de Uso e Apêndices. Em caso de conflito, prevalecem as disposições desta Política quanto a proteção de dados.</p>
              <p>17.2. O aceite eletrônico (clickwrap) é válido e vinculante.</p>
              <p>17.4. Severabilidade: invalidade de uma disposição não afeta as demais.</p>
              <p>17.7. A versão em português do Brasil é a oficial e prevalece.</p>

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

export default PoliticaPrivacidade;
