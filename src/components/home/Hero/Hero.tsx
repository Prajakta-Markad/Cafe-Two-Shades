import { Link } from "react-router-dom";

import HeroSlider from "./HeroSlider";

export default function Hero() {
  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden">
      <HeroSlider />

      <div className="relative z-10 flex min-h-[calc(100svh-5rem)] items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-3xl text-center text-white">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.3em] text-brand-ochre sm:text-base">
            Cafe Two Shades
          </p>

          <h1 className="text-5xl font-semibold leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">
            Where Every Flavour Has a Story
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-stone-200 sm:text-lg">
            A meeting of Indian warmth and British tradition,
            brought together through food, friendship, and
            flavour.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/bookings"
              className="
                min-w-40
                rounded-xl
                bg-brand-ochre
                px-6
                py-3.5
                text-sm
                font-semibold
                text-brand-black
                transition-colors
                hover:bg-brand-ochre-dark
              "
            >
              Book a Table
            </Link>

            <Link
              to="/menu"
              className="
                min-w-40
                rounded-xl
                border
                border-white/70
                px-6
                py-3.5
                text-sm
                font-semibold
                text-white
                transition-colors
                hover:border-white
                hover:bg-white
                hover:text-brand-black
              "
            >
              Explore Our Menu
            </Link>
          </div>
          </div>
      </div>

      <div
        className="
          absolute
          bottom-8
          left-1/2
          z-10
          hidden
          -translate-x-1/2
          sm:block
        "
        aria-hidden="true"
      >
        <div className="flex h-10 w-6 justify-center rounded-full border border-white/60 p-1">
          <div className="h-2 w-1 rounded-full bg-white/80 animate-bounce" />
        </div>
      </div>
    </section>
  );
}