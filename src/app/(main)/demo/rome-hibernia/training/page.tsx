import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Training" />

      <main className="flex-1 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-light text-gray-900">
            Training Information here
          </h1>
        </div>
      </main>

      <Footer />
    </div>
  );
}
