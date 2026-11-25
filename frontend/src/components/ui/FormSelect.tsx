"use client";

import React from "react";
import { LucideIcon, ChevronsUpDown } from "lucide-react";

export interface FormSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelExtra?: React.ReactNode;
  required?: boolean;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
  options?: FormSelectOption[];
  containerClassName?: string;
}

export function FormSelect({
  label,
  labelExtra,
  required,
  icon: Icon,
  error,
  helperText,
  options,
  children,
  containerClassName = "",
  className = "",
  id,
  ...props
}: FormSelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {(label || labelExtra) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={selectId}
              className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 select-none"
            >
              {label} {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {labelExtra && <div>{labelExtra}</div>}
        </div>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        )}

        <select
          id={selectId}
          required={required}
          className={`w-full h-10 ${
            Icon ? "pl-10" : "pl-3.5"
          } pr-9 rounded-xl bg-[#F3F5F8] text-xs sm:text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 ${
            error
              ? "ring-2 ring-rose-500 bg-rose-50/30"
              : "focus:ring-[#007E7A]"
          } transition cursor-pointer ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={String(opt.value)}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronsUpDown className="w-4 h-4" />
        </div>
      </div>

      {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      {helperText && !error && (
        <p className="text-[10px] text-slate-400 leading-tight">{helperText}</p>
      )}
    </div>
  );
}

export default FormSelect;
