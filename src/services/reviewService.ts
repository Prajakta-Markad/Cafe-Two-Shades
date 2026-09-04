import { supabase } from "../lib/supabase";

export interface Review {
  id: string;
  reviewer_name: string;
  review_text: string;
  rating: number;
  source: "Google Reviews";
  display_order: number;
}

export async function getPublishedReviews(): Promise<
  Review[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("reviews")
      .select(
        `
          id,
          reviewer_name,
          review_text,
          rating,
          source,
          display_order
        `
      )
      .eq(
        "is_published",
        true
      )
      .order(
        "display_order",
        {
          ascending: true,
        }
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (error) {
    throw new Error(
      "Unable to load reviews."
    );
  }

  return (
    data ?? []
  ) as Review[];
}