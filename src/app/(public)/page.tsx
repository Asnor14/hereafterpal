import HeroSection from '@/components/homepage/HeroSection';
import QuickActionsSection from '@/components/homepage/QuickActionsSection';
import BenefitsSection from '@/components/homepage/BenefitsSection';
import HowItWorksSection from '@/components/homepage/HowItWorksSection';
import PricingPreviewSection from '@/components/homepage/PricingPreviewSection';
import FinalCTASection from '@/components/homepage/FinalCTASection';

export const revalidate = 0;

export default function Home() {
    return (
        <main className="bg-memorial-bg dark:bg-memorialDark-bg min-h-screen">
            <HeroSection />
            <div className="space-y-20 md:space-y-32">
                <QuickActionsSection />
                <BenefitsSection />
                <HowItWorksSection />
                <PricingPreviewSection />
                <FinalCTASection />
            </div>
        </main>
    );
}
