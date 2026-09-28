import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, Check } from "lucide-react";
import { toast } from "react-toastify";

import { updateProfile } from "@/actions/profile";
import { CATEGORIES } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";
import { Input, Textarea, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";

export function ProfileForm({ user }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const { setFontScale, setReducedMotion } = useTheme();

  const [selected, setSelected] = useState(user.favoriteCategories);
  const [preview, setPreview] = useState(user.avatarUrl);
  const [fontScale, setLocalFontScale] = useState(user.preferences.fontScale);
  const [reducedMotion, setLocalReducedMotion] = useState(
    user.preferences.reducedMotion,
  );
  const fileInput = useRef(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Profile saved.");
      // Mirror the saved preferences into the live client state so the page
      // reflects them without a reload.
      setFontScale(fontScale);
      setReducedMotion(reducedMotion);
    } else if (state?.message) {
      toast.error(state.message);
    }
    // Only react to a new action result, not to every local edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Local object URL preview, revoked when it is replaced.
  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview((old) => {
      if (old.startsWith("blob:")) URL.revokeObjectURL(old);
      return url;
    });
  }

  function toggleCategory(slug) {
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug],
    );
  }

  return (
    <form action={action} className="flex flex-col gap-10">
      {/* Avatar */}
      <section>
        <h2 className="mb-5 font-display text-[1.3rem]">Profile picture</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] font-display text-[1.6rem] font-extrabold">
              {preview ? (
                // A local blob or an already-optimised Cloudinary URL.
                <img
                  src={preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(user.name)
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              aria-label="Choose a profile picture"
              className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full bg-[var(--n1)] text-[var(--void)] shadow-[0_0_20px_color-mix(in_oklch,var(--n1)_60%,transparent)] transition-transform hover:scale-110"
            >
              <Camera className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="min-w-0">
            <p className="text-[0.9rem] text-[var(--ink)]">
              JPG, PNG, WebP or GIF, up to 5 MB.
            </p>
            <p className="mt-1 text-[0.82rem] text-[var(--ink-soft)]">
              Uploads are stored on Cloudinary and resized automatically.
            </p>
            {state?.errors?.avatar && (
              <p
                role="alert"
                className="mt-2 text-[0.82rem] font-medium text-[var(--spot)]"
              >
                {state.errors.avatar}
              </p>
            )}
          </div>

          <input
            ref={fileInput}
            type="file"
            name="avatar"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="sr-only"
          />
        </div>
      </section>

      {/* Identity */}
      <section className="flex flex-col gap-5">
        <h2 className="font-display text-[1.3rem]">About you</h2>
        <Input
          label="Display name"
          name="name"
          defaultValue={user.name}
          required
          error={state?.errors?.name}
        />

        <Textarea
          label="Bio"
          name="bio"
          defaultValue={user.bio}
          maxLength={280}
          placeholder="Which fandoms claimed you first?"
          error={state?.errors?.bio}
          hint="Up to 280 characters."
        />
      </section>

      {/* Favourite fandoms */}
      <section>
        <h2 className="font-display text-[1.3rem]">Favourite fandoms</h2>
        <p className="mt-2 text-[0.88rem] text-[var(--ink-soft)]">
          Your dashboard leads with these. Change them whenever your taste does.
        </p>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const isSelected = selected.includes(category.slug);
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => toggleCategory(category.slug)}
                aria-pressed={isSelected}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden border p-3.5 text-left transition-all duration-200",
                  isSelected
                    ? "border-[var(--spot)] bg-[var(--spot-wash)]"
                    : "border-[var(--rule)] hover:border-[var(--rule-strong)]",
                )}
              >
                <span
                  aria-hidden
                  className="h-8 w-1 shrink-0 transition-all duration-300 group-hover:h-9"
                  style={{ background: `var(--ch-${category.token})` }}
                />

                <span className="min-w-0 flex-1 text-[0.9rem] font-semibold">
                  {category.name}
                </span>
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center border transition-colors",
                    isSelected
                      ? "border-[var(--spot)] bg-[var(--spot)] text-[var(--void)]"
                      : "border-[var(--rule-strong)]",
                  )}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" aria-hidden />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selections travel as repeated fields the server action reads with getAll. */}
        {selected.map((slug) => (
          <input
            key={slug}
            type="hidden"
            name="favoriteCategories"
            value={slug}
          />
        ))}
      </section>

      {/* Display preferences */}
      <section>
        <h2 className="font-display text-[1.3rem]">Display preferences</h2>
        <p className="mt-2 text-[0.88rem] text-[var(--ink-soft)]">
          Saved to your account, so they follow you to any device. The colour
          scheme is set from the display menu in the header.
        </p>

        <div className="mt-5">
          <Field label={`Text size — ${fontScale}%`}>
            <input
              type="range"
              name="fontScale"
              min={90}
              max={130}
              step={5}
              value={fontScale}
              onChange={(event) =>
                setLocalFontScale(Number(event.target.value))
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--paper-2)] accent-[var(--n1)]"
            />
          </Field>
        </div>

        <label className="mt-5 flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-4 transition-colors hover:border-[var(--n2)]">
          <span>
            <span className="block text-[0.92rem] font-semibold">
              Reduce motion
            </span>
            <span className="block text-[0.82rem] text-[var(--ink-soft)]">
              Turns off the scroll reveals, ticker and hero animation.
            </span>
          </span>
          <input
            type="checkbox"
            name="reducedMotion"
            checked={reducedMotion}
            onChange={(event) => setLocalReducedMotion(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-[var(--n1)]"
          />
        </label>
      </section>

      <div className="flex justify-end border-t border-[var(--rule)] pt-7">
        <Button type="submit" size="lg" loading={pending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
