import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { IntroductionSection } from "@/components/IntroductionSection";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ShopCategoriesSection } from "@/components/ShopCategoriesSection";
import { ProductsCarousel } from "@/components/ProductsCarousel";
import { FeaturesSplitSection } from "@/components/FeaturesSplitSection";
import { TeamSection } from "@/components/TeamSection";
import { SkillsSection } from "@/components/SkillsSection";
import { StatsSection } from "@/components/StatsSection";
import { BlogSection } from "@/components/BlogSection";
import { CTABanner } from "@/components/CTABanner";
import { FindStoreSection } from "@/components/FindStoreSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <IntroductionSection />
      <PortfolioGrid />
      <TestimonialsSection />
      <ShopCategoriesSection />
      <ProductsCarousel />
      <FeaturesSplitSection />
      <TeamSection />
      <SkillsSection />
      <StatsSection />
      <BlogSection />
      <CTABanner />
      <FindStoreSection />
      <Footer />
    </main>
  );
}
