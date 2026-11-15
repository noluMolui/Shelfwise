import type { SelectHTMLAttributes } from 'react';

type Option = { value: string; label: string };
type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Option[];
  error?: string;
  placeholder?: string;
};

export function SelectField({
  label,
  id,
  options,
  error,
  placeholder,
  ...selectProps
}: Props) {
  const selectId = id ?? selectProps.name;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={selectId}>
        {label}
        {selectProps.required ? <span className="field__required"> *</span> : null}
      </label>
      <select
        {...selectProps}
        id={selectId}
        className={`field__control field__select${error ? ' field__control--error' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="field__error" id={errorId}>{error}</span> : null}
    </div>
  );
}
