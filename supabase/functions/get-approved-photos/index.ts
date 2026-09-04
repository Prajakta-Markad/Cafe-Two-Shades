import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, OPTIONS",
};

const MAX_PHOTOS = 24;

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
          "public, max-age=300, s-maxage=300",
      },
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
     * Only approved photos are retrieved.
     */

    const {
      data: photos,
      error:
        photosError,
    } =
      await supabase
        .from(
          "photo_submissions"
        )
        .select(
          `
            id,
            storage_path,
            mime_type
          `
        )
        .eq(
          "status",
          "approved"
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(
          MAX_PHOTOS
        );


    if (
      photosError
    ) {
      console.error(
        photosError
      );

      return response(
        {
          error:
            "Unable to load photos.",
        },
        500
      );
    }


    /*
     * Create temporary signed URLs.
     *
     * URLs expire after one hour.
     */

    const results = [];

    for (
      const photo of
      photos ?? []
    ) {
      const {
        data: signed,
        error:
          signedError,
      } =
        await supabase.storage
          .from(
            "customer-submissions"
          )
          .createSignedUrl(
            photo.storage_path,
            60 * 60
          );

      if (
        signedError ||
        !signed?.signedUrl
      ) {
        console.error(
          "Signed URL error:",
          signedError
        );

        continue;
      }

      results.push({
        id:
          photo.id,

        url:
          signed.signedUrl,

        mimeType:
          photo.mime_type,
      });
    }


    return response({
      photos:
        results,
    });

  } catch (error) {
    console.error(error);

    return response(
      {
        error:
          "Unable to load photos.",
      },
      500
    );
  }
});