import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { ModeProvider } from "@/contexts/ModeContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inicio" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueci-minha-senha" element={<EsqueciMinhaSenha />} />
            <Route path="/criar-evento" element={<CriarEvento />} />
            <Route path="/freelancers" element={<Freelancers />} />
            <Route path="/aceitar-job/:jobId" element={<AceitarJob />} />
            <Route path="/freelancer/:id" element={<PerfilFreelancer />} />
            <Route path="/dashboard-freelancer" element={<DashboardFreelancer />} />
            <Route path="/dashboard-contratante" element={<DashboardContratante />} />
            <Route path="/mensagens" element={<Mensagens />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/vaga/:vagaId" element={<DetalheVaga />} />
            <Route path="/confirmar-servico/:vagaId" element={<ConfirmarServico />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/avaliacoes" element={<Avaliacoes />} />
            <Route path="/avaliacao/:avaliacaoId" element={<DetalheAvaliacao />} />
            <Route path="/mapa-vagas" element={<MapaVagas />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/termos" element={<TermosDeUso />} />
            <Route path="/privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/escolher-perfil" element={<EscolherPerfil />} />
            <Route path="/cadastro-contratante" element={<CadastroContratante />} />
            <Route path="/cadastro-freelancer" element={<CadastroFreelancer />} />
            <Route path="/video-apresentacao" element={<VideoApresentacao />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ModeProvider>
  </QueryClientProvider>
);

export default App;
