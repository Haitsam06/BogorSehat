"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type FormAlertTipe = "sukses" | "error" | "warning" | "info";

export interface FormAlertProps {
  tipe?: FormAlertTipe;
  pesan: string;
  link?: {
    href: string;
    label: string;
  };
  onClose?: () => void;
  className?: string;
}

export function FormAlert({
  tipe = "error",
  pesan,
  link,
  onClose,
  className = "",
}: FormAlertProps) {
  const config = {
    sukses: {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
    },
    error: {
      bg: "bg-rose-50 text-rose-800 border-rose-200",
      icon: AlertCircle,
      iconColor: "text-rose-600",
    },
    warning: {
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
    },
    info: {
      bg: "bg-teal-50 text-teal-800 border-teal-200",
      icon: Info,
      iconColor: "text-teal-600",
    },
  }[tipe];

  const Icon = config.icon;

  return (
    <div
      className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs font-semibold ${config.bg} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 space-y-1">
          <p className="leading-relaxed">{pesan}</p>
          {link && (
            <div>
              <Link
                href={link.href}
                className="font-bold underline hover:opacity-80 transition inline-flex items-center gap-1"
              >
                <span>{link.label}</span>
                <span>&rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-lg transition shrink-0 cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default FormAlert;
