import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";
import HomeContent from "./components/HomeContent";

export default function RomeHiberniaPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Home" />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Editable Content Sections */}
      <HomeContent />

      <Footer />
    </div>
  );
}
