import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { sendEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function response(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    }
  );
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return response(
      { error: "Method not allowed." },
      405
    );
  }

  try {
    const authHeader =
      request.headers.get(
        "Authorization"
      );

    if (!authHeader) {
      return response(
        { error: "Unauthorized." },
        401
      );
    }

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL")!;

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      )!;

    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

    const body = await request.json();

    const bookingId =
      body.bookingId;

    if (
      typeof bookingId !== "string"
    ) {
      return response(
        {
          error:
            "Invalid booking ID.",
        },
        400
      );
    }

    const { data: booking, error } =
      await supabase
        .from("bookings")
        .select(
          `
            id,
            customer_name,
            customer_email,
            booking_date,
            booking_time,
            party_size,
            status
          `
        )
        .eq("id", bookingId)
        .single();

    if (error || !booking) {
      return response(
        {
          error:
            "Booking not found.",
        },
        404
      );
    }

    if (
      booking.status !==
      "approved"
    ) {
      return response(
        {
          error:
            "Only approved bookings can receive confirmation emails.",
        },
        400
      );
    }

    const formattedDate =
      new Date(
        `${booking.booking_date}T${booking.booking_time}`
      ).toLocaleDateString(
        "en-GB",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone:
            "Europe/London",
        }
      );

    const formattedTime =
      booking.booking_time.slice(
        0,
        5
      );

    await sendEmail({
      to: booking.customer_email,
      subject:
        "Your Cafe Two Shades booking is confirmed",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2>Your booking is confirmed</h2>

          <p>
            Hello ${escapeHtml(
              booking.customer_name
            )},
          </p>

          <p>
            Your booking at Cafe Two Shades
            has been approved.
          </p>

          <p>
            <strong>Date:</strong>
            ${escapeHtml(formattedDate)}
            <br />
            <strong>Time:</strong>
            ${escapeHtml(formattedTime)}
            <br />
            <strong>Guests:</strong>
            ${booking.party_size}
          </p>

          <p>
            If you mentioned any allergies or
            dietary requirements, please speak
            to a member of staff again when you
            arrive and before ordering.
          </p>

          <p>
            We look forward to seeing you.
          </p>

          <p>
            Cafe Two Shades
          </p>
        </div>
      `,
    });

    return response({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return response(
      {
        error:
          "Unable to send confirmation.",
      },
      500
    );
  }
});


function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll(
      "'",
      "&#039;"
    );
}