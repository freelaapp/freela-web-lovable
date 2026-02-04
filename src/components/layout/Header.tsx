import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoFreela from "@/assets/logo-freela-transparent.png";
import ModeSelector from "@/components/ModeSelector";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/criar-evento", label: "Criar Evento" },
    { href: "/freelancers", label: "Freelancers" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto container-padding">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover-scale">
            <img 
              src={logoFreela} 
              alt="Freela Serviços" 
              className="h-10 md:h-12 w-auto"
            />
          </Link>

          {/* Mode Selector - Desktop */}
          <div className="hidden lg:block">
            <ModeSelector />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">Cadastre-se</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            {/* Mode Selector - Mobile */}
            <div className="px-4 mb-4">
              <ModeSelector />
            </div>
            
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary-light text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 px-4">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>
                    Cadastre-se
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
