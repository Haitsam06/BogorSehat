"use client";

import React, { useState } from "react";
import { LucideIcon, Lock, Eye, EyeOff } from "lucide-react";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelExtra?: React.ReactNode;
  required?: boolean;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export function FormInput({
  label,
  labelExtra,
  required,
  icon: Icon,
  error,
  helperText,
  rightElement,
  containerClassName = "",
  className = "",
  id,
  type = "text",
  ...props
}: FormInputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {(label || labelExtra) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
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

        <input
          id={inputId}
          type={type}
          required={required}
          className={`w-full h-10 ${
            Icon ? "pl-10" : "pl-3.5"
          } ${
            rightElement ? "pr-10" : "pr-4"
          } rounded-xl bg-[#F3F5F8] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            error
              ? "ring-2 ring-rose-500 bg-rose-50/30"
              : "focus:ring-[#007E7A]"
          } transition ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3.5 top-2.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      {helperText && !error && (
        <p className="text-[10px] text-slate-400 leading-tight">{helperText}</p>
      )}
    </div>
  );
}

export interface FormPasswordProps extends Omit<FormInputProps, "type" | "rightElement"> {
  labelToggleVisibility?: boolean;
}

export function FormPassword({
  icon = Lock,
  labelToggleVisibility = true,
  ...props
}: FormPasswordProps) {
  const [tampilkanSandi, setTampilkanSandi] = useState(false);

  return (
    <FormInput
      {...props}
      type={tampilkanSandi ? "text" : "password"}
      icon={icon}
      rightElement={
        labelToggleVisibility ? (
          <button
            type="button"
            onClick={() => setTampilkanSandi((prev) => !prev)}
            className="text-slate-400 hover:text-slate-600 p-0.5 transition"
            aria-label={tampilkanSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            title={tampilkanSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {tampilkanSandi ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        ) : undefined
      }
    />
  );
}

export default FormInput;
