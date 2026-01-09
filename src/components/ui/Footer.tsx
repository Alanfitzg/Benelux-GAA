import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">PlayAway</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting GAA clubs and tournaments worldwide. Making Gaelic
              games more accessible and sustainable globally.
            </p>
            <div className="text-sm text-gray-400">
              <p>Gaelic Trips Ltd</p>
              <p>Registered in Ireland</p>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/clubs"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Browse Clubs
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Find Events
                </Link>
              </li>
              <li>
                <Link
                  href="/clubs/register"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Register Club
                </Link>
              </li>
              <li>
                <Link
                  href="/events/create"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Legal Compliance
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cookie Settings
                </Link>
              </li>
              <li>
                <Link
                  href="/host-terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Host Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Form
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} Gaelic Trips Ltd. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>
                Products are <strong>Linked Travel Arrangements</strong> per EU
                Directive 2015/2302
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
