import { Link } from "react-router-dom";

import SectionContainer from "../../common/SectionContainer";

export default function OurStory() {
  return (
    <SectionContainer>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-ochre">
            Our Story
          </p>

          <h2 className="mt-3 text-4xl font-semibold leading-tight text-brand-black sm:text-5xl">
            Two cultures.
            <br />
            One table.
          </h2>

          <div className="mt-6 space-y-4 text-base leading-7 text-stone-600">
            <p>
              Cafe Two Shades was born from a friendship between
              two cultures, bringing together the warmth and
              character of Indian food with the familiar charm
              of British café tradition.
            </p>

            <p>
              It is a place where different flavours, stories,
              and traditions can sit comfortably together at the
              same table.
            </p>

            <p>
              From a comforting cup of chai to a hearty breakfast,
              every dish is part of that story.
            </p>
          </div>

          <Link
            to="/menu"
            className="
              mt-8
              inline-flex
              rounded-xl
              border
              border-brand-ochre
              px-5
              py-3
              text-sm
              font-semibold
              text-brand-black
              transition-colors
              hover:bg-brand-ochre
            "
          >
            Explore the Menu
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
          <img
              src="/images/about/about-story.jpg"
              alt="Cafe Two Shades interior"
              width="800"
              height="1000"
              className="aspect-[4/5] h-full w-full object-cover"
              loading="lazy"
          />
          </div>

          <div
            className="
              absolute
              -bottom-5
              -left-5
              hidden
              rounded-2xl
              bg-brand-ochre
              px-6
              py-5
              sm:block
            "
          >
            <p className="font-serif text-2xl font-semibold text-brand-black">
              Two Shades
            </p>

            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-brand-black/70">
              One friendship
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}