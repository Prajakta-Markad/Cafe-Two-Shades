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

    const supabase =
      createClient(
        Deno.env.get(
          "SUPABASE_URL"
        )!,
        Deno.env.get(
          "SUPABASE_SERVICE_ROLE_KEY"
        )!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

    const body =
      await request.json();

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
      "rejected"
    ) {
      return response(
        {
          error:
            "Only rejected bookings can receive rejection emails.",
        },
        400
      );
    }

    await sendEmail({
      to: booking.customer_email,
      subject:
        "Update regarding your Cafe Two Shades booking",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2>Booking update</h2>

          <p>
            Hello ${escapeHtml(
              booking.customer_name
            )},
          </p>

          <p>
            Unfortunately, we are unable to
            accommodate your booking request
            for
            <strong>
              ${escapeHtml(
                booking.booking_date
              )}
            </strong>
            at
            <strong>
              ${escapeHtml(
                booking.booking_time.slice(
                  0,
                  5
                )
              )}
            </strong>.
          </p>

          <p>
            Please contact Cafe Two Shades
            directly if you would like to
            discuss another date or time.
          </p>

          <p>
            We apologise for any inconvenience.
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
          "Unable to send rejection email.",
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