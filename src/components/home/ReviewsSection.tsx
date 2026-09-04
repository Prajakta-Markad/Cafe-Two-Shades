import {
    useEffect,
    useState,
  } from "react";
  
  import {
    getPublishedReviews,
    type Review,
  } from "../../services/reviewService";
  
  export default function ReviewsSection() {
    const [
      reviews,
      setReviews,
    ] = useState<Review[]>([]);
  
    const [
      loading,
      setLoading,
    ] = useState(true);
  
    const [
      error,
      setError,
    ] = useState("");
  
    const [
      currentIndex,
      setCurrentIndex,
    ] = useState(0);
  
    useEffect(() => {
      let mounted = true;
  
      async function loadReviews() {
        try {
          const result =
            await getPublishedReviews();
  
          if (mounted) {
            setReviews(result);
          }
        } catch {
          if (mounted) {
            setError(
              "Reviews are temporarily unavailable."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
  
      loadReviews();
  
      return () => {
        mounted = false;
      };
    }, []);
  
    function previousReview() {
      setCurrentIndex(
        (current) =>
          current === 0
            ? reviews.length - 1
            : current - 1
      );
    }
  
    function nextReview() {
      setCurrentIndex(
        (current) =>
          current === reviews.length - 1
            ? 0
            : current + 1
      );
    }
  
    function renderStars(
      rating: number
    ) {
      return (
        <div
          className="flex gap-1"
          aria-label={`${rating} out of 5 stars`}
        >
          {Array.from(
            { length: 5 },
            (_, index) => (
              <span
                key={index}
                aria-hidden="true"
                className={
                  index < rating
                    ? "text-[#a87916]"
                    : "text-[#d8d0c4]"
                }
              >
                ★
              </span>
            )
          )}
        </div>
      );
    }
  
    if (
      !loading &&
      !error &&
      reviews.length === 0
    ) {
      return null;
    }
  
    return (
      <section
        id="reviews"
        className="bg-white px-6 py-20 sm:px-8 lg:px-12"
        aria-labelledby="reviews-heading"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#8a6a22]">
              What our customers say
            </p>
  
            <h2
              id="reviews-heading"
              className="font-serif text-3xl text-[#171512] sm:text-4xl"
            >
              Reviews
            </h2>
  
            <p className="mt-4 text-sm text-[#6b645b]">
              Shared by our customers via Google
              Reviews.
            </p>
          </div>
  
          {loading && (
            <div
              className="mx-auto mt-12 max-w-3xl rounded-2xl bg-[#f6f1e8] px-6 py-14 text-center"
              aria-live="polite"
            >
              <p className="text-sm text-[#6b645b]">
                Loading reviews...
              </p>
            </div>
          )}
  
          {error && (
            <div
              className="mx-auto mt-12 max-w-3xl rounded-2xl bg-[#f6f1e8] px-6 py-14 text-center"
              role="status"
            >
              <p className="text-sm text-[#6b645b]">
                {error}
              </p>
            </div>
          )}
  
          {!loading &&
            !error &&
            reviews.length > 0 && (
              <div className="mx-auto mt-12 max-w-3xl">
                <article className="rounded-2xl bg-[#f6f1e8] px-7 py-10 text-center shadow-sm sm:px-12">
                  <div className="flex justify-center">
                    {renderStars(
                      reviews[
                        currentIndex
                      ].rating
                    )}
                  </div>
  
                  <blockquote className="mt-6 font-serif text-xl leading-8 text-[#29251f] sm:text-2xl">
                    “
                    {
                      reviews[
                        currentIndex
                      ].review_text
                    }
                    ”
                  </blockquote>
  
                  <p className="mt-6 text-sm font-medium text-[#4e483f]">
                    —
                    {
                      reviews[
                        currentIndex
                      ].reviewer_name
                    }
                    , via Google Reviews
                  </p>
  
                  {reviews.length >
                    1 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={
                          previousReview
                        }
                        aria-label="Previous review"
                        className="rounded-full border border-[#cfc6b8] bg-white px-4 py-2 text-[#29251f] transition hover:bg-[#faf8f4] focus:outline-none focus:ring-2 focus:ring-[#8a6a22] focus:ring-offset-2"
                      >
                        ←
                      </button>
  
                      <span
                        className="min-w-16 text-sm text-[#6b645b]"
                        aria-live="polite"
                      >
                        {currentIndex +
                          1}{" "}
                        /{" "}
                        {
                          reviews.length
                        }
                      </span>
  
                      <button
                        type="button"
                        onClick={
                          nextReview
                        }
                        aria-label="Next review"
                        className="rounded-full border border-[#cfc6b8] bg-white px-4 py-2 text-[#29251f] transition hover:bg-[#faf8f4] focus:outline-none focus:ring-2 focus:ring-[#8a6a22] focus:ring-offset-2"
                      >
                        →
                      </button>
                    </div>
                  )}
                </article>
              </div>
            )}
        </div>
      </section>
    );
  }