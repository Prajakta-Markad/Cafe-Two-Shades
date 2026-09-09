import { supabase } from "../lib/supabase";

export interface GoogleReview {
  id: string;
  reviewer_name: string;
  review_text: string;
  rating: number;
  source: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}


/* ============================================================
   PUBLIC
   ============================================================ */

export async function getPublicGoogleReviews() {
  const {
    data,
    error,
  } = await supabase
    .from("google_reviews")
    .select(
      "id, reviewer_name, review_text, rating, source"
    )
    .eq("is_visible", true)
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      "Unable to load reviews."
    );
  }

  return data ?? [];
}


/* ============================================================
   ADMIN
   ============================================================ */

export async function getGoogleReviewsForAdmin() {
  const {
    data,
    error,
  } = await supabase
    .from("google_reviews")
    .select("*")
    .order(
      "display_order"
    );

  if (error) {
    throw new Error(
      "Unable to load reviews."
    );
  }

  return (
    data as GoogleReview[]
  ) ?? [];
}


export async function createGoogleReview(
  review: {
    reviewer_name: string;
    review_text: string;
    rating: number;
    display_order: number;
  }
) {
  const {
    error,
  } = await supabase
    .from("google_reviews")
    .insert({
      reviewer_name:
        review.reviewer_name.trim(),

      review_text:
        review.review_text.trim(),

      rating:
        review.rating,

      display_order:
        review.display_order,

      source:
        "Google Reviews",
    });

  if (error) {
    throw new Error(
      "Unable to create the review."
    );
  }
}


export async function updateGoogleReview(
  id: string,
  updates: Partial<
    Pick<
      GoogleReview,
      | "reviewer_name"
      | "review_text"
      | "rating"
      | "display_order"
      | "is_visible"
    >
  >
) {
  const {
    error,
  } = await supabase
    .from("google_reviews")
    .update({
      ...updates,

      reviewer_name:
        updates.reviewer_name?.trim(),

      review_text:
        updates.review_text?.trim(),
    })
    .eq(
      "id",
      id
    );

  if (error) {
    throw new Error(
      "Unable to update the review."
    );
  }
}


export async function deleteGoogleReview(
  id: string
) {
  const {
    error,
  } = await supabase
    .from("google_reviews")
    .delete()
    .eq(
      "id",
      id
    );

  if (error) {
    throw new Error(
      "Unable to delete the review."
    );
  }
}