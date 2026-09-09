import { useEffect, useState } from "react";
import {
  type Season,
  type SeasonalSpecial,
  getSeasonalSpecials,
  createSeasonalSpecial,
  updateSeasonalSpecial,
  activateSeasonalSpecial,
  deactivateSeasonalSpecial,
  deleteSeasonalSpecial,
  uploadSeasonalSpecialImage,
  getSeasonalSpecialImageUrl,
} from "../../services/seasonalSpecialService";

const seasons: Season[] = ["spring","summer","autumn","winter",];

const emptyForm = {
  name: "",
  description: "",
  season: "summer" as Season,
  display_order: 0,
  image_path: null as string | null,
};

export default function SeasonalSpecialAdmin() {
  const [specials, setSpecials] = useState<SeasonalSpecial[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSpecials() {
    try {
      setLoading(true);
      setError(null);

      const data = await getSeasonalSpecials();
      setSpecials(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load seasonal specials."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSpecials();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
  }

  function startEdit(special: SeasonalSpecial) {
    setEditingId(special.id);
    setForm({
      name: special.name,
      description: special.description,
      season: special.season,
      display_order: special.display_order,
      image_path: special.image_path,
    });
    setImageFile(null);
    setMessage(null);
    setError(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim() || !form.description.trim()) {
      setError("Name and description are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      let imagePath = form.image_path;

      if (imageFile) {
        imagePath = await uploadSeasonalSpecialImage(imageFile);
      }

      if (editingId) {
        await updateSeasonalSpecial(editingId, {
          name: form.name,
          description: form.description,
          season: form.season,
          display_order: form.display_order,
          image_path: imagePath,
        });

        setMessage("Seasonal special updated successfully.");
      } else {
        await createSeasonalSpecial({
          name: form.name,
          description: form.description,
          season: form.season,
          display_order: form.display_order,
          image_path: imagePath,
        });

        setMessage(
          "Seasonal special created. Activate it when you are ready to display it."
        );
      }

      resetForm();
      await loadSpecials();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the seasonal special."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(id: string) {
    try {
      setActionId(id);
      setError(null);
      setMessage(null);

      await activateSeasonalSpecial(id);

      setMessage("Seasonal special is now active.");
      await loadSpecials();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to activate the seasonal special."
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      setActionId(id);
      setError(null);
      setMessage(null);

      await deactivateSeasonalSpecial(id);

      setMessage("Seasonal special has been deactivated.");
      await loadSpecials();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to deactivate the seasonal special."
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(special: SeasonalSpecial) {
    const confirmed = window.confirm(
      `Delete "${special.name}"?\n\nThis will also remove its stored image.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(special.id);
      setError(null);
      setMessage(null);

      await deleteSeasonalSpecial(special.id);

      if (editingId === special.id) {
        resetForm();
      }

      setMessage("Seasonal special deleted.");
      await loadSpecials();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the seasonal special."
      );
    } finally {
      setActionId(null);
    }
  }

  const currentImageUrl = getSeasonalSpecialImageUrl(
    form.image_path
  );

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-8 text-[#171512] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#8c6a19]">
            Homepage
          </p>

          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
            Seasonal Special
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#625e57]">
            Manage the seasonal special shown on the homepage.
            Only one special can be active at a time.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <section className="mb-10 rounded-2xl border border-[#ddd6ca] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {editingId
                  ? "Edit seasonal special"
                  : "Add seasonal special"}
              </h2>

              <p className="mt-1 text-sm text-[#6d685f]">
                Add one special for the selected season.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#d8d1c5] px-4 py-2 text-sm font-medium transition hover:bg-[#f5f1e9]"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="special-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Name
                </label>

                <input
                  id="special-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Mango Lassi"
                  className="w-full rounded-lg border border-[#d8d1c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8c6a19] focus:ring-2 focus:ring-[#8c6a19]/10"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="special-season"
                  className="mb-2 block text-sm font-medium"
                >
                  Season
                </label>

                <select
                  id="special-season"
                  value={form.season}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      season: event.target.value as Season,
                    }))
                  }
                  className="w-full rounded-lg border border-[#d8d1c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8c6a19] focus:ring-2 focus:ring-[#8c6a19]/10"
                >
                  {seasons.map((season) => (
                    <option
                      key={season}
                      value={season}
                    >
                      {season.charAt(0).toUpperCase() +
                        season.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="special-description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="special-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Short description shown on the homepage."
                className="w-full resize-y rounded-lg border border-[#d8d1c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8c6a19] focus:ring-2 focus:ring-[#8c6a19]/10"
                required
              />
            </div>

            <div>
              <label htmlFor="special-image" className="mb-2 block text-sm font-medium" > Image </label>

              <input id="special-image" type="file" accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setImageFile( event.target.files?.[0] ?? null )
                }
                className="block w-full text-sm"
              />

              <p className="mt-2 text-xs text-[#777168]"> JPG, PNG or WebP recommended. </p>

              {currentImageUrl && !imageFile && (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#ddd6ca]">
                  <img
                    src={currentImageUrl}
                    alt={form.name || "Seasonal special"}
                    className="h-56 w-full object-cover"
                  />
                </div>
              )}

              {imageFile && (
                <p className="mt-3 text-sm text-[#625e57]">
                  New image selected: {imageFile.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="special-order" className="mb-2 block text-sm font-medium" > Display order </label>

              <input id="special-order" type="number" min="0" value={form.display_order}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    display_order:
                      Number(event.target.value) || 0,
                  }))
                }
                className="w-full rounded-lg border border-[#d8d1c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8c6a19] focus:ring-2 focus:ring-[#8c6a19]/10 md:max-w-xs"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving}
                className="rounded-lg bg-[#171512] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#2b2823] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId
                    ? "Save changes" : "Create special"}
              </button>

              {editingId && (
                <button type="button" onClick={resetForm} disabled={saving}
                  className="rounded-lg border border-[#d8d1c5] px-5 py-3 text-sm font-medium transition hover:bg-[#f5f1e9]"
                > Clear
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Existing specials
            </h2>

            <p className="mt-1 text-sm text-[#6d685f]">
              Activate one special to display it on the
              homepage.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#ddd6ca] bg-white p-8 text-center text-sm text-[#6d685f]">
              Loading seasonal specials...
            </div>
          ) : specials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cfc7ba] bg-white p-8 text-center">
              <p className="font-medium"> No seasonal specials yet. </p>
              <p className="mt-1 text-sm text-[#6d685f]"> Create the first one above. </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {specials.map((special) => {
                const imageUrl =
                  getSeasonalSpecialImageUrl(
                    special.image_path
                  );

                const busy = actionId === special.id;

                return (
                  <article key={special.id}
                    className="overflow-hidden rounded-2xl border border-[#ddd6ca] bg-white shadow-sm"
                  >
                    {imageUrl ? ( <img src={imageUrl} alt={special.name} className="h-56 w-full object-cover" />): 
                    (
                      <div className="flex h-56 items-center justify-center bg-[#eee9df] text-sm text-[#777168]">
                        No image
                      </div>
                    )}

                    <div className="p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#f1e8cf] px-3 py-1 text-xs font-medium capitalize text-[#705512]">
                          {special.season}
                        </span>

                        {special.is_active && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold">
                        {special.name}
                      </h3>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#625e57]">
                        {special.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <button type="button"
                          onClick={() =>
                            startEdit(special)
                          }
                          disabled={busy}
                          className="rounded-lg border border-[#d8d1c5] px-4 py-2 text-sm font-medium transition hover:bg-[#f5f1e9] disabled:opacity-50"
                        > Edit
                        </button>

                        {special.is_active ? (
                          <button type="button"
                            onClick={() =>
                              handleDeactivate( special.id )
                            }
                            disabled={busy}
                            className="rounded-lg border border-[#d8d1c5] px-4 py-2 text-sm font-medium transition hover:bg-[#f5f1e9] disabled:opacity-50"
                          >
                            {busy ? "Working..." : "Deactivate"}
                          </button>
                        ) : (
                          <button type="button"
                            onClick={() =>
                              handleActivate( special.id )
                            }
                            disabled={busy}
                            className="rounded-lg bg-[#171512] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2b2823] disabled:opacity-50"
                          >
                            {busy ? "Activating..." : "Activate"}
                          </button>
                        )}

                        <button type="button"
                          onClick={() =>
                            handleDelete(special)
                          }
                          disabled={busy}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        > Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}