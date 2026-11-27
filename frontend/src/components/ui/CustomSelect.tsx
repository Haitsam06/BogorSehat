"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LucideIcon, Search, X } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  icon?: LucideIcon;
  className?: string;
  containerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  highlightSelected?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  searchable = false,
  searchPlaceholder = "Cari...",
  icon: Icon,
  className = "",
  containerClassName = "",
  menuClassName = "",
  disabled = false,
  highlightSelected = false,
}: CustomSelectProps) {
  const [terbuka, setTerbuka] = useState(false);
  const [kataKunci, setKataKunci] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setTerbuka(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setTerbuka(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (terbuka && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 40);
    } else if (!terbuka) {
      setKataKunci("");
    }
  }, [terbuka, searchable]);

  const opsiTersaring = useMemo(() => {
    const q = kataKunci.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, kataKunci]);

  const opsiTerpilih = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const isSelected = Boolean(opsiTerpilih && value !== "");

  return (
    <div className={`relative ${containerClassName}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setTerbuka((prev) => !prev)}
        className={`w-full h-10 px-3.5 rounded-xl border text-xs sm:text-[13px] flex items-center justify-between gap-2 transition text-left select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          highlightSelected && isSelected
            ? "border-[#007E7A]/40 bg-[#E6F4F3]/50 text-[#007E7A] font-semibold"
            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
        } ${
          terbuka ? "ring-2 ring-[#007E7A]/20 border-[#007E7A] bg-white" : ""
        } ${className}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {Icon && (
            <Icon
              className={`w-4 h-4 shrink-0 ${
                terbuka || (highlightSelected && isSelected)
                  ? "text-[#007E7A]"
                  : "text-slate-400"
              }`}
            />
          )}
          <span
            className={`truncate ${
              opsiTerpilih ? "" : "text-slate-400 font-normal"
            }`}
          >
            {opsiTerpilih ? opsiTerpilih.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            terbuka ? "rotate-180 text-[#007E7A]" : "text-slate-400"
          }`}
        />
      </button>

      {terbuka && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
        >
          {searchable && (
            <div className="relative flex items-center bg-slate-100/90 rounded-lg px-2.5 py-1.5 border border-slate-200/60">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={kataKunci}
                onChange={(e) => setKataKunci(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 pl-2 focus:outline-none"
              />
              {kataKunci && (
                <button
                  type="button"
                  onClick={() => setKataKunci("")}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
            {opsiTersaring.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-slate-400 text-center">
                Tidak ditemukan
              </div>
            ) : (
              opsiTersaring.map((opt) => {
                const aktif = opt.value === value;
                return (
                  <button
                    key={opt.value || "__empty__"}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      if (opt.disabled) return;
                      onChange(opt.value);
                      setTerbuka(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 text-left transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      aktif
                        ? "bg-[#E6F4F3] text-[#007E7A] font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {aktif && (
                      <Check className="w-3.5 h-3.5 text-[#007E7A] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
