import { orderPlatforms } from "../config/orderLinks";

export default function Orders() {
  return (
    <main className="bg-[#faf8f4] text-[#171512]">
      {/* Hero */}
      <section className="px-6 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#8a6a22]">
            Order online
          </p>

          <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Your favourites,
            <br />
            delivered.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#5c554b] sm:text-lg">
            Looking to enjoy Cafe Two Shades from
            home? You can order directly through
            your preferred delivery platform.
          </p>
        </div>
      </section>

      {/* Ordering platforms */}
      <section
        className="px-6 pb-20 sm:px-8 lg:px-12"
        aria-labelledby="order-platforms-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="order-platforms-heading"
            className="sr-only"
          >
            Online ordering platforms
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {orderPlatforms.map(
              (platform) => (
                <article
                  key={platform.name}
                  className="flex flex-col rounded-2xl border border-[#e1d9cc] bg-white p-7 shadow-sm"
                >
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl text-[#171512]">
                      {platform.name}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#6b645b]">
                      {platform.description}
                    </p>
                  </div>

                  <a
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center justify-center rounded-lg bg-[#171512] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#302b25] focus:outline-none focus:ring-2 focus:ring-[#8a6a22] focus:ring-offset-2"
                  >
                    Order on{" "}
                    {platform.name}
                    <span
                      aria-hidden="true"
                      className="ml-2"
                    >
                      ↗
                    </span>
                  </a>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* Important ordering note */}
      <section className="border-y border-[#e1d9cc] bg-[#f1eadf] px-6 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-2xl text-[#171512] sm:text-3xl">
            Ordering through the café?
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#625b52] sm:text-base">
            Online orders are handled securely by
            the delivery platforms above. Cafe Two
            Shades does not take or process online
            food orders directly through this
            website.
          </p>
        </div>
      </section>
    </main>
  );
}