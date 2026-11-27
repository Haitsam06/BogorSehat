"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  ThumbsUp,
  MessageSquare,
  Eye,
  MapPin,
  Trash2,
  Flag,
  Share2,
  ArrowRight,
} from "lucide-react";
import type { ApiDiskusi, ApiUser } from "@/lib/api";

interface DiskusiCardProps {
  item: ApiDiskusi;
  currentUser?: ApiUser | null;
  onHapus?: (id: number) => void;
  onLapor?: (id: number, judul: string) => void;
  onBagikan?: (id: number, judul: string) => void;
  className?: string;
  tampilkanDetailPenulis?: boolean;
}

export default function DiskusiCard({
  item,
  currentUser,
  onHapus,
  onLapor,
  onBagikan,
  className = "",
  tampilkanDetailPenulis = true,
}: DiskusiCardProps) {
  const [menuBuka, setMenuBuka] = useState(false);

  const isOwner =
    currentUser !== null &&
    currentUser !== undefined &&
    item.id_user === currentUser.id_user;
  const authorName = item.user?.nama_user || "Warga Bogor";
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const totalTanggapan = item.jumlah_tanggapan ?? item.tanggapan?.length ?? 0;
  const likesCount = item.jumlah_suka ?? 0;
  const viewsCount = item.jumlah_dilihat ?? 0;
  const faskesName = item.faskes_terkait?.nama_faskes;
  // `jarak_faskes_km` hanya dikirim endpoint `/diskusi/nearby`.
  const jarakFaskes =
    typeof item.jarak_faskes_km === "number"
      ? `${item.jarak_faskes_km.toFixed(1)} km`
      : null;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-[#007E7A] p-5 sm:p-6 shadow-xs hover:shadow-md transition space-y-4 relative ${className}`}
    >
      {/* Header Row: Badges & Three dots */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {isOwner && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#007E7A] border border-teal-200">
              Diskusi Saya
            </span>
          )}
          {item.kategori_diskusi && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              {item.kategori_diskusi}
            </span>
          )}
          {faskesName && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4F3] text-[#007E7A] flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{faskesName}</span>
              {jarakFaskes && (
                <span className="text-[#005F5C]/70 font-bold">· {jarakFaskes}</span>
              )}
            </span>
          )}
        </div>

        {/* Dropdown Menu Tiga Titik */}
        {(onHapus || onLapor) && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuBuka((prev) => !prev)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Opsi diskusi"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuBuka && (
              <div className="absolute right-0 top-7 z-20 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-xs animate-in fade-in duration-100">
                {isOwner && onHapus ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuBuka(false);
                      onHapus(item.id_diskusi);
                    }}
                    className="w-full px-3.5 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Diskusi</span>
                  </button>
                ) : onLapor ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuBuka(false);
                      onLapor(item.id_diskusi, item.judul_diskusi);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5 text-rose-500" />
                    <span>Laporkan Konten</span>
                  </button>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Author Info */}
      {tampilkanDetailPenulis && (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#007E7A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {initials}
          </div>
          <div>
            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight">
              {authorName}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {item.sublokasi_penulis || "Bogor"}
            </p>
          </div>
        </div>
      )}

      {/* Judul & Cuplikan Konten */}
      <div className="space-y-1.5">
        <Link href={`/diskusi/${item.id_diskusi}`} className="block group">
          <h2 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-[#007E7A] transition leading-snug">
            {item.judul_diskusi}
          </h2>
        </Link>
        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-3">
          {item.body}
        </p>
      </div>

      {/* Footer Interaksi */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <span className="flex items-center gap-1.5 hover:text-[#007E7A] cursor-pointer">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{likesCount} Suka</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{totalTanggapan} Balasan</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{viewsCount} Dilihat</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onBagikan && (
            <button
              type="button"
              onClick={() => onBagikan(item.id_diskusi, item.judul_diskusi)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Bagikan tautan"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          <Link
            href={`/diskusi/${item.id_diskusi}`}
            className="px-3.5 py-1.5 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <span>Buka Diskusi ({totalTanggapan})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
