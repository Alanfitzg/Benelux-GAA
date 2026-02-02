import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import HomeContent from "./components/HomeContent";

export default function BeneluxGAAPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Home" />
      <HeroSection />
      <HomeContent />
      <Footer />
    </div>
  );
}
