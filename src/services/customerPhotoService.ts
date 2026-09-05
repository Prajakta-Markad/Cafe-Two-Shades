import { supabase } from "../lib/supabase";

const PHOTO_BUCKET =
  "customer-photos";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export interface CustomerPhoto {
  id: string;
  image_path: string;
  status:
    | "pending"
    | "approved"
    | "rejected";
  display_order: number;
  submitted_at: string;
  reviewed_at: string | null;
}


/* ============================================================
   PUBLIC GALLERY
   ============================================================ */

   export async function getApprovedCustomerPhotos() {
    const {
      data,
      error,
    } = await supabase.rpc(
      "get_random_customer_photos",
      {
        requested_count: 10,
      }
    );
  
    if (error) {
      throw new Error(
        "Unable to load customer photos."
      );
    }
  
    return data ?? [];
  }


/* ============================================================
   ADMIN
   ============================================================ */

export async function getCustomerPhotosForAdmin() {
  const {
    data,
    error,
  } = await supabase
    .from("customer_photos")
    .select("*")
    .order(
      "status"
    )
    .order(
      "submitted_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      "Unable to load customer photo submissions."
    );
  }

  return (
    data as CustomerPhoto[]
  ) ?? [];
}


/* ============================================================
   ANONYMOUS SUBMISSION
   ============================================================ */

export async function submitCustomerPhoto(
  file: File
) {
  validatePhoto(file);

  const path =
    `${crypto.randomUUID()}.${getExtension(file)}`;

  const {
    error:
      uploadError,
  } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(
      path,
      file,
      {
        cacheControl:
          "31536000",
        contentType:
          file.type,
        upsert:
          false,
      }
    );

  if (uploadError) {
    throw new Error(
      "Unable to upload your photo. Please try again."
    );
  }

  const {
    error:
      databaseError,
  } = await supabase
    .from("customer_photos")
    .insert({
      image_path:
        path,

      status:
        "pending",
    });

  if (databaseError) {
    /*
     * If the database insert fails, clean up the
     * orphaned storage object.
     */
    await supabase.storage
      .from(PHOTO_BUCKET)
      .remove([path]);

    throw new Error(
      "Your photo could not be submitted. Please try again."
    );
  }
}


/* ============================================================
   MODERATION
   ============================================================ */

   export async function approveCustomerPhoto(
    id: string
  ) {
    const {
      data,
      error,
    } = await supabase.rpc(
      "approve_customer_photo",
      {
        photo_id: id,
      }
    );
  
    if (error) {
      throw new Error(
        "Unable to approve the photo."
      );
    }
  
    if (!data) {
      throw new Error(
        "The gallery is currently full. Remove an approved photo before approving another."
      );
    }
  }


export async function rejectCustomerPhoto(
  id: string
) {
  const {
    data,
    error:
      fetchError,
  } = await supabase
    .from("customer_photos")
    .select("image_path")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(
      "Unable to find the photo."
    );
  }

  const {
    error:
      updateError,
  } = await supabase
    .from("customer_photos")
    .update({
      status:
        "rejected",

      reviewed_at:
        new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    throw new Error(
      "Unable to reject the photo."
    );
  }

  if (data?.image_path) {
    await supabase.storage
      .from(PHOTO_BUCKET)
      .remove([
        data.image_path,
      ]);
  }
}


export async function deleteCustomerPhoto(
  id: string
) {
  const {
    data,
    error:
      fetchError,
  } = await supabase
    .from("customer_photos")
    .select("image_path")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(
      "Unable to find the photo."
    );
  }

  const {
    error:
      deleteError,
  } = await supabase
    .from("customer_photos")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(
      "Unable to delete the photo."
    );
  }

  if (data?.image_path) {
    await supabase.storage
      .from(PHOTO_BUCKET)
      .remove([
        data.image_path,
      ]);
  }
}


/* ============================================================
   IMAGE URL
   ============================================================ */

export function getCustomerPhotoUrl(
  imagePath: string
) {
  return supabase.storage
    .from(PHOTO_BUCKET)
    .getPublicUrl(
      imagePath
    ).data.publicUrl;
}


/* ============================================================
   VALIDATION
   ============================================================ */

function validatePhoto(
  file: File
) {
  if (
    !ALLOWED_TYPES.includes(
      file.type as typeof ALLOWED_TYPES[number]
    )
  ) {
    throw new Error(
      "Please upload a JPG, PNG or WebP image."
    );
  }

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      "Please keep the image under 5 MB."
    );
  }

  if (file.size <= 0) {
    throw new Error(
      "The selected image is empty."
    );
  }
}


function getExtension(
  file: File
) {
  switch (file.type) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return "jpg";
  }
}