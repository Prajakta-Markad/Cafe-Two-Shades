import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, OPTIONS",
};

const MINIMUM_NOTICE_MINUTES = 120;

interface BookingSettings {
  maximum_capacity: number;
  maximum_party_size: number;
  booking_duration_minutes: number;
  slot_interval_minutes: number;
  opening_time: string;
  closing_time: string;
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

function londonParts(
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
          part.type !== "literal"
      )
      .map((part) => [
        part.type,
        part.value,
      ])
  );
}

function dateString(
  parts: Record<string, string>
) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function timeToMinutes(
  value: string
) {
  const [
    hours,
    minutes,
  ] = value
    .slice(0, 5)
    .split(":")
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function isValidDate(
  value: string
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const parsed = new Date(
    `${value}T12:00:00Z`
  );

  return (
    !Number.isNaN(
      parsed.getTime()
    ) &&
    parsed
      .toISOString()
      .slice(0, 10) === value
  );
}

function addOneMonth(
  value: string
) {
  const date = new Date(
    `${value}T12:00:00Z`
  );

  date.setUTCMonth(
    date.getUTCMonth() + 1
  );

  return date
    .toISOString()
    .slice(0, 10);
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
    request.method !== "GET"
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
    const url =
      new URL(request.url);

    const bookingDate =
      url.searchParams.get(
        "date"
      );

    const partySize =
      Number(
        url.searchParams.get(
          "partySize"
        )
      );

    if (
      !bookingDate ||
      !isValidDate(
        bookingDate
      )
    ) {
      return response(
        {
          error:
            "Please provide a valid date.",
        },
        400
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

      return response(
        {
          error:
            "Booking availability is temporarily unavailable.",
        },
        500
      );
    }

    if (
      !Number.isInteger(
        partySize
      ) ||
      partySize < 1 ||
      partySize >
        settings.maximum_party_size
    ) {
      return response(
        {
          error:
            "Invalid party size.",
        },
        400
      );
    }

    const now =
      new Date();

    const nowLondon =
      londonParts(now);

    const today =
      dateString(
        nowLondon
      );

    const maximumDate =
      addOneMonth(today);

    if (
      bookingDate < today ||
      bookingDate >
        maximumDate
    ) {
      return response(
        {
          error:
            "Bookings are only available within the permitted booking window.",
        },
        400
      );
    }

    const {
      data: bookings,
      error:
        bookingsError,
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
          bookingDate
        )
        .eq(
          "status",
          "approved"
        );

    if (bookingsError) {
      console.error(
        bookingsError
      );

      return response(
        {
          error:
            "Unable to load availability.",
        },
        500
      );
    }

    const opening =
      timeToMinutes(
        settings.opening_time
      );

    const closing =
      timeToMinutes(
        settings.closing_time
      );

    const latestStart =
      closing -
      settings.booking_duration_minutes;

    const slots: Array<{
      time: string;
      available: boolean;
    }> = [];

    const currentLondonMinutes =
      Number(
        nowLondon.hour
      ) *
        60 +
      Number(
        nowLondon.minute
      );

    for (
      let start = opening;
      start <= latestStart;
      start +=
        settings.slot_interval_minutes
    ) {
      const hours =
        Math.floor(
          start / 60
        );

      const minutes =
        start % 60;

      const time =
        `${String(hours).padStart(
          2,
          "0"
        )}:${String(minutes).padStart(
          2,
          "0"
        )}`;

      /*
       * Same-day bookings require at least
       * two hours' notice.
       */
      if (
        bookingDate === today &&
        start <
          currentLondonMinutes +
            MINIMUM_NOTICE_MINUTES
      ) {
        slots.push({
          time,
          available: false,
        });

        continue;
      }

      const end =
        start +
        settings.booking_duration_minutes;

      let occupied = 0;

      for (
        const booking of
        bookings ?? []
      ) {
        const bookingStart =
          timeToMinutes(
            booking.booking_time
          );

        const bookingEnd =
          bookingStart +
          settings.booking_duration_minutes;

        const overlaps =
          bookingStart <
            end &&
          bookingEnd >
            start;

        if (overlaps) {
          occupied +=
            booking.party_size;
        }
      }

      slots.push({
        time,
        available:
          occupied +
            partySize <=
          settings.maximum_capacity,
      });
    }

    return response({
      date: bookingDate,
      slots,
      maximumPartySize:
        settings.maximum_party_size,
    });
  } catch (error) {
    console.error(error);

    return response(
      {
        error:
          "Unable to load booking availability.",
      },
      500
    );
  }
});