import { supabase } from "../lib/supabase";

export interface AdminBooking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  party_size: number;
  notes: string | null;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled"
    | "completed";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function getBookings(
  status?: AdminBooking["status"]
) {
  let query = supabase
    .from("bookings")
    .select("*")
    .order("booking_date", {
      ascending: true,
    })
    .order("booking_time", {
      ascending: true,
    });

  if (status) {
    query = query.eq(
      "status",
      status
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    throw new Error(
      "Unable to load bookings."
    );
  }

  return data as AdminBooking[];
}


export async function manageBooking(
  bookingId: string,
  action: "approve" | "reject"
) {
  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "manage-booking",
      {
        body: {
          bookingId,
          action,
        },
      }
    );

  if (error) {
    throw new Error(
      "Unable to update booking."
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error ??
        "Unable to update booking."
    );
  }

  return data;
}