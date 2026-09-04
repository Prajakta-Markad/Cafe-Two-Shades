import { supabase } from "../lib/supabase";

export interface BookingSlot {
  time: string;
  available: boolean;
}

export interface BookingAvailability {
  date: string;
  slots: BookingSlot[];
  maximumPartySize: number;
}

export interface CreateBookingInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  partySize: number;
  notes: string;
}

export async function getBookingSlots(
  date: string,
  partySize: number
): Promise<BookingAvailability> {
  const supabaseUrl =
    import.meta.env
      .VITE_SUPABASE_URL;

  const params =
    new URLSearchParams({
      date,
      partySize:
        String(partySize),
    });

  const response =
    await fetch(
      `${supabaseUrl}/functions/v1/get-booking-slots?${params.toString()}`,
      {
        method: "GET",
        headers: {
          apikey:
            import.meta.env
              .VITE_SUPABASE_ANON_KEY,
        },
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ??
        "Unable to load booking times."
    );
  }

  return data as BookingAvailability;
}


export async function createBooking(
  input: CreateBookingInput
) {
  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "create-booking",
      {
        body: input,
      }
    );

  if (error) {
    throw new Error(
      "Unable to submit your booking request."
    );
  }

  if (
    !data?.success
  ) {
    throw new Error(
      data?.error ??
        "Unable to submit your booking request."
    );
  }

  return data as {
    success: true;
    bookingId: string;
    status: "pending";
  };
}