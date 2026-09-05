import {
    type FormEvent,
    useRef,
    useState,
  } from "react";
  
  import {
    submitCustomerPhoto,
  } from "../../services/customerPhotoService";
  
  export default function CustomerPhotoSubmission() {
    const [
      file,
      setFile,
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
  
    const inputRef =
      useRef<HTMLInputElement>(
        null
      );
  
    async function handleSubmit(
      event: FormEvent
    ) {
      event.preventDefault();
  
      setMessage("");
      setError("");
  
      if (!file) {
        setError(
          "Please choose a photo first."
        );
        return;
      }
  
      setSubmitting(true);
  
      try {
        await submitCustomerPhoto(
          file
        );
  
        setMessage(
          "Thank you! Your photo has been submitted for review."
        );
  
        setFile(null);
  
        if (inputRef.current) {
          inputRef.current.value =
            "";
        }
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to submit your photo."
        );
      } finally {
        setSubmitting(false);
      }
    }
  
    return (
      <div className="rounded-xl border border-[#e5ded3] bg-[#faf8f4] p-6">
        <div className="max-w-xl">
          <h3 className="font-serif text-2xl">
            Share your Two Shades moment
          </h3>
  
          <p className="mt-2 text-sm leading-6 text-[#6b645b]">
            Have a photo from your visit?
            You can submit it anonymously
            for a chance to be featured in
            our customer gallery.
          </p>
  
          <p className="mt-2 text-xs leading-5 text-[#7a736a]">
            We do not ask for your name,
            email address or other personal
            information. Every submission
            is reviewed by the cafe before
            it appears on the website.
          </p>
  
          <form
            onSubmit={handleSubmit}
            className="mt-5"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setFile(
                  event.target.files?.[0] ??
                    null
                )
              }
              className="block w-full text-sm"
            />
  
            {error && (
              <p
                role="alert"
                className="mt-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
  
            {message && (
              <p
                role="status"
                className="mt-3 text-sm text-green-800"
              >
                {message}
              </p>
            )}
  
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 rounded-lg bg-[#171512] px-5 py-3 text-sm text-white disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit photo"}
            </button>
          </form>
        </div>
      </div>
    );
  }