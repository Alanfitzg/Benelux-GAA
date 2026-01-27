"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Where we train */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-4">
              <Image
                src="/club-crests/rome-hibernia-NEW.png"
                alt="Rome Hibernia GAA"
                width={60}
                height={60}
                className="object-contain"
                unoptimized
              />
            </div>
            <h4 className="font-medium mb-2">Where we train</h4>
            <p className="text-gray-400 text-sm">Address</p>
            <p className="text-gray-400 text-sm">Address</p>
            <a
              href="#"
              className="text-white text-sm underline hover:text-[#c41e3a] transition-colors mt-2 inline-block"
            >
              Show on Google Maps
            </a>
          </div>

          {/* Newsletter */}
          <div className="text-center sm:col-span-2 md:col-span-1">
            <h4 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">
              Subscribe to our newsletter
            </h4>
            <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <div className="flex-1">
                <label className="block text-left text-xs text-gray-400 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="e.g., email@exampl..."
                  className="w-full px-3 py-2 bg-white text-black text-sm rounded-none border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="button"
                className="sm:self-end px-4 py-2 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center sm:text-right md:text-right sm:col-span-2 md:col-span-1">
            <h4 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">
              Contact us on social media
            </h4>
            <div className="flex gap-2 sm:gap-3 justify-center sm:justify-end md:justify-end mb-3 sm:mb-4 flex-wrap">
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{
                  background:
                    "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                }}
              >
                <Instagram size={20} className="text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-[#1877f2] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Facebook size={20} className="text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-[#0a66c2] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Linkedin size={20} className="text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-[#ff0000] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Youtube size={20} className="text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-black border border-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              Email us on{" "}
              <a href="#" className="underline hover:text-white">
                ____________
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Powered by PlayAway */}
      <div className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Powered by{" "}
            <Link
              href="/"
              className="text-[#c41e3a] hover:text-white transition-colors font-medium"
            >
              PlayAway
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
