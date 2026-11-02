"use client";

import React from "react";
import { Stethoscope } from "lucide-react";

interface BadgePoliProps {
  nama_poli: string;
  ukuran_badge?: "mikro" | "kecil" | "sedang";
  aktif_dipilih?: boolean;
  saat_diklik?: () => void;
}

export function BadgePoli({
  nama_poli,
  ukuran_badge = "kecil",
  aktif_dipilih = false,
  saat_diklik,
}: BadgePoliProps) {
  let kelas_ukuran = "px-2 py-0.5 text-[10px] gap-1";
  let ukuran_ikon = "w-2.5 h-2.5";

  if (ukuran_badge === "sedang") {
    kelas_ukuran = "px-3 py-1 text-xs gap-1.5";
    ukuran_ikon = "w-3 h-3";
  } else if (ukuran_badge === "mikro") {
    kelas_ukuran = "px-1.5 py-[1.5px] text-[8.5px] gap-1 leading-tight";
    ukuran_ikon = "w-2 h-2";
  }

  const kelas_warna = aktif_dipilih
    ? "bg-[#007E7A] text-white border-[#007E7A]"
    : "bg-[#E6F4F3] text-[#007E7A] border-[#BCE3E0] hover:bg-[#D5ECEB]";

  if (saat_diklik) {
    return (
      <button
        type="button"
        onClick={saat_diklik}
        className={`inline-flex items-center whitespace-nowrap shrink-0 font-bold rounded-full border transition ${kelas_ukuran} ${kelas_warna}`}
      >
        <Stethoscope className={`${ukuran_ikon} shrink-0`} />
        <span>{nama_poli}</span>
      </button>
    );
  }

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap shrink-0 font-bold rounded-full border ${kelas_ukuran} ${kelas_warna}`}
    >
      <Stethoscope className={`${ukuran_ikon} shrink-0`} />
      <span>{nama_poli}</span>
    </span>
  );
}

interface DaftarBadgePoliProps {
  daftar_poli: string[];
  maksimal_tampil?: number;
  ukuran_badge?: "mikro" | "kecil" | "sedang";
}

export function DaftarBadgePoli({
  daftar_poli,
  maksimal_tampil = 3,
  ukuran_badge = "kecil",
}: DaftarBadgePoliProps) {
  const poli_ditampilkan = daftar_poli.slice(0, maksimal_tampil);
  const sisa_poli = daftar_poli.length - poli_ditampilkan.length;

  const kelas_sisa =
    ukuran_badge === "mikro"
      ? "px-1.5 py-[1.5px] text-[8.5px] leading-tight"
      : ukuran_badge === "sedang"
      ? "px-2.5 py-1 text-xs"
      : "px-2 py-0.5 text-[10px]";

  return (
    <div className="flex flex-wrap items-center gap-1">
      {poli_ditampilkan.map((nama_poli) => (
        <BadgePoli
          key={nama_poli}
          nama_poli={nama_poli}
          ukuran_badge={ukuran_badge}
        />
      ))}
      {sisa_poli > 0 && (
        <span
          className={`rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold ${kelas_sisa}`}
        >
          +{sisa_poli} Poli
        </span>
      )}
    </div>
  );
}
