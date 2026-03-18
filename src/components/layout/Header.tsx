import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard, Calendar, Star, Map, User, CalendarPlus, Bell, LogOut } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import logoFreela from "@/assets/logo-freela-red.svg";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const role = useUserRole();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Heuristic: if we have a token in localStorage, we are likely logged in.
  // This avoids the "flicker" of showing public nav while auth is still loading on mount.
  const hasAuthToken = !!localStorage.getItem("authToken");
  const isLoggedIn = isAuthenticated || (isLoading && hasAuthToken);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const publicNavLinks = [
    { href: "/", label: "Início" },
    { href: "/#o-que-e", label: "O que é o Freela" },
    { href: "/#como-funciona", label: "Como funciona" },
    { href: "/#parcerias", label: "Parcerias" },
    { href: "/#duvidas", label: "Dúvidas" },
  ];

  const freelancerNavLinks = [
    { href: "/dashboard-freelancer", label: "Dashboard", icon: LayoutDashboard },
    { href: "/agenda", label: "Agenda", icon: Calendar },
    { href: "/mapa-vagas", label: "Vagas", icon: Map },
    { href: "/avaliacoes", label: "Avaliações", icon: Star },
  ];

  const contratanteNavLinks = [
    { href: "/dashboard-contratante", label: "Dashboard", icon: LayoutDashboard },
    { href: "/agenda", label: "Agenda", icon: Calendar },
    { href: "/avaliacoes", label: "Avaliações", icon: Star },
  ];

  const loggedInNavLinks = role === "contratante" ? contratanteNavLinks : freelancerNavLinks;

  const isLandingPage = location.pathname === "/" || location.pathname === "/inicio";
  const showPublicNav = !isLoggedIn || isLandingPage;

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
            <Link
              to={isLoggedIn ? (role === "contratante" ? "/dashboard-contratante" : "/dashboard-freelancer") : "/"}
              className="flex items-center gap-2 hover-scale"
            >
              <img
                src={logoFreela}
                alt="Freela Serviços"
                className="h-[52px] md:h-[62px] w-auto object-fill"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          {showPublicNav ? (
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
          ) : (
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
          )}

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn && !isLandingPage ? (
              <>
                {role === "contratante" && location.pathname !== "/dashboard-contratante" && (
                  <Button asChild size="sm" className="gap-1.5">
                    <Link to="/criar-evento">
                      <CalendarPlus className="w-4 h-4" /> Criar Vaga
                    </Link>
                  </Button>
                )}
                <button
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative"
                  title="Notificações"
                >
                  <Bell className="w-5 h-5" />
                </button>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Meu Perfil"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-popover shadow-lg py-1 z-50 animate-fade-in">
                      <Link
                        to="/perfil"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                      <button
                        onClick={() => { setIsProfileMenuOpen(false); logout(); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair da conta
                      </button>
                    </div>
                  )}
                </div>
              </>
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
                    {role === "contratante" && location.pathname !== "/dashboard-contratante" && (
                      <Button asChild className="w-full gap-2">
                        <Link to="/criar-evento" onClick={() => setIsMenuOpen(false)}>
                          <CalendarPlus className="w-4 h-4" /> Criar Vaga
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/perfil" onClick={() => setIsMenuOpen(false)}>
                        <User className="w-4 h-4 mr-2" /> Meu Perfil
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => { setIsMenuOpen(false); logout(); }}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sair da conta
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
