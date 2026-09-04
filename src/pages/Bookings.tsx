import { FormEvent, useEffect, useMemo, useState,} from "react";
import { createBooking, getBookingSlots,type BookingSlot,} from "../services/bookingService";
  
  const MAX_PARTY_SIZE = 8;
  
  function getToday() {
    return new Date()
      .toLocaleDateString(
        "en-CA",
        {
          timeZone:
            "Europe/London",
        }
      );
  }
  
  function getMaximumDate() {
    const date = new Date();
  
    date.setMonth(
      date.getMonth() + 1
    );
  
    return date
      .toLocaleDateString(
        "en-CA",
        {
          timeZone:
            "Europe/London",
        }
      );
  }
  
  export default function Bookings() {
    const [
      bookingDate,
      setBookingDate,
    ] = useState(getToday());
  
    const [
      bookingTime,
      setBookingTime,
    ] = useState("");
  
    const [
      partySize,
      setPartySize,
    ] = useState("2");
  
    const [
      customerName,
      setCustomerName,
    ] = useState("");
  
    const [
      customerEmail,
      setCustomerEmail,
    ] = useState("");
  
    const [
      customerPhone,
      setCustomerPhone,
    ] = useState("");
  
    const [
      notes,
      setNotes,
    ] = useState("");
  
    const [
      slots,
      setSlots,
    ] = useState<BookingSlot[]>([]);
  
    const [
      loadingSlots,
      setLoadingSlots,
    ] = useState(false);
  
    const [
      submitting,
      setSubmitting,
    ] = useState(false);
  
    const [
      error,
      setError,
    ] = useState("");
  
    const [
      success,
      setSuccess,
    ] = useState(false);
  
    const minimumDate =
      useMemo(
        () => getToday(),
        []
      );
  
    const maximumDate =
      useMemo(
        () => getMaximumDate(),
        []
      );
  
    useEffect(() => {
      let mounted = true;
  
      async function loadSlots() {
        setLoadingSlots(true);
        setError("");
        setBookingTime("");
  
        try {
          const data =
            await getBookingSlots(
              bookingDate
            );
  
          if (mounted) {
            setSlots(
              data.slots ?? []
            );
          }
        } catch (loadError) {
          if (mounted) {
            setSlots([]);
  
            setError(
              loadError instanceof Error
                ? loadError.message
                : "Unable to load booking times."
            );
          }
        } finally {
          if (mounted) {
            setLoadingSlots(false);
          }
        }
      }
  
      loadSlots();
  
      return () => {
        mounted = false;
      };
    }, [bookingDate]);
  
    const availableSlots =
      slots.filter(
        (slot) =>
          slot.available
      );
  
    async function handleSubmit(
      event: FormEvent<HTMLFormElement>
    ) {
      event.preventDefault();
  
      setError("");
      setSuccess(false);
  
      const guests =
        Number(partySize);
  
      if (
        !Number.isInteger(
          guests
        ) ||
        guests < 1 ||
        guests > MAX_PARTY_SIZE
      ) {
        setError(
          `Bookings are limited to ${MAX_PARTY_SIZE} people.`
        );
        return;
      }
  
      if (!bookingTime) {
        setError(
          "Please select a booking time."
        );
        return;
      }
  
      setSubmitting(true);
  
      try {
        await createBooking({
          customerName:
            customerName.trim(),
  
          customerEmail:
            customerEmail
              .trim()
              .toLowerCase(),
  
          customerPhone:
            customerPhone.trim(),
  
          bookingDate,
  
          bookingTime,
  
          partySize: guests,
  
          notes: notes.trim(),
        });
  
        setSuccess(true);
  
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setNotes("");
        setBookingTime("");
        setPartySize("2");
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to submit your booking."
        );
      } finally {
        setSubmitting(false);
      }
    }
  
    return (
      <main>
        <section className="bg-brand-beige px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-ochre">
              Reservations
            </p>
  
            <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
              Book a table
            </h1>
  
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
              Request a table at Cafe Two Shades.
              Bookings can be requested up to one
              month in advance and are subject to
              approval by the café.
            </p>
          </div>
        </section>
  
        <section className="px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            {success && (
              <div
                role="status"
                className="mb-8 rounded-2xl border border-brand-ochre/30 bg-brand-beige p-6"
              >
                <h2 className="font-serif text-xl font-semibold">
                  Booking request received
                </h2>
  
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Your request has been sent to
                  Cafe Two Shades. Your booking is
                  not confirmed until the café
                  approves it.
                </p>
              </div>
            )}
  
            {error && (
              <div
                role="alert"
                className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}
  
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-brand-border bg-brand-ivory p-6 shadow-sm sm:p-8"
            >
              <div className="grid gap-6 sm:grid-cols-2">
  
                <Field
                  label="Name"
                  htmlFor="booking-name"
                >
                  <input
                    id="booking-name"
                    type="text"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(
                        event.target.value
                      )
                    }
                    autoComplete="name"
                    maxLength={100}
                    required
                    className={inputClass}
                  />
                </Field>
  
                <Field
                  label="Phone"
                  htmlFor="booking-phone"
                >
                  <input
                    id="booking-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(
                        event.target.value
                      )
                    }
                    autoComplete="tel"
                    maxLength={30}
                    required
                    className={inputClass}
                  />
                </Field>
  
                <Field
                  label="Email"
                  htmlFor="booking-email"
                >
                  <input
                    id="booking-email"
                    type="email"
                    value={customerEmail}
                    onChange={(event) =>
                      setCustomerEmail(
                        event.target.value
                      )
                    }
                    autoComplete="email"
                    maxLength={254}
                    required
                    className={inputClass}
                  />
                </Field>
  
                <Field
                  label="Number of guests"
                  htmlFor="booking-party"
                >
                  <select
                    id="booking-party"
                    value={partySize}
                    onChange={(event) =>
                      setPartySize(
                        event.target.value
                      )
                    }
                    className={inputClass}
                  >
                    {Array.from(
                      {
                        length:
                          MAX_PARTY_SIZE,
                      },
                      (_, index) =>
                        index + 1
                    ).map(
                      (number) => (
                        <option
                          key={number}
                          value={number}
                        >
                          {number}{" "}
                          {number === 1
                            ? "guest"
                            : "guests"}
                        </option>
                      )
                    )}
                  </select>
                </Field>
  
                <Field
                  label="Date"
                  htmlFor="booking-date"
                >
                  <input
                    id="booking-date"
                    type="date"
                    value={bookingDate}
                    min={minimumDate}
                    max={maximumDate}
                    onChange={(event) =>
                      setBookingDate(
                        event.target.value
                      )
                    }
                    required
                    className={inputClass}
                  />
                </Field>
  
                <Field
                  label="Time"
                  htmlFor="booking-time"
                >
                  <select
                    id="booking-time"
                    value={bookingTime}
                    onChange={(event) =>
                      setBookingTime(
                        event.target.value
                      )
                    }
                    disabled={
                      loadingSlots ||
                      availableSlots.length ===
                        0
                    }
                    required
                    className={inputClass}
                  >
                    <option value="">
                      {loadingSlots
                        ? "Checking availability..."
                        : availableSlots.length ===
                            0
                          ? "No times available"
                          : "Select a time"}
                    </option>
  
                    {availableSlots.map(
                      (slot) => (
                        <option
                          key={slot.time}
                          value={slot.time}
                        >
                          {formatTime(
                            slot.time
                          )}
                        </option>
                      )
                    )}
                  </select>

                  {!loadingSlots &&
                        bookingDate ===
                            new Date().toLocaleDateString(
                            "en-CA",
                            {
                                timeZone:
                                "Europe/London",
                            }
                            ) && (
                            <p className="mt-2 text-xs leading-5 text-stone-500">
                            Online bookings require at least
                            2 hours' notice. For bookings within
                            the next 2 hours, please contact the
                            café directly.
                            </p>
                        )}

                   
                </Field>

                {!loadingSlots &&
                  availableSlots.length === 0 && (
                    <div
                      role="status"
                      className="mt-4 rounded-xl bg-brand-beige p-4 text-sm leading-6 text-stone-600 sm:col-span-2"
                    >
                      <p className="font-medium text-brand-black">
                        No online booking times are currently
                        available.
                      </p>

                      <p className="mt-1">
                        Please contact Cafe Two Shades directly
                        on <strong>01206 768165</strong>{" "}
                        to check whether we can accommodate you.
                      </p>
                    </div>
                  )}
  
                <div className="sm:col-span-2">
                  <label
                    htmlFor="booking-notes"
                    className="text-sm font-medium"
                  >
                    Booking notes
                  </label>
  
                  <textarea
                    id="booking-notes"
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    maxLength={1000}
                    rows={5}
                    placeholder="Anything you'd like the café to know? Please mention any allergies or dietary requirements."
                    className={`${inputClass} resize-y`}
                  />
  
                  <p className="mt-2 text-xs leading-5 text-stone-500">
                    Please speak to a member of staff
                    again on arrival about any
                    allergies or dietary requirements.
                  </p>
                </div>
              </div>
  
              <div className="mt-8 rounded-xl bg-brand-beige/70 p-4 text-sm leading-6 text-stone-600">
                <strong className="text-brand-black">
                  Please note:
                </strong>{" "}
                bookings are limited to{" "}
                {MAX_PARTY_SIZE} guests per request.
                For larger groups, please contact the
                café directly.
              </div>
  
              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingSlots ||
                  availableSlots.length ===
                    0
                }
                className="
                  mt-6
                  w-full
                  rounded-xl
                  bg-brand-ochre
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
                  text-brand-black
                  transition
                  hover:bg-brand-ochre-dark
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {submitting
                  ? "Sending request..."
                  : "Request booking"}
              </button>
  
              <p className="mt-4 text-center text-xs leading-5 text-stone-500">
                Your booking is only confirmed after
                approval from Cafe Two Shades.
              </p>
            </form>
          </div>
        </section>
      </main>
    );
  }
  
  
  function Field({
    label,
    htmlFor,
    children,
  }: {
    label: string;
    htmlFor: string;
    children: React.ReactNode;
  }) {
    return (
      <div>
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium"
        >
          {label}
        </label>
  
        {children}
      </div>
    );
  }
  
  
  function formatTime(
    value: string
  ) {
    const [
      hours,
      minutes,
    ] = value.split(":").map(Number);
  
    const date = new Date();
  
    date.setHours(
      hours,
      minutes,
      0,
      0
    );
  
    return date.toLocaleTimeString(
      "en-GB",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }
  
  
  const inputClass = `
    mt-2
    w-full
    rounded-xl
    border
    border-brand-border
    bg-white
    px-4
    py-3
    text-sm
    outline-none
    transition
    focus:border-brand-ochre
    focus:ring-2
    focus:ring-brand-ochre/20
    disabled:cursor-not-allowed
    disabled:bg-stone-100
  `;



/* ---Initial version

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import SectionContainer from "../components/common/SectionContainer";
import {
  createBooking,
  getBookingSettings,
} from "../services/bookingService";

interface BookingSettings {
  maximum_capacity: number;
  maximum_party_size: number;
  booking_duration_minutes: number;
  booking_interval_minutes: number;
  maximum_days_ahead: number;
  warning_capacity_threshold: number;
}

const initialForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  bookingDate: "",
  bookingTime: "",
  partySize: 2,
  notes: "",
};

export default function Bookings() {
  const [settings, setSettings] =
    useState<BookingSettings | null>(null);

  const [form, setForm] = useState(initialForm);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getBookingSettings();
        setSettings(data);
      } catch {
        setError(
          "Booking information is temporarily unavailable."
        );
      }
    }

    loadSettings();
  }, []);

  function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  }
  
  const today = new Date();
  
  const minimumDate =
    formatLocalDate(today);
  
  const maximumDate = new Date(today);
  
  maximumDate.setDate(
    maximumDate.getDate() +
      (settings?.maximum_days_ahead ?? 31)
  );
  
  const maximumBookingDate =
    formatLocalDate(maximumDate);

  function updateField(
    field: keyof typeof initialForm,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!settings) {
      setError(
        "Booking information is temporarily unavailable."
      );
      return;
    }

    if (form.partySize > settings.maximum_party_size) {
      setError(
        `Online bookings are limited to ${settings.maximum_party_size} people. Please contact the café directly for larger groups.`
      );
      return;
    }

    setSubmitting(true);

    try {
      await createBooking(form);

      setSuccess(true);
      setForm(initialForm);
     } catch (bookingError) {
        const message =
          bookingError instanceof Error
            ? bookingError.message
            : "We couldn't submit your booking. Please try again.";
      
        setError(message);
      } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <>
        <BookingHeader />

        <SectionContainer>
          <div className="mx-auto max-w-2xl rounded-2xl border border-brand-border bg-brand-beige/40 p-8 text-center sm:p-12">
            <h2 className="font-serif text-3xl font-semibold">
              Booking request received
            </h2>

            <p className="mt-4 text-sm leading-7 text-stone-600">
              Thank you. Your booking request has been sent to
              Cafe Two Shades and is awaiting confirmation.
            </p>

            <p className="mt-3 text-sm leading-7 text-stone-600">
              Please check your email for confirmation or any
              further communication from the café.
            </p>

            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="
                mt-8
                rounded-xl
                bg-brand-ochre
                px-5
                py-3
                text-sm
                font-semibold
                text-brand-black
                transition-colors
                hover:bg-brand-ochre-dark
              "
            >
              Make another booking
            </button>
          </div>
        </SectionContainer>
      </>
    );
  }

  return (
    <>
      <BookingHeader />

      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="h-fit rounded-2xl bg-brand-black p-7 text-white sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-ochre">
              Before You Book
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold">
              A few things to know
            </h2>

            <ul className="mt-6 space-y-4 text-sm leading-6 text-stone-300">
              <li>
                Online bookings are limited to{" "}
                {settings?.maximum_party_size ?? 8} people.
              </li>

              <li>
                Larger groups should contact the café directly.
              </li>

              <li>
                Your request is not confirmed until approved by
                the café.
              </li>

              <li>
                Bookings are available up to one month ahead.
              </li>

              <li>
                Please include any allergies or dietary
                requirements in the booking notes.
              </li>
            </ul>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-xs leading-5 text-stone-400">
                Allergy information helps our team prepare.
                Please speak to a member of staff again when
                you arrive and before ordering.
              </p>
            </div>
          </aside>

          <div className="rounded-2xl border border-brand-border bg-brand-ivory p-7 sm:p-9">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-ochre">
                Book a Table
              </p>

              <h2 className="mt-2 font-serif text-3xl font-semibold">
                Send us a booking request
              </h2>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Name"
                  name="customerName"
                  value={form.customerName}
                  onChange={(value) =>
                    updateField("customerName", value)
                  }
                  required
                  autoComplete="name"
                />

                <Field
                  label="Email"
                  name="customerEmail"
                  type="email"
                  value={form.customerEmail}
                  onChange={(value) =>
                    updateField("customerEmail", value)
                  }
                  required
                  autoComplete="email"
                />

                <Field
                  label="Phone"
                  name="customerPhone"
                  type="tel"
                  value={form.customerPhone}
                  onChange={(value) =>
                    updateField("customerPhone", value)
                  }
                  required
                  autoComplete="tel"
                />

                <div>
                  <label
                    htmlFor="partySize"
                    className="text-sm font-medium"
                  >
                    Number of guests
                  </label>

                  <select
                    id="partySize"
                    value={form.partySize}
                    onChange={(event) =>
                      updateField(
                        "partySize",
                        Number(event.target.value)
                      )
                    }
                    className={inputClass}
                  >
                    {Array.from(
                      {
                        length:
                          settings?.maximum_party_size ?? 8,
                      },
                      (_, index) => index + 1
                    ).map((size) => (
                      <option key={size} value={size}>
                        {size}{" "}
                        {size === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bookingDate"
                    className="text-sm font-medium"
                  >
                    Date
                  </label>

                  <input
                    id="bookingDate"
                    type="date"
                    min={minimumDate}
                    max={maximumBookingDate}
                    value={form.bookingDate}
                    onChange={(event) =>
                      updateField(
                        "bookingDate",
                        event.target.value
                      )
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="bookingTime"
                    className="text-sm font-medium"
                  >
                    Time
                  </label>

                  <input
                    id="bookingTime"
                    type="time"
                    step="1800"
                    value={form.bookingTime}
                    onChange={(event) =>
                      updateField(
                        "bookingTime",
                        event.target.value
                      )
                    }
                    required
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-stone-400">
                    Bookings are available in 30-minute
                    intervals.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="text-sm font-medium"
                >
                  Booking notes
                </label>

                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                  rows={5}
                  placeholder="Allergies, dietary requirements, or anything else we'd need to know..."
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-2 text-xs leading-5 text-stone-400">
                  Please tell us about any allergies here.
                  Always speak to staff again on arrival about
                  allergies before ordering.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !settings}
                className="
                  w-full
                  rounded-xl
                  bg-brand-ochre
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
                  text-brand-black
                  transition-colors
                  hover:bg-brand-ochre-dark
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {submitting
                  ? "Sending request..."
                  : "Request a Booking"}
              </button>

              <p className="text-center text-xs leading-5 text-stone-400">
                Submitting this form does not guarantee a
                booking. Your request must be approved by the
                café.
              </p>
            </form>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}


function BookingHeader() {
  return (
    <section className="bg-brand-black px-6 py-20 text-center text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-ochre">
        Cafe Two Shades
      </p>

      <h1 className="mt-3 text-5xl font-semibold sm:text-6xl">
        Bookings
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-300">
        Reserve your place at the table.
      </p>
    </section>
  );
}


interface FieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        required={required}
        autoComplete={autoComplete}
        className={inputClass}
      />
    </div>
  );
}


const inputClass = `
  mt-2
  w-full
  rounded-xl
  border
  border-brand-border
  bg-white
  px-4
  py-3
  text-sm
  text-brand-black
  outline-none
  transition
  focus:border-brand-ochre
  focus:ring-2
  focus:ring-brand-ochre/20
`;

*/