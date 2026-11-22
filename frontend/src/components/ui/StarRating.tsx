"use client";

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  /** Nilai rating numerik (0 - 5) */
  rating?: number | null;
  /** Jumlah total ulasan/rating jika untuk mode display */
  jumlahUlasan?: number;
  /** Teks label alternatif jika belum dirating */
  teksBelumDirating?: string;
  /** Mode interaktif untuk form input ulasan */
  interaktif?: boolean;
  /** Callback saat nilai bintang diklik (mode interaktif) */
  onChange?: (rating: number) => void;
  /** Ukuran bintang */
  ukuran?: "kecil" | "sedang" | "besar";
  /** Kelas styling tambahan */
  className?: string;
  /** Menampilkan angka skor rating di samping bintang */
  tampilkanSkor?: boolean;
}

export default function StarRating({
  rating = 0,
  jumlahUlasan,
  teksBelumDirating = "Belum Dirating",
  interaktif = false,
  onChange,
  ukuran = "sedang",
  className = "",
  tampilkanSkor = true,
}: StarRatingProps) {
  const ratingNum = typeof rating === "number" ? rating : 0;
  const sudahDirating = (jumlahUlasan ?? 0) > 0 || ratingNum > 0;

  const sizeClass =
    ukuran === "kecil"
      ? "w-3 h-3"
      : ukuran === "besar"
      ? "w-5 h-5 sm:w-6 sm:h-6"
      : "w-3.5 h-3.5";

  if (interaktif) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(ratingNum === star ? 0 : star)}
            className="p-0.5 rounded hover:scale-110 active:scale-95 transition cursor-pointer"
            title={`Beri ${star} bintang`}
          >
            <Star
              className={`${sizeClass} ${
                star <= ratingNum
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300 hover:text-amber-200"
              }`}
            />
          </button>
        ))}
        {tampilkanSkor && (
          <span className="text-xs font-bold text-slate-700 ml-1.5">
            {ratingNum > 0 ? `${ratingNum} / 5` : "0 (Belum pilih)"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= Math.round(ratingNum)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }`}
          />
        ))}
      </div>

      {tampilkanSkor && (
        <span
          className={
            sudahDirating
              ? "text-xs font-extrabold text-slate-900"
              : "text-[11px] font-semibold text-slate-500"
          }
        >
          {sudahDirating ? Number(ratingNum).toFixed(1) : teksBelumDirating}
        </span>
      )}

      {typeof jumlahUlasan === "number" && (
        <span className="text-[11px] text-slate-400">
          ({jumlahUlasan})
        </span>
      )}
    </div>
  );
}
