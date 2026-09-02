import MenuCategory from "../components/menu/MenuCategory";
import SectionContainer from "../components/common/SectionContainer";
import { menuCategories } from "../data/menu";
import FoodGallery from "../components/menu/FoodGallery";

export default function Menu() {
  return (
    <>
      <section className="bg-brand-black px-6 py-20 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-ochre">
          Cafe Two Shades
        </p>

        <h1 className="mt-3 text-5xl font-semibold sm:text-6xl">
          Our Menu
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-300">
          A little bit of both worlds, brought together at
          the table.
        </p>
      </section>

      <SectionContainer>
      <nav
        aria-label="Menu categories"
        className="
          sticky
          top-20
          z-30
          -mx-6
          overflow-x-auto
          border-y
          border-brand-border
          bg-brand-ivory/95
          px-6
          py-4
          backdrop-blur-md
          sm:-mx-8
          sm:px-8
          lg:-mx-10
          lg:px-10
        "
        >
        <div className="mx-auto flex min-w-max gap-3">
          {menuCategories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="
                rounded-full
                border
                border-brand-border
                px-4
                py-2
                text-sm
                font-medium
                text-stone-600
                transition-colors
                hover:border-brand-ochre
                hover:text-brand-ochre
              "
            >
              {category.name}
            </a>
          ))}
        </div>
      </nav>

        <div className="space-y-16">
          {menuCategories.map((category) => (
            <MenuCategory
              key={category.id}
              category={category}
            />
          ))}
        </div>

      </SectionContainer>

      <FoodGallery />
    </>

  );
}