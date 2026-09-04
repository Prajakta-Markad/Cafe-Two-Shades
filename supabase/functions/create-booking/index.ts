import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { sendEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

const MAX_NOTES_LENGTH = 1000;
const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 30;

const MINIMUM_NOTICE_MINUTES = 120;

interface BookingRequest {
  customerName?: unknown;
  customerEmail?: unknown;
  customerPhone?: unknown;
  bookingDate?: unknown;
  bookingTime?: unknown;
  partySize?: unknown;
  notes?: unknown;
}

interface BookingSettings {
  maximum_capacity: number;
  maximum_party_size: number;
  booking_duration_minutes: number;
  slot_interval_minutes: number;
  opening_time: string;
  closing_time: string;
}

function jsonResponse(
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
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function escapeHtml(
  value: string
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidDate(
  value: string
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(
    `${value}T12:00:00Z`
  );

  return (
    !Number.isNaN(date.getTime()) &&
    date
      .toISOString()
      .slice(0, 10) === value
  );
}

function isValidTime(
  value: string
): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(
    value
  );
}

function getLondonParts(
  date: Date
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone:
          "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }
    ).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter(
        (part) =>
          part.type !==
          "literal"
      )
      .map((part) => [
        part.type,
        part.value,
      ])
  );
}

function timeToMinutes(
  time: string
): number {
  const [
    hours,
    minutes,
  ] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function getDateStringFromParts(
  parts: Record<string, string>
) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDays(
  dateString: string,
  days: number
) {
  const date = new Date(
    `${dateString}T12:00:00Z`
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function addMonths(
  dateString: string,
  months: number
) {
  const date = new Date(
    `${dateString}T12:00:00Z`
  );

  date.setUTCMonth(
    date.getUTCMonth() + months
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function isValidEmail(
  email: string
): boolean {
  /*
   * This is deliberately conservative.
   * The actual email service also performs
   * its own validation.
   */
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  );
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error:
          "Method not allowed.",
      },
      405
    );
  }

  try {
    const body =
      (await request.json()) as BookingRequest;

    const customerName =
      cleanString(
        body.customerName
      );

    const customerEmail =
      cleanString(
        body.customerEmail
      ).toLowerCase();

    const customerPhone =
      cleanString(
        body.customerPhone
      );

    const bookingDate =
      cleanString(
        body.bookingDate
      );

    const bookingTime =
      cleanString(
        body.bookingTime
      );

    const notes =
      cleanString(body.notes);

    const partySize =
      Number(body.partySize);

    /*
     * --------------------------------------------------------
     * BASIC VALIDATION
     * --------------------------------------------------------
     */

    if (
      !customerName ||
      customerName.length >
        MAX_NAME_LENGTH
    ) {
      return jsonResponse(
        {
          error:
            "Please enter a valid name.",
        },
        400
      );
    }

    if (
      !isValidEmail(
        customerEmail
      )
    ) {
      return jsonResponse(
        {
          error:
            "Please enter a valid email address.",
        },
        400
      );
    }

    if (
      !customerPhone ||
      customerPhone.length >
        MAX_PHONE_LENGTH
    ) {
      return jsonResponse(
        {
          error:
            "Please enter a valid phone number.",
        },
        400
      );
    }

    if (
      !isValidDate(
        bookingDate
      )
    ) {
      return jsonResponse(
        {
          error:
            "Please select a valid booking date.",
        },
        400
      );
    }

    if (
      !isValidTime(
        bookingTime
      )
    ) {
      return jsonResponse(
        {
          error:
            "Please select a valid booking time.",
        },
        400
      );
    }

    if (
      !Number.isInteger(
        partySize
      )
    ) {
      return jsonResponse(
        {
          error:
            "Please select a valid party size.",
        },
        400
      );
    }

    if (
      notes.length >
      MAX_NOTES_LENGTH
    ) {
      return jsonResponse(
        {
          error:
            "Booking notes are too long.",
        },
        400
      );
    }

    /*
     * --------------------------------------------------------
     * SUPABASE
     * --------------------------------------------------------
     */

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

    /*
     * --------------------------------------------------------
     * LOAD BOOKING SETTINGS
     * --------------------------------------------------------
     */

    const {
      data: settings,
      error: settingsError,
    } =
      await supabase
        .from(
          "booking_settings"
        )
        .select(
          `
            maximum_capacity,
            maximum_party_size,
            booking_duration_minutes,
            slot_interval_minutes,
            opening_time,
            closing_time
          `
        )
        .eq("id", true)
        .single<BookingSettings>();

    if (
      settingsError ||
      !settings
    ) {
      console.error(
        settingsError
      );

      return jsonResponse(
        {
          error:
            "Booking service is temporarily unavailable.",
        },
        500
      );
    }

    /*
     * --------------------------------------------------------
     * PARTY SIZE
     * --------------------------------------------------------
     */

    if (
      partySize < 1 ||
      partySize >
        settings.maximum_party_size
    ) {
      return jsonResponse(
        {
          error:
            `Online bookings are limited to ${settings.maximum_party_size} guests. For larger groups, please contact the café directly.`,
        },
        400
      );
    }

    /*
     * --------------------------------------------------------
     * BOOKING WINDOW
     * --------------------------------------------------------
     */

    const now =
      new Date();

    const londonNow =
      getLondonParts(now);

    const today =
      getDateStringFromParts(
        londonNow
      );

    const maximumDate =
      addMonths(
        today,
        1
      );

    if (
      bookingDate < today ||
      bookingDate >
        maximumDate
    ) {
      return jsonResponse(
        {
          error:
            "Bookings can only be made up to one month in advance.",
        },
        400
      );
    }

    /*
     * --------------------------------------------------------
     * SAME-DAY TWO-HOUR NOTICE
     * --------------------------------------------------------
     */

    if (
      bookingDate === today
    ) {
      const currentMinutes =
        Number(
          londonNow.hour
        ) *
          60 +
        Number(
          londonNow.minute
        );

      const requestedMinutes =
        timeToMinutes(
          bookingTime
        );

      if (
        requestedMinutes <
        currentMinutes +
          MINIMUM_NOTICE_MINUTES
      ) {
        return jsonResponse(
          {
            error:
              "For bookings within the next 2 hours, please contact the café directly.",
            code:
              "SHORT_NOTICE",
          },
          400
        );
      }
    }

    /*
     * --------------------------------------------------------
     * SLOT VALIDATION
     * --------------------------------------------------------
     *
     * The customer cannot invent a time such as
     * 14:17 when bookings are every 30 minutes.
     */

    const requestedMinutes =
      timeToMinutes(
        bookingTime
      );

    const openingMinutes =
      timeToMinutes(
        settings.opening_time
      );

    const closingMinutes =
      timeToMinutes(
        settings.closing_time
      );

    const latestStartMinutes =
      closingMinutes -
      settings.booking_duration_minutes;

    if (
      requestedMinutes <
        openingMinutes ||
      requestedMinutes >
        latestStartMinutes
    ) {
      return jsonResponse(
        {
          error:
            "That booking time is outside the available booking hours.",
        },
        400
      );
    }

    if (
      (
        requestedMinutes -
        openingMinutes
      ) %
        settings.slot_interval_minutes !==
      0
    ) {
      return jsonResponse(
        {
          error:
            "Please select one of the available booking times.",
        },
        400
      );
    }

    /*
     * --------------------------------------------------------
     * LOAD APPROVED BOOKINGS
     * --------------------------------------------------------
     */

    const {
      data: existingBookings,
      error:
        existingBookingsError,
    } =
      await supabase
        .from("bookings")
        .select(
          `
            booking_time,
            party_size,
            status
          `
        )
        .eq(
          "booking_date",
          bookingDate
        )
        .eq(
          "status",
          "approved"
        );

    if (
      existingBookingsError
    ) {
      console.error(
        existingBookingsError
      );

      return jsonResponse(
        {
          error:
            "Unable to check booking availability.",
        },
        500
      );
    }

    /*
     * --------------------------------------------------------
     * CAPACITY CHECK
     * --------------------------------------------------------
     */

    const requestedEnd =
      requestedMinutes +
      settings.booking_duration_minutes;

    let occupiedCapacity = 0;

    for (
      const booking of
      existingBookings ?? []
    ) {
      const existingStart =
        timeToMinutes(
          booking.booking_time
        );

      const existingEnd =
        existingStart +
        settings.booking_duration_minutes;

      const overlaps =
        existingStart <
          requestedEnd &&
        existingEnd >
          requestedMinutes;

      if (overlaps) {
        occupiedCapacity +=
          booking.party_size;
      }
    }

    const remainingCapacity =
      settings.maximum_capacity -
      occupiedCapacity;

    if (
      remainingCapacity <
      partySize
    ) {
      return jsonResponse(
        {
          error:
            "Unfortunately, that time is no longer available for your group. Please choose another time or contact the café directly.",
          code:
            "CAPACITY_UNAVAILABLE",
        },
        409
      );
    }

    /*
     * --------------------------------------------------------
     * CREATE PENDING BOOKING
     * --------------------------------------------------------
     *
     * IMPORTANT:
     *
     * The database/RPC layer should also perform the
     * final capacity transaction if strict concurrent
     * booking protection is required.
     *
     * The Edge Function validation above protects normal
     * requests, while the database constraint/RPC protects
     * simultaneous requests.
     */

    const {
      data: bookingId,
      error: bookingError,
    } =
      await supabase.rpc(
        "create_pending_booking",
        {
          p_customer_name:
            customerName,
    
          p_customer_email:
            customerEmail,
    
          p_customer_phone:
            customerPhone,
    
          p_booking_date:
            bookingDate,
    
          p_booking_time:
            bookingTime,
    
          p_party_size:
            partySize,
    
          p_notes:
            notes || null,
        }
      );
    
    if (
      bookingError ||
      !bookingId
    ) {
      console.error(
        "Booking RPC error:",
        bookingError
      );
    
      const message =
        bookingError?.message ??
        "";
    
      if (
        message.includes(
          "SHORT_NOTICE"
        )
      ) {
        return jsonResponse(
          {
            error:
              "For bookings within the next 2 hours, please contact the café directly.",
            code:
              "SHORT_NOTICE",
          },
          400
        );
      }
    
      if (
        message.includes(
          "CAPACITY_UNAVAILABLE"
        )
      ) {
        return jsonResponse(
          {
            error:
              "Unfortunately, that time is no longer available for your group. Please choose another time or contact the café directly.",
            code:
              "CAPACITY_UNAVAILABLE",
          },
          409
        );
      }
    
      if (
        message.includes(
          "INVALID_BOOKING_SLOT"
        )
      ) {
        return jsonResponse(
          {
            error:
              "Please select one of the available booking times.",
          },
          400
        );
      }
    
      return jsonResponse(
        {
          error:
            "We couldn't submit your booking request. Please try again.",
        },
        500
      );
    }

    /*
     * --------------------------------------------------------
     * CUSTOMER EMAIL
     * --------------------------------------------------------
     */

    try {
      const readableDate =
        new Date(
          `${bookingDate}T12:00:00Z`
        ).toLocaleDateString(
          "en-GB",
          {
            weekday:
              "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        );

      const readableTime =
        new Date(
          `1970-01-01T${bookingTime}:00`
        ).toLocaleTimeString(
          "en-GB",
          {
            hour: "numeric",
            minute: "2-digit",
          }
        );

      await sendEmail({
        to:
          customerEmail,

        subject:
          "Cafe Two Shades — booking request received",

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
            <h2>Booking request received</h2>

            <p>
              Hello ${escapeHtml(
                customerName
              )},
            </p>

            <p>
              Thank you for your booking request
              with Cafe Two Shades.
            </p>

            <p>
              <strong>Date:</strong>
              ${escapeHtml(
                readableDate
              )}<br>

              <strong>Time:</strong>
              ${escapeHtml(
                readableTime
              )}<br>

              <strong>Guests:</strong>
              ${partySize}
            </p>

            <p>
              Your request is currently
              <strong>pending approval</strong>.
              We will contact you at this email
              address once the café has reviewed
              your request.
            </p>

            ${
              notes
                ? `
                  <p>
                    <strong>Your notes:</strong><br>
                    ${escapeHtml(
                      notes
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
              Cafe Two Shades
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      /*
       * Do NOT delete the booking just because
       * the confirmation email failed.
       *
       * The admin can still see the booking and
       * the customer can contact the café.
       */
      console.error(
        "Customer email failed:",
        emailError
      );
    }

    return jsonResponse({
      success: true,
      bookingId,
      status:
        "pending",
    });
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        error:
          "Unable to submit your booking request.",
      },
      500
    );
  }
});