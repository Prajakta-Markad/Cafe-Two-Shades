import { useCallback, useEffect, useState,} from "react";
import { type AdminBooking, getBookings, manageBooking, } from "../../services/adminBookingService";
  
  type Filter =
    | "pending"
    | "approved"
    | "rejected"
    | "all";
  
  export default function AdminBookings() {
    const [
      bookings,
      setBookings,
    ] = useState<AdminBooking[]>([]);
  
    const [
      filter,
      setFilter,
    ] = useState<Filter>("pending");
  
    const [
      loading,
      setLoading,
    ] = useState(true);
  
    const [
      processingId,
      setProcessingId,
    ] = useState<string | null>(null);
  
    const [
      error,
      setError,
    ] = useState("");
  
    const loadBookings =
      useCallback(async () => {
        setLoading(true);
        setError("");
  
        try {
          const data =
            await getBookings(
              filter === "all"
                ? undefined
                : filter
            );
  
          setBookings(data);
        } catch (loadError) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load bookings."
          );
        } finally {
          setLoading(false);
        }
      }, [filter]);
  
    useEffect(() => {
      loadBookings();
    }, [loadBookings]);
  
    async function handleAction(
      bookingId: string,
      action: "approve" | "reject"
    ) {
      const confirmed =
        window.confirm(
          action === "approve"
            ? "Approve this booking?"
            : "Reject this booking?"
        );
  
      if (!confirmed) {
        return;
      }
  
      setProcessingId(bookingId);
      setError("");
  
      try {
        await manageBooking(
          bookingId,
          action
        );
  
        await loadBookings();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Unable to update booking."
        );
      } finally {
        setProcessingId(null);
      }
    }
  
    return (
      <section>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ochre">
              Management
            </p>
  
            <h2 className="mt-2 font-serif text-3xl font-semibold">
              Bookings
            </h2>
  
            <p className="mt-2 text-sm text-stone-500">
              Review and manage customer booking requests.
            </p>
          </div>
  
          <button
            type="button"
            onClick={loadBookings}
            className="
              rounded-lg
              border
              border-brand-border
              px-4
              py-2
              text-sm
              font-medium
              hover:border-brand-ochre
            "
          >
            Refresh
          </button>
        </div>
  
        <div className="mt-7 flex flex-wrap gap-2">
          {(
            [
              ["pending", "Pending"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
              ["all", "All"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setFilter(value)
              }
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition
                ${
                  filter === value
                    ? "bg-brand-black text-white"
                    : "border border-brand-border bg-brand-ivory hover:border-brand-ochre"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
  
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}
  
        {loading ? (
          <div className="py-16 text-center text-sm text-stone-500">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-brand-border bg-brand-ivory p-10 text-center">
            <p className="font-serif text-xl font-semibold">
              No bookings found
            </p>
  
            <p className="mt-2 text-sm text-stone-500">
              There are no bookings in this category.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                processing={
                  processingId === booking.id
                }
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </section>
    );
  }
  
  
  interface BookingCardProps {
    booking: AdminBooking;
    processing: boolean;
    onAction: (
      bookingId: string,
      action: "approve" | "reject"
    ) => void;
  }
  
  function BookingCard({
    booking,
    processing,
    onAction,
  }: BookingCardProps) {
    const date = new Date(
      `${booking.booking_date}T${booking.booking_time}`
    );
  
    const formattedDate =
      date.toLocaleDateString(
        "en-GB",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
  
    const formattedTime =
      booking.booking_time.slice(
        0,
        5
      );
  
    return (
      <article className="rounded-2xl border border-brand-border bg-brand-ivory p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-serif text-2xl font-semibold">
                {booking.customer_name}
              </h3>
  
              <StatusBadge
                status={booking.status}
              />
            </div>
  
            <div className="mt-4 grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
              <p>
                <strong>Date:</strong>{" "}
                {formattedDate}
              </p>
  
              <p>
                <strong>Time:</strong>{" "}
                {formattedTime}
              </p>
  
              <p>
                <strong>Guests:</strong>{" "}
                {booking.party_size}
              </p>
  
              <p>
                <strong>Phone:</strong>{" "}
                {booking.customer_phone}
              </p>
  
              <p className="sm:col-span-2">
                <strong>Email:</strong>{" "}
                {booking.customer_email}
              </p>
            </div>
  
            {booking.notes && (
              <div className="mt-5 rounded-xl bg-brand-beige/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Booking notes
                </p>
  
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>
  
          {booking.status ===
            "pending" && (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={processing}
                onClick={() =>
                  onAction(
                    booking.id,
                    "approve"
                  )
                }
                className="
                  rounded-lg
                  bg-brand-ochre
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-brand-black
                  hover:bg-brand-ochre-dark
                  disabled:opacity-50
                "
              >
                Approve
              </button>
  
              <button
                type="button"
                disabled={processing}
                onClick={() =>
                  onAction(
                    booking.id,
                    "reject"
                  )
                }
                className="
                  rounded-lg
                  border
                  border-red-200
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-red-700
                  hover:bg-red-50
                  disabled:opacity-50
                "
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </article>
    );
  }
  
  
  function StatusBadge({
    status,
  }: {
    status: AdminBooking["status"];
  }) {
    const labels = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      cancelled: "Cancelled",
      completed: "Completed",
    };
  
    return (
      <span className="rounded-full bg-brand-beige px-3 py-1 text-xs font-semibold capitalize text-stone-700">
        {labels[status]}
      </span>
    );
  }