import Header from "../components/Header";
import Footer from "../components/Footer";

export default function SponsorsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Sponsors" />

      <main className="flex-1 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-gray-500 text-sm mb-2">2025 & 2026</p>
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Our Sponsors
          </h1>
          <p className="text-gray-600 mb-8">
            (Can include banner sponsor, gear partner, regional sponsor, etc..)
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#996B4D] aspect-[4/3] flex items-center justify-center"
              >
                <div className="bg-white/90 px-8 py-6 text-center">
                  <span className="text-xl font-serif text-gray-800">
                    Sponsor
                  </span>
                  <br />
                  <span className="text-lg font-serif text-gray-800">here</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
