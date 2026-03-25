import AppLayout from "@/components/layout/AppLayout";
import HeroSection from "@/components/home/HeroSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PartnersSection from "@/components/home/PartnersSection";
import PartnersBenefitsSection from "@/components/home/PartnersBenefitsSection";
import CTASection from "@/components/home/CTASection";
import EmpresasLandingPage from "@/components/home/EmpresasLandingPage";
import AppDownloadCard from "@/components/home/AppDownloadCard";
import { useMode } from "@/contexts/ModeContext";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const { isFreelaCasa, setMode } = useMode();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const modo = searchParams.get("modo");
    if (modo === "empresas" || modo === "casa") {
      setMode(modo);
    }
  }, [searchParams, setMode]);

  if (!isFreelaCasa) {
    return (
      <AppLayout>
        <EmpresasLandingPage />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <HeroSection />
      <BenefitsSection />
      <CategoriesSection />
      <PartnersBenefitsSection />
      <TestimonialsSection />
      <PartnersSection />
      <HowItWorksSection />
      {/* <AppDownloadCard /> — temporariamente desativado até o App estar pronto */}
      <CTASection />
    </AppLayout>
  );
};

export default Index;
