"use client";

import React, { useState, useEffect } from "react";
import { X, Check, ChevronsUpDown, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api, getAuthToken } from "@/lib/api";

interface ModalReportFaskesProps {
  isOpen: boolean;
  onClose: () => void;
  faskesId: number;
  namaFaskes?: string;
  onSuccess?: () => void;
}

const KATEGORI_OPTIONS = [
  "Informasi Alamat / Lokasi GPS Tidak Akurat",
  "Nomor Telepon Tidak Aktif / Salah",
  "Status Kerjasama BPJS Berubah / Tidak Sesuai",
  "Layanan / Fasilitas Medis Tidak Tersedia",
  "Jam Operasional Tidak Sesuai",
  "Fasilitas Tutup Permanen / Tidak Beroperasi",
  "Lainnya",
];

export default function ModalReportFaskes({
  isOpen,
  onClose,
  faskesId,
  namaFaskes,
  onSuccess,
}: ModalReportFaskesProps) {
  const [kategori, setKategori] = useState("");
  const [penjelasan, setPenjelasan] = useState("");
  const [sedangKirim, setSedangKirim] = useState(false);
  const [sukses, setSukses] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setKategori("");
      setPenjelasan("");
      setErrorMessage(null);
      setSukses(false);
      setSedangKirim(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!kategori) {
      setErrorMessage("Silakan pilih kategori alasan laporan.");
      return;
    }

    if (!penjelasan.trim()) {
      setErrorMessage("Silakan isi penjelasan singkat laporan.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("Silakan login terlebih dahulu untuk mengirim laporan informasi faskes.");
      return;
    }

    setSedangKirim(true);
    try {
      await api.sendFeedback(faskesId, {
        alasan: kategori,
        saran_perbaikan: penjelasan.trim(),
      });

      setSukses(true);
      if (onSuccess) onSuccess();

      // Auto dismiss success card after 2.2 seconds
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Gagal mengirim laporan informasi. Silakan coba kembali."
      );
    } finally {
      setSedangKirim(false);
    }
  };

  const isFormValid = Boolean(kategori && penjelasan.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget && !sedangKirim) {
          onClose();
        }
      }}
    >
      {/* State 2: Sukses ("Berhasil Dilaporkan") */}
      {sukses ? (
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center w-full max-w-[290px] animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center mb-4 shadow-sm">
            <Check className="w-9 h-9 text-white stroke-[3.2]" />
          </div>
          <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
            Berhasil Dilaporkan
          </h3>
        </div>
      ) : (
        /* State 1: Modal Form Laporkan Informasi */
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-[530px] p-6 sm:p-7 relative border border-slate-100 transition-all animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[21px] font-bold text-slate-900 tracking-tight leading-tight">
                Laporkan Informasi
              </h2>
              <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
                Tolong pilih alasan laporan terkait informasi fasilitas kesehatan ini.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={sedangKirim}
              className="p-1 -mr-1 text-slate-700 hover:text-slate-900 transition rounded-lg hover:bg-slate-100 disabled:opacity-50"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {errorMessage.includes("login") && (
                  <div className="mt-1.5">
                    <Link
                      href="/admin/login"
                      className="inline-flex items-center font-bold text-[#007E7A] hover:underline"
                    >
                      Buka Halaman Login &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Kategori Laporan */}
            <div>
              <label className="block text-[13px] font-medium text-slate-800 mb-1.5">
                Kategori Laporan
              </label>
              <div className="relative">
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  disabled={sedangKirim}
                  className={`w-full h-11 px-3.5 pr-10 rounded-lg border border-slate-300 text-[13.5px] appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition ${
                    kategori ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  <option value="" disabled>
                    Pilih alasan...
                  </option>
                  {KATEGORI_OPTIONS.map((item) => (
                    <option key={item} value={item} className="text-slate-800">
                      {item}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronsUpDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Penjelasan */}
            <div>
              <label className="block text-[13px] font-medium text-slate-800 mb-1.5">
                Penjelasan
              </label>
              <input
                type="text"
                value={penjelasan}
                onChange={(e) => setPenjelasan(e.target.value)}
                disabled={sedangKirim}
                placeholder="Tulis penjelasan singkat..."
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={sedangKirim}
                className="h-10 px-5 rounded-lg border border-slate-300 text-slate-700 text-[13.5px] font-medium hover:bg-slate-50 transition active:scale-[0.98] disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={sedangKirim || !isFormValid}
                className={`h-10 px-5 rounded-lg text-[13.5px] font-medium flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                  isFormValid
                    ? "bg-[#007E7A] hover:bg-[#006965] text-white shadow-xs"
                    : "bg-[#BAC7D5] text-slate-700 cursor-not-allowed opacity-90"
                }`}
              >
                {sedangKirim && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <span>Kirim Laporan</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

