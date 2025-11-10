import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import LicitacionesSection from "@/components/LicitacionesSection";
import TestimoniosSection from "@/components/TestimoniosSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <LicitacionesSection />
        <TestimoniosSection />
      </main>
      <Footer />
    </div>
  );
}
