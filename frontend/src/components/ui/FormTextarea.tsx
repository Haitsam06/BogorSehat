"use client";

import React from "react";

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  labelExtra?: React.ReactNode;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export function FormTextarea({
  label,
  labelExtra,
  required,
  error,
  helperText,
  containerClassName = "",
  className = "",
  id,
  rows = 4,
  ...props
}: FormTextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {(label || labelExtra) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 select-none"
            >
              {label} {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {labelExtra && <div>{labelExtra}</div>}
        </div>
      )}

      <textarea
        id={textareaId}
        required={required}
        rows={rows}
        className={`w-full p-3.5 rounded-xl bg-[#F3F5F8] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          error
            ? "ring-2 ring-rose-500 bg-rose-50/30"
            : "focus:ring-[#007E7A]"
        } transition resize-y ${className}`}
        {...props}
      />

      {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      {helperText && !error && (
        <p className="text-[10px] text-slate-400 leading-tight">{helperText}</p>
      )}
    </div>
  );
}

export default FormTextarea;
