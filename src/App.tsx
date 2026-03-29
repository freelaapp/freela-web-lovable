import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { ModeProvider } from "@/contexts/ModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TimelineProvider } from "@/contexts/TimelineContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import EsqueciMinhaSenha from "./pages/EsqueciMinhaSenha";
import CriarEvento from "./pages/CriarEvento";
import Freelancers from "./pages/Freelancers";
import AceitarJob from "./pages/AceitarJob";
import PerfilFreelancer from "./pages/PerfilFreelancer";
import DashboardFreelancer from "./pages/DashboardFreelancer";
import Agenda from "./pages/Agenda";
import DetalheVaga from "./pages/DetalheVaga";
import ConfirmarServico from "./pages/ConfirmarServico";
import Historico from "./pages/Historico";
import Avaliacoes from "./pages/Avaliacoes";
import DetalheAvaliacao from "./pages/DetalheAvaliacao";
import MapaVagas from "./pages/MapaVagas";
import DashboardContratante from "./pages/DashboardContratante";
import Mensagens from "./pages/Mensagens";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import EscolherPerfil from "./pages/EscolherPerfil";
import CadastroContratante from "./pages/CadastroContratante";
import CadastroFreelancer from "./pages/CadastroFreelancer";
import VideoApresentacao from "./pages/VideoApresentacao";
import ConfirmarEmail from "./pages/ConfirmarEmail";
import CadastroFreelancerAreas from "./pages/CadastroFreelancerAreas";
import MeusDados from "./pages/MeusDados";
import MeusDadosContratante from "./pages/MeusDadosContratante";
import Configuracoes from "./pages/Configuracoes";
import ConfiguracoesContratante from "./pages/ConfiguracoesContratante";
import Ajuda from "./pages/Ajuda";
import AjudaContratante from "./pages/AjudaContratante";
import Carteira from "./pages/Carteira";
import DetalheEventoContratante from "./pages/DetalheEventoContratante";
import PerfilContratante from "./pages/PerfilContratante";
import TelaPix from "./pages/TelaPix";
import ObrigadoContratante from "./pages/ObrigadoContratante";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <TimelineProvider>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/inicio" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueci-minha-senha" element={<EsqueciMinhaSenha />} />
            <Route path="/redefinir-senha" element={<Navigate to="/esqueci-minha-senha" replace />} />
            <Route path="/freelancers" element={<Freelancers />} />
            <Route path="/freelancer/:id" element={<PerfilFreelancer />} />
            <Route path="/termos" element={<TermosDeUso />} />
            <Route path="/privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/escolher-perfil" element={<EscolherPerfil />} />
            <Route path="/cadastro-contratante" element={<CadastroContratante />} />
            <Route path="/cadastro-freelancer" element={<CadastroFreelancer />} />
            <Route path="/confirmar-email" element={<ConfirmarEmail />} />
            <Route path="/cadastro-freelancer-areas" element={<CadastroFreelancerAreas />} />
            <Route path="/video-apresentacao" element={<VideoApresentacao />} />
            <Route path="/perfil-contratante/:clientId" element={<PerfilContratante />} />

            {/* Authenticated routes (any role) */}
            <Route path="/mensagens" element={<ProtectedRoute><Mensagens /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/avaliacoes" element={<ProtectedRoute><Avaliacoes /></ProtectedRoute>} />
            <Route path="/avaliacao/:avaliacaoId" element={<ProtectedRoute><DetalheAvaliacao /></ProtectedRoute>} />
            <Route path="/carteira" element={<ProtectedRoute><Carteira /></ProtectedRoute>} />

            {/* Freelancer-only routes */}
            <Route path="/dashboard-freelancer" element={<ProtectedRoute requiredRole="freelancer"><DashboardFreelancer /></ProtectedRoute>} />
            <Route path="/mapa-vagas" element={<ProtectedRoute requiredRole="freelancer"><MapaVagas /></ProtectedRoute>} />
            <Route path="/vaga/:vagaId" element={<ProtectedRoute requiredRole="freelancer"><DetalheVaga /></ProtectedRoute>} />
            <Route path="/aceitar-job/:jobId" element={<ProtectedRoute requiredRole="freelancer"><AceitarJob /></ProtectedRoute>} />
            <Route path="/confirmar-servico/:vagaId" element={<ProtectedRoute requiredRole="freelancer"><ConfirmarServico /></ProtectedRoute>} />
            <Route path="/historico" element={<ProtectedRoute requiredRole="freelancer"><Historico /></ProtectedRoute>} />
            <Route path="/meus-dados" element={<ProtectedRoute requiredRole="freelancer"><MeusDados /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute requiredRole="freelancer"><Configuracoes /></ProtectedRoute>} />
            <Route path="/ajuda" element={<ProtectedRoute requiredRole="freelancer"><Ajuda /></ProtectedRoute>} />

            {/* Contratante-only routes */}
            <Route path="/dashboard-contratante" element={<ProtectedRoute requiredRole="contratante"><DashboardContratante /></ProtectedRoute>} />
            <Route path="/criar-evento" element={<ProtectedRoute requiredRole="contratante"><CriarEvento /></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
            <Route path="/evento/:eventoId" element={<ProtectedRoute requiredRole="contratante"><DetalheEventoContratante /></ProtectedRoute>} />
            <Route path="/meus-dados-contratante" element={<ProtectedRoute requiredRole="contratante"><MeusDadosContratante /></ProtectedRoute>} />
            <Route path="/configuracoes-contratante" element={<ProtectedRoute requiredRole="contratante"><ConfiguracoesContratante /></ProtectedRoute>} />
            <Route path="/ajuda-contratante" element={<ProtectedRoute requiredRole="contratante"><AjudaContratante /></ProtectedRoute>} />
            <Route path="/tela-pix" element={<ProtectedRoute requiredRole="contratante"><TelaPix /></ProtectedRoute>} />
            <Route path="/obrigado-contratante" element={<ProtectedRoute requiredRole="contratante"><ObrigadoContratante /></ProtectedRoute>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </TimelineProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ModeProvider>
  </QueryClientProvider>
);

export default App;
