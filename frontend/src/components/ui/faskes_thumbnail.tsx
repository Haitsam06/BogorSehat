"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  FlaskConical,
  HeartPulse,
  Hospital,
  Pill,
  Smile,
  Stethoscope,
  UserRound,
} from "lucide-react";

interface FaskesVisualConfig {
  bgClass: string;
  iconBgClass: string;
  iconColorClass: string;
  labelColorClass: string;
  hexColor: string;
  svgInner: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export function getFaskesVisual(kategori?: string | null): FaskesVisualConfig {
  const jenis = (kategori || "").toUpperCase();

  if (jenis.includes("RUMAH SAKIT")) {
    return {
      bgClass: "bg-gradient-to-br from-rose-50 via-red-50 to-rose-100/80",
      iconBgClass: "bg-rose-600 shadow-rose-200",
      iconColorClass: "text-white",
      labelColorClass: "text-rose-700",
      hexColor: "#E11D48",
      svgInner:
        '<path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>',
      Icon: Hospital,
    };
  }

  if (jenis.includes("PUSKESMAS")) {
    return {
      bgClass: "bg-gradient-to-br from-teal-50 via-[#E6F4F3] to-teal-100/80",
      iconBgClass: "bg-[#007E7A] shadow-teal-200",
      iconColorClass: "text-white",
      labelColorClass: "text-[#007E7A]",
      hexColor: "#007E7A",
      svgInner:
        '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
      Icon: HeartPulse,
    };
  }

  if (jenis.includes("KLINIK")) {
    return {
      bgClass: "bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100/80",
      iconBgClass: "bg-sky-600 shadow-sky-200",
      iconColorClass: "text-white",
      labelColorClass: "text-sky-700",
      hexColor: "#0284C7",
      svgInner:
        '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
      Icon: Stethoscope,
    };
  }

  if (jenis.includes("APOTEK")) {
    return {
      bgClass: "bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100/80",
      iconBgClass: "bg-emerald-600 shadow-emerald-200",
      iconColorClass: "text-white",
      labelColorClass: "text-emerald-700",
      hexColor: "#059669",
      svgInner:
        '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
      Icon: Pill,
    };
  }

  if (jenis.includes("GIGI")) {
    return {
      bgClass: "bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-100/80",
      iconBgClass: "bg-indigo-600 shadow-indigo-200",
      iconColorClass: "text-white",
      labelColorClass: "text-indigo-700",
      hexColor: "#4F46E5",
      svgInner:
        '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
      Icon: Smile,
    };
  }

  if (jenis.includes("DOKTER") || jenis.includes("PRAKTIK")) {
    return {
      bgClass: "bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-100/80",
      iconBgClass: "bg-purple-600 shadow-purple-200",
      iconColorClass: "text-white",
      labelColorClass: "text-purple-700",
      hexColor: "#9333EA",
      svgInner:
        '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
      Icon: UserRound,
    };
  }

  if (jenis.includes("LABORATORIUM") || jenis.includes("LAB")) {
    return {
      bgClass: "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/80",
      iconBgClass: "bg-amber-600 shadow-amber-200",
      iconColorClass: "text-white",
      labelColorClass: "text-amber-700",
      hexColor: "#D97706",
      svgInner:
        '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
      Icon: FlaskConical,
    };
  }

  return {
    bgClass: "bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/70",
    iconBgClass: "bg-slate-600 shadow-slate-200",
    iconColorClass: "text-white",
    labelColorClass: "text-slate-700",
    hexColor: "#475569",
    svgInner:
      '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
    Icon: Building2,
  };
}

interface FaskesThumbnailProps {
  gambar_faskes?: string | null;
  nama_faskes: string;
  kategori_faskes?: string | null;
  className?: string;
  /**
   * `true` untuk gambar above-the-fold yang harus segera tampil (kartu
   * pertama). Sisanya lazy: halaman daftar memuat 12 kartu sekaligus
   * padahal layar hanya menampilkan sebagian.
   */
  prioritas?: boolean;
}

export function FaskesThumbnail({
  gambar_faskes,
  nama_faskes,
  kategori_faskes,
  className = "w-full h-full",
  prioritas = false,
}: FaskesThumbnailProps) {
  const [gagalMuat, setGagalMuat] = useState(false);

  useEffect(() => {
    setGagalMuat(false);
  }, [gambar_faskes]);

  const punyaGambar = Boolean(gambar_faskes && gambar_faskes.trim() !== "") && !gagalMuat;

  if (punyaGambar) {
    return (
      <img
        src={gambar_faskes!}
        alt={nama_faskes}
        loading={prioritas ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={prioritas ? "high" : "auto"}
        onError={() => setGagalMuat(true)}
        className={`${className} object-cover group-hover:scale-105 transition-transform duration-500`}
      />
    );
  }

  const { bgClass, iconBgClass, iconColorClass, labelColorClass, Icon } =
    getFaskesVisual(kategori_faskes);

  return (
    <div
      className={`${className} ${bgClass} flex flex-col items-center justify-center gap-2.5 p-4 select-none`}
    >
      <div
        className={`w-14 h-14 rounded-2xl ${iconBgClass} shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className={`w-7 h-7 ${iconColorClass}`} />
      </div>
      <span
        className={`text-[10px] font-extrabold uppercase tracking-wider ${labelColorClass} opacity-80 text-center line-clamp-1`}
      >
        {kategori_faskes || "Fasilitas Kesehatan"}
      </span>
    </div>
  );
}
