export function Input({ label, helperText, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <input className={error ? 'has-error' : ''} {...props} />
      {(error || helperText) && <small className={error ? 'field-error' : ''}>{error || helperText}</small>}
    </label>
  );
}

export function Select({ label, options = [], placeholder = 'Seleccionar', className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <select {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;

          return (
          <option key={value} value={value}>
            {optionLabel}
          </option>
          );
        })}
      </select>
    </label>
  );
}

export function Textarea({ label, helperText, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <textarea className={error ? 'has-error' : ''} {...props} />
      {(error || helperText) && <small className={error ? 'field-error' : ''}>{error || helperText}</small>}
    </label>
  );
}
