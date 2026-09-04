export interface CustomerPhoto {
    id: string;
    url: string;
    mimeType: string;
  }
  
  const SUPABASE_URL =
    import.meta.env
      .VITE_SUPABASE_URL;
  
  const SUPABASE_ANON_KEY =
    import.meta.env
      .VITE_SUPABASE_ANON_KEY;
  
  
  export async function submitCustomerPhoto(
    file: File
  ): Promise<void> {
    const formData =
      new FormData();
  
    formData.append(
      "file",
      file
    );
  
    const response =
      await fetch(
        `${SUPABASE_URL}/functions/v1/submit-photo`,
        {
          method: "POST",
  
          headers: {
            apikey:
              SUPABASE_ANON_KEY,
          },
  
          body:
            formData,
        }
      );
  
    const data =
      await response.json();
  
    if (
      !response.ok
    ) {
      throw new Error(
        data?.error ??
          "Unable to submit your photo."
      );
    }
  }
  
  
  export async function getApprovedCustomerPhotos(): Promise<
    CustomerPhoto[]
  > {
    const response =
      await fetch(
        `${SUPABASE_URL}/functions/v1/get-approved-photos`,
        {
          method: "GET",
  
          headers: {
            apikey:
              SUPABASE_ANON_KEY,
          },
        }
      );
  
    const data =
      await response.json();
  
    if (
      !response.ok
    ) {
      throw new Error(
        data?.error ??
          "Unable to load customer photos."
      );
    }
  
    return data.photos ?? [];
  }