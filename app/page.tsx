import HeroSection from "@/components/landing/HeroSection";
import TechStackSection from "@/components/landing/TechStackSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CTASection from "@/components/landing/CTASection";

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-violet-100">

      <HeroSection />

      <TechStackSection />

      <FeaturesSection />

      <HowItWorksSection />

      <CTASection />

    </main>
  );
}