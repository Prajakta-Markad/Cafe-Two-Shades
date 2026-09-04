import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";

type CategoryRow =
  Database["public"]["Tables"]["menu_categories"]["Row"];

type ItemRow =
  Database["public"]["Tables"]["menu_items"]["Row"];

type PriceRow =
  Database["public"]["Tables"]["menu_item_prices"]["Row"];

export interface MenuPrice {
  id: string;
  label: string;
  price: number;
  displayOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  available: boolean;
  prices: MenuPrice[];
}

export interface MenuCategory {
  id: string;
  name: string;
  note: string | null;
  displayOrder: number;
  active: boolean;
  items: MenuItem[];
}

interface ItemWithPrices extends ItemRow {
  menu_item_prices: PriceRow[];
}

interface CategoryWithItems extends CategoryRow {
  menu_items: ItemWithPrices[];
}

export async function getPublicMenu(): Promise<MenuCategory[]> {
  const { data, error } = await supabase
    .from("menu_categories")
    .select(`
      id,
      name,
      note,
      display_order,
      active,
      menu_items (
        id,
        category_id,
        name,
        description,
        display_order,
        available,
        menu_item_prices (
          id,
          item_id,
          label,
          price,
          display_order
        )
      )
    `)
    .eq("active", true)
    .order("display_order");

  if (error) {
    throw new Error(
      `Unable to load menu: ${error.message}`
    );
  }

  return (data as CategoryWithItems[]).map((category) => ({
    id: category.id,
    name: category.name,
    note: category.note,
    displayOrder: category.display_order,
    active: category.active,

    items: category.menu_items
      .filter((item) => item.available)
      .sort(
        (a, b) =>
          a.display_order - b.display_order
      )
      .map((item) => ({
        id: item.id,
        categoryId: item.category_id,
        name: item.name,
        description: item.description,
        displayOrder: item.display_order,
        available: item.available,

        prices: item.menu_item_prices
          .sort(
            (a, b) =>
              a.display_order - b.display_order
          )
          .map((price) => ({
            id: price.id,
            label: price.label,
            price: Number(price.price),
            displayOrder: price.display_order,
          })),
      })),
  }));
}