"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon;
  ikon?: LucideIcon;
  judul: string;
  deskripsi?: string;
  aksiLabel?: string;
  teksTombol?: string;
  onAksi?: () => void;
  aksiHref?: string;
  hrefTombol?: string;
  className?: string;
}

export default function EmptyState({
  icon,
  ikon,
  judul,
  deskripsi,
  aksiLabel,
  teksTombol,
  onAksi,
  aksiHref,
  hrefTombol,
  className = "",
}: EmptyStateProps) {
  const IconComponent = icon || ikon || Inbox;
  const labelTombol = aksiLabel || teksTombol;
  const linkHref = aksiHref || hrefTombol;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-3 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto text-[#007E7A]">
        <IconComponent className="w-6 h-6" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-900">{judul}</h3>
      {deskripsi && (
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          {deskripsi}
        </p>
      )}
      {labelTombol && (
        <div className="pt-1">
          {linkHref ? (
            <Link
              href={linkHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007E7A] text-white text-xs font-bold shadow-xs hover:bg-[#006663] transition"
            >
              <span>{labelTombol}</span>
            </Link>
          ) : onAksi ? (
            <button
              type="button"
              onClick={onAksi}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007E7A] text-white text-xs font-bold shadow-xs hover:bg-[#006663] transition cursor-pointer"
            >
              <span>{labelTombol}</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
