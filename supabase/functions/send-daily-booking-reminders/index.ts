import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { sendEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

interface Booking {
  id: string;
  customer_name: string;
  booking_date: string;
  booking_time: string;
  party_size: number;
  notes: string | null;
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed." },
      405
    );
  }

  try {
    /*
     * This function is intended to be called by Supabase's
     * scheduler, not by the public website.
     *
     * The scheduler invocation should include the function's
     * configured authorization.
     */
    const authHeader =
      request.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse(
        { error: "Unauthorized." },
        401
      );
    }

    const supabase =
      createClient(
        Deno.env.get("SUPABASE_URL")!,
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

    /*
     * London date.
     *
     * We deliberately calculate this in the café's timezone
     * instead of using UTC date.
     */
    const londonDate =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "Europe/London",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      ).format(new Date());

    const {
      data: bookings,
      error: bookingError,
    } = await supabase
      .from("bookings")
      .select(
        `
          id,
          customer_name,
          booking_date,
          booking_time,
          party_size,
          notes
        `
      )
      .eq(
        "booking_date",
        londonDate
      )
      .eq(
        "status",
        "approved"
      )
      .is(
        "reminder_sent_at",
        null
      )
      .order(
        "booking_time",
        {
          ascending: true,
        }
      );

    if (bookingError) {
      console.error(
        bookingError
      );

      return jsonResponse(
        {
          error:
            "Unable to load today's bookings.",
        },
        500
      );
    }

    const cafeEmail =
      Deno.env.get(
        "CAFE_EMAIL"
      );

    if (!cafeEmail) {
      return jsonResponse(
        {
          error:
            "Cafe email is not configured.",
        },
        500
      );
    }

    /*
     * Nothing to remind the café about.
     */
    if (!bookings?.length) {
      return jsonResponse({
        success: true,
        remindersSent: 0,
      });
    }

    const bookingRows = (
      bookings as Booking[]
    )
      .map(
        (booking) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
              ${escapeHtml(
                formatTime(
                  booking.booking_time
                )
              )}
            </td>

            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
              ${escapeHtml(
                booking.customer_name
              )}
            </td>

            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
              ${booking.party_size}
            </td>

            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
              ${
                booking.notes
                  ? escapeHtml(
                      booking.notes
                    )
                  : "—"
              }
            </td>
          </tr>
        `
      )
      .join("");

    const readableDate =
      new Date(
        `${londonDate}T12:00:00`
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

    await sendEmail({
      to: cafeEmail,
      subject:
        `Today's bookings — ${readableDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2>Today's bookings</h2>

          <p>
            Here are the approved bookings
            scheduled for today.
          </p>

          <p>
            <strong>
              ${escapeHtml(
                readableDate
              )}
            </strong>
          </p>

          <table
            style="
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            "
          >
            <thead>
              <tr>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #222;">
                  Time
                </th>

                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #222;">
                  Name
                </th>

                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #222;">
                  Guests
                </th>

                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #222;">
                  Notes
                </th>
              </tr>
            </thead>

            <tbody>
              ${bookingRows}
            </tbody>
          </table>

          <p style="margin-top: 24px;">
            Please remember to check any allergy
            or dietary notes with the customer
            when they arrive.
          </p>

          <p>
            Cafe Two Shades
          </p>
        </div>
      `,
    });

    /*
     * Mark reminders as sent only after the email succeeds.
     */
    const bookingIds =
      (
        bookings as Booking[]
      ).map(
        (booking) =>
          booking.id
      );

    const {
      error: updateError,
    } = await supabase
      .from("bookings")
      .update({
        reminder_sent_at:
          new Date().toISOString(),
      })
      .in(
        "id",
        bookingIds
      )
      .is(
        "reminder_sent_at",
        null
      );

    if (updateError) {
      /*
       * The email has already gone out.
       * Log the failure rather than sending it again.
       */
      console.error(
        "Reminder tracking update failed:",
        updateError
      );
    }

    return jsonResponse({
      success: true,
      remindersSent: 1,
      bookingsIncluded:
        bookings.length,
    });
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        error:
          "Unable to send booking reminders.",
      },
      500
    );
  }
});