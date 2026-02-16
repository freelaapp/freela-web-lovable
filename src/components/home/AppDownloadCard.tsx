import { Smartphone, Briefcase, Building2 } from "lucide-react";

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.09 12l2.608-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/>
  </svg>
);

const AppDownloadCard = () => (
  <section className="section-padding bg-muted/50">
    <div className="container mx-auto container-padding">
      <div className="bg-secondary rounded-3xl p-8 md:p-12 shadow-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-bold">Disponível para iOS e Android</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-secondary-foreground mb-3">
            Baixe o App Freela e facilite sua experiência.
          </h3>
          <p className="text-secondary-foreground/70 max-w-xl mx-auto">
            Escolha seu perfil e tenha acesso completo à plataforma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profissional */}
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 md:p-8 flex flex-col">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full mb-4 self-start">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Sou Profissional</span>
            </div>
            <h4 className="text-lg md:text-xl font-bold text-secondary-foreground mb-3">
              Receba oportunidades na sua região
            </h4>
            <p className="text-secondary-foreground/60 text-sm mb-6 leading-relaxed flex-1">
              Gerencie seus trabalhos, aumente sua renda e receba ofertas diretamente no seu celular.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#" className="flex items-center justify-center gap-2 bg-secondary-foreground text-secondary rounded-xl px-5 py-3 font-semibold text-sm hover:opacity-90 transition-opacity">
                <AppleIcon /> Apple Store
              </a>
              <a href="#" className="flex items-center justify-center gap-2 bg-secondary-foreground text-secondary rounded-xl px-5 py-3 font-semibold text-sm hover:opacity-90 transition-opacity">
                <PlayIcon /> Google Play
              </a>
            </div>
          </div>

          {/* Contratante */}
          <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6 md:p-8 flex flex-col">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full mb-4 self-start">
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Sou Contratante</span>
            </div>
            <h4 className="text-lg md:text-xl font-bold text-secondary-foreground mb-3">
              Encontre profissionais rapidamente
            </h4>
            <p className="text-secondary-foreground/60 text-sm mb-6 leading-relaxed flex-1">
              Publique vagas, gerencie contratações com facilidade e tenha controle total pelo celular.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#" className="flex items-center justify-center gap-2 bg-secondary-foreground text-secondary rounded-xl px-5 py-3 font-semibold text-sm hover:opacity-90 transition-opacity">
                <AppleIcon /> Apple Store
              </a>
              <a href="#" className="flex items-center justify-center gap-2 bg-secondary-foreground text-secondary rounded-xl px-5 py-3 font-semibold text-sm hover:opacity-90 transition-opacity">
                <PlayIcon /> Google Play
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AppDownloadCard;
