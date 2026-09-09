import { useEffect, useState } from "react";
import {
  getActiveSeasonalSpecial,
  getSeasonalSpecialImageUrl,
  type SeasonalSpecial as SeasonalSpecialData,
} from "../../services/seasonalSpecialService";

export default function SeasonalSpecial() {
  const [special, setSpecial] =
    useState<SeasonalSpecialData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSpecial() {
      try {
        const data =
          await getActiveSeasonalSpecial();

        if (mounted) {
          setSpecial(data);
        }
      } catch {
        if (mounted) {
          setSpecial(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadSpecial();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !special) {
    return null;
  }

  const imageUrl =
    getSeasonalSpecialImageUrl(
      special.image_path
    );

  return (
    <section
      aria-labelledby="seasonal-special-heading"
      className="bg-[#f8f5ef] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#8c6a19]">
            Seasonal Special
          </p>

          <h2
            id="seasonal-special-heading"
            className="font-serif text-3xl font-semibold text-[#171512] sm:text-4xl"
          >
            A little something special
          </h2>
        </div>

        <div className="grid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#ddd6ca] md:grid-cols-2">
          {imageUrl && (
            <div className="min-h-[280px] md:min-h-[420px]">
              <img
                src={imageUrl}
                alt={special.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex items-center p-7 sm:p-10 lg:p-14">
            <div>
              <span className="inline-flex rounded-full bg-[#f1e8cf] px-3 py-1 text-xs font-medium capitalize text-[#705512]">
                {special.season}
              </span>

              <h3 className="mt-4 font-serif text-2xl font-semibold text-[#171512] sm:text-3xl">
                {special.name}
              </h3>

              <div className="mt-5 h-px w-14 bg-[#c8a84e]" />

              <p className="mt-5 text-base leading-7 text-[#625e57]">
                {special.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}