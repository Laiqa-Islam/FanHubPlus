import { useActionState, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";

import { saveResource, deleteResource } from "@/actions/admin";
import { Input, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * One editor for every admin resource (SRS FR-11).
 *
 * Content, characters, merchandise, events and FAQ entries differ only in
 * their field list, so they share this component rather than repeating five
 * near-identical CRUD screens. The server action still validates each kind
 * against its own schema — this is a UI convenience, not a trust boundary.
 */
export function ResourceManager({ kind, rows, fields, toolbar, singular }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const bound = saveResource.bind(null, kind);
  const [state, action, pending] = useActionState(bound, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Saved.");
      setEditing(null);
      setCreating(false);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  async function remove(row) {
    // A native confirm is the honest tool here: this is destructive and
    // immediate, and a custom dialog would add no safety.
    if (!window.confirm(`Delete “${row.title}”? This cannot be undone.`))
      return;

    setDeletingId(row.id);
    const result = await deleteResource(kind, row.id);
    setDeletingId(null);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  }

  const open = creating || editing !== null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="mark">
          {rows.length} {rows.length === 1 ? singular : `${singular}s`}
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          New {singular}
        </Button>
      </div>

      {open && (
        <form
          action={action}
          className="mb-8 rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] p-6 shadow-[var(--lift-md)]"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-[1.15rem] leading-none">
              {editing ? `Edit ${singular}` : `New ${singular}`}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
              aria-label="Close editor"
              className="grid h-8 w-8 place-items-center rounded-2xl border border-[var(--edge)] transition-colors hover:border-[var(--n1)] hover:text-[var(--n1)]"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {editing && <input type="hidden" name="id" value={editing.id} />}

          <div className="grid gap-5 sm:grid-cols-2">
            {toolbar}
            {fields.map((field) => {
              const value = editing?.values[field.name];
              const wrapper = field.half ? "" : "sm:col-span-2";

              if (field.kind === "checkbox") {
                return (
                  <label
                    key={field.name}
                    className={cn(
                      "flex cursor-pointer items-center justify-between border border-[var(--rule-strong)] bg-[var(--paper)] p-4",
                      wrapper,
                    )}
                  >
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em]">
                      {field.label}
                    </span>
                    <input
                      type="checkbox"
                      name={field.name}
                      defaultChecked={Boolean(value)}
                      className="h-5 w-5 accent-[var(--spot)]"
                    />
                  </label>
                );
              }

              if (field.kind === "textarea") {
                return (
                  <div key={field.name} className={wrapper}>
                    <Textarea
                      label={field.label}
                      name={field.name}
                      required={field.required}
                      rows={field.name === "body" ? 10 : 4}
                      defaultValue={String(value ?? "")}
                      hint={field.hint}
                      error={state?.errors?.[field.name]}
                    />
                  </div>
                );
              }

              if (field.kind === "select") {
                return (
                  <div key={field.name} className={wrapper}>
                    <Select
                      label={field.label}
                      name={field.name}
                      required={field.required}
                      defaultValue={String(value ?? "")}
                      error={state?.errors?.[field.name]}
                    >
                      <option value="">Choose…</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                );
              }

              return (
                <div key={field.name} className={wrapper}>
                  <Input
                    label={field.label}
                    name={field.name}
                    required={field.required}
                    type={
                      field.kind === "number"
                        ? "number"
                        : field.kind === "datetime"
                          ? "datetime-local"
                          : "text"
                    }
                    step={field.kind === "number" ? "any" : undefined}
                    defaultValue={String(value ?? "")}
                    hint={field.hint}
                    error={state?.errors?.[field.name]}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[var(--rule)] pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {editing ? "Save changes" : `Create ${singular}`}
            </Button>
          </div>
        </form>
      )}

      {/* Listing */}
      {rows.length === 0 ? (
        <p className="border border-dashed border-[var(--edge-strong)] px-6 py-16 text-center text-[var(--ink-soft)]">
          Nothing here yet. Create the first one.
        </p>
      ) : (
        <ul className="border-t border-[var(--rule-strong)]">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-4 border-b border-[var(--rule)] py-3"
            >
              {row.ink && (
                <span
                  aria-hidden
                  className="h-4 w-4 shrink-0"
                  style={{ background: row.ink }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[0.95rem] leading-none">
                  {row.title}
                </p>
                <p className="mt-1 truncate font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                  {row.meta}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setEditing(row);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-label={`Edit ${row.title}`}
                  className="grid h-9 w-9 place-items-center rounded-2xl border border-[var(--edge)] transition-colors hover:border-[var(--n1)] hover:text-[var(--n1)]"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => remove(row)}
                  disabled={deletingId === row.id}
                  aria-label={`Delete ${row.title}`}
                  className="grid h-9 w-9 place-items-center rounded-2xl border border-[var(--edge)] transition-colors hover:bg-[var(--spot)] hover:text-[var(--void)] disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
