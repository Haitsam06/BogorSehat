"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, PlusCircle, Hospital } from "lucide-react";
import Link from "next/link";
import { api, ApiDiskusi, getAuthToken } from "@/lib/api";

interface ModalBuatDiskusiProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (baru: ApiDiskusi) => void;
}

const KATEGORI_DISKUSI_LIST = [
  "Rujukan BPJS & Prosedur",
  "Rekomendasi Faskes & Dokter",
  "Ketersediaan Obat & Farmasi",
  "Pengalaman Pelayanan Kesehatan",
  "Tips & Informasi Kesehatan Umum",
  "Lainnya",
];

export default function ModalBuatDiskusi({
  isOpen,
  onClose,
  onSuccess,
}: ModalBuatDiskusiProps) {
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState(KATEGORI_DISKUSI_LIST[0]);
  const [faskesTerkait, setFaskesTerkait] = useState("");
  const [isi, setIsi] = useState("");
  const [sedangKirim, setSedangKirim] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setJudul("");
      setKategori(KATEGORI_DISKUSI_LIST[0]);
      setFaskesTerkait("");
      setIsi("");
      setErrorMsg(null);
      setSedangKirim(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!judul.trim()) {
      setErrorMsg("Judul diskusi wajib diisi.");
      return;
    }

    if (!isi.trim()) {
      setErrorMsg("Isi / pertanyaan diskusi wajib diisi.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setErrorMsg("Silakan login terlebih dahulu untuk membuat diskusi baru.");
      return;
    }

    setSedangKirim(true);
    try {
      const res = await api.createDiscussion({
        judul_diskusi: judul.trim(),
        kategori_diskusi: kategori,
        body: isi.trim(),
      });

      onSuccess(res);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal membuat diskusi baru.");
    } finally {
      setSedangKirim(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget && !sedangKirim) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[560px] p-6 sm:p-7 relative border border-slate-100 transition-all animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-[20px] font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#007E7A]" />
              <span>Buat Diskusi Baru</span>
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1">
              Bagikan pertanyaan atau pengalaman seputar faskes & kesehatan di Bogor.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sedangKirim}
            className="p-1 -mr-1 text-slate-400 hover:text-slate-700 transition rounded-lg hover:bg-slate-100 disabled:opacity-50"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              {errorMsg.includes("login") && (
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs sm:text-[13px]">
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Judul Diskusi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Pengalaman Rujukan Faskes Tingkat 1 ke RSUD..."
              className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Kategori Diskusi
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A]"
              >
                {KATEGORI_DISKUSI_LIST.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Fasilitas Kesehatan Terkait (Opsional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={faskesTerkait}
                  onChange={(e) => setFaskesTerkait(e.target.value)}
                  placeholder="Contoh: RSUD Kota Bogor / RS Siloam"
                  className="w-full h-11 pl-8 pr-3 rounded-lg border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A]"
                />
                <Hospital className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Isi Diskusi / Pertanyaan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              placeholder="Ceritakan detail pertanyaan atau informasi yang ingin Anda diskusikan bersama warga Bogor..."
              className="w-full p-3.5 rounded-lg border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={sedangKirim}
              className="h-10 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={sedangKirim}
              className="h-10 px-5 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white font-bold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
            >
              {sedangKirim && <Loader2 className="w-4 h-4 animate-spin text-white" />}
              <span>Publikasikan Diskusi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

