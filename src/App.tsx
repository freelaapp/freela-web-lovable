import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ModeProvider } from "@/contexts/ModeContext";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import EsqueciMinhaSenha from "./pages/EsqueciMinhaSenha";
import CriarEvento from "./pages/CriarEvento";
import Freelancers from "./pages/Freelancers";
import AceitarJob from "./pages/AceitarJob";
import PerfilFreelancer from "./pages/PerfilFreelancer";
import DashboardFreelancer from "./pages/DashboardFreelancer";
import DashboardContratante from "./pages/DashboardContratante";
import Mensagens from "./pages/Mensagens";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
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
            <Route path="/perfil" element={<Perfil />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ModeProvider>
  </QueryClientProvider>
);

export default App;
