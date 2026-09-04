import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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


/*
 * ------------------------------------------------------------
 * FILE SIGNATURE VALIDATION
 * ------------------------------------------------------------
 *
 * MIME type supplied by a browser is not trusted.
 *
 * We verify the actual file signature as well.
 */

async function detectImageType(
  file: File
): Promise<string | null> {
  const buffer =
    new Uint8Array(
      await file
        .slice(0, 16)
        .arrayBuffer()
    );

  /*
   * JPEG
   */
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  /*
   * PNG
   */
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  /*
   * WEBP
   *
   * RIFF....WEBP
   */
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}


function sanitiseFilename(
  filename: string
) {
  return filename
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    )
    .slice(0, 100);
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
     * SUPABASE CLIENT
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
            persistSession:
              false,
            autoRefreshToken:
              false,
          },
        }
      );


    /*
     * --------------------------------------------------------
     * REQUEST BODY
     * --------------------------------------------------------
     */

    const contentType =
      request.headers.get(
        "content-type"
      ) ?? "";

    if (
      !contentType
        .toLowerCase()
        .includes(
          "multipart/form-data"
        )
    ) {
      return response(
        {
          error:
            "Invalid upload format.",
        },
        400
      );
    }


    const formData =
      await request.formData();

    /*
     * IMPORTANT:
     *
     * We intentionally only accept ONE field:
     *
     * file
     *
     * No name, email, phone, message, account ID,
     * location or other customer information is collected.
     */

    const file =
      formData.get(
        "file"
      );


    if (
      !(file instanceof File)
    ) {
      return response(
        {
          error:
            "Please select an image.",
        },
        400
      );
    }


    /*
     * --------------------------------------------------------
     * FILE SIZE
     * --------------------------------------------------------
     */

    if (
      file.size <= 0
    ) {
      return response(
        {
          error:
            "The selected image is empty.",
        },
        400
      );
    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return response(
        {
          error:
            "Images must be 5 MB or smaller.",
        },
        413
      );
    }


    /*
     * --------------------------------------------------------
     * MIME TYPE
     * --------------------------------------------------------
     */

    if (
      !ALLOWED_TYPES.has(
        file.type
      )
    ) {
      return response(
        {
          error:
            "Only JPG, PNG and WebP images are accepted.",
        },
        415
      );
    }


    /*
     * --------------------------------------------------------
     * ACTUAL FILE SIGNATURE
     * --------------------------------------------------------
     */

    const detectedType =
      await detectImageType(
        file
      );

    if (
      !detectedType ||
      detectedType !==
        file.type
    ) {
      return response(
        {
          error:
            "The uploaded file is not a valid image.",
        },
        415
      );
    }


    /*
     * --------------------------------------------------------
     * RANDOM STORAGE PATH
     * --------------------------------------------------------
     *
     * Never use the original filename as the storage path.
     */

    const submissionId =
      crypto.randomUUID();

    const safeFilename =
      sanitiseFilename(
        file.name ||
          "customer-photo"
      );

    const storagePath =
      `pending/${submissionId}-${safeFilename}`;


    /*
     * --------------------------------------------------------
     * STORAGE UPLOAD
     * --------------------------------------------------------
     */

    const {
      error:
        uploadError,
    } =
      await supabase.storage
        .from(
          "customer-submissions"
        )
        .upload(
          storagePath,
          file,
          {
            contentType:
              detectedType,

            cacheControl:
              "3600",

            upsert:
              false,
          }
        );


    if (
      uploadError
    ) {
      console.error(
        "Storage upload failed:",
        uploadError
      );

      return response(
        {
          error:
            "We couldn't upload that image. Please try again.",
        },
        500
      );
    }


    /*
     * --------------------------------------------------------
     * DATABASE RECORD
     * --------------------------------------------------------
     */

    const {
      error:
        insertError,
    } =
      await supabase
        .from(
          "photo_submissions"
        )
        .insert({
          id:
            submissionId,

          storage_path:
            storagePath,

          original_filename:
            safeFilename,

          mime_type:
            detectedType,

          file_size_bytes:
            file.size,

          status:
            "pending",
        });


    /*
     * If the database insert fails, remove the orphaned
     * storage object.
     */

    if (
      insertError
    ) {
      console.error(
        "Database insert failed:",
        insertError
      );

      await supabase.storage
        .from(
          "customer-submissions"
        )
        .remove([
          storagePath,
        ]);

      return response(
        {
          error:
            "We couldn't complete the image submission. Please try again.",
        },
        500
      );
    }


    /*
     * --------------------------------------------------------
     * SUCCESS
     * --------------------------------------------------------
     */

    return response(
      {
        success:
          true,

        message:
          "Thank you! Your photo has been submitted for review.",
      },
      201
    );

  } catch (error) {
    console.error(
      "Photo submission error:",
      error
    );

    return response(
      {
        error:
          "We couldn't submit your photo. Please try again.",
      },
      500
    );
  }
});