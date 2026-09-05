import { supabase } from "../lib/supabase";

export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_visible: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_available: boolean;
}

export interface MenuItemPrice {
  id: string;
  item_id: string;
  label: string;
  price: number;
  display_order: number;
}

export interface MenuNote {
  id: string;
  category_id: string | null;
  item_id: string | null;
  note: string;
  display_order: number;
  is_visible: boolean;
}


/* ============================================================
   PUBLIC MENU
   ============================================================ */

export async function getPublicMenu() {
  const [
    categoriesResult,
    itemsResult,
    pricesResult,
    notesResult,
  ] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*")
      .eq("is_visible", true)
      .order("display_order"),

    supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("display_order"),

    supabase
      .from("menu_item_prices")
      .select("*")
      .order("display_order"),

    supabase
      .from("menu_notes")
      .select("*")
      .eq("is_visible", true)
      .order("display_order"),
  ]);

  if (
    categoriesResult.error ||
    itemsResult.error ||
    pricesResult.error ||
    notesResult.error
  ) {
    throw new Error(
      "Unable to load the menu."
    );
  }

  return {
    categories:
      (categoriesResult.data ??
        []) as MenuCategory[],

    items:
      (itemsResult.data ??
        []) as MenuItem[],

    prices:
      (pricesResult.data ??
        []) as MenuItemPrice[],

    notes:
      (notesResult.data ??
        []) as MenuNote[],
  };
}


/* ============================================================
   ADMIN MENU
   ============================================================ */

export async function getAdminMenu() {
  const [
    categoriesResult,
    itemsResult,
    pricesResult,
    notesResult,
  ] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*")
      .order("display_order"),

    supabase
      .from("menu_items")
      .select("*")
      .order("display_order"),

    supabase
      .from("menu_item_prices")
      .select("*")
      .order("display_order"),

    supabase
      .from("menu_notes")
      .select("*")
      .order("display_order"),
  ]);

  if (
    categoriesResult.error ||
    itemsResult.error ||
    pricesResult.error ||
    notesResult.error
  ) {
    throw new Error(
      "Unable to load menu management data."
    );
  }

  return {
    categories:
      (categoriesResult.data ??
        []) as MenuCategory[],

    items:
      (itemsResult.data ??
        []) as MenuItem[],

    prices:
      (pricesResult.data ??
        []) as MenuItemPrice[],

    notes:
      (notesResult.data ??
        []) as MenuNote[],
  };
}


/* ============================================================
   CATEGORY
   ============================================================ */

export async function createCategory(
  category: {
    name: string;
    description?: string;
    display_order: number;
  }
) {
  const {
    error,
  } =
    await supabase
      .from("menu_categories")
      .insert({
        name:
          category.name.trim(),

        description:
          category.description?.trim() ||
          null,

        display_order:
          category.display_order,
      });

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "A category with that name already exists."
        : "Unable to create the category."
    );
  }
}


export async function updateCategory(
  id: string,
  updates: Partial<
    Pick<
      MenuCategory,
      | "name"
      | "description"
      | "display_order"
      | "is_visible"
    >
  >
) {
  const {
    error,
  } =
    await supabase
      .from("menu_categories")
      .update({
        ...updates,
        name:
          updates.name?.trim(),
        description:
          updates.description?.trim() ||
          undefined,
      })
      .eq("id", id);

  if (error) {
    throw new Error(
      "Unable to update the category."
    );
  }
}


/* ============================================================
   ITEM
   ============================================================ */

export async function createMenuItem(
  item: {
    category_id: string;
    name: string;
    description?: string;
    display_order: number;
  }
) {
  const {
    error,
  } =
    await supabase
      .from("menu_items")
      .insert({
        category_id:
          item.category_id,

        name:
          item.name.trim(),

        description:
          item.description?.trim() ||
          null,

        display_order:
          item.display_order,
      });

  if (error) {
    throw new Error(
      "Unable to create the menu item."
    );
  }
}


export async function updateMenuItem(
  id: string,
  updates: Partial<
    Pick<
      MenuItem,
      | "category_id"
      | "name"
      | "description"
      | "display_order"
      | "is_available"
    >
  >
) {
  const {
    error,
  } =
    await supabase
      .from("menu_items")
      .update({
        ...updates,
        name:
          updates.name?.trim(),
        description:
          updates.description?.trim() ||
          undefined,
      })
      .eq("id", id);

  if (error) {
    throw new Error(
      "Unable to update the menu item."
    );
  }
}


/* ============================================================
   PRICE
   ============================================================ */

export async function createMenuPrice(
  price: {
    item_id: string;
    label: string;
    price: number;
    display_order: number;
  }
) {
  const {
    error,
  } =
    await supabase
      .from("menu_item_prices")
      .insert({
        item_id:
          price.item_id,

        label:
          price.label.trim(),

        price:
          price.price,

        display_order:
          price.display_order,
      });

  if (error) {
    throw new Error(
      "Unable to create the price."
    );
  }
}


export async function updateMenuPrice(
  id: string,
  updates: Partial<
    Pick<
      MenuItemPrice,
      | "label"
      | "price"
      | "display_order"
    >
  >
) {
  const {
    error,
  } =
    await supabase
      .from("menu_item_prices")
      .update({
        ...updates,
        label:
          updates.label?.trim(),
      })
      .eq("id", id);

  if (error) {
    throw new Error(
      "Unable to update the price."
    );
  }
}


export async function deleteMenuPrice(
  id: string
) {
  const {
    error,
  } =
    await supabase
      .from("menu_item_prices")
      .delete()
      .eq("id", id);

  if (error) {
    throw new Error(
      "Unable to delete the price."
    );
  }
}


/* ============================================================
   NOTES
   ============================================================ */

export async function createMenuNote(
  note: {
    category_id?: string;
    item_id?: string;
    note: string;
    display_order: number;
  }
) {
  const {
    error,
  } =
    await supabase
      .from("menu_notes")
      .insert({
        category_id:
          note.category_id ??
          null,

        item_id:
          note.item_id ??
          null,

        note:
          note.note.trim(),

        display_order:
          note.display_order,
      });

  if (error) {
    throw new Error(
      "Unable to create the menu note."
    );
  }
}


export async function updateMenuNote(
  id: string,
  updates: Partial<
    Pick<
      MenuNote,
      | "note"
      | "display_order"
      | "is_visible"
    >
  >
) {
  const {
    error,
  } =
    await supabase
      .from("menu_notes")
      .update({
        ...updates,
        note:
          updates.note?.trim(),
      })
      .eq("id", id);

  if (error) {
    throw new Error(
      "Unable to update the menu note."
    );
  }
}


export async function deleteMenuNote(
  id: string
) {
  const {
    error,
  } =
    await supabase
      .from("menu_notes")
      .delete()
      .eq("id", id);

  if (error) {
    throw new Error(
      "Unable to delete the menu note."
    );
  }
}