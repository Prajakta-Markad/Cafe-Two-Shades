import {
    Clock3,
    Mail,
    MapPin,
    Phone,
  } from "lucide-react";
  
  import SectionContainer from "../../common/SectionContainer";
  
  const openingHours = [
    { day: "Monday", hours: "Closed" },
    { day: "Tuesday", hours: "9:00 AM – 6:00 PM" },
    { day: "Wednesday", hours: "9:00 AM – 6:00 PM" },
    { day: "Thursday", hours: "9:00 AM – 6:00 PM" },
    { day: "Friday", hours: "9:00 AM – 7:00 PM" },
    { day: "Saturday", hours: "9:00 AM – 7:00 PM" },
    { day: "Sunday", hours: "10:00 AM – 5:00 PM" },
  ];
  
  export default function VisitUs() {
    return (
      <SectionContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-ochre">
            Find Us
          </p>
  
          <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
            Come and see us
          </h2>
  
          <p className="mt-5 text-base leading-7 text-stone-600">
            Good food, good company, and a table waiting for you.
          </p>
        </div>
  
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Map */}
          <div className="min-h-[380px] overflow-hidden rounded-2xl border border-brand-border bg-brand-beige">
            <iframe
              title="Cafe Two Shades location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2462.5212864951927!2d0.8993384765772426!3d51.88795038283205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d9053377dcf1a7%3A0xde7ff8c9d85d92e0!2sCafe%20Two%20Shades%20%23%20Authentic%20Indian%20Street%20Food!5e0!3m2!1sen!2suk!4v1787947203776!5m2!1sen!2suk"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[380px] w-full border-0"
            />
          </div>
  
          {/* Details */}
          <div className="rounded-2xl border border-brand-border bg-brand-beige/40 p-7 sm:p-9">
            <div className="space-y-7">
              <div className="flex gap-4">
                <MapPin
                  className="mt-1 shrink-0 text-brand-ochre"
                  size={22}
                  aria-hidden="true"
                />
  
                <div>
                  <h3 className="font-serif text-2xl font-semibold">
                    Address
                  </h3>
  
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Cafe Two Shades
                    <br />
                    23 Eld Ln, Colchester CO1 1LS
                  </p>
                </div>
              </div>
  
              <div className="flex gap-4">
                <Phone
                  className="mt-1 shrink-0 text-brand-ochre"
                  size={22}
                  aria-hidden="true"
                />
  
                <div>
                  <h3 className="font-serif text-2xl font-semibold">
                    Contact
                  </h3>
  
                  <a
                    href="tel:"
                    className="mt-2 block text-sm text-stone-600 transition-colors hover:text-brand-ochre"
                  >
                    01206 768165
                  </a>
  
                  <a
                    href="mailto:"
                    className="mt-1 block text-sm text-stone-600 transition-colors hover:text-brand-ochre"
                  >
                    twoshadescol@gmail.com
                  </a>
                </div>
              </div>
  
              <div className="flex gap-4">
                <Clock3
                  className="mt-1 shrink-0 text-brand-ochre"
                  size={22}
                  aria-hidden="true"
                />
  
                <div className="w-full">
                  <h3 className="font-serif text-2xl font-semibold">
                    Opening Hours
                  </h3>
  
                  <div className="mt-4 space-y-2">
                    {openingHours.map((entry) => (
                      <div
                        key={entry.day}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <span className="text-stone-600">
                          {entry.day}
                        </span>
  
                        <span
                          className={
                            entry.hours === "Closed"
                              ? "font-medium text-stone-400"
                              : "font-medium text-brand-black"
                          }
                        >
                          {entry.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Service timings */}
        <div className="mt-8 rounded-2xl border border-brand-border bg-brand-black p-7 text-white sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-ochre">
                Please Note
              </p>
  
              <h3 className="mt-2 font-serif text-2xl font-semibold">
                Menu & service timings
              </h3>
            </div>
  
            <div className="text-sm leading-7 text-stone-300 sm:text-right">
              <p>
                Cafe hours: <span className="text-white">9:00 to 21:30</span>
              </p>
              <p>
                Brunch: <span className="text-white">9:30 to 17:00</span>
              </p>
              <p>
                Drinks & desserts:{" "}
                <span className="text-white">9:30 to 21:30</span>
              </p>
            </div>
          </div>
        </div>
      </SectionContainer>
    );
  }