"use client";

import React, { useMemo } from "react";
import { MapPin, ChevronDown, X, Layers } from "lucide-react";
import {
  DATA_WILAYAH,
  DataWilayah,
} from "@/data/data_wilayah";

export interface FilterWilayahValue {
  wilayahId: string | null;    // "kota-bogor" | "kab-bogor" | null
  kecamatan: string | null;    // nama kecamatan terpilih, atau null
}

interface FilterWilayahProps {
  value: FilterWilayahValue;
  onChange: (val: FilterWilayahValue) => void;
  className?: string;
}

export function FilterWilayah({ value, onChange, className = "" }: FilterWilayahProps) {
  const wilayahTerpilih: DataWilayah | undefined = useMemo(
    () => DATA_WILAYAH.find((w) => w.id === value.wilayahId),
    [value.wilayahId]
  );

  const kecamatanList = wilayahTerpilih?.kecamatan ?? [];

  const handleWilayahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value || null;
    onChange({ wilayahId: newId, kecamatan: null });
  };

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...value, kecamatan: e.target.value || null });
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
            className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 hover:text-rose-700 transition"
            title="Hapus filter wilayah"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Dropdown Kota / Kabupaten */}
      <div className="relative">
        <MapPin className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <select
          value={value.wilayahId ?? ""}
          onChange={handleWilayahChange}
          className="w-full h-8 pl-7 pr-7 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] appearance-none cursor-pointer"
        >
          <option value="">Semua Wilayah</option>
          {DATA_WILAYAH.map((w) => (
            <option key={w.id} value={w.id}>
              {w.nama}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Dropdown Kecamatan (hanya muncul jika wilayah dipilih) */}
      {wilayahTerpilih && (
        <div className="relative">
          <MapPin className="w-3 h-3 text-[#059669] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={value.kecamatan ?? ""}
            onChange={handleKecamatanChange}
            className="w-full h-8 pl-7 pr-7 rounded-lg border border-emerald-600/30 bg-emerald-50/40 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 appearance-none cursor-pointer font-medium"
          >
            <option value="">-- Pilih Kecamatan --</option>
            <option value="SEMUA">Semua Kecamatan di {wilayahTerpilih.nama}</option>
            {kecamatanList.map((kec) => (
              <option key={kec} value={kec}>
                {kec}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-[#059669] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
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
