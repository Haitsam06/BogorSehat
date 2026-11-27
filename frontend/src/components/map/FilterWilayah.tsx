"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, ChevronDown, X, Layers, Check, Search } from "lucide-react";
import { DATA_WILAYAH, DataWilayah } from "@/data/data_wilayah";

export interface FilterWilayahValue {
  wilayahId: string | null; // "kota-bogor" | "kab-bogor" | null
  kecamatan: string | null; // nama kecamatan terpilih, atau null
}

interface FilterWilayahProps {
  value: FilterWilayahValue;
  onChange: (val: FilterWilayahValue) => void;
  className?: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  activeTone?: "teal" | "emerald";
}

function CustomDropdown({
  options,
  value,
  onChange,
  placeholder,
  searchable = false,
  searchPlaceholder = "Cari...",
  activeTone = "teal",
}: CustomDropdownProps) {
  const [terbuka, setTerbuka] = useState(false);
  const [kataKunci, setKataKunci] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const isSelectedNonEmpty = value !== "";
  const isEmerald = activeTone === "emerald";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setTerbuka((prev) => !prev)}
        className={`w-full h-9 px-2.5 rounded-xl border text-[11px] flex items-center justify-between gap-2 transition text-left select-none cursor-pointer ${
          isSelectedNonEmpty
            ? isEmerald
              ? "border-emerald-600/40 bg-emerald-50/50 text-[#047857] font-semibold"
              : "border-[#007E7A]/40 bg-[#E6F4F3]/50 text-[#007E7A] font-semibold"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
        } ${
          terbuka
            ? isEmerald
              ? "ring-2 ring-emerald-500/20 border-emerald-600"
              : "ring-2 ring-[#007E7A]/20 border-[#007E7A]"
            : ""
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <MapPin
            className={`w-3.5 h-3.5 shrink-0 ${
              isSelectedNonEmpty
                ? isEmerald
                  ? "text-[#059669]"
                  : "text-[#007E7A]"
                : "text-slate-400"
            }`}
          />
          <span className="truncate">
            {opsiTerpilih ? opsiTerpilih.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            terbuka
              ? isEmerald
                ? "rotate-180 text-[#059669]"
                : "rotate-180 text-[#007E7A]"
              : "text-slate-400"
          }`}
        />
      </button>

      {terbuka && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          {searchable && (
            <div className="relative flex items-center bg-slate-100/90 rounded-lg px-2.5 py-1.5 border border-slate-200/60">
              <Search className="w-3 h-3 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={kataKunci}
                onChange={(e) => setKataKunci(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-[11px] text-slate-800 placeholder:text-slate-400 pl-2 focus:outline-none"
              />
              {kataKunci && (
                <button
                  type="button"
                  onClick={() => setKataKunci("")}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
            {opsiTersaring.length === 0 ? (
              <div className="px-2.5 py-2 text-[11px] text-slate-400 text-center">
                Tidak ditemukan
              </div>
            ) : (
              opsiTersaring.map((opt) => {
                const aktif = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setTerbuka(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-lg text-[11px] flex items-center justify-between gap-2 text-left transition cursor-pointer ${
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

export function FilterWilayah({
  value,
  onChange,
  className = "",
}: FilterWilayahProps) {
  const wilayahTerpilih: DataWilayah | undefined = useMemo(
    () => DATA_WILAYAH.find((w) => w.id === value.wilayahId),
    [value.wilayahId]
  );

  const wilayahOptions: DropdownOption[] = useMemo(
    () => [
      { value: "", label: "Semua Wilayah" },
      ...DATA_WILAYAH.map((w) => ({ value: w.id, label: w.nama })),
    ],
    []
  );

  const kecamatanOptions: DropdownOption[] = useMemo(() => {
    if (!wilayahTerpilih) return [];
    return [
      { value: "", label: "-- Pilih Kecamatan --" },
      { value: "SEMUA", label: `Semua Kecamatan di ${wilayahTerpilih.nama}` },
      ...wilayahTerpilih.kecamatan.map((kec) => ({ value: kec, label: kec })),
    ];
  }, [wilayahTerpilih]);

  const handleWilayahChange = (newId: string) => {
    onChange({ wilayahId: newId || null, kecamatan: null });
  };

  const handleKecamatanChange = (newKec: string) => {
    onChange({ ...value, kecamatan: newKec || null });
  };

  const handleReset = () => {
    onChange({ wilayahId: null, kecamatan: null });
  };

  const adaFilter = value.wilayahId !== null || value.kecamatan !== null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#007E7A]" />
          <span>Filter Wilayah</span>
        </span>
        {adaFilter && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 hover:text-rose-700 transition cursor-pointer"
            title="Hapus filter wilayah"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Dropdown Kota / Kabupaten */}
      <CustomDropdown
        options={wilayahOptions}
        value={value.wilayahId ?? ""}
        onChange={handleWilayahChange}
        placeholder="Semua Wilayah"
        activeTone="teal"
      />

      {/* Dropdown Kecamatan (hanya muncul jika wilayah dipilih) */}
      {wilayahTerpilih && (
        <CustomDropdown
          options={kecamatanOptions}
          value={value.kecamatan ?? ""}
          onChange={handleKecamatanChange}
          placeholder="-- Pilih Kecamatan --"
          searchable={kecamatanOptions.length > 8}
          searchPlaceholder="Cari kecamatan..."
          activeTone="emerald"
        />
      )}

      {/* Badge aktif */}
      {adaFilter && (
        <div className="text-[10px] font-semibold text-[#047857] bg-emerald-50 border border-emerald-200/60 rounded-lg px-2 py-1 flex items-center gap-1 leading-none">
          <Layers className="w-3 h-3 shrink-0" />
          <span>
            {value.kecamatan === "SEMUA"
              ? `Semua Kecamatan (${wilayahTerpilih?.nama})`
              : value.kecamatan
              ? `Kec. ${value.kecamatan}`
              : `${wilayahTerpilih?.nama} (Pilih Kecamatan)`}
          </span>
        </div>
      )}
    </div>
  );
}

export default FilterWilayah;
