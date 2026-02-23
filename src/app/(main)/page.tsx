import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeContent from "./components/HomeContent";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Home" />
      <main className="flex-1">
        <HomeContent />
      </main>
      <Footer />
    </div>
  );
}
