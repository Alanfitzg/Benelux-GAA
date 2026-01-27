import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Contact" />

      <main className="flex-1 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-gray-700 mb-2">
            The quickest way to get in touch with us is through sending a
            message to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Facebook
            </a>{" "}
            or{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Instagram
            </a>{" "}
            page.
          </p>
          <p className="text-gray-700 mb-4">
            If you don&apos;t have a social media account you can contact us on{" "}
            <a href="#" className="underline">
              ______________@gmail.com
            </a>
            .
          </p>

          <p className="text-gray-700 mb-12">
            Buttons to social media accounts can be linked here
          </p>

          <h2 className="text-3xl font-light text-red-600 mb-8">
            Contact information
          </h2>

          <form className="space-y-6 max-w-xl">
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
