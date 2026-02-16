import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoFreela from "@/assets/logo-freela.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/como-funciona", label: "Como Funciona" },
    { href: "/para-empresas", label: "Para Empresas" },
    { href: "/freela-em-casa", label: "Freela em Casa" },
    { href: "/profissionais", label: "Profissionais" },
    { href: "/sobre", label: "Sobre o Freela" },
    { href: "/contato", label: "Contato" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-secondary-foreground/10">
      <div className="container mx-auto container-padding">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover-scale shrink-0">
            <img
              src={logoFreela}
              alt="Freela"
              className="h-10 md:h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-secondary-foreground/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden xl:flex items-center gap-3 shrink-0">
            <Button variant="ghost" asChild className="text-secondary-foreground hover:text-primary hover:bg-secondary-foreground/10">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-hover">
              <Link to="/cadastro">Criar Conta</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden p-2 text-secondary-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden py-4 border-t border-secondary-foreground/10 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary/20 text-primary"
                      : "text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 px-4">
                <Button variant="outline" asChild className="w-full border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary-hover">
                  <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>
                    Criar Conta
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
