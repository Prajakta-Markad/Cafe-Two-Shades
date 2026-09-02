import { Heart, Sparkles, Users } from "lucide-react";

import SectionContainer from "../../common/SectionContainer";

const values = [
  {
    icon: Heart,
    title: "Made with Warmth",
    description:
      "A welcoming space where good food and genuine hospitality come first.",
  },
  {
    icon: Sparkles,
    title: "Two Traditions",
    description:
      "Indian and British influences meet naturally across our food and drinks.",
  },
  {
    icon: Users,
    title: "Made for People",
    description:
      "A café built around friendship, conversation, and sharing good moments.",
  },
];

export default function WhyTwoShades() {
  return (
    <SectionContainer className="bg-brand-beige/40">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-ochre">
          Why Two Shades?
        </p>

        <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
          More than just a café
        </h2>

        <p className="mt-5 text-base leading-7 text-stone-600">
          Two Shades represents the friendship behind the café:
          different backgrounds coming together to create
          something shared.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {values.map((value) => {
          const Icon = value.icon;

          return (
            <article
              key={value.title}
              className="
                rounded-2xl
                border
                border-brand-border
                bg-brand-ivory
                p-7
                text-center
              "
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-ochre/20">
                <Icon
                  size={22}
                  className="text-brand-brown"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-5 text-2xl font-semibold">
                {value.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                {value.description}
              </p>
            </article>
          );
        })}
      </div>
    </SectionContainer>
  );
}