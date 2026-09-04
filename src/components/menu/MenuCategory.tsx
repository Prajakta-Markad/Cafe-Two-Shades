import type { MenuCategory as MenuCategoryType } from "../../services/menuService";
import MenuItem from "./MenuItem";

interface MenuCategoryProps {
  category: MenuCategoryType;
}

export default function MenuCategory({
  category,
}: MenuCategoryProps) {
  const availableItems = category.items.filter(
    (item) => item.available
  );

  return (
    <section
      id={category.id}
      aria-labelledby={`${category.id}-heading`}
      className="scroll-mt-32"
    >
      <div className="mb-6 flex items-center gap-4">
        <h2
          id={`${category.id}-heading`}
          className="font-serif text-3xl font-semibold sm:text-4xl"
        >
          {category.name}
        </h2>

        <div
          className="h-px flex-1 bg-brand-border"
          aria-hidden="true"
        />
      </div>

      {category.note && (
        <p className="mb-5 max-w-3xl text-sm italic leading-6 text-stone-500">
          {category.note}
        </p>
      )}

      {availableItems.length > 0 ? (
        <div className="divide-y divide-brand-border">
          {availableItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-stone-400">
          Items currently unavailable.
        </p>
      )}
    </section>
  );
}