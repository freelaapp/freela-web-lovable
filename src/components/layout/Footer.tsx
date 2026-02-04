import { Link } from "react-router-dom";
import logoFreela from "@/assets/logo-freela.png";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    plataforma: [
      { href: "/como-funciona", label: "Como Funciona" },
      { href: "/para-freelancers", label: "Para Freelancers" },
      { href: "/para-clientes", label: "Para Clientes" },
      { href: "/categorias", label: "Categorias" },
    ],
    suporte: [
      { href: "/ajuda", label: "Central de Ajuda" },
      { href: "/contato", label: "Contato" },
      { href: "/faq", label: "Perguntas Frequentes" },
      { href: "/termos", label: "Termos de Uso" },
    ],
    empresa: [
      { href: "/sobre", label: "Sobre Nós" },
      { href: "/blog", label: "Blog" },
      { href: "/carreiras", label: "Carreiras" },
      { href: "/privacidade", label: "Política de Privacidade" },
    ],
  };

  const socialLinks = [
    { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
    { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
    { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
    { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto container-padding section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img 
                src={logoFreela} 
                alt="Freela Serviços" 
                className="h-14 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-secondary-foreground/70 mb-6 max-w-sm">
              Conectamos talentos a oportunidades. Encontre os melhores freelancers ou 
              ofereça seus serviços para clientes em todo o Brasil.
            </p>
            <div className="space-y-3">
              <a 
                href="mailto:contato@freela.com.br" 
                className="flex items-center gap-3 text-secondary-foreground/70 hover:text-primary transition-colors"
              >
                <Mail size={18} />
                <span>contato@freela.com.br</span>
              </a>
              <a 
                href="tel:+5511999999999" 
                className="flex items-center gap-3 text-secondary-foreground/70 hover:text-primary transition-colors"
              >
                <Phone size={18} />
                <span>(11) 99999-9999</span>
              </a>
              <div className="flex items-center gap-3 text-secondary-foreground/70">
                <MapPin size={18} />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Plataforma</h4>
            <ul className="space-y-3">
              {footerLinks.plataforma.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-secondary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Suporte</h4>
            <ul className="space-y-3">
              {footerLinks.suporte.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-secondary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-secondary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-foreground/60 text-sm">
            © {currentYear} Freela Serviços. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-secondary-foreground/10 text-secondary-foreground/70 hover:bg-primary hover:text-primary-foreground transition-all"
                aria-label={social.label}
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
