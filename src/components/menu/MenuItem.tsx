import type { MenuItem as MenuItemType } from "../../data/menu";

interface MenuItemProps {
  item: MenuItemType;
}

export default function MenuItem({ item }: MenuItemProps) {
  if (!item.available) {
    return null;
  }

  return (
    <article className="flex items-start justify-between gap-6 py-5">
      <div className="min-w-0">
        <h3 className="font-medium text-brand-black">
          {item.name}
        </h3>

        {item.description && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-500">
            {item.description}
          </p>
        )}
      </div>

      <span className="shrink-0 font-medium text-brand-black">
        £{item.price.toFixed(2)}
      </span>
    </article>
  );
}