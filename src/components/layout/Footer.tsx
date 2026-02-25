import { Link } from "react-router-dom";
import logoFreela from "@/assets/logo-freela-red.svg";
import { Mail, Phone, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    plataforma: [
    { href: "/", label: "Sobre o Freela" },
    { href: "/#como-funciona", label: "Como Funciona" },
    { href: "/inicio?modo=empresas", label: "Freela para Empresas" },
    { href: "/inicio?modo=casa", label: "Freela em Casa" }],

    suporte: [
    { href: "/contato", label: "Contato" },
    { href: "/termos", label: "Termos de Uso" },
    { href: "/privacidade", label: "Política de Privacidade" }],

    acesso: [
    { href: "/login", label: "Entrar" },
    { href: "/cadastro", label: "Cadastre-se" },
    { href: "/freelancers", label: "Ver Freelancers" }],

  };

  const socialLinks = [
  { href: "https://www.facebook.com/profile.php?id=61573385341423&locale=pt_BR", icon: Facebook, label: "Facebook" },
  { href: "https://www.instagram.com/freelaservicos/", icon: Instagram, label: "Instagram" },
  { href: "https://www.linkedin.com/company/freela-serviços/", icon: Linkedin, label: "LinkedIn" }];


  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto container-padding section-padding pt-[10px] pb-[10px] py-[20px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img src={logoFreela} alt="Freela Serviços" className="h-14 w-auto invert" />
            </Link>
            <p className="text-secondary-foreground/70 mb-6 max-w-sm">
              Conectamos você a profissionais qualificados para eventos e estabelecimentos em todo o Brasil.
            </p>
            <div className="space-y-3">
              <a href="mailto:contato@freelaservicos.com.br" className="flex items-center gap-3 text-secondary-foreground/70 hover:text-primary transition-colors">
                <Mail size={18} />
                <span>contato@freelaservicos.com.br</span>
              </a>
              <a href="tel:+5511948735114" className="flex items-center gap-3 text-secondary-foreground/70 hover:text-primary transition-colors">
                <Phone size={18} />
                <span>+55 11 94873-5114</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Plataforma</h4>
            <ul className="space-y-3">
              {footerLinks.plataforma.map((link) =>
              <li key={link.href + link.label}>
                  <Link to={link.href} className="text-secondary-foreground/70 hover:text-primary transition-colors">{link.label}</Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Suporte</h4>
            <ul className="space-y-3">
              {footerLinks.suporte.map((link) =>
              <li key={link.href}>
                  <Link to={link.href} className="text-secondary-foreground/70 hover:text-primary transition-colors">{link.label}</Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Acesso</h4>
            <ul className="space-y-3">
              {footerLinks.acesso.map((link) =>
              <li key={link.href}>
                  <Link to={link.href} className="text-secondary-foreground/70 hover:text-primary transition-colors">{link.label}</Link>
                </li>
              )}
            </ul>
          </div>

          <div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-foreground/60 text-sm">
            © {currentYear} Freela Serviços. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) =>
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-secondary-foreground/10 text-secondary-foreground/70 hover:bg-primary hover:text-primary-foreground transition-all"
              aria-label={social.label}>

                <social.icon size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>);

};

export default Footer;