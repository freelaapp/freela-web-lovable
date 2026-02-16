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
import { useMode } from "@/contexts/ModeContext";

const Index = () => {
  const { isFreelaCasa } = useMode();

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
      <CTASection />
    </AppLayout>
  );
};

export default Index;
