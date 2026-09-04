import { useEffect, useState } from "react";

import MenuCategory from "../components/menu/MenuCategory";
import FoodGallery from "../components/menu/FoodGallery";
import SectionContainer from "../components/common/SectionContainer";
import {
  getPublicMenu,
  type MenuCategory as MenuCategoryType,
} from "../services/menuService";

export default function Menu() {
  const [categories, setCategories] = useState<
    MenuCategoryType[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadMenu() {
      try {
        const menu = await getPublicMenu();

        if (mounted) {
          setCategories(menu);
        }
      } catch {
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      mounted = false;
    };
  }, []);

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
        {loading && (
          <div
            className="py-20 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-stone-500">
              Loading our menu...
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            className="rounded-2xl border border-brand-border bg-brand-beige/40 px-6 py-12 text-center"
            role="alert"
          >
            <h2 className="font-serif text-2xl font-semibold">
              Our menu is temporarily unavailable
            </h2>

            <p className="mt-3 text-sm leading-6 text-stone-500">
              Please check back shortly or contact the café
              directly.
            </p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-stone-500">
              Our menu is currently being updated.
            </p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <>
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
                {categories.map((category) => (
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

            <div className="mt-14 space-y-16">
              {categories.map((category) => (
                <MenuCategory
                  key={category.id}
                  category={category}
                />
              ))}
            </div>
          </>
        )}
      </SectionContainer>

      <FoodGallery />
    </>
  );
}