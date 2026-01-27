import React from "react";

export default function AboutPage() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-8">
      <h1 className="text-4xl font-extrabold text-primary mb-6 pb-2 border-b border-gray-200">
        About Us
      </h1>
      <div className="prose lg:prose-xl max-w-none text-gray-700">
        <p className="lead">
          Gaelic Trips exists to empower Gaelic Games clubs across Europe by
          simplifying travel, event management, and financial sustainability—all
          for less than the price of a pint per player.
        </p>
        <p>
          We believe the future of Gaelic Games lies in connection: between
          players, between clubs, and between countries. Our platform helps
          clubs host events, sell Day Passes, and streamline bookings, while
          ensuring players and teams get a simple, affordable, and enriching
          experience.
        </p>
        <h2 className="text-3xl font-bold text-primary mt-8 mb-4">
          Our Mission
        </h2>
        <p>
          To make participation in Gaelic Games across Europe easier, fairer,
          and more financially sustainable—one trip at a time.
        </p>
        <h2 className="text-3xl font-bold text-primary mt-8 mb-4">
          Our Principles
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Club First:</strong> Everything we build is for the benefit
            of the clubs. We help you grow, fundraise, and thrive.
          </li>
          <li>
            <strong>Transparency:</strong> No hidden fees. No tricks. Just a
            small fee per pass sold—always under €5.
          </li>
          <li>
            <strong>Simplicity:</strong> Booking a tournament should be as easy
            as booking a flight. Now it is.
          </li>
          <li>
            <strong>Community-Led:</strong> We listen to the players,
            volunteers, and regional boards who make Gaelic Games possible.
          </li>
          <li>
            <strong>Smart Design:</strong> Built with Wix Velo, our platform is
            tailored to the specific needs of GGE clubs, not generic travel
            groups.
          </li>
        </ul>
        <h2 className="text-3xl font-bold text-primary mt-8 mb-4">
          Why It Matters
        </h2>
        <p>
          With limited funding, volunteer burnout, and rising travel costs,
          Gaelic Games clubs face unique challenges in Europe. Gaelic Trips is
          the first solution designed specifically to help you cover costs,
          boost participation, and create unforgettable experiences—all while
          keeping control in the hands of the clubs themselves.
        </p>
      </div>
    </div>
  );
}
