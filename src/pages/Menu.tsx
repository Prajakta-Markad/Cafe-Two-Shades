import { useEffect, useMemo, useState } from "react";
import FoodGallery from "../components/home/FoodGallery";
import SectionContainer from "../components/common/SectionContainer";
import {
  getPublicMenu,
  type MenuCategory,
  type MenuItem,
  type MenuItemPrice,
  type MenuNote,
} from "../services/menuService";

export default function Menu() {
  const [categories, setCategories] = useState<MenuCategory[]>(
    []
  );

  const [items, setItems] = useState<MenuItem[]>([]);
  const [prices, setPrices] = useState<MenuItemPrice[]>([]);
  const [notes, setNotes] = useState<MenuNote[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadMenu() {
      try {
        setLoading(true);
        setError(false);

        const menu = await getPublicMenu();

        if (!mounted) {
          return;
        }

        setCategories(menu.categories);
        setItems(menu.items);
        setPrices(menu.prices);
        setNotes(menu.notes);
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

    void loadMenu();

    return () => {
      mounted = false;
    };
  }, []);

  const itemsByCategory = useMemo(() => {
    const grouped = new Map<string, MenuItem[]>();

    for (const item of items) {
      const existing = grouped.get(item.category_id) ?? [];
      existing.push(item);
      grouped.set(item.category_id, existing);
    }

    return grouped;
  }, [items]);

  const pricesByItem = useMemo(() => {
    const grouped = new Map<string, MenuItemPrice[]>();

    for (const price of prices) {
      const existing = grouped.get(price.item_id) ?? [];
      existing.push(price);
      grouped.set(price.item_id, existing);
    }

    return grouped;
  }, [prices]);

  const categoryNotes = useMemo(() => {
    const grouped = new Map<string, MenuNote[]>();

    for (const note of notes) {
      if (!note.category_id || note.item_id) {
        continue;
      }

      const existing = grouped.get(note.category_id) ?? [];
      existing.push(note);
      grouped.set(note.category_id, existing);
    }

    return grouped;
  }, [notes]);

  const itemNotes = useMemo(() => {
    const grouped = new Map<string, MenuNote[]>();

    for (const note of notes) {
      if (!note.item_id) {
        continue;
      }

      const existing = grouped.get(note.item_id) ?? [];
      existing.push(note);
      grouped.set(note.item_id, existing);
    }

    return grouped;
  }, [notes]);

  return (
    <>
      <section className="bg-brand-black px-6 py-20 text-center text-white sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-ochre">
          Cafe Two Shades
        </p>

        <h1 className="mt-3 font-serif text-5xl font-semibold sm:text-6xl">
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
            className="py-20 text-center"
            role="alert"
          >
            <h2 className="font-serif text-2xl font-semibold">
              We couldn't load the menu
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">
              Please refresh the page or try again shortly.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          categories.length > 0 && (
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
                      href={`#menu-category-${category.id}`}
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
                        focus:outline-none
                        focus:ring-2
                        focus:ring-brand-ochre
                      "
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              </nav>

              <div className="mt-14 space-y-20">
                {categories.map((category) => {
                  const categoryItems =
                    itemsByCategory.get(category.id) ?? [];

                  const categoryLevelNotes =
                    categoryNotes.get(category.id) ?? [];

                  return (
                    <section
                      key={category.id}
                      id={`menu-category-${category.id}`}
                      className="scroll-mt-36"
                    >
                      <div className="mb-8 border-b border-brand-border pb-5">
                        <h2 className="font-serif text-3xl font-semibold text-brand-black sm:text-4xl">
                          {category.name}
                        </h2>

                        {category.description && (
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-500">
                            {category.description}
                          </p>
                        )}

                        {categoryLevelNotes.length > 0 && (
                          <div className="mt-4 space-y-1">
                            {categoryLevelNotes.map((note) => (
                              <p
                                key={note.id}
                                className="text-sm font-medium text-brand-ochre"
                              >
                                {note.note}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      {categoryItems.length > 0 ? (
                        <div className="divide-y divide-brand-border/70">
                          {categoryItems.map((item) => {
                            const itemPrices =
                              pricesByItem.get(item.id) ?? [];

                            const itemLevelNotes =
                              itemNotes.get(item.id) ?? [];

                            return (
                              <article
                                key={item.id}
                                className="py-6 first:pt-0 last:pb-0"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                                  <div className="min-w-0">
                                    <h3 className="text-lg font-semibold text-brand-black">
                                      {item.name}
                                    </h3>

                                    {item.description && (
                                      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
                                        {item.description}
                                      </p>
                                    )}

                                    {itemLevelNotes.length > 0 && (
                                      <div className="mt-3 space-y-1">
                                        {itemLevelNotes.map(
                                          (note) => (
                                            <p
                                              key={note.id}
                                              className="text-xs font-medium text-brand-ochre"
                                            >
                                              {note.note}
                                            </p>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {itemPrices.length > 0 && (
                                    <div className="shrink-0 sm:min-w-[130px]">
                                      <div className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
                                        {itemPrices.map(
                                          (price) => (
                                            <div
                                              key={price.id}
                                              className="text-right"
                                            >
                                              {price.label && (
                                                <span className="block text-xs text-stone-500">
                                                  {price.label}
                                                </span>
                                              )}

                                              <span className="text-base font-semibold text-brand-black">
                                                £
                                                {price.price.toFixed(
                                                  2
                                                )}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-stone-500">
                          No items are currently listed in this
                          category.
                        </p>
                      )}
                    </section>
                  );
                })}
              </div>
            </>
          )}

        {!loading &&
          !error &&
          categories.length === 0 && (
            <div className="py-20 text-center">
              <h2 className="font-serif text-2xl font-semibold">
                Our menu is being updated
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">
                Please check back shortly.
              </p>
            </div>
          )}
      </SectionContainer>

      <FoodGallery />
    </>
  );
}