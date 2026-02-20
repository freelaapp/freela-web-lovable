import {
  Zap,
  Leaf,
  GraduationCap,
  Gift,
  ArrowRight,
  Star,
  TrendingUp,
  BadgePercent,
  BookOpen,
  Award } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useMode } from "@/contexts/ModeContext";

const PartnersBenefitsSection = () => {
  const { isFreelaCasa } = useMode();

  return (
    <section className="section-padding bg-background py-[60px]">
      <div className="container mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <span className="badge-primary mb-6 inline-block text-base px-5 py-2">
            🎁 Benefícios exclusivos para parceiros
          </span>
          <h2 className="mb-6 section-title section-title-center">
            Quanto mais usar o Freela,{" "}
            <span className="text-gradient">mais vantagens você tem</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Parcerias que geram economia real, capacitação e crescimento para quem faz parte do ecossistema Freela.
          </p>
        </div>

        {/* ========== GRUPO PROSPERA ========== */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent rounded-3xl border border-emerald-500/20 overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Left - Info */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full mb-6">
                    <Leaf className="w-4 h-4" />
                    <span className="text-sm font-bold">Parceiro oficial</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                    Grupo Prospera
                  </h3>

                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {isFreelaCasa ?
                    "Ao se cadastrar no Freela e aderir à Assinatura Verde do Grupo Prospera, você ganha desconto na sua conta de energia. Quanto mais usar o Freela, maiores seus descontos." :
                    "Cadastre seu estabelecimento no Freela e adira à Assinatura Verde do Grupo Prospera. Ganhe 10% de desconto na conta de energia e acumule pontos que viram desconto nas contratações de freelancers."}
                  </p>

                  {/* Benefits Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start gap-3 bg-background rounded-xl p-4 border border-border">
                      <div className="p-2 bg-emerald-500/10 rounded-lg flex-shrink-0">
                        <Zap className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">10% de desconto</p>
                        <p className="text-xs text-muted-foreground">Na conta de energia elétrica</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-background rounded-xl p-4 border border-border">
                      <div className="p-2 bg-emerald-500/10 rounded-lg flex-shrink-0">
                        <Leaf className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">Assinatura Verde</p>
                        <p className="text-xs text-muted-foreground">Energia limpa e sustentável</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-background rounded-xl p-4 border border-border">
                      <div className="p-2 bg-emerald-500/10 rounded-lg flex-shrink-0">
                        <Star className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">Pontos Freela</p>
                        <p className="text-xs text-muted-foreground">
                          {isFreelaCasa ?
                          "Acumule pontos e ganhe descontos em serviços" :
                          "Desconto nas contratações de freelancers"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-background rounded-xl p-4 border border-border">
                      <div className="p-2 bg-emerald-500/10 rounded-lg flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">Mais uso, mais desconto</p>
                        <p className="text-xs text-muted-foreground">Descontos progressivos no Freela</p>
                      </div>
                    </div>
                  </div>

                  <a href="https://www.meuprospera.com.br/proposta/" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white group">
                      Cadastrar agora
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </div>

                {/* Right - Visual Highlight */}
                <div className="lg:w-80 w-full flex-shrink-0">
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BadgePercent className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-4xl font-display font-bold mb-2">10%</p>
                    <p className="text-lg font-medium mb-1">de desconto</p>
                    <p className="text-emerald-200 text-sm mb-6">na conta de energia</p>
                    <div className="border-t border-emerald-500/50 pt-4">
                      <p className="text-emerald-200 text-xs">+ Pontos que viram desconto</p>
                      <p className="text-emerald-200 text-xs">+ Energia sustentável</p>
                      <p className="text-emerald-200 text-xs">+ Sem fidelidade</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== CURSOS E CAPACITAÇÃO (Apenas para Empresas) ========== */}
        {!isFreelaCasa &&
        <div>
            <div className="text-center mb-12">
              <span className="badge-primary mb-6 inline-block text-base px-5 py-2">
                📚 Capacitação profissional
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Cursos, treinamentos e capacitação
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Capacite sua equipe e seus freelancers com cursos dos melhores parceiros do setor de hospitalidade.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Bares SP */}
              <div className="card-elevated overflow-hidden card-hover group">
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-400/5 p-8 text-center">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <span className="text-3xl">🍺</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Parceiro</span>
                  </div>
                  <h4 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    Bares SP
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cursos práticos de coquetelaria, gestão de bares e tendências do mercado. Ideal para bartenders e donos de bares.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-amber-500/10 text-amber-700 px-2 py-1 rounded-full">Coquetelaria</span>
                    <span className="text-xs bg-amber-500/10 text-amber-700 px-2 py-1 rounded-full">Gestão</span>
                    <span className="text-xs bg-amber-500/10 text-amber-700 px-2 py-1 rounded-full">Tendências</span>
                  </div>
                  <a href="https://baressp.com.br/cursos-online/" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" size="sm" className="w-full group/btn">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ver cursos
                      <ArrowRight className="w-3 h-3 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Diageo */}
              <div className="card-elevated overflow-hidden card-hover group">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-400/5 p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <span className="text-3xl">🥃</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Parceiro</span>
                  </div>
                  <h4 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    Cursos Diageo
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Programa de treinamento Diageo Bar Academy. Certificação internacional em mixologia e atendimento premium.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-blue-500/10 text-blue-700 px-2 py-1 rounded-full">Mixologia</span>
                    <span className="text-xs bg-blue-500/10 text-blue-700 px-2 py-1 rounded-full">Certificação</span>
                    <span className="text-xs bg-blue-500/10 text-blue-700 px-2 py-1 rounded-full">Premium</span>
                  </div>
                  <a href="https://www.diageobaracademy.com/pt-br/home/learning-for-life" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" size="sm" className="w-full group/btn">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Ver cursos
                      <ArrowRight className="w-3 h-3 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Sebrae */}
              <div className="card-elevated overflow-hidden card-hover group">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                    <span className="text-3xl">📊</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">Parceiro</span>
                  </div>
                  <h4 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    Cursos Sebrae
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Capacitação para empresários do setor de alimentação e eventos. Gestão financeira, marketing e formalização.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Gestão</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Finanças</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Marketing</span>
                  </div>
                  <a href="https://sebrae.com.br/sites/PortalSebrae" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" size="sm" className="w-full group/btn">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Ver cursos
                      <ArrowRight className="w-3 h-3 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 bg-muted rounded-full px-6 py-3">
                <Gift className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">
                  Parceiros Freela têm acesso a descontos exclusivos em todos os cursos
                </span>
              </div>
            </div>
          </div>
        }
      </div>
    </section>);

};

export default PartnersBenefitsSection;