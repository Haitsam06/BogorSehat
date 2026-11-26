"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Map,
  CornerUpRight,
  Phone,
  Navigation,
  InfoIcon,
  Info,
} from "lucide-react";
import { BPJS_STATUS_CLASS, BPJS_STATUS_SHORT } from "@/lib/bpjsStatus";
import type { DataFaskesItem } from "@/data/data_faskes";
import { FaskesThumbnail } from "@/components/ui/faskes_thumbnail";
import StarRating from "@/components/ui/StarRating";

interface FaskesCardProps {
  faskes: DataFaskesItem;
  variant?: "grid" | "home";
  className?: string;
}

export default function FaskesCard({
  faskes,
  variant = "grid",
  className = "",
}: FaskesCardProps) {
  const detailHref = `/faskes/${faskes.slug_faskes}`;

  if (variant === "home") {
    return (
      <div
        className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition group ${className}`}
      >
        <div>
          {/* Thumbnail Faskes */}
          <Link
            href={detailHref}
            className="block relative h-[160px] bg-slate-100 overflow-hidden"
          >
            <FaskesThumbnail
              gambar_faskes={faskes.gambar_faskes}
              nama_faskes={faskes.nama_faskes}
              kategori_faskes={faskes.kategori_faskes}
              className="w-full h-full"
            />
            <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[#007E7A] text-[10px] font-extrabold shadow-xs">
              {faskes.jarak_km}
            </span>
          </Link>

          <div className="p-5 pb-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#007E7A]">
                {faskes.kategori_faskes}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                {faskes.kelas_faskes}
              </span>
            </div>

            <Link
              href={detailHref}
              className="block text-base font-extrabold text-slate-900 group-hover:text-[#007E7A] transition line-clamp-1"
            >
              {faskes.nama_faskes}
            </Link>

            <div className="flex items-start gap-1.5 text-[11px] text-slate-500 leading-relaxed line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{faskes.alamat_lengkap}</span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Kartu Beranda */}
        <div className="px-5 pb-5 pt-1 flex items-center gap-2">
          <Link
            href="/peta"
            className="flex-1 h-9 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Buka di Peta</span>
          </Link>

          <Link
            href={detailHref}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
            title="Lihat Detail & Petunjuk Arah"
          >
            <Info className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Variant "grid" (default untuk Direktori / Pencarian Faskes)
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition ${className}`}
    >
      <div>
        <Link
          href={detailHref}
          className="group block relative h-[160px] bg-slate-100 overflow-hidden"
        >
          <FaskesThumbnail
            gambar_faskes={faskes.gambar_faskes}
            nama_faskes={faskes.nama_faskes}
            kategori_faskes={faskes.kategori_faskes}
            className="w-full h-full"
          />
          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[#007E7A] text-[10px] font-extrabold shadow-xs">
            {faskes.jarak_km}
          </span>
        </Link>

        <div className="p-4 sm:p-5 pb-3 space-y-2.5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#007E7A] block">
              {faskes.kategori_faskes}
            </span>
            <Link
              href={detailHref}
              className="text-sm sm:text-base font-extrabold text-slate-900 hover:text-[#007E7A] transition mt-0.5 block line-clamp-1"
            >
              {faskes.nama_faskes}
            </Link>
          </div>

          <p className="text-xs text-slate-500 line-clamp-1">
            {faskes.alamat_lengkap}
          </p>

          <div className="flex items-center gap-3">
            <StarRating
              rating={faskes.sudah_dirating ? parseFloat(faskes.rating_faskes) : 0}
              jumlahUlasan={faskes.jumlah_ulasan}
              teksBelumDirating="Belum Dirating"
            />
            <div className="flex items-center gap-1.5">
              <span
                className={`px-1.5 py-[1px] rounded text-[8px] font-bold border ${BPJS_STATUS_CLASS[faskes.bpjs_status]}`}
              >
                {BPJS_STATUS_SHORT[faskes.bpjs_status]}
              </span>
              {faskes.status_igd_24jam && (
                <span className="px-1.5 py-[1px] rounded bg-rose-50 text-rose-700 text-[8px] font-bold border border-rose-200">
                  UGD 24 Jam
                </span>
              )}
            </div>
          </div>

          {/* Badge Poliklinik */}
          {faskes.daftar_poli && faskes.daftar_poli.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {faskes.daftar_poli.slice(0, 3).map((poli) => (
                <span
                  key={poli}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E6F4F3] text-[#007E7A] border border-[#B3DFDD]"
                >
                  {poli}
                </span>
              ))}
              {faskes.daftar_poli.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                  +{faskes.daftar_poli.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 flex items-center gap-1.5">
        <Link
          href={detailHref}
          className="flex-1 h-[38px] rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold flex items-center justify-center transition shadow-xs"
        >
          Lihat Detail
        </Link>
        <Link
          href="/peta"
          className="w-[38px] h-[38px] rounded-xl border border-slate-200/90 hover:border-[#007E7A] hover:bg-teal-50/50 text-[#007E7A] flex items-center justify-center transition shrink-0"
          title="Petunjuk Arah di Peta"
        >
          <Navigation className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
