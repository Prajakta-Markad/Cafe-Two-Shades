import {
    type FormEvent,
    useEffect,
    useState,
  } from "react";
  
  import {
    createCategory,
    createMenuItem,
    createMenuNote,
    createMenuPrice,
    deleteMenuNote,
    deleteMenuPrice,
    getAdminMenu,
    type MenuCategory,
    type MenuItem,
    type MenuItemPrice,
    type MenuNote,
    updateCategory,
    updateMenuItem,
    updateMenuNote,
    updateMenuPrice,
  } from "../../services/menuService";
  
  export default function MenuManagement() {
    const [
      categories,
      setCategories,
    ] = useState<MenuCategory[]>(
      []
    );
  
    const [
      items,
      setItems,
    ] = useState<MenuItem[]>(
      []
    );
  
    const [
      prices,
      setPrices,
    ] = useState<MenuItemPrice[]>(
      []
    );
  
    const [
      notes,
      setNotes,
    ] = useState<MenuNote[]>(
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
  
    async function loadMenu() {
      setLoading(true);
      setError("");
  
      try {
        const data =
          await getAdminMenu();
  
        setCategories(
          data.categories
        );
  
        setItems(
          data.items
        );
  
        setPrices(
          data.prices
        );
  
        setNotes(
          data.notes
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load menu."
        );
      } finally {
        setLoading(false);
      }
    }
  
    useEffect(() => {
      loadMenu();
    }, []);
  
    async function perform(
      action: () => Promise<void>,
      successMessage: string
    ) {
      setError("");
      setMessage("");
  
      try {
        await action();
  
        setMessage(
          successMessage
        );
  
        await loadMenu();
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
          Loading menu...
        </p>
      );
    }
  
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-serif text-3xl">
            Menu management
          </h2>
  
          <p className="mt-2 text-sm text-[#6b645b]">
            Manage categories, items, prices,
            availability and menu notes.
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
  
        <AddCategoryForm
          onSubmit={(data) =>
            perform(
              () =>
                createCategory(
                  data
                ),
              "Category created."
            )
          }
        />
  
        <div className="space-y-6">
          {categories.map(
            (category) => (
              <CategoryEditor
                key={category.id}
                category={category}
                items={items.filter(
                  (item) =>
                    item.category_id ===
                    category.id
                )}
                prices={prices}
                notes={notes}
                onUpdateCategory={(
                  updates
                ) =>
                  perform(
                    () =>
                      updateCategory(
                        category.id,
                        updates
                      ),
                    "Category updated."
                  )
                }
                onUpdateItem={(
                  id,
                  updates
                ) =>
                  perform(
                    () =>
                      updateMenuItem(
                        id,
                        updates
                      ),
                    "Menu item updated."
                  )
                }
                onAddItem={(data) =>
                  perform(
                    () =>
                      createMenuItem(
                        data
                      ),
                    "Menu item created."
                  )
                }
                onAddPrice={(data) =>
                  perform(
                    () =>
                      createMenuPrice(
                        data
                      ),
                    "Price added."
                  )
                }
                onUpdatePrice={(
                  id,
                  updates
                ) =>
                  perform(
                    () =>
                      updateMenuPrice(
                        id,
                        updates
                      ),
                    "Price updated."
                  )
                }
                onDeletePrice={(id) =>
                  perform(
                    () =>
                      deleteMenuPrice(
                        id
                      ),
                    "Price deleted."
                  )
                }
                onAddNote={(data) =>
                  perform(
                    () =>
                      createMenuNote(
                        data
                      ),
                    "Note added."
                  )
                }
                onUpdateNote={(
                  id,
                  updates
                ) =>
                  perform(
                    () =>
                      updateMenuNote(
                        id,
                        updates
                      ),
                    "Note updated."
                  )
                }
                onDeleteNote={(id) =>
                  perform(
                    () =>
                      deleteMenuNote(
                        id
                      ),
                    "Note deleted."
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
     CATEGORY FORM
     ============================================================ */
  
  function AddCategoryForm({
    onSubmit,
  }: {
    onSubmit: (data: {
      name: string;
      description: string;
      display_order: number;
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
      order,
      setOrder,
    ] = useState(0);
  
    const [
      submitting,
      setSubmitting,
    ] = useState(false);
  
    async function handleSubmit(
      event: FormEvent
    ) {
      event.preventDefault();
  
      if (!name.trim()) {
        return;
      }
  
      setSubmitting(true);
  
      try {
        await onSubmit({
          name,
          description,
          display_order:
            Number(order) || 0,
        });
  
        setName("");
        setDescription("");
        setOrder(0);
      } finally {
        setSubmitting(false);
      }
    }
  
    return (
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[#e1d9cc] bg-white p-6"
      >
        <h3 className="font-serif text-xl">
          Add category
        </h3>
  
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_120px_auto] md:items-end">
          <Field
            label="Category name"
            value={name}
            onChange={setName}
            required
          />
  
          <Field
            label="Description"
            value={description}
            onChange={setDescription}
          />
  
          <Field
            label="Order"
            type="number"
            value={String(order)}
            onChange={(value) =>
              setOrder(
                Number(value)
              )
            }
          />
  
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#171512] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>
    );
  }
  
  
  /* ============================================================
     CATEGORY EDITOR
     ============================================================ */
  
  function CategoryEditor({
    category,
    items,
    prices,
    notes,
    onUpdateCategory,
    onUpdateItem,
    onAddItem,
    onAddPrice,
    onUpdatePrice,
    onDeletePrice,
    onAddNote,
    onUpdateNote,
    onDeleteNote,
  }: {
    category: MenuCategory;
    items: MenuItem[];
    prices: MenuItemPrice[];
    notes: MenuNote[];
    onUpdateCategory: (
      updates: Partial<MenuCategory>
    ) => Promise<void>;
    onUpdateItem: (
      id: string,
      updates: Partial<MenuItem>
    ) => Promise<void>;
    onAddItem: (
      data: {
        category_id: string;
        name: string;
        description: string;
        display_order: number;
      }
    ) => Promise<void>;
    onAddPrice: (
      data: {
        item_id: string;
        label: string;
        price: number;
        display_order: number;
      }
    ) => Promise<void>;
    onUpdatePrice: (
      id: string,
      updates: Partial<MenuItemPrice>
    ) => Promise<void>;
    onDeletePrice: (
      id: string
    ) => Promise<void>;
    onAddNote: (
      data: {
        category_id: string;
        note: string;
        display_order: number;
      }
    ) => Promise<void>;
    onUpdateNote: (
      id: string,
      updates: Partial<MenuNote>
    ) => Promise<void>;
    onDeleteNote: (
      id: string
    ) => Promise<void>;
  }) {
    const categoryNotes =
      notes.filter(
        (note) =>
          note.category_id ===
          category.id
      );
  
    return (
      <section className="rounded-xl border border-[#e1d9cc] bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-[#eee8df] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-serif text-2xl">
              {category.name}
            </h3>
  
            {category.description && (
              <p className="mt-1 text-sm text-[#6b645b]">
                {category.description}
              </p>
            )}
          </div>
  
          <button
            type="button"
            onClick={() =>
              onUpdateCategory({
                is_visible:
                  !category.is_visible,
              })
            }
            className="rounded-lg border border-[#d7cfc2] px-4 py-2 text-sm"
          >
            {category.is_visible
              ? "Visible"
              : "Hidden"}
          </button>
        </div>
  
        <div className="mt-6 space-y-5">
          {items.map(
            (item) => (
              <ItemEditor
                key={item.id}
                item={item}
                prices={prices.filter(
                  (price) =>
                    price.item_id ===
                    item.id
                )}
                notes={notes.filter(
                  (note) =>
                    note.item_id ===
                    item.id
                )}
                onUpdate={(
                  updates
                ) =>
                  onUpdateItem(
                    item.id,
                    updates
                  )
                }
                onAddPrice={
                  onAddPrice
                }
                onUpdatePrice={
                  onUpdatePrice
                }
                onDeletePrice={
                  onDeletePrice
                }
                onAddNote={(data) =>
                  onAddNote({
                    ...data,
                    item_id:
                      item.id,
                  })
                }
                onUpdateNote={
                  onUpdateNote
                }
                onDeleteNote={
                  onDeleteNote
                }
              />
            )
          )}
        </div>
  
        <AddItemForm
          categoryId={
            category.id
          }
          nextOrder={
            items.length
          }
          onSubmit={
            onAddItem
          }
        />
  
        <AddCategoryNoteForm
          categoryId={
            category.id
          }
          nextOrder={
            categoryNotes.length
          }
          onSubmit={
            onAddNote
          }
        />
      </section>
    );
  }
  
  
  /* ============================================================
     ITEM EDITOR
     ============================================================ */
  
  function ItemEditor({
    item,
    prices,
    notes,
    onUpdate,
    onAddPrice,
    onUpdatePrice,
    onDeletePrice,
    onAddNote,
    onUpdateNote,
    onDeleteNote,
  }: {
    item: MenuItem;
    prices: MenuItemPrice[];
    notes: MenuNote[];
    onUpdate: (
      updates: Partial<MenuItem>
    ) => Promise<void>;
    onAddPrice: (
      data: {
        item_id: string;
        label: string;
        price: number;
        display_order: number;
      }
    ) => Promise<void>;
    onUpdatePrice: (
      id: string,
      updates: Partial<MenuItemPrice>
    ) => Promise<void>;
    onDeletePrice: (
      id: string
    ) => Promise<void>;
    onAddNote: (
      data: {
        item_id: string;
        note: string;
        display_order: number;
      }
    ) => Promise<void>;
    onUpdateNote: (
      id: string,
      updates: Partial<MenuNote>
    ) => Promise<void>;
    onDeleteNote: (
      id: string
    ) => Promise<void>;
  }) {
    const [
      editing,
      setEditing,
    ] = useState(false);
  
    const [
      name,
      setName,
    ] = useState(item.name);
  
    const [
      description,
      setDescription,
    ] = useState(
      item.description ?? ""
    );
  
    const [
      order,
      setOrder,
    ] = useState(
      item.display_order
    );
  
    async function save() {
      await onUpdate({
        name,
        description,
        display_order:
          Number(order) || 0,
      });
  
      setEditing(false);
    }
  
    return (
      <div className="rounded-lg border border-[#eee8df] bg-[#faf8f4] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {editing ? (
            <div className="grid flex-1 gap-3">
              <Field
                label="Name"
                value={name}
                onChange={setName}
                required
              />
  
              <Field
                label="Description"
                value={
                  description
                }
                onChange={
                  setDescription
                }
              />
  
              <Field
                label="Display order"
                type="number"
                value={String(order)}
                onChange={(value) =>
                  setOrder(
                    Number(value)
                  )
                }
              />
  
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={
                    save
                  }
                  className="rounded-lg bg-[#171512] px-4 py-2 text-sm text-white"
                >
                  Save
                </button>
  
                <button
                  type="button"
                  onClick={() =>
                    setEditing(
                      false
                    )
                  }
                  className="rounded-lg border border-[#d7cfc2] px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="font-medium">
                  {item.name}
                </h4>
  
                <span className="text-xs text-[#7a736a]">
                  {item.is_available
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>
  
              {item.description && (
                <p className="mt-1 text-sm text-[#6b645b]">
                  {item.description}
                </p>
              )}
            </div>
          )}
  
          {!editing && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    is_available:
                      !item.is_available,
                  })
                }
                className="rounded-lg border border-[#d7cfc2] px-3 py-2 text-xs"
              >
                {item.is_available
                  ? "Hide"
                  : "Show"}
              </button>
  
              <button
                type="button"
                onClick={() =>
                  setEditing(
                    true
                  )
                }
                className="rounded-lg border border-[#d7cfc2] px-3 py-2 text-xs"
              >
                Edit
              </button>
            </div>
          )}
        </div>
  
        <div className="mt-5 border-t border-[#e5ded3] pt-5">
          <h5 className="text-sm font-medium">
            Prices
          </h5>
  
          <div className="mt-3 space-y-2">
            {prices.map(
              (price) => (
                <PriceEditor
                  key={price.id}
                  price={price}
                  onUpdate={
                    onUpdatePrice
                  }
                  onDelete={
                    onDeletePrice
                  }
                />
              )
            )}
          </div>
  
          <AddPriceForm
            itemId={item.id}
            nextOrder={
              prices.length
            }
            onSubmit={
              onAddPrice
            }
          />
        </div>
  
        <div className="mt-5 border-t border-[#e5ded3] pt-5">
          <h5 className="text-sm font-medium">
            Notes
          </h5>
  
          <div className="mt-3 space-y-2">
            {notes.map(
              (note) => (
                <NoteEditor
                  key={note.id}
                  note={note}
                  onUpdate={
                    onUpdateNote
                  }
                  onDelete={
                    onDeleteNote
                  }
                />
              )
            )}
          </div>
  
          <AddItemNoteForm
            itemId={item.id}
            nextOrder={
              notes.length
            }
            onSubmit={
              onAddNote
            }
          />
        </div>
      </div>
    );
  }
  
  
  /* ============================================================
     PRICE EDITOR
     ============================================================ */
  
  function PriceEditor({
    price,
    onUpdate,
    onDelete,
  }: {
    price: MenuItemPrice;
    onUpdate: (
      id: string,
      updates: Partial<MenuItemPrice>
    ) => Promise<void>;
    onDelete: (
      id: string
    ) => Promise<void>;
  }) {
    const [
      label,
      setLabel,
    ] = useState(price.label);
  
    const [
      value,
      setValue,
    ] = useState(
      String(price.price)
    );
  
    async function save() {
      await onUpdate(
        price.id,
        {
          label,
          price:
            Number(value),
        }
      );
    }
  
    return (
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-32 flex-1">
          <label className="text-xs text-[#7a736a]">
            Size / option
          </label>
  
          <input
            value={label}
            onChange={(e) =>
              setLabel(
                e.target.value
              )
            }
            className="mt-1 w-full rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm"
          />
        </div>
  
        <div className="w-28">
          <label className="text-xs text-[#7a736a]">
            Price
          </label>
  
          <input
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) =>
              setValue(
                e.target.value
              )
            }
            className="mt-1 w-full rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm"
          />
        </div>
  
        <button
          type="button"
          onClick={save}
          className="rounded-md bg-[#171512] px-3 py-2 text-xs text-white"
        >
          Save
        </button>
  
        <button
          type="button"
          onClick={() =>
            onDelete(
              price.id
            )
          }
          className="rounded-md border border-red-200 px-3 py-2 text-xs text-red-700"
        >
          Delete
        </button>
      </div>
    );
  }
  
  
  /* ============================================================
     NOTE EDITOR
     ============================================================ */
  
  function NoteEditor({
    note,
    onUpdate,
    onDelete,
  }: {
    note: MenuNote;
    onUpdate: (
      id: string,
      updates: Partial<MenuNote>
    ) => Promise<void>;
    onDelete: (
      id: string
    ) => Promise<void>;
  }) {
    const [
      value,
      setValue,
    ] = useState(note.note);
  
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) =>
            setValue(
              e.target.value
            )
          }
          className="flex-1 rounded-md border border-[#d7cfc2] bg-white px-3 py-2 text-sm"
        />
  
        <button
          type="button"
          onClick={() =>
            onUpdate(
              note.id,
              {
                note: value,
              }
            )
          }
          className="rounded-md bg-[#171512] px-3 py-2 text-xs text-white"
        >
          Save
        </button>
  
        <button
          type="button"
          onClick={() =>
            onDelete(
              note.id
            )
          }
          className="rounded-md border border-red-200 px-3 py-2 text-xs text-red-700"
        >
          Delete
        </button>
      </div>
    );
  }
  
  
  /* ============================================================
     ADD ITEM
     ============================================================ */
  
  function AddItemForm({
    categoryId,
    nextOrder,
    onSubmit,
  }: {
    categoryId: string;
    nextOrder: number;
    onSubmit: (
      data: {
        category_id: string;
        name: string;
        description: string;
        display_order: number;
      }
    ) => Promise<void>;
  }) {
    const [
      name,
      setName,
    ] = useState("");
  
    const [
      description,
      setDescription,
    ] = useState("");
  
    async function submit(
      event: FormEvent
    ) {
      event.preventDefault();
  
      if (!name.trim()) {
        return;
      }
  
      await onSubmit({
        category_id:
          categoryId,
        name,
        description,
        display_order:
          nextOrder,
      });
  
      setName("");
      setDescription("");
    }
  
    return (
      <form
        onSubmit={submit}
        className="mt-6 rounded-lg border border-dashed border-[#d7cfc2] p-4"
      >
        <p className="text-sm font-medium">
          Add item
        </p>
  
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field
            label="Item name"
            value={name}
            onChange={setName}
            required
          />
  
          <Field
            label="Description"
            value={
              description
            }
            onChange={
              setDescription
            }
          />
        </div>
  
        <button
          type="submit"
          className="mt-3 rounded-lg bg-[#171512] px-4 py-2 text-xs text-white"
        >
          Add item
        </button>
      </form>
    );
  }
  
  
  /* ============================================================
     ADD PRICE
     ============================================================ */
  
  function AddPriceForm({
    itemId,
    nextOrder,
    onSubmit,
  }: {
    itemId: string;
    nextOrder: number;
    onSubmit: (
      data: {
        item_id: string;
        label: string;
        price: number;
        display_order: number;
      }
    ) => Promise<void>;
  }) {
    const [
      label,
      setLabel,
    ] = useState("");
  
    const [
      price,
      setPrice,
    ] = useState("");
  
    async function submit() {
      if (
        !label.trim() ||
        !price
      ) {
        return;
      }
  
      await onSubmit({
        item_id:
          itemId,
        label,
        price:
          Number(price),
        display_order:
          nextOrder,
      });
  
      setLabel("");
      setPrice("");
    }
  
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          placeholder="e.g. 1 Scoop"
          value={label}
          onChange={(e) =>
            setLabel(
              e.target.value
            )
          }
          className="min-w-32 flex-1 rounded-md border border-[#d7cfc2] px-3 py-2 text-sm"
        />
  
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) =>
            setPrice(
              e.target.value
            )
          }
          className="w-28 rounded-md border border-[#d7cfc2] px-3 py-2 text-sm"
        />
  
        <button
          type="button"
          onClick={submit}
          className="rounded-md border border-[#d7cfc2] px-3 py-2 text-xs"
        >
          Add price
        </button>
      </div>
    );
  }
  
  
  /* ============================================================
     ADD NOTES
     ============================================================ */
  
  function AddCategoryNoteForm({
    categoryId,
    nextOrder,
    onSubmit,
  }: {
    categoryId: string;
    nextOrder: number;
    onSubmit: (
      data: {
        category_id: string;
        note: string;
        display_order: number;
      }
    ) => Promise<void>;
  }) {
    const [
      note,
      setNote,
    ] = useState("");
  
    async function submit() {
      if (!note.trim()) {
        return;
      }
  
      await onSubmit({
        category_id:
          categoryId,
        note,
        display_order:
          nextOrder,
      });
  
      setNote("");
    }
  
    return (
      <div className="mt-5 flex gap-2">
        <input
          placeholder="Add category note"
          value={note}
          onChange={(e) =>
            setNote(
              e.target.value
            )
          }
          className="flex-1 rounded-md border border-[#d7cfc2] px-3 py-2 text-sm"
        />
  
        <button
          type="button"
          onClick={submit}
          className="rounded-md border border-[#d7cfc2] px-3 py-2 text-xs"
        >
          Add note
        </button>
      </div>
    );
  }
  
  
  function AddItemNoteForm({
    itemId,
    nextOrder,
    onSubmit,
  }: {
    itemId: string;
    nextOrder: number;
    onSubmit: (
      data: {
        item_id: string;
        note: string;
        display_order: number;
      }
    ) => Promise<void>;
  }) {
    const [
      note,
      setNote,
    ] = useState("");
  
    async function submit() {
      if (!note.trim()) {
        return;
      }
  
      await onSubmit({
        item_id:
          itemId,
        note,
        display_order:
          nextOrder,
      });
  
      setNote("");
    }
  
    return (
      <div className="mt-4 flex gap-2">
        <input
          placeholder="Add item note"
          value={note}
          onChange={(e) =>
            setNote(
              e.target.value
            )
          }
          className="flex-1 rounded-md border border-[#d7cfc2] px-3 py-2 text-sm"
        />
  
        <button
          type="button"
          onClick={submit}
          className="rounded-md border border-[#d7cfc2] px-3 py-2 text-xs"
        >
          Add note
        </button>
      </div>
    );
  }
  
  
  /* ============================================================
     GENERIC FIELD
     ============================================================ */
  
  function Field({
    label,
    value,
    onChange,
    type = "text",
    required = false,
  }: {
    label: string;
    value: string;
    onChange: (
      value: string
    ) => void;
    type?: string;
    required?: boolean;
  }) {
    return (
      <label className="block">
        <span className="text-xs font-medium text-[#6b645b]">
          {label}
        </span>
  
        <input
          type={type}
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