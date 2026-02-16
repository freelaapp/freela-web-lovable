import AppLayout from "@/components/layout/AppLayout";
import HeroSection from "@/components/home/HeroSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PartnersSection from "@/components/home/PartnersSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <AppLayout>
      <HeroSection />
      <BenefitsSection />
      <CategoriesSection />
      <TestimonialsSection />
      <PartnersSection />
      <HowItWorksSection />
      <CTASection />
    </AppLayout>
  );
};

export default Index;
