import React, { useId } from "react";
import { CircleAlert } from "lucide-react";

/** Labelled input/textarea with an inline, screen-reader-announced error. */
export default function Field({ label, error, as = "input", hint, className = "", ...props }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const Tag = as;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <Tag id={id} className="field" aria-invalid={error ? "true" : undefined} aria-describedby={describedBy} {...props} />
      {hint && !error && (
        <p id={hintId} className="mt-2 text-sm text-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error" role="alert">
          <CircleAlert size={15} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}
