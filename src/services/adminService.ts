import { supabase } from "../lib/supabase";

export interface AdminProfile {
  user_id: string;
  display_name: string;
  is_active: boolean;
}

export async function getCurrentAdmin(): Promise<
  AdminProfile | null
> {
  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("admin_profiles")
    .select(
      `
        user_id,
        display_name,
        is_active
      `
    )
    .eq(
      "user_id",
      user.id
    )
    .eq(
      "is_active",
      true
    )
    .maybeSingle();

  if (
    error ||
    !data
  ) {
    return null;
  }

  return data as AdminProfile;
}


export async function signOutAdmin() {
  const {
    error,
  } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}