import SectionContainer from "../../common/SectionContainer";

const foodImages = [
  {
    src: "/images/food-gallery/food-01.jpg",
    alt: "Cafe Two Shades food selection",
  },
  {
    src: "/images/food-gallery/food-02.jpg",
    alt: "Cafe Two Shades dish",
  },
  {
    src: "/images/food-gallery/food-03.jpg",
    alt: "Cafe Two Shades dessert",
  },
  {
    src: "/images/food-gallery/food-04.jpg",
    alt: "Cafe Two Shades drink",
  },
  {
    src: "/images/food-gallery/food-05.jpg",
    alt: "Cafe Two Shades food",
  },
  {
    src: "/images/food-gallery/food-06.jpg",
    alt: "Cafe Two Shades dessert selection",
  },
];

export default function FoodGallery() {
  return (
    <SectionContainer className="bg-brand-beige/40">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-ochre">
          From Our Kitchen
        </p>

        <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Want to see what it looks like?
        </h2>

        <p className="mt-5 text-base leading-7 text-stone-600">
          A glimpse of some of the food, drinks, and sweet
          treats you can enjoy at Cafe Two Shades.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
        {foodImages.map((image) => (
          <div
            key={image.src}
            className="group overflow-hidden rounded-2xl"
          >
            <img
              src={image.src}
              alt={image.alt}
              width="800"
              height="800"
              loading="lazy"
              className="
                aspect-square
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}