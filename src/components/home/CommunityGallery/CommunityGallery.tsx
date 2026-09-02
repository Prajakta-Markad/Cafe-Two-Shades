import SectionContainer from "../../common/SectionContainer";
import PhotoCard from "./PhotoCard";

const photos = [
  {
    src: "/images/placeholders/customer-photo-01.jpg",
    alt: "Customer photo at Cafe Two Shades",
  },
  {
    src: "/images/placeholders/customer-photo-02.jpg",
    alt: "Customer photo at Cafe Two Shades",
  },
  {
    src: "/images/placeholders/customer-photo-03.jpg",
    alt: "Customer photo at Cafe Two Shades",
  },
  {
    src: "/images/placeholders/customer-photo-04.jpg",
    alt: "Customer photo at Cafe Two Shades",
  },
];

export default function CommunityGallery() {
  return (
    <SectionContainer className="bg-brand-beige/40">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-ochre">
          From Our Guests
        </p>

        <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Two Shades Through Your Lens
        </h2>

        <p className="mt-5 text-base leading-7 text-stone-600">
          Moments shared by the people who make Cafe Two Shades
          what it is.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {photos.map((photo) => (
          <PhotoCard key={photo.src} {...photo} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-stone-500">
          Have a photo you'd like to share?
        </p>

        <button
          type="button"
          disabled
          className="
            mt-3
            rounded-xl
            border
            border-brand-border
            px-5
            py-3
            text-sm
            font-semibold
            text-stone-400
          "
        >
          Share Your Photo
        </button>
      </div>
    </SectionContainer>
  );
}

/* so from here: <div className="mt-10 text-center">
        <p className="text-sm text-stone-500">
          Have a photo you'd like to share?
 to the end of the div right after button I have to delete later */