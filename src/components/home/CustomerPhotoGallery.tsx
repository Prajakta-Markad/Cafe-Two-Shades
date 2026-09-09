import { useEffect, useState } from "react";

import {
  getApprovedCustomerPhotos,
  getCustomerPhotoUrl,
} from "../../services/customerPhotoService";

interface GalleryPhoto {
  id: string;
  image_path: string;
}

export default function CustomerPhotoGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
useEffect(() => {
    let mounted = true;
    getApprovedCustomerPhotos()
      .then((data) => {
        if (mounted) { setPhotos(data); }
      })
      .catch(() => {
        if (mounted) {
          setPhotos([]);
        }
      })
      .finally(() => {
        if (mounted) { setLoading(false); }
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => { if (photos.length <= 1) { return; }

    const interval = window.setInterval(() => {
      setActiveIndex((current) =>
        current === photos.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => { window.clearInterval(interval); };
  }, [photos.length]);

  if (loading || photos.length === 0) { return null; }

  const activePhoto = photos[activeIndex];

  return (
    <section
      aria-labelledby="gallery-heading"
      className="bg-[#171512] px-5 py-16 text-white sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#d3b66c]">
            From our guests
          </p>

          <h2
            id="gallery-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl"
          >
            Two Shades Through Your Lens
          </h2>

          <p className="mt-4 text-sm leading-6 text-[#d5d0c8]">
            Moments shared by customers who have
            visited Cafe Two Shades.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={getCustomerPhotoUrl(
                activePhoto.image_path
              )}
              alt="Customer-submitted moment at Cafe Two Shades"
              className="aspect-[16/10] w-full object-cover"
              loading={
                activeIndex === 0
                  ? "eager"
                  : "lazy"
              }
            />

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous customer photo"
                  onClick={() =>
                    setActiveIndex(
                      (current) =>
                        current === 0
                          ? photos.length - 1
                          : current - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-lg backdrop-blur-sm transition hover:bg-black/80"
                >
                  ‹
                </button>

                <button
                  type="button"
                  aria-label="Next customer photo"
                  onClick={() =>
                    setActiveIndex(
                      (current) =>
                        current === photos.length - 1
                          ? 0
                          : current + 1
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-lg backdrop-blur-sm transition hover:bg-black/80"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div
              className="mt-5 flex justify-center gap-2"
              aria-label="Customer photo navigation"
            >
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  aria-label={`Show customer photo ${index + 1}`}
                  aria-current={
                    index === activeIndex
                  }
                  onClick={() =>
                    setActiveIndex(index)
                  }
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-6 bg-[#d3b66c]"
                      : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}