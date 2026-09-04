import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { sendEmail } from "../_shared/email.ts";

interface Booking {
  id: string;
  customer_name: string;
  booking_date: string;
  booking_time: string;
  party_size: number;
  customer_phone: string;
  customer_email: string;
  notes: string | null;
}

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
        "Cache-Control":
          "no-store",
      },
    }
  );
}

function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(
  value: string
) {
  const [
    hour,
    minute,
  ] = value
    .slice(0, 5)
    .split(":")
    .map(Number);

  const date =
    new Date();

  date.setHours(
    hour,
    minute,
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

function formatDate(
  value: string
) {
  return new Date(
    `${value}T12:00:00Z`
  ).toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

Deno.serve(async (request) => {
  if (
    request.method ===
    "OPTIONS"
  ) {
    return new Response(
      "ok",
      {
        headers:
          corsHeaders,
      }
    );
  }

  if (
    request.method !== "POST"
  ) {
    return response(
      {
        error:
          "Method not allowed.",
      },
      405
    );
  }

  try {
    /*
     * This function is intended to be called by a
     * scheduled Supabase job.
     *
     * It is NOT a public endpoint.
     */
    const authorization =
      request.headers.get(
        "Authorization"
      );

    const expectedKey =
      Deno.env.get(
        "BOOKING_REMINDER_SECRET"
      );

    if (
      !expectedKey ||
      authorization !==
        `Bearer ${expectedKey}`
    ) {
      return response(
        {
          error:
            "Unauthorised.",
        },
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
            persistSession:
              false,
            autoRefreshToken:
              false,
          },
        }
      );

    /*
     * Current date in the café's timezone.
     */
    const now =
      new Date();

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
      ).format(now);

    /*
     * Only approved bookings for today.
     */
    const {
      data: bookings,
      error:
        bookingError,
    } =
      await supabase
        .from("bookings")
        .select(
          `
            id,
            customer_name,
            booking_date,
            booking_time,
            party_size,
            customer_phone,
            customer_email,
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

      return response(
        {
          error:
            "Unable to retrieve bookings.",
        },
        500
      );
    }

    if (
      !bookings ||
      bookings.length === 0
    ) {
      return response({
        success: true,
        message:
          "No approved bookings for today.",
        sent: false,
      });
    }

    /*
     * Admin email addresses are stored in the database,
     * not hard-coded in the function.
     */
    const {
      data: admins,
      error:
        adminError,
    } =
      await supabase
        .from("admin_users")
        .select(
          "email"
        )
        .eq(
          "is_active",
          true
        );

    if (
      adminError
    ) {
      console.error(
        adminError
      );

      return response(
        {
          error:
            "Unable to retrieve admin recipients.",
        },
        500
      );
    }

    const recipients =
      (admins ?? [])
        .map(
          (admin) =>
            admin.email
        )
        .filter(
          (
            email
          ): email is string =>
            typeof email ===
              "string" &&
            email.length > 0
        );

    if (
      recipients.length ===
      0
    ) {
      return response(
        {
          error:
            "No active admin email addresses configured.",
        },
        500
      );
    }

    const bookingRows =
      (bookings as Booking[])
        .map(
          (booking) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <strong>
                  ${escapeHtml(
                    formatTime(
                      booking.booking_time
                    )
                  )}
                </strong>
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
                ${escapeHtml(
                  booking.customer_phone
                )}
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

    await sendEmail({
      to:
        recipients,

      subject:
        `Cafe Two Shades — today's bookings (${bookings.length})`,

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #222;
          "
        >
          <h2>
            Today's bookings
          </h2>

          <p>
            Here is the approved booking list
            for
            <strong>
              ${escapeHtml(
                formatDate(
                  londonDate
                )
              )}
            </strong>.
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
                <th
                  style="
                    padding: 10px;
                    text-align: left;
                    border-bottom: 2px solid #222;
                  "
                >
                  Time
                </th>

                <th
                  style="
                    padding: 10px;
                    text-align: left;
                    border-bottom: 2px solid #222;
                  "
                >
                  Customer
                </th>

                <th
                  style="
                    padding: 10px;
                    text-align: left;
                    border-bottom: 2px solid #222;
                  "
                >
                  Guests
                </th>

                <th
                  style="
                    padding: 10px;
                    text-align: left;
                    border-bottom: 2px solid #222;
                  "
                >
                  Phone
                </th>

                <th
                  style="
                    padding: 10px;
                    text-align: left;
                    border-bottom: 2px solid #222;
                  "
                >
                  Notes
                </th>
              </tr>
            </thead>

            <tbody>
              ${bookingRows}
            </tbody>
          </table>

          <p
            style="
              margin-top: 24px;
              font-size: 13px;
              color: #666;
            "
          >
            This is an automated daily reminder
            from the Cafe Two Shades booking system.
          </p>
        </div>
      `,
    });

    return response({
      success: true,
      sent: true,
      bookingCount:
        bookings.length,
      recipientCount:
        recipients.length,
    });
  } catch (error) {
    console.error(error);

    return response(
      {
        error:
          "Unable to send booking reminders.",
      },
      500
    );
  }
});