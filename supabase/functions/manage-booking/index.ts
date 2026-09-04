import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { sendEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

interface ManageBookingRequest {
  bookingId?: unknown;
  action?: unknown;
}

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

function cleanString(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim()
    : "";
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
     * --------------------------------------------------------
     * AUTHENTICATION
     * --------------------------------------------------------
     *
     * The admin dashboard must send a valid Supabase
     * authenticated session.
     */

    const authorization =
      request.headers.get(
        "Authorization"
      );

    if (
      !authorization?.startsWith(
        "Bearer "
      )
    ) {
      return response(
        {
          error:
            "Authentication required.",
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
     * Verify the user's JWT.
     */
    const token =
      authorization.replace(
        "Bearer ",
        ""
      );

    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabase.auth.getUser(
        token
      );

    if (
      userError ||
      !user
    ) {
      return response(
        {
          error:
            "Authentication required.",
        },
        401
      );
    }

    /*
     * --------------------------------------------------------
     * ADMIN AUTHORISATION
     * --------------------------------------------------------
     *
     * Only users explicitly listed in admin_users may
     * manage bookings.
     */

    const {
      data: admin,
      error:
        adminError,
    } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "is_active",
          true
        )
        .maybeSingle();

    if (
      adminError ||
      !admin
    ) {
      return response(
        {
          error:
            "You are not authorised to manage bookings.",
        },
        403
      );
    }

    /*
     * --------------------------------------------------------
     * INPUT
     * --------------------------------------------------------
     */

    const body =
      (await request.json()) as ManageBookingRequest;

    const bookingId =
      cleanString(
        body.bookingId
      );

    const action =
      cleanString(
        body.action
      );

    if (
      !bookingId
    ) {
      return response(
        {
          error:
            "Booking ID is required.",
        },
        400
      );
    }

    if (
      action !== "approve" &&
      action !== "reject"
    ) {
      return response(
        {
          error:
            "Invalid booking action.",
        },
        400
      );
    }

    /*
     * --------------------------------------------------------
     * FETCH BOOKING
     * --------------------------------------------------------
     */

    const {
      data: booking,
      error:
        bookingError,
    } =
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
            notes,
            status
          `
        )
        .eq(
          "id",
          bookingId
        )
        .maybeSingle();

    if (
      bookingError ||
      !booking
    ) {
      return response(
        {
          error:
            "Booking not found.",
        },
        404
      );
    }

    /*
     * --------------------------------------------------------
     * ONLY PENDING BOOKINGS CAN BE DECIDED
     * --------------------------------------------------------
     */

    if (
      booking.status !==
      "pending"
    ) {
      return response(
        {
          error:
            "This booking has already been processed.",
        },
        409
      );
    }

    /*
     * --------------------------------------------------------
     * APPROVE
     * --------------------------------------------------------
     */

    if (
      action === "approve"
    ) {
      /*
       * Capacity must be checked again at the moment
       * of approval.
       *
       * Pending bookings do not consume capacity.
       */

      const {
        data: settings,
        error:
          settingsError,
      } =
        await supabase
          .from(
            "booking_settings"
          )
          .select(
            `
              maximum_capacity,
              booking_duration_minutes
            `
          )
          .eq("id", true)
          .single();

      if (
        settingsError ||
        !settings
      ) {
        return response(
          {
            error:
              "Booking settings are unavailable.",
          },
          500
        );
      }

      const [
        bookingHour,
        bookingMinute,
      ] =
        booking.booking_time
          .slice(0, 5)
          .split(":")
          .map(Number);

      const bookingStart =
        bookingHour * 60 +
        bookingMinute;

      const bookingEnd =
        bookingStart +
        settings.booking_duration_minutes;

      const {
        data: approvedBookings,
        error:
          capacityError,
      } =
        await supabase
          .from("bookings")
          .select(
            `
              booking_time,
              party_size
            `
          )
          .eq(
            "booking_date",
            booking.booking_date
          )
          .eq(
            "status",
            "approved"
          )
          .neq(
            "id",
            booking.id
          );

      if (capacityError) {
        return response(
          {
            error:
              "Unable to verify booking capacity.",
          },
          500
        );
      }

      let occupied =
        0;

      for (
        const existing of
        approvedBookings ??
        []
      ) {
        const [
          hour,
          minute,
        ] =
          existing.booking_time
            .slice(0, 5)
            .split(":")
            .map(Number);

        const existingStart =
          hour * 60 +
          minute;

        const existingEnd =
          existingStart +
          settings.booking_duration_minutes;

        if (
          existingStart <
            bookingEnd &&
          existingEnd >
            bookingStart
        ) {
          occupied +=
            existing.party_size;
        }
      }

      if (
        occupied +
          booking.party_size >
        settings.maximum_capacity
      ) {
        return response(
          {
            error:
              "This booking can no longer be approved because there is not enough capacity at that time.",
            code:
              "CAPACITY_UNAVAILABLE",
          },
          409
        );
      }

      const {
        error:
          updateError,
      } =
        await supabase
          .from("bookings")
          .update({
            status:
              "approved",
            approved_at:
              new Date().toISOString(),
            approved_by:
              user.id,
          })
          .eq(
            "id",
            booking.id
          )
          .eq(
            "status",
            "pending"
          );

      if (updateError) {
        console.error(
          updateError
        );

        return response(
          {
            error:
              "Unable to approve the booking.",
          },
          500
        );
      }

      /*
       * Customer confirmation email.
       */
      try {
        await sendEmail({
          to:
            booking.customer_email,

          subject:
            "Cafe Two Shades — booking confirmed",

          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
              <h2>Your booking is confirmed</h2>

              <p>
                Hello ${escapeHtml(
                  booking.customer_name
                )},
              </p>

              <p>
                Your booking at
                <strong>Cafe Two Shades</strong>
                has been confirmed.
              </p>

              <p>
                <strong>Date:</strong>
                ${escapeHtml(
                  formatDate(
                    booking.booking_date
                  )
                )}<br>

                <strong>Time:</strong>
                ${escapeHtml(
                  formatTime(
                    booking.booking_time
                  )
                )}<br>

                <strong>Guests:</strong>
                ${booking.party_size}
              </p>

              ${
                booking.notes
                  ? `
                    <p>
                      <strong>Your notes:</strong><br>
                      ${escapeHtml(
                        booking.notes
                      )}
                    </p>
                  `
                  : ""
              }

              <p>
                If you have mentioned an allergy
                or dietary requirement, please speak
                to a member of staff again when you
                arrive.
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
      } catch (emailError) {
        console.error(
          "Confirmation email failed:",
          emailError
        );
      }

      return response({
        success: true,
        status:
          "approved",
      });
    }

    /*
     * --------------------------------------------------------
     * REJECT
     * --------------------------------------------------------
     */

    const {
      error: rejectError,
    } =
      await supabase
        .from("bookings")
        .update({
          status:
            "rejected",
          rejected_at:
            new Date().toISOString(),
          rejected_by:
            user.id,
        })
        .eq(
          "id",
          booking.id
        )
        .eq(
          "status",
          "pending"
        );

    if (rejectError) {
      console.error(
        rejectError
      );

      return response(
        {
          error:
            "Unable to reject the booking.",
        },
        500
      );
    }

    /*
     * Customer rejection email.
     */
    try {
      await sendEmail({
        to:
          booking.customer_email,

        subject:
          "Cafe Two Shades — booking update",

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
            <h2>Booking request update</h2>

            <p>
              Hello ${escapeHtml(
                booking.customer_name
              )},
            </p>

            <p>
              Unfortunately, Cafe Two Shades
              is unable to confirm your booking
              request for:
            </p>

            <p>
              <strong>Date:</strong>
              ${escapeHtml(
                formatDate(
                  booking.booking_date
                )
              )}<br>

              <strong>Time:</strong>
              ${escapeHtml(
                formatTime(
                  booking.booking_time
                )
              )}<br>

              <strong>Guests:</strong>
              ${booking.party_size}
            </p>

            <p>
              Please contact the café directly
              if you would like to discuss
              alternative arrangements.
            </p>

            <p>
              Cafe Two Shades
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error(
        "Rejection email failed:",
        emailError
      );
    }

    return response({
      success: true,
      status:
        "rejected",
    });
  } catch (error) {
    console.error(error);

    return response(
      {
        error:
          "Unable to manage this booking.",
      },
      500
    );
  }
});