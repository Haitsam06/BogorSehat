"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

export interface DropdownOptionItem {
  value: string;
  label: string;
}

interface DropdownPencarianProps {
  label: string;
  daftar_pilihan: Array<string | DropdownOptionItem>;
  nilai_terpilih: string;
  saat_memilih: (nilai: string) => void;
  placeholder_pencarian?: string;
  teks_default?: string;
}

const DROPDOWN_BATCH_SIZE = 100;

export default function DropdownPencarian({
  label,
  daftar_pilihan,
  nilai_terpilih,
  saat_memilih,
  placeholder_pencarian = "Cari opsi...",
  teks_default = "Semua",
}: DropdownPencarianProps) {
  const [apakah_terbuka, set_apakah_terbuka] = useState(false);
  const [kata_kunci, set_kata_kunci] = useState("");
  const [jumlah_tampil, set_jumlah_tampil] = useState(DROPDOWN_BATCH_SIZE);
  const kontainer_ref = useRef<HTMLDivElement | null>(null);
  const input_ref = useRef<HTMLInputElement | null>(null);

  const opsi_ternormalisasi = useMemo<DropdownOptionItem[]>(
    () =>
      daftar_pilihan.map((item) =>
        typeof item === "string" ? { value: item, label: item } : item
      ),
    [daftar_pilihan]
  );

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function tangani_klik_luar(e: MouseEvent) {
      if (
        kontainer_ref.current &&
        !kontainer_ref.current.contains(e.target as Node)
      ) {
        set_apakah_terbuka(false);
      }
    }
    document.addEventListener("mousedown", tangani_klik_luar);
    return () => document.removeEventListener("mousedown", tangani_klik_luar);
  }, []);

  // Fokuskan input saat dropdown dibuka
  useEffect(() => {
    if (apakah_terbuka) {
      set_jumlah_tampil(DROPDOWN_BATCH_SIZE);
      setTimeout(() => input_ref.current?.focus(), 50);
    } else {
      set_kata_kunci("");
    }
  }, [apakah_terbuka]);

  // Saring opsi berdasarkan kata kunci
  const opsi_tersaring = useMemo(() => {
    const q = kata_kunci.trim().toLowerCase();
    if (!q) return opsi_ternormalisasi;
    return opsi_ternormalisasi.filter((item) =>
      item.label.toLowerCase().includes(q)
    );
  }, [opsi_ternormalisasi, kata_kunci]);

  useEffect(() => {
    set_jumlah_tampil(DROPDOWN_BATCH_SIZE);
  }, [kata_kunci]);

  const opsi_tampil = useMemo(
    () => opsi_tersaring.slice(0, jumlah_tampil),
    [opsi_tersaring, jumlah_tampil]
  );

  const opsi_aktif = useMemo(
    () => opsi_ternormalisasi.find((item) => item.value === nilai_terpilih),
    [opsi_ternormalisasi, nilai_terpilih]
  );

  const apakah_aktif = nilai_terpilih !== "ALL" && nilai_terpilih !== "";

  const tangani_scroll_opsi = (e: React.UIEvent<HTMLDivElement>) => {
    if (jumlah_tampil >= opsi_tersaring.length) return;
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      set_jumlah_tampil((prev) =>
        Math.min(prev + DROPDOWN_BATCH_SIZE, opsi_tersaring.length)
      );
    }
  };

  return (
    <div className="space-y-1.5 relative" ref={kontainer_ref}>
      <label className="block text-xs font-bold text-slate-800">{label}</label>

      {/* Tombol Pemicu Dropdown */}
      <button
        type="button"
        onClick={() => set_apakah_terbuka(!apakah_terbuka)}
        className={`w-full h-9 px-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition text-left select-none ${
          apakah_aktif
            ? "border-[#007E7A] bg-teal-50/30 text-[#007E7A] font-bold"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
        } ${apakah_terbuka ? "ring-2 ring-[#007E7A]/20 border-[#007E7A]" : ""}`}
      >
        <span className="truncate">
          {apakah_aktif ? opsi_aktif?.label || nilai_terpilih : teks_default}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {apakah_aktif && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                saat_memilih("ALL");
              }}
              className="w-4 h-4 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              title="Reset pilihan"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              apakah_terbuka ? "rotate-180 text-[#007E7A]" : ""
            }`}
          />
        </div>
      </button>

      {/* Menu Dropdown Melayang */}
      {apakah_terbuka && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-xl shadow-lg border border-slate-200/90 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
          {/* Input Pencarian di dalam Dropdown */}
          <div className="relative flex items-center bg-slate-100/90 rounded-lg px-2.5 py-1.5 border border-slate-200/60">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              ref={input_ref}
              type="text"
              value={kata_kunci}
              onChange={(e) => set_kata_kunci(e.target.value)}
              placeholder={placeholder_pencarian}
              className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 pl-2 focus:outline-none"
            />
            {kata_kunci && (
              <button
                type="button"
                onClick={() => set_kata_kunci("")}
                className="w-4 h-4 rounded-full text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Daftar Opsi dengan Scroll */}
          <div
            onScroll={tangani_scroll_opsi}
            className="max-h-44 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5"
          >
            {/* Opsi Semua / Reset */}
            <button
              type="button"
              onClick={() => {
                saat_memilih("ALL");
                set_apakah_terbuka(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between text-left transition ${
                !apakah_aktif
                  ? "bg-[#E6F4F3] text-[#007E7A] font-bold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{teks_default}</span>
              {!apakah_aktif && <Check className="w-3.5 h-3.5 text-[#007E7A]" />}
            </button>

            {opsi_tampil.length === 0 ? (
              <div className="p-3 text-center text-[11px] text-slate-400">
                Tidak ada hasil ditemukan
              </div>
            ) : (
              <>
                {opsi_tampil.map((opsi) => {
                  const terpilih = nilai_terpilih === opsi.value;
                  return (
                    <button
                      key={opsi.value}
                      type="button"
                      onClick={() => {
                        saat_memilih(opsi.value);
                        set_apakah_terbuka(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-left transition ${
                        terpilih
                          ? "bg-[#E6F4F3] text-[#007E7A] font-bold"
                          : "text-slate-700 hover:bg-slate-50 font-medium"
                      }`}
                    >
                      <span className="truncate pr-2">{opsi.label}</span>
                      {terpilih && (
                        <Check className="w-3.5 h-3.5 text-[#007E7A] shrink-0" />
                      )}
                    </button>
                  );
                })}
                {jumlah_tampil < opsi_tersaring.length && (
                  <button
                    type="button"
                    onClick={() =>
                      set_jumlah_tampil((prev) =>
                        Math.min(prev + DROPDOWN_BATCH_SIZE, opsi_tersaring.length)
                      )
                    }
                    className="w-full py-1.5 text-center text-[10px] font-semibold text-[#007E7A] hover:underline"
                  >
                    Muat lagi ({opsi_tampil.length}/{opsi_tersaring.length})
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
