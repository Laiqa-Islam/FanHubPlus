import { useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Focus lights the cyan signal rather than drawing a browser ring; the
// global :focus-visible rule still covers keyboard traversal elsewhere.
const controlStyles =
  "w-full rounded-xl border border-[var(--edge)] bg-[var(--paper-2)] px-4 py-3 text-[0.95rem] text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition-[border-color,box-shadow,background-color] duration-200 focus:border-[var(--n2)] focus:bg-[var(--paper-3)] focus:shadow-[0_0_18px_color-mix(in_oklch,var(--n2)_25%,transparent)] focus:outline-none disabled:opacity-45";

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-[var(--ink-faint)]"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[0.8rem] text-[var(--ink-faint)]">{hint}</p>
      )}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-[0.8rem] font-medium text-[var(--spot-deep)]"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ label, error, hint, className, id, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={inputId}>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(controlStyles, error && "border-[var(--n1)]", className)}
        {...props}
      />
    </Field>
  );
}

export function Textarea({ label, error, hint, className, id, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={inputId}>
      <textarea
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(
          controlStyles,
          "min-h-28 resize-y",
          error && "border-[var(--n1)]",
          className,
        )}
        {...props}
      />
    </Field>
  );
}

export function Select({
  label,
  error,
  hint,
  className,
  id,
  children,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={inputId}>
      <select
        id={inputId}
        className={cn(controlStyles, "cursor-pointer", className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}
