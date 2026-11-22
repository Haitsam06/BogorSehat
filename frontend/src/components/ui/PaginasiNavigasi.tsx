"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiPaginationMeta } from "@/lib/api";

interface PaginasiNavigasiProps {
  meta: ApiPaginationMeta | null;
  halamanAktif: number;
  saatGantiHalaman: (halamanBaru: number) => void;
  className?: string;
}

export default function PaginasiNavigasi({
  meta,
  halamanAktif,
  saatGantiHalaman,
  className = "",
}: PaginasiNavigasiProps) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs ${className}`}
    >
      <span className="text-slate-600">
        Halaman <strong className="text-slate-900">{meta.current_page}</strong> dari{" "}
        <strong className="text-slate-900">{meta.last_page}</strong>
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={halamanAktif <= 1}
          onClick={() => saatGantiHalaman(Math.max(1, halamanAktif - 1))}
          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 flex items-center gap-1 disabled:opacity-40 disabled:hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Sebelumnya</span>
        </button>

        <span className="w-7 h-7 rounded bg-[#007E7A] text-white font-bold text-[11px] flex items-center justify-center">
          {meta.current_page}
        </span>

        <button
          type="button"
          disabled={halamanAktif >= meta.last_page}
          onClick={() => saatGantiHalaman(Math.min(meta.last_page, halamanAktif + 1))}
          className="px-2.5 py-1 text-[#007E7A] font-semibold flex items-center gap-1 hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer disabled:cursor-not-allowed transition"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
