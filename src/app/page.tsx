import HeroSection from '@/components/homepage/HeroSection';
import QuickActionsSection from '@/components/homepage/QuickActionsSection';
import BenefitsSection from '@/components/homepage/BenefitsSection';
import HowItWorksSection from '@/components/homepage/HowItWorksSection';
import PricingPreviewSection from '@/components/homepage/PricingPreviewSection';
import FinalCTASection from '@/components/homepage/FinalCTASection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <QuickActionsSection />
      <BenefitsSection />
      <HowItWorksSection />
      <PricingPreviewSection />
      <FinalCTASection />
    </main>
  );
}
