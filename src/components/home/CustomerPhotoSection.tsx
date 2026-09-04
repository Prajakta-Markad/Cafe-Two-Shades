import {
    type ChangeEvent,
    useEffect,
    useState,
  } from "react";
  
  import {
    getApprovedCustomerPhotos,
    submitCustomerPhoto,
    type CustomerPhoto,
  } from "../../services/photoService";
  
  const MAX_FILE_SIZE =
    5 * 1024 * 1024;
  
  const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  
  export default function CustomerPhotoSection() {
    const [
      photos,
      setPhotos,
    ] = useState<CustomerPhoto[]>(
      []
    );
  
    const [
      loading,
      setLoading,
    ] = useState(true);
  
    const [
      selectedFile,
      setSelectedFile,
    ] = useState<File | null>(
      null
    );
  
    const [
      submitting,
      setSubmitting,
    ] = useState(false);
  
    const [
      message,
      setMessage,
    ] = useState("");
  
    const [
      error,
      setError,
    ] = useState("");
  
    const [
      currentIndex,
      setCurrentIndex,
    ] = useState(0);
  
    useEffect(() => {
      let mounted = true;
  
      async function loadPhotos() {
        try {
          const result =
            await getApprovedCustomerPhotos();
  
          if (mounted) {
            setPhotos(result);
          }
        } catch {
          if (mounted) {
            setError(
              "Customer photos are temporarily unavailable."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
  
      loadPhotos();
  
      return () => {
        mounted = false;
      };
    }, []);
  
    function handleFileChange(
      event: ChangeEvent<HTMLInputElement>
    ) {
      setMessage("");
      setError("");
  
      const file =
        event.target.files?.[0];
  
      if (!file) {
        setSelectedFile(null);
        return;
      }
  
      if (
        !ACCEPTED_TYPES.includes(
          file.type
        )
      ) {
        setSelectedFile(null);
  
        setError(
          "Please choose a JPG, PNG or WebP image."
        );
  
        event.target.value = "";
  
        return;
      }
  
      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setSelectedFile(null);
  
        setError(
          "The image must be 5 MB or smaller."
        );
  
        event.target.value = "";
  
        return;
      }
  
      setSelectedFile(file);
    }
  
    async function handleSubmit() {
      if (
        !selectedFile ||
        submitting
      ) {
        return;
      }
  
      setSubmitting(true);
      setMessage("");
      setError("");
  
      try {
        await submitCustomerPhoto(
          selectedFile
        );
  
        setSelectedFile(null);
  
        const input =
          document.getElementById(
            "customer-photo"
          ) as HTMLInputElement | null;
  
        if (input) {
          input.value = "";
        }
  
        setMessage(
          "Thank you! Your photo has been submitted for review."
        );
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "We couldn't submit your photo. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    }
  
    function previousPhoto() {
      setCurrentIndex(
        (current) =>
          current === 0
            ? photos.length - 1
            : current - 1
      );
    }
  
    function nextPhoto() {
      setCurrentIndex(
        (current) =>
          current === photos.length - 1
            ? 0
            : current + 1
      );
    }
  
    return (
      <section
        id="two-shades-through-your-lens"
        className="bg-[#f6f1e8] px-6 py-20 sm:px-8 lg:px-12"
        aria-labelledby="customer-photos-heading"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#8a6a22]">
              From our customers
            </p>
  
            <h2
              id="customer-photos-heading"
              className="font-serif text-3xl text-[#171512] sm:text-4xl"
            >
              Two Shades Through Your Lens
            </h2>
  
            <p className="mt-5 text-base leading-7 text-[#5c554b]">
              Have a photo from your time at
              Cafe Two Shades? You can share it
              with us and, with our approval, it
              may appear here.
            </p>
          </div>
  
          {loading && (
            <div
              className="mt-12 flex min-h-72 items-center justify-center rounded-2xl bg-white"
              aria-live="polite"
            >
              <p className="text-sm text-[#6b645b]">
                Loading customer photos...
              </p>
            </div>
          )}
  
          {!loading &&
            photos.length > 0 && (
              <div className="relative mx-auto mt-12 max-w-4xl">
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="aspect-[4/3] sm:aspect-[16/9]">
                    <img
                      src={
                        photos[currentIndex].url
                      }
                      alt="Customer-submitted photo from Cafe Two Shades"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
  
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={previousPhoto}
                      aria-label="Previous customer photo"
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-[#171512] shadow-md transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8a6a22] focus:ring-offset-2"
                    >
                      <span aria-hidden="true">
                        ←
                      </span>
                    </button>
  
                    <button
                      type="button"
                      onClick={nextPhoto}
                      aria-label="Next customer photo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-[#171512] shadow-md transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8a6a22] focus:ring-offset-2"
                    >
                      <span aria-hidden="true">
                        →
                      </span>
                    </button>
  
                    <div
                      className="mt-4 flex justify-center gap-2"
                      aria-label={`Photo ${currentIndex + 1} of ${photos.length}`}
                    >
                      {photos.map(
                        (photo, index) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() =>
                              setCurrentIndex(
                                index
                              )
                            }
                            aria-label={`View customer photo ${index + 1}`}
                            aria-current={
                              index ===
                              currentIndex
                            }
                            className={`h-2 rounded-full transition-all ${
                              index ===
                              currentIndex
                                ? "w-6 bg-[#8a6a22]"
                                : "w-2 bg-[#c9c0b2]"
                            }`}
                          />
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
  
          {!loading &&
            photos.length === 0 &&
            !error && (
              <div className="mt-12 rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-[#6b645b]">
                  Be among the first to share a
                  moment from Cafe Two Shades.
                </p>
              </div>
            )}
  
          <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-[#ded6ca] bg-white p-6 sm:p-8">
            <h3 className="font-serif text-2xl text-[#171512]">
              Share your photo
            </h3>
  
            <p className="mt-2 text-sm leading-6 text-[#6b645b]">
              Upload one photo from your visit.
              We don't ask for your name, email,
              phone number or other personal
              information.
            </p>
  
            <label
              htmlFor="customer-photo"
              className="mt-6 block text-sm font-medium text-[#29251f]"
            >
              Choose an image
            </label>
  
            <input
              id="customer-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={submitting}
              className="mt-2 block w-full cursor-pointer rounded-lg border border-[#d7cfc2] bg-[#faf8f4] px-3 py-3 text-sm text-[#29251f] file:mr-4 file:rounded-md file:border-0 file:bg-[#171512] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#302b25] focus:outline-none focus:ring-2 focus:ring-[#8a6a22]"
            />
  
            <p className="mt-2 text-xs text-[#7a736a]">
              JPG, PNG or WebP · Maximum 5 MB
            </p>
  
            {selectedFile && (
              <p className="mt-3 text-sm text-[#4e483f]">
                Selected:{" "}
                <span className="font-medium">
                  {selectedFile.name}
                </span>
              </p>
            )}
  
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}
  
            {message && (
              <p
                role="status"
                className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                {message}
              </p>
            )}
  
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !selectedFile ||
                submitting
              }
              className="mt-6 w-full rounded-lg bg-[#171512] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#302b25] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#8a6a22] focus:ring-offset-2"
            >
              {submitting
                ? "Submitting..."
                : "Submit photo"}
            </button>
  
            <p className="mt-4 text-xs leading-5 text-[#7a736a]">
              Photos are reviewed by Cafe Two
              Shades before appearing on the
              website. Please only submit photos
              that you are happy for the cafe to
              display publicly.
            </p>
          </div>
        </div>
      </section>
    );
  }