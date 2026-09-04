import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-brand-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        {/* Brand */}
        <div>
          <Link
            to="/"
            className="inline-block"
            aria-label="Cafe Two Shades - Home"
          >
            <img
              src="/images/logo/cafe-two-shades-logo.png"
              alt="Cafe Two Shades"
              className="h-14 w-auto"
            />
          </Link>

          <p className="mt-4 max-w-sm font-serif text-xl text-brand-ochre">
            Where Every Flavour Has a Story
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="font-serif text-2xl font-semibold">
            Visit Us
          </h2>

          <div className="mt-5 space-y-4 text-sm text-stone-300">
            <a
              href="#"
              className="flex items-start gap-3 transition-colors hover:text-brand-ochre"
            >
              <MapPin
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>23 Eld Ln, Colchester CO1 1LS</span>
            </a>

            <a
              href="tel:"
              className="flex items-center gap-3 transition-colors hover:text-[#C49A3A]"
            >
              <Phone size={18} aria-hidden="true" />
              <span>01206 768165</span>
            </a>

            <a
              href="mailto:"
              className="flex items-center gap-3 transition-colors hover:text-[#C49A3A]"
            >
              <Mail size={18} aria-hidden="true" />
              <span>twoshadescol@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h2 className="font-serif text-2xl font-semibold">
            Explore
          </h2>

          <nav
            aria-label="Footer navigation"
            className="mt-5 flex flex-col items-start gap-3 text-sm"
          >
            <Link
              to="/"
              className="text-stone-300 transition-colors hover:text-[#C49A3A]"
            >
              Home
            </Link>

            <Link
              to="/menu"
              className="text-stone-300 transition-colors hover:text-[#C49A3A]"
            >
              Menu
            </Link>

            <Link
              to="/orders"
              className="text-stone-300 transition-colors hover:text-[#C49A3A]"
            >
              Order Online
            </Link>

            <Link
              to="/privacy"
              className="text-stone-300 transition-colors hover:text-[#C49A3A]"
            >
              Privacy Policy
            </Link>

            <Link
              to="/admin"
              className="mt-3 text-xs text-stone-500 transition-colors hover:text-[#C49A3A]"
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} Cafe Two Shades. All rights reserved.
          </p>

          <p>
            Where Every Flavour Has a Story
          </p>
        </div>
      </div>
    </footer>
  );
}