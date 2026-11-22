"use client";

import React from "react";
import Link from "next/link";
import { Trash2, ExternalLink, CornerUpLeft, Flag } from "lucide-react";
import type { ApiKomentar, ApiUser } from "@/lib/api";
import StarRating from "@/components/ui/StarRating";

interface UlasanCardProps {
  ulasan: ApiKomentar;
  currentUser?: ApiUser | null;
  onHapus?: (id: number) => void;
  onBalas?: (id: number) => void;
  onLapor?: (id: number, ringkasan: string) => void;
  tampilkanFaskesInfo?: boolean;
  className?: string;
}

function formatTanggal(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Baru saja";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Baru saja";
  }
}

export default function UlasanCard({
  ulasan,
  currentUser,
  onHapus,
  onBalas,
  onLapor,
  tampilkanFaskesInfo = false,
  className = "",
}: UlasanCardProps) {
  const isOwner =
    currentUser !== null &&
    currentUser !== undefined &&
    ulasan.id_user === currentUser.id_user;
  const faskes = ulasan.faskes;

  // Jika ditampilkan di halaman profil (dengan info nama faskes terkait)
  if (tampilkanFaskesInfo) {
    return (
      <div
        className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 hover:border-slate-300 transition space-y-2.5 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={faskes?.id_faskes ? `/faskes/${faskes.id_faskes}` : "/cari-faskes"}
              className="font-extrabold text-slate-900 text-sm hover:text-[#007E7A] transition"
            >
              {faskes?.nama_faskes || "Fasilitas Kesehatan"}
            </Link>
            {faskes?.kelas_faskes && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                {faskes.kelas_faskes}
              </span>
            )}
            {faskes?.jenis_faskes && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-[#007E7A]">
                {faskes.jenis_faskes}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {ulasan.rating !== null && ulasan.rating !== undefined && (
              <StarRating rating={ulasan.rating} ukuran="kecil" />
            )}
            <span className="text-[11px] text-slate-400">
              {formatTanggal(ulasan.created_at)}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-3">
          {ulasan.body}
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <Link
            href={faskes?.id_faskes ? `/faskes/${faskes.id_faskes}#ulasan` : "/cari-faskes"}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007E7A] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Lihat di Halaman Faskes</span>
          </Link>

          {onHapus && (
            <button
              type="button"
              onClick={() => onHapus(ulasan.id_komentar)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Hapus</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Tampilan standar untuk halaman detail faskes
  const authorName = ulasan.user?.nama_user || "Warga Bogor";
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#007E7A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {initials}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              {authorName}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {formatTanggal(ulasan.created_at)}
            </p>
          </div>
        </div>

        {ulasan.rating !== null && ulasan.rating !== undefined && (
          <StarRating rating={ulasan.rating} ukuran="kecil" />
        )}
      </div>

      <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
        {ulasan.body}
      </p>

      {/* Aksi ulasan (Balas, Hapus, Lapor) */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-50 text-[11px]">
        {onBalas && (
          <button
            type="button"
            onClick={() => onBalas(ulasan.id_komentar)}
            className="font-bold text-[#007E7A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <CornerUpLeft className="w-3 h-3" />
            <span>Balas</span>
          </button>
        )}

        {isOwner && onHapus && (
          <button
            type="button"
            onClick={() => onHapus(ulasan.id_komentar)}
            className="font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Hapus</span>
          </button>
        )}

        {!isOwner && onLapor && (
          <button
            type="button"
            onClick={() => onLapor(ulasan.id_komentar, ulasan.body)}
            className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer ml-auto"
            title="Laporkan ulasan tidak pantas"
          >
            <Flag className="w-3 h-3" />
            <span>Laporkan</span>
          </button>
        )}
      </div>
    </div>
  );
}
