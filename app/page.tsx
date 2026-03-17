import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { VisualComparison } from "@/components/landing/VisualComparison";
import { Features } from "@/components/landing/Features";
import { AIFeatures } from "@/components/landing/AIFeatures";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <VisualComparison />
      <Features />
      <AIFeatures />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
