import { useState } from "react";

const foodGalleryImages = [
  "/images/food-gallery/food-01.jpg",
  "/images/food-gallery/food-02.jpg",
  "/images/food-gallery/food-03.jpg",
  "/images/food-gallery/food-04.jpg",
  "/images/food-gallery/food-05.jpg",
  "/images/food-gallery/food-06.jpg",
  "/images/food-gallery/food-07.jpg",
];

export default function FoodGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  const previous = () => {
    setActiveIndex((current) =>
      current === 0 ? foodGalleryImages.length - 1 : current - 1,
    );
  };

  const next = () => {
    setActiveIndex((current) =>
      current === foodGalleryImages.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <section
      id="food-gallery"
      className="bg-[#171512] px-4 py-16 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-[#d7ad36]">
            Food & Kitchen Gallery
          </p>

          <h2 className="text-3xl font-semibold sm:text-4xl">
            Want to see what the items look like?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Take a look at some of the food prepared at Cafe Two Shades.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl">
          <img
            src={foodGalleryImages[activeIndex]}
            alt="Food prepared at Cafe Two Shades"
            className="h-[280px] w-full object-contain sm:h-[420px] lg:h-[520px]"
            loading="lazy"
          />

          <button
            type="button"
            onClick={previous}
            aria-label="Previous food photograph"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-white transition hover:bg-black/80"
          >
            ←
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next food photograph"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-white transition hover:bg-black/80"
          >
            →
          </button>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {foodGalleryImages.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View food photograph ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex
                  ? "bg-[#d7ad36]"
                  : "bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}