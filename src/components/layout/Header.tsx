import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, LayoutDashboard, Calendar, History, Star, Map } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import logoFreela from "@/assets/logo-freela-red.svg";

const loggedInPaths = [
  "/dashboard-freelancer",
  "/dashboard-contratante",
  "/perfil",
  "/mensagens",
  "/agenda",
  "/historico",
  "/avaliacoes",
  "/mapa-vagas",
  "/criar-evento",
  "/aceitar-job",
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = useMemo(() => {
    return loggedInPaths.some(p => location.pathname.startsWith(p));
  }, [location.pathname]);

  const publicNavLinks = [
    { href: "/", label: "Início" },
    { href: "/#o-que-e", label: "O que é o Freela" },
    { href: "/#como-funciona", label: "Como funciona" },
    { href: "/#parcerias", label: "Parcerias" },
    { href: "/#duvidas", label: "Dúvidas" },
  ];

  const loggedInNavLinks = [
    { href: "/dashboard-freelancer", label: "Dashboard", icon: LayoutDashboard },
    { href: "/agenda", label: "Agenda", icon: Calendar },
    { href: "/mapa-vagas", label: "Mapa de Vagas", icon: Map },
    { href: "/historico", label: "Histórico", icon: History },
    { href: "/avaliacoes", label: "Avaliações", icon: Star },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = useCallback((e: React.MouseEvent, href: string) => {
    if (href.includes("#")) {
      e.preventDefault();
      const hash = href.split("#")[1];
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(false);
    }
  }, [location.pathname, navigate]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto container-padding">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 hover-scale">
              <img
                src={logoFreela}
                alt="Freela Serviços"
                className="h-[52px] md:h-[62px] w-auto object-fill"
              />
            </Link>
            {isLoggedIn && (
              <Link
                to="/"
                className="ml-2 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Voltar para Home"
              >
                <Home className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          {isLoggedIn ? (
            <nav className="hidden lg:flex items-center gap-6">
              {loggedInNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
                    isActive(link.href)
                      ? "text-primary bg-primary-light"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-8">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
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
          )}

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <Button variant="outline" asChild>
                <Link to="/perfil">Meu Perfil</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/cadastro">Cadastre-se</Link>
                </Button>
              </>
            )}
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
            <nav className="flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  {loggedInNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                        isActive(link.href)
                          ? "bg-primary-light text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-2 mt-4 px-4">
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/" onClick={() => setIsMenuOpen(false)}>
                        <Home className="w-4 h-4 mr-2" /> Voltar para Home
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/perfil" onClick={() => setIsMenuOpen(false)}>
                        Meu Perfil
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {publicNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
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
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
