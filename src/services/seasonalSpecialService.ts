import { supabase } from "../lib/supabase";

export type Season =
  | "spring"
  | "summer"
  | "autumn"
  | "winter";

export interface SeasonalSpecial {
  id: string;
  name: string;
  description: string;
  image_path: string | null;
  season: Season;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}


/* ============================================================
   PUBLIC
   ============================================================ */

export async function getActiveSeasonalSpecial() {
  const {
    data,
    error,
  } = await supabase
    .from("seasonal_specials")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(
      "Unable to load the seasonal special."
    );
  }

  return data as SeasonalSpecial | null;
}


/* ============================================================
   ADMIN
   ============================================================ */

export async function getSeasonalSpecials() {
  const {
    data,
    error,
  } = await supabase
    .from("seasonal_specials")
    .select("*")
    .order("season")
    .order("display_order");

  if (error) {
    throw new Error(
      "Unable to load seasonal specials."
    );
  }

  return (
    data as SeasonalSpecial[]
  ) ?? [];
}


export async function createSeasonalSpecial(
  data: {
    name: string;
    description: string;
    season: Season;
    image_path?: string | null;
    display_order?: number;
  }
) {
  const {
    error,
  } = await supabase
    .from("seasonal_specials")
    .insert({
      name:
        data.name.trim(),

      description:
        data.description.trim(),

      season:
        data.season,

      image_path:
        data.image_path ??
        null,

      display_order:
        data.display_order ??
        0,

      is_active:
        false,
    });

  if (error) {
    throw new Error(
      "Unable to create the seasonal special."
    );
  }
}


export async function updateSeasonalSpecial(
  id: string,
  updates: Partial<
    Pick<
      SeasonalSpecial,
      | "name"
      | "description"
      | "season"
      | "image_path"
      | "display_order"
    >
  >
) {
  const {
    error,
  } = await supabase
    .from("seasonal_specials")
    .update({
      ...updates,
      name:
        updates.name?.trim(),
      description:
        updates.description?.trim(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      "Unable to update the seasonal special."
    );
  }
}


export async function activateSeasonalSpecial(
  id: string
) {
  /*
   * The database has a unique partial index
   * allowing only one active special.
   *
   * Deactivate the current special first,
   * then activate the requested one.
   */

  const {
    error:
      deactivateError,
  } = await supabase
    .from("seasonal_specials")
    .update({
      is_active:
        false,
    })
    .eq("is_active", true);

  if (deactivateError) {
    throw new Error(
      "Unable to deactivate the current seasonal special."
    );
  }

  const {
    error:
      activateError,
  } = await supabase
    .from("seasonal_specials")
    .update({
      is_active:
        true,
    })
    .eq("id", id);

  if (activateError) {
    throw new Error(
      "Unable to activate the seasonal special."
    );
  }
}


export async function deactivateSeasonalSpecial(
  id: string
) {
  const {
    error,
  } = await supabase
    .from("seasonal_specials")
    .update({
      is_active:
        false,
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      "Unable to deactivate the seasonal special."
    );
  }
}


export async function deleteSeasonalSpecial(
  id: string
) {
  const {
    data,
    error:
      fetchError,
  } = await supabase
    .from("seasonal_specials")
    .select("image_path")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(
      "Unable to find the seasonal special."
    );
  }

  const {
    error:
      deleteError,
  } = await supabase
    .from("seasonal_specials")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(
      "Unable to delete the seasonal special."
    );
  }

  if (data?.image_path) {
    await supabase.storage
      .from("seasonal-specials")
      .remove([
        data.image_path,
      ]);
  }
}


/* ============================================================
   IMAGE
   ============================================================ */

export async function uploadSeasonalSpecialImage(
  file: File
) {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "jpg";

  const path =
    `${crypto.randomUUID()}.${extension}`;

  const {
    error,
  } = await supabase.storage
    .from("seasonal-specials")
    .upload(
      path,
      file,
      {
        cacheControl:
          "31536000",
        upsert:
          false,
        contentType:
          file.type,
      }
    );

  if (error) {
    throw new Error(
      "Unable to upload the image."
    );
  }

  return path;
}


export function getSeasonalSpecialImageUrl(
  path: string | null
) {
  if (!path) {
    return null;
  }

  const {
    data,
  } = supabase.storage
    .from("seasonal-specials")
    .getPublicUrl(path);

  return data.publicUrl;
}