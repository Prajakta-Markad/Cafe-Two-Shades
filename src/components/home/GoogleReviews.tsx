import { useEffect, useState } from "react";
import {
  getPublicGoogleReviews,
  type GoogleReview,
} from "../../services/googleReviewsService";

export default function GoogleReviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getPublicGoogleReviews()
      .then((data) => {
        if (mounted) {
          setReviews(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setReviews([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="reviews-heading"
      className="bg-[#f8f5ef] px-5 py-16 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#8a6a22]">
            From our guests
          </p>

          <h2
            id="reviews-heading"
            className="mt-3 font-serif text-3xl text-[#171512] sm:text-4xl"
          >
            What our customers say
          </h2>

          <p className="mt-4 text-sm leading-6 text-[#6b645b]">
            A few words from our guests on Google.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-[#e4ddd2] bg-white p-6"
            >
              <div
                aria-label={`${review.rating} out of 5 stars`}
                className="flex gap-1 text-[#8a6a22]"
              >
                {Array.from(
                  { length: 5 },
                  (_, index) => (
                    <span key={index}>
                      {index < review.rating
                        ? "★"
                        : "☆"}
                    </span>
                  )
                )}
              </div>

              <blockquote className="mt-4 text-sm leading-7 text-[#3f3a34]">
                “{review.review_text}”
              </blockquote>

              <footer className="mt-5 text-xs text-[#7a736a]">
                — {review.reviewer_name}, via{" "}
                {review.source}
              </footer>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-[#7a736a]">
            Reviews shown with permission from the
            cafe's Google listing.
          </p>
        </div>
      </div>
    </section>
  );
}