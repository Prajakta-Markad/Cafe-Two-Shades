import {
    type FormEvent,
    useEffect,
    useState,
  } from "react";
  
  import {
    createSeasonalSpecial,
    deleteSeasonalSpecial,
    deactivateSeasonalSpecial,
    getSeasonalSpecialImageUrl,
    getSeasonalSpecials,
    type Season,
    type SeasonalSpecial,
    activateSeasonalSpecial,
    updateSeasonalSpecial,
    uploadSeasonalSpecialImage,
  } from "../../services/seasonalSpecialService";
  
  
  const seasons: {
    value: Season;
    label: string;
  }[] = [
    {
      value: "spring",
      label: "Spring",
    },
    {
      value: "summer",
      label: "Summer",
    },
    {
      value: "autumn",
      label: "Autumn",
    },
    {
      value: "winter",
      label: "Winter",
    },
  ];
  
  
  export default function SeasonalSpecialManagement() {
    const [
      specials,
      setSpecials,
    ] = useState<SeasonalSpecial[]>(
      []
    );
  
    const [
      loading,
      setLoading,
    ] = useState(true);
  
    const [
      error,
      setError,
    ] = useState("");
  
    const [
      message,
      setMessage,
    ] = useState("");
  
    async function load() {
      setLoading(true);
      setError("");
  
      try {
        setSpecials(
          await getSeasonalSpecials()
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load seasonal specials."
        );
      } finally {
        setLoading(false);
      }
    }
  
    useEffect(() => {
      load();
    }, []);
  
    async function perform(
      action: () => Promise<void>,
      success: string
    ) {
      setError("");
      setMessage("");
  
      try {
        await action();
  
        setMessage(
          success
        );
  
        await load();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "The operation could not be completed."
        );
      }
    }
  
    if (loading) {
      return (
        <p className="text-sm text-[#6b645b]">
          Loading seasonal specials...
        </p>
      );
    }
  
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-serif text-3xl">
            Seasonal special
          </h2>
  
          <p className="mt-2 max-w-2xl text-sm text-[#6b645b]">
            Keep one seasonal highlight active
            for the customer-facing home page.
          </p>
        </div>
  
        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}
  
        {message && (
          <div
            role="status"
            className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {message}
          </div>
        )}
  
        <CreateSpecialForm
          onSubmit={(data) =>
            perform(
              () =>
                createSeasonalSpecial(
                  data
                ),
              "Seasonal special created."
            )
          }
        />
  
        <div className="space-y-5">
          {specials.map(
            (special) => (
              <SpecialEditor
                key={special.id}
                special={special}
                onUpdate={(
                  updates
                ) =>
                  perform(
                    () =>
                      updateSeasonalSpecial(
                        special.id,
                        updates
                      ),
                    "Seasonal special updated."
                  )
                }
                onActivate={() =>
                  perform(
                    () =>
                      activateSeasonalSpecial(
                        special.id
                      ),
                    "Seasonal special activated."
                  )
                }
                onDeactivate={() =>
                  perform(
                    () =>
                      deactivateSeasonalSpecial(
                        special.id
                      ),
                    "Seasonal special deactivated."
                  )
                }
                onDelete={() =>
                  perform(
                    () =>
                      deleteSeasonalSpecial(
                        special.id
                      ),
                    "Seasonal special deleted."
                  )
                }
              />
            )
          )}
        </div>
      </div>
    );
  }
  
  
  /* ============================================================
     CREATE
     ============================================================ */
  
  function CreateSpecialForm({
    onSubmit,
  }: {
    onSubmit: (data: {
      name: string;
      description: string;
      season: Season;
      image_path: string | null;
    }) => Promise<void>;
  }) {
    const [
      name,
      setName,
    ] = useState("");
  
    const [
      description,
      setDescription,
    ] = useState("");
  
    const [
      season,
      setSeason,
    ] = useState<Season>(
      "summer"
    );
  
    const [
      image,
      setImage,
    ] = useState<File | null>(
      null
    );
  
    const [
      submitting,
      setSubmitting,
    ] = useState(false);
  
    async function submit(
      event: FormEvent
    ) {
      event.preventDefault();
  
      if (
        !name.trim() ||
        !description.trim()
      ) {
        return;
      }
  
      setSubmitting(true);
  
      try {
        let imagePath:
          string | null =
          null;
  
        if (image) {
          imagePath =
            await uploadSeasonalSpecialImage(
              image
            );
        }
  
        await onSubmit({
          name,
          description,
          season,
          image_path:
            imagePath,
        });
  
        setName("");
        setDescription("");
        setImage(null);
      } finally {
        setSubmitting(false);
      }
    }
  
    return (
      <form
        onSubmit={submit}
        className="rounded-xl border border-[#e1d9cc] bg-white p-6"
      >
        <h3 className="font-serif text-xl">
          Add seasonal special
        </h3>
  
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field
            label="Name"
            value={name}
            onChange={setName}
            required
          />
  
          <label>
            <span className="text-xs font-medium text-[#6b645b]">
              Season
            </span>
  
            <select
              value={season}
              onChange={(e) =>
                setSeason(
                  e.target.value as Season
                )
              }
              className="mt-1 block w-full rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm"
            >
              {seasons.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </label>
        </div>
  
        <div className="mt-4">
          <Field
            label="Description"
            value={description}
            onChange={
              setDescription
            }
            required
          />
        </div>
  
        <div className="mt-4">
          <label>
            <span className="text-xs font-medium text-[#6b645b]">
              Image
            </span>
  
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                setImage(
                  e.target.files?.[0] ??
                    null
                )
              }
              className="mt-1 block w-full text-sm"
            />
          </label>
        </div>
  
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 rounded-lg bg-[#171512] px-5 py-3 text-sm text-white disabled:opacity-50"
        >
          {submitting
            ? "Adding..."
            : "Add special"}
        </button>
      </form>
    );
  }
  
  
  /* ============================================================
     EDITOR
     ============================================================ */
  
  function SpecialEditor({
    special,
    onUpdate,
    onActivate,
    onDeactivate,
    onDelete,
  }: {
    special: SeasonalSpecial;
    onUpdate: (
      updates: Partial<SeasonalSpecial>
    ) => Promise<void>;
    onActivate: () => Promise<void>;
    onDeactivate: () => Promise<void>;
    onDelete: () => Promise<void>;
  }) {
    const [
      name,
      setName,
    ] = useState(special.name);
  
    const [
      description,
      setDescription,
    ] = useState(
      special.description
    );
  
    const [
      season,
      setSeason,
    ] = useState<Season>(
      special.season
    );
  
    const [
      saving,
      setSaving,
    ] = useState(false);
  
    const imageUrl =
      getSeasonalSpecialImageUrl(
        special.image_path
      );
  
    async function save() {
      setSaving(true);
  
      try {
        await onUpdate({
          name,
          description,
          season,
        });
      } finally {
        setSaving(false);
      }
    }
  
    return (
      <article className="overflow-hidden rounded-xl border border-[#e1d9cc] bg-white">
        <div className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-serif text-2xl">
                  {special.name}
                </h3>
  
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    special.is_active
                      ? "bg-green-50 text-green-800"
                      : "bg-[#f1ede6] text-[#6b645b]"
                  }`}
                >
                  {special.is_active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
  
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  className="mt-5 h-48 w-full rounded-lg object-cover"
                />
              )}
            </div>
  
            <div className="flex flex-wrap gap-2">
              {special.is_active ? (
                <button
                  type="button"
                  onClick={
                    onDeactivate
                  }
                  className="rounded-lg border border-[#d7cfc2] px-4 py-2 text-xs"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    onActivate
                  }
                  className="rounded-lg bg-[#171512] px-4 py-2 text-xs text-white"
                >
                  Make active
                </button>
              )}
  
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Delete this seasonal special?"
                    )
                  ) {
                    void onDelete();
                  }
                }}
                className="rounded-lg border border-red-200 px-4 py-2 text-xs text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
  
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field
              label="Name"
              value={name}
              onChange={setName}
              required
            />
  
            <label>
              <span className="text-xs font-medium text-[#6b645b]">
                Season
              </span>
  
              <select
                value={season}
                onChange={(e) =>
                  setSeason(
                    e.target.value as Season
                  )
                }
                className="mt-1 block w-full rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm"
              >
                {seasons.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>
  
          <div className="mt-4">
            <Field
              label="Description"
              value={
                description
              }
              onChange={
                setDescription
              }
              required
            />
          </div>
  
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="mt-5 rounded-lg border border-[#8a6a22] px-4 py-2 text-xs text-[#6b5018] disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </article>
    );
  }
  
  
  /* ============================================================
     FIELD
     ============================================================ */
  
  function Field({
    label,
    value,
    onChange,
    required = false,
  }: {
    label: string;
    value: string;
    onChange: (
      value: string
    ) => void;
    required?: boolean;
  }) {
    return (
      <label className="block">
        <span className="text-xs font-medium text-[#6b645b]">
          {label}
        </span>
  
        <input
          value={value}
          required={required}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          className="mt-1 block w-full rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm outline-none focus:border-[#8a6a22] focus:ring-2 focus:ring-[#8a6a22]/20"
        />
      </label>
    );
  }