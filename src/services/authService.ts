import { supabase } from "../lib/supabase";

export async function signInAdmin(
  email: string,
  password: string
) {
  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(
      "Invalid email or password."
    );
  }

  if (!data.user) {
    throw new Error(
      "Unable to sign in."
    );
  }

  const {
    data: admin,
    error: adminError,
  } =
    await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

  if (
    adminError ||
    !admin
  ) {
    await supabase.auth.signOut();

    throw new Error(
      "You do not have administrator access."
    );
  }

  return data.user;
}


export async function signOutAdmin() {
  const {
    error,
  } = await supabase.auth.signOut();

  if (error) {
    throw new Error(
      "Unable to sign out."
    );
  }
}


export async function getCurrentAdmin() {
  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const {
    data: admin,
  } =
    await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (!admin) {
    return null;
  }

  return user;
}