import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import SectionContainer from "../../common/SectionContainer";

export default function SeasonalSpecial() {
  return (
    <SectionContainer>
      <div className="overflow-hidden rounded-3xl bg-brand-black">
        <div className="grid items-stretch lg:grid-cols-2">
          {/* Image */}
          <div className="relative min-h-[320px] lg:min-h-[500px]">
          <img
            src="/images/seasonal/seasonal-special.jpg"
            alt="Seasonal special"
            width="1200"
            height="900"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />

            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-ochre">
              This Season
            </p>

            <h2 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              A taste of summer
            </h2>

            <h3 className="mt-5 font-serif text-3xl font-semibold text-brand-ochre">
              Royal Mango Mastani Milkshake
            </h3>

            <p className="mt-4 max-w-lg text-base leading-7 text-stone-300">
              Cool, creamy, and full of mango flavour — a
              refreshing favourite for warmer days.
            </p>

            <Link
              to="/menu"
              className="
                mt-8
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-xl
                bg-brand-ochre
                px-5
                py-3
                text-sm
                font-semibold
                text-brand-black
                transition-colors
                hover:bg-brand-ochre-dark
              "
            >
              See the Menu
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}