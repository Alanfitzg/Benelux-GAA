"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";

export default function YouthPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Youth" />

      <main className="flex-1 pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            <EditableText
              pageKey="youth"
              contentKey="title"
              defaultValue="Youth GAA"
              maxLength={40}
            />
          </h1>

          <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
            <EditableText
              pageKey="youth"
              contentKey="intro"
              defaultValue="Developing the next generation of Gaelic games players in Rome. Our youth programme offers children the chance to learn hurling, football, and camogie in a fun, supportive environment."
              maxLength={250}
            />
          </p>

          <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
            <li>
              <EditableText
                pageKey="youth"
                contentKey="item1"
                defaultValue="Rome's first Cúl camp - information & photos"
                maxLength={80}
              />
            </li>
            <li>
              <EditableText
                pageKey="youth"
                contentKey="item2"
                defaultValue="How to get your kids involved"
                maxLength={60}
              />
            </li>
            <li>
              <EditableText
                pageKey="youth"
                contentKey="item3"
                defaultValue="Get involved as a coach"
                maxLength={60}
              />
            </li>
            <li>
              <EditableText
                pageKey="youth"
                contentKey="item4"
                defaultValue="Contact details for Youth Officer"
                maxLength={60}
              />
            </li>
            <li>
              <EditableText
                pageKey="youth"
                contentKey="item5"
                defaultValue="Information on Youth activities throughout European GAA"
                maxLength={80}
              />
            </li>
          </ul>

          <p className="mt-6 sm:mt-8 text-gray-700 text-sm sm:text-base">
            <EditableText
              pageKey="youth"
              contentKey="note"
              defaultValue="Demonstrating a youth set up is proven to add huge value in the eyes of a sponsor - it demonstrates sustainability and a solid structure."
              maxLength={200}
            />
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
