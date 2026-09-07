import { type FormEvent, useEffect, useState, } from "react";
import { createGoogleReview, deleteGoogleReview, getGoogleReviewsForAdmin, type GoogleReview, updateGoogleReview, } from "../../services/googleReviewsService";
import { approveCustomerPhoto, deleteCustomerPhoto, getCustomerPhotoUrl, getCustomerPhotosForAdmin, rejectCustomerPhoto, type CustomerPhoto, } from "../../services/customerPhotoService";
  
export default function HomepageContentManagement() {
    return (
      <div className="space-y-12">
        <GoogleReviewsAdmin /> <CustomerPhotosAdmin />
      </div>
    );
  }
  
  /* ============================================================
     GOOGLE REVIEWS
     ============================================================ */
  
  function GoogleReviewsAdmin() {
    const [ reviews, setReviews, ] = useState<GoogleReview[]>([]);
    const [ loading, setLoading, ] = useState(true);
    const [ error, setError, ] = useState("");
    const [ message, setMessage, ] = useState("");
  
    async function loadReviews() {
      setLoading(true);
      setError("");
  
      try {
        setReviews(
          await getGoogleReviewsForAdmin()
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load reviews."
        );
      } finally {
        setLoading(false);
      }
    }
  
    useEffect(() => { void loadReviews(); }, []);
  
    async function handleCreate(
      review: {
        reviewer_name: string;
        review_text: string;
        rating: number;
        display_order: number;
      }
    ) {
      setError("");
      setMessage("");
  
      try {
        await createGoogleReview( review );
        setMessage( "Review added successfully." );
        await loadReviews();
      } catch (createError) {
        setError(
          createError instanceof Error
            ? createError.message
            : "Unable to add review."
        );
  
        throw createError;
      }
    }
  
    async function handleUpdate(
      id: string,
      updates: Partial<GoogleReview>
    ) {
      setError("");
      setMessage("");
  
      try {
        await updateGoogleReview( id, updates );
        setMessage( "Review updated." );
        await loadReviews();
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "Unable to update review."
        );
      }
    }
  
    async function handleDelete(
      id: string
    ) {
      if (!window.confirm( "Delete this review permanently?" )) {
        return;
      }
  
      setError("");
      setMessage("");
  
      try {
        await deleteGoogleReview( id );
  
        setMessage( "Review deleted." );
  
        await loadReviews();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete review."
        );
      }
    }
  
    return (
      <section>
        <div>
          <h2 className="font-serif text-3xl text-[#171512]">
            Google Reviews
          </h2>
  
          <p className="mt-2 text-sm text-[#6b645b]">
            Add and manage the reviews displayed
            on the homepage.
          </p>
        </div>
  
        {(error || message) && (
          <div className="mt-5">
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" >
                {error}
              </p>
            )}
  
            {message && (
              <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800" >
                {message}
              </p>
            )}
          </div>
        )}
  
        <ReviewForm onSubmit={handleCreate} />

        {loading ? (
          <p className="mt-6 text-sm text-[#6b645b]">
            Loading reviews...
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-[#6b645b]"> No reviews have been added yet. </p>
            ) : (
              reviews.map(
                (review) => (
                  <ReviewEditor
                    key={review.id}
                    review={review}
                    onUpdate={ handleUpdate }
                    onDelete={ handleDelete }
                  />
                )
              )
            )}
          </div>
        )}
      </section>
    );
  }
  
  /* ============================================================
     REVIEW FORM
     ============================================================ */
  
  function ReviewForm({
    onSubmit,
  }: {
    onSubmit: (
      review: {
        reviewer_name: string;
        review_text: string;
        rating: number;
        display_order: number;
      }
    ) => Promise<void>;
  }) {
    const [ name, setName, ] = useState("");
    const [ text, setText, ] = useState("");
    const [ rating, setRating, ] = useState(5);
    const [ order, setOrder, ] = useState(0);
    const [ submitting, setSubmitting, ] = useState(false);
  
    async function submit(
      event: FormEvent
    ) {
      event.preventDefault();
      if ( !name.trim() || !text.trim()) {
        return;
      }
  
      setSubmitting(true);
  
      try {
        await onSubmit({
          reviewer_name: name.trim(),
          review_text: text.trim(),
          rating,
          display_order: order,
        });
  
        setName("");
        setText("");
        setRating(5);
        setOrder(0);
      } finally {
        setSubmitting(false);
      }
    }
  
    return (
      <form
        onSubmit={submit} className="mt-6 rounded-xl border border-[#e1d9cc] bg-white p-6" >
        <h3 className="font-serif text-xl"> Add review </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <AdminInput label="Reviewer name" value={name} onChange={setName} required />
  
          <label>
            <span className="text-xs font-medium text-[#6b645b]"> Rating </span>
            <select
              value={rating}
              onChange={(event) =>
                setRating( Number(event.target.value) )
              }
              className="mt-1 block w-full rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm" >
              {[5, 4, 3, 2, 1].map(
                (value) => (<option key={value} value={value} > {value} / 5 </option>)
              )}
            </select>
          </label>
        </div>
  
        <label className="mt-4 block">
        <span className="text-xs font-medium text-[#6b645b]"> Review </span>
  
        <textarea value={text} required rows={5} onChange=
            {(event) => setText(event.target.value)}
            className="mt-1 block w-full resize-y rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a6a22] focus:ring-2 focus:ring-[#8a6a22]/20"
          />
        </label>
  
        <label className="mt-4 block max-w-xs">
          <span className="text-xs font-medium text-[#6b645b]"> Display order </span>
          <input type="number" min={0} value={order} onChange=
          {(event) => setOrder( Number( event.target.value ) )}
            className="mt-1 block w-full rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm"
          />
        </label>
  
        <button type="submit"
          disabled={submitting} className="mt-5 rounded-lg bg-[#171512] px-5 py-3 text-sm text-white disabled:opacity-50" >
          {submitting ? "Adding..." : "Add review"}
        </button>
      </form>
    );
  }
  
  
  /* ============================================================
     REVIEW EDITOR
     ============================================================ */
  
  function ReviewEditor({
    review,
    onUpdate,
    onDelete,
  }: {
    review: GoogleReview;
    onUpdate: (
      id: string,
      updates: Partial<GoogleReview>
    ) => Promise<void>;
    onDelete: (
      id: string
    ) => Promise<void>;
  }) {
    const [ name, setName, ] = useState( review.reviewer_name );
    const [ text, setText, ] = useState( review.review_text );
    const [ rating, setRating, ] = useState( review.rating );
    const [ order, setOrder, ] = useState( review.display_order );
    const [ saving, setSaving, ] = useState(false);
  
    async function save() {
      setSaving(true);
      try {
        await onUpdate(
          review.id,
          {
            reviewer_name: name,
            review_text: text,
            rating,
            display_order: order,
          }
        );
      } finally {
        setSaving(false);
      }
    }
  
    return (
      <article className="rounded-xl border border-[#e1d9cc] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <AdminInput label="Reviewer name" value={name} onChange={setName} />
  
          <label>
            <span className="text-xs font-medium text-[#6b645b]"> Rating </span>
  
            <select value={rating} onChange={(event) => 
            setRating(
                  Number(
                    event.target.value
                  )
                )
              }
              className="mt-1 block w-full rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map(
                (value) => (
                  <option key={value} value={value} > {value} / 5 </option>
                )
              )}
            </select>
          </label>
        </div>
  
        <textarea
          value={text}
          rows={4}
          onChange={(event) =>
            setText(
              event.target.value
            )
          }
          className="mt-4 block w-full resize-y rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm"
        />
  
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[#6b645b]"> Order
            <input type="number" min={0} value={order}
             onChange={(event) =>
                setOrder( Number( event.target.value) )
             }
              className="w-20 rounded-md border border-[#d7cfc2] px-2 py-1"
            />
          </label>
  
          <button type="button"
            onClick={() =>
              void onUpdate(
                review.id,
                { is_visible: !review.is_visible, }
              )
            }
            className="rounded-lg border border-[#d7cfc2] px-4 py-2 text-xs"
          >
            {review.is_visible ? "Hide" : "Show"}
          </button>
  
          <button type="button" disabled={saving}
            onClick={ () => void save() }
            className="rounded-lg bg-[#171512] px-4 py-2 text-xs text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
  
          <button type="button"
            onClick={() => void onDelete( review.id )}
            className="rounded-lg border border-red-200 px-4 py-2 text-xs text-red-700" > Delete
          </button>
        </div>
      </article>
    );
  }
  
  
  /* ============================================================
     CUSTOMER PHOTOS
     ============================================================ */
  
  function CustomerPhotosAdmin() {
    const [ photos, setPhotos, ] = useState<CustomerPhoto[]>([]);
    const [ loading, setLoading, ] = useState(true);
    const [ error, setError, ] = useState("");
    const [ message, setMessage, ] = useState("");
  
    async function loadPhotos() {
      setLoading(true);
      setError("");
  
      try {
        setPhotos(
          await getCustomerPhotosForAdmin()
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load photo submissions."
        );
      } finally {
        setLoading(false);
      }
    }
  
    useEffect(() => {
      void loadPhotos();
    }, []);
  
    const approvedCount =
      photos.filter((photo) => photo.status === "approved").length;
  
    const pendingPhotos =
      photos.filter((photo) => photo.status === "pending");
  
    async function handleApprove(
      id: string
    ) {
      setError("");
      setMessage("");
  
      try {
        await approveCustomerPhoto(id);
        setMessage("Photo approved.");
        await loadPhotos();
      } catch (approveError) {
        setError(
          approveError instanceof Error
            ? approveError.message
            : "Unable to approve photo."
        );
      }
    }
  
    async function handleReject(
      id: string
    ) {
      if ( !window.confirm("Reject and permanently delete this photo?") ) {
        return;
      }
  
      setError("");
      setMessage("");
  
      try {
        await rejectCustomerPhoto(id);
        setMessage("Photo rejected.");
        await loadPhotos();
      } catch (rejectError) {
        setError(
          rejectError instanceof Error
         ? rejectError.message : "Unable to reject photo."
        );
      }
    }
  
    async function handleDelete(
      id: string
    ) {
      if (!window.confirm( "Delete this photo permanently?"))
        { return; }
  
      setError("");
      setMessage("");
  
      try {
        await deleteCustomerPhoto(id);
        setMessage("Photo deleted.");
        await loadPhotos();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete photo."
        );
      }
    }
  
    return (
      <section>
        <div>
          <h2 className="font-serif text-3xl text-[#171512]">
            Two Shades Through Your Lens
          </h2>
  
          <p className="mt-2 text-sm text-[#6b645b]">
            Review customer-submitted photos
            before they appear publicly.
          </p>
        </div>
  
        <div className="mt-5 flex flex-wrap gap-3">
          <Stat label="Approved" value={`${approvedCount} / 40`} />
          <Stat label="Pending" value={`${pendingPhotos.length}`} />
        </div>
  
        {approvedCount >= 40 && (
          <div
            role="alert"
            className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            The gallery is full. Remove an
            approved photo before approving
            another submission.
          </div>
        )}
  
        {(error || message) && (
          <div className="mt-5">
            {error && (
              <p
                role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" > {error}
              </p>
            )}
  
            {message && (
              <p
                role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800" > {message}
              </p>
            )}
          </div>
        )}
  
        {loading ? (
          <p className="mt-6 text-sm text-[#6b645b]">
            Loading photo submissions...
          </p>
        ) : (
          <div className="mt-6">
            {photos.length === 0 ? (
              <p className="text-sm text-[#6b645b]">
                No photo submissions yet.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((photo) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      galleryFull={ approvedCount >= 40 }
                      onApprove={ handleApprove }
                      onReject={ handleReject }
                      onDelete={ handleDelete }
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}
      </section>
    );
  }
  
  
  /* ============================================================
     PHOTO CARD
     ============================================================ */
  
  function PhotoCard({
    photo,
    galleryFull,
    onApprove,
    onReject,
    onDelete,
  }: {
    photo: CustomerPhoto;
    galleryFull: boolean;
    onApprove: (
      id: string
    ) => Promise<void>;
    onReject: (
      id: string
    ) => Promise<void>;
    onDelete: (
      id: string
    ) => Promise<void>;
  }) {
    return (
      <article className="overflow-hidden rounded-xl border border-[#e1d9cc] bg-white">
        <img src={getCustomerPhotoUrl(photo.image_path)}
          alt="Customer submission" className="aspect-square w-full object-cover" loading="lazy"
        />
  
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                photo.status === "approved" ? "bg-green-50 text-green-800" : photo.status === "pending" 
                ? "bg-amber-50 text-amber-800"
                : "bg-red-50 text-red-800"
              }`}
            > {photo.status}
            </span>
  
            <span className="text-xs text-[#7a736a]">
              {new Date(photo.submitted_at).toLocaleDateString()}
            </span>
          </div>
  
          <div className="mt-4 flex flex-wrap gap-2">
            {photo.status ===
              "pending" && (
              <>
                {!galleryFull && (
                  <button
                    type="button"
                    onClick={() =>
                      void onApprove(photo.id)
                    }
                    className="rounded-lg bg-[#171512] px-4 py-2 text-xs text-white" > Approve
                  </button>
                )}
  
                <button type="button" onClick={() =>
                    void onReject( photo.id ) } className="rounded-lg border border-red-200 px-4 py-2 text-xs text-red-700" > Reject 
                </button>
                </>
            )}
  
            {photo.status === "approved" && (
              <button type="button"
                onClick={() =>
                  void onDelete(photo.id)
                }
                className="rounded-lg border border-red-200 px-4 py-2 text-xs text-red-700" > Remove
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }
  
  
  /* ============================================================
     SMALL COMPONENTS
     ============================================================ */
  
  function AdminInput({ label, value, onChange, required = false, }: {
    label: string;
    value: string;
    onChange: ( value: string ) => void;
    required?: boolean;
  }) {
    return (
      <label className="block">
        <span className="text-xs font-medium text-[#6b645b]"> {label} </span>
  
        <input
          value={value}
          required={required}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="mt-1 block w-full rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a6a22] focus:ring-2 focus:ring-[#8a6a22]/20"
        />
      </label>
    );
  }
  
  
  function Stat({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) {
    return (
      <div className="rounded-lg border border-[#e1d9cc] bg-[#faf8f4] px-4 py-3">
        <p className="text-xs text-[#7a736a]">
          {label}
        </p>
  
        <p className="mt-1 font-serif text-xl text-[#171512]">
          {value}
        </p>
      </div>
    );
  }