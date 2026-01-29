import Header from "../components/Header";
import Footer from "../components/Footer";
import { Instagram, Facebook } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Contact" />

      <main className="flex-1 pt-24 pb-16 md:pt-32">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-600 mb-8">
            The quickest way to reach us is through social media or email.
          </p>

          <div className="flex gap-4 mb-8">
            <a
              href="#"
              className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              style={{
                background:
                  "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
              }}
            >
              <Instagram className="w-7 h-7 text-white" />
            </a>

            <a
              href="#"
              className="w-14 h-14 bg-[#1877f2] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Facebook className="w-7 h-7 text-white" />
            </a>
          </div>

          <p className="text-gray-600 mb-8">
            Or email us at{" "}
            <a
              href="mailto:secretary.rome.europe@gaa.ie"
              className="text-[#c41e3a] font-medium hover:underline"
            >
              secretary.rome.europe@gaa.ie
            </a>
          </p>

          <h2 className="text-3xl font-light text-[#c41e3a] mb-8">
            Send us a message
          </h2>

          <form
            className="space-y-6 max-w-xl"
            action={`mailto:secretary.rome.europe@gaa.ie`}
            method="POST"
            encType="text/plain"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Your question
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#c41e3a] text-white py-3 font-medium hover:bg-[#a01830] transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
