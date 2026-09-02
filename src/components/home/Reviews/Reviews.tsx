interface ReviewCardProps {
    name: string;
    rating: number;
    text: string;
  }
  
  export default function ReviewCard({
    name,
    rating,
    text,
  }: ReviewCardProps) {
    return (
      <article className="flex h-full flex-col rounded-2xl border border-brand-border bg-brand-ivory p-7">
        <div
          className="flex gap-1"
          aria-label={`${rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={
                index < rating
                  ? "text-brand-ochre"
                  : "text-stone-300"
              }
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>
  
        <blockquote className="mt-5 flex-1 text-sm leading-7 text-stone-600">
          “{text}Genuinely the best food I’ve had in Colchester so far. The Indian street food was so authentic and tasty. Very reasonably priced as well - amazing value for money! The staff were so friendly, and the ambience was so cozy and cute. I’ll definitely be coming back to try the huge variety of things they have on their menu. I’d definitely recommend!”
        </blockquote>
  
        <p className="mt-6 text-sm font-semibold text-brand-black">
          — {name}Muskaan Jonathan, via Google Reviews
        </p>
      </article>
    );
  }