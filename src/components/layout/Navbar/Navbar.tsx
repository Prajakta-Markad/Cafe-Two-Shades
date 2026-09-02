import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((current) => !current);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-brand-ivory/95 backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          aria-label="Cafe Two Shades - Home"
          className="shrink-0"
        >
          <img
            src="/images/logo/cafe-two-shades-logo.png"
            alt="Cafe Two Shades"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop navigation */}
        <DesktopNav />

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={
            mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          className="
            rounded-lg
            p-2
            text-[#111111]
            transition-colors
            hover:bg-[#E8E0D0]
            md:hidden
          "
        >
          {mobileMenuOpen ? (
            <X size={26} aria-hidden="true" />
          ) : (
            <Menu size={26} aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile navigation */}
      <div id="mobile-navigation">
        <MobileMenu
          open={mobileMenuOpen}
          closeMenu={closeMobileMenu}
        />
      </div>
    </header>
  );
}