import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({ label, id, error, hint, ...inputProps }: Props) {
  const inputId = id ?? inputProps.name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {label}
        {inputProps.required ? <span className="field__required"> *</span> : null}
      </label>
      <input
        {...inputProps}
        id={inputId}
        className={`field__control${error ? ' field__control--error' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      />
      {hint ? <span className="field__hint" id={hintId}>{hint}</span> : null}
      {error ? <span className="field__error" id={errorId}>{error}</span> : null}
    </div>
  );
}
