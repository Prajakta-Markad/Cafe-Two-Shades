import type { MenuItem as MenuItemType } from "../../services/menuService";

interface MenuItemProps {
  item: MenuItemType;
}

export default function MenuItem({
  item,
}: MenuItemProps) {
  return (
    <article className="py-5">
      <div className="flex items-start justify-between gap-6">
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
      </div>

      {item.prices.length > 0 && (
        <div className="mt-3 ml-0 space-y-1 sm:ml-4">
          {item.prices.map((price) => (
            <div
              key={price.id}
              className="flex max-w-sm items-center justify-between gap-6 text-sm"
            >
              <span className="text-stone-500">
                {price.label}
              </span>

              <span className="font-medium text-brand-black">
                £{price.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}