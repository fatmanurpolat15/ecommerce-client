import type { ReactNode } from "react";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  trailing?: ReactNode;
  describedBy?: string;
  footer?: ReactNode;
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  error,
  placeholder,
  autoComplete,
  required,
  trailing,
  describedBy,
  footer,
}: TextFieldProps) {
  const errorId = `${id}-error`;
  const describedIds = [error ? errorId : null, describedBy].filter(Boolean).join(" ");

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedIds || undefined}
          className={`w-full rounded-lg border bg-slate-950/50 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-4 ${
            error
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
              : "border-white/10 focus:border-blue-500 focus:ring-blue-500/20"
          }${trailing ? " pr-11" : ""}`}
        />
        {trailing}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}

      {footer}
    </div>
  );
}

export default TextField;
