import Header from "../components/Header";
import Footer from "../components/Footer";

export default function YouthPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Youth" />

      <main className="flex-1 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <ul className="list-disc pl-6 space-y-3 text-gray-700">
            <li>Romes first Cúl camp - information & photos</li>
            <li>How to get your kids involved</li>
            <li>Get involved as a coach</li>
            <li>Contact details for Youth Officer</li>
            <li>Information on Youth activities throughout European GAA</li>
          </ul>

          <p className="mt-8 text-gray-700">
            Demonstrating a youth set up is proven to add huge value in the eyes
            of a sponsor - it demonstrates sustainability and a solid structure.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
