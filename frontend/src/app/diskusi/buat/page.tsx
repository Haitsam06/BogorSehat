"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Bold,
  Italic,
  Underline,
  List,
  Link2,
  UploadCloud,
  Check,
  Loader2,
  AlertCircle,
  ChevronsUpDown,
  X,
  FileText,
} from "lucide-react";
import { api, getAuthToken, getAuthUser } from "@/lib/api";

const KATEGORI_DISKUSI_OPTIONS = [
  "Rujukan BPJS & Prosedur",
  "Rekomendasi Faskes & Dokter",
  "Ketersediaan Obat & Farmasi",
  "Pengalaman Pelayanan Kesehatan",
  "Tips & Informasi Kesehatan Umum",
  "Lainnya",
];

export default function BuatDiskusiBaruPage() {
  const router = useRouter();

  // Form states
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("");
  const [isiDiskusi, setIsiDiskusi] = useState("");
  const [isAnonim, setIsAnonim] = useState(false);
  const [lampiranFiles, setLampiranFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Submission & UI states
  const [sedangKirim, setSedangKirim] = useState(false);
  const [suksesSimpan, setSuksesSimpan] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatting helper for rich text toolbar
  const insertFormatting = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = isiDiskusi.substring(start, end);
    const replacement = `${prefix}${selectedText || "teks"}${suffix}`;

    const newText =
      isiDiskusi.substring(0, start) +
      replacement +
      isiDiskusi.substring(end);
    setIsiDiskusi(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + replacement.length - suffix.length
      );
    }, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setLampiranFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setLampiranFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setLampiranFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!judul.trim()) {
      setErrorMessage("Judul diskusi wajib diisi.");
      return;
    }

    if (!kategori) {
      setErrorMessage("Silakan pilih kategori diskusi.");
      return;
    }

    if (!isiDiskusi.trim()) {
      setErrorMessage("Isi diskusi wajib diisi.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setErrorMessage(
        "Silakan login terlebih dahulu untuk mempublikasikan diskusi baru."
      );
      return;
    }

    setSedangKirim(true);
    try {
      const payload = {
        judul_diskusi: judul.trim(),
        kategori_diskusi: kategori,
        body: isiDiskusi.trim(),
      };

      const res = await api.createDiscussion(payload);

      setSuksesSimpan(true);

      // Auto redirect to new discussion or discussion list after 2 seconds
      setTimeout(() => {
        if (res && res.id_diskusi) {
          router.push(`/diskusi/${res.id_diskusi}`);
        } else {
          router.push("/diskusi");
        }
      }, 2000);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Gagal mempublikasikan diskusi. Silakan coba kembali."
      );
    } finally {
      setSedangKirim(false);
    }
  };

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-7 w-full space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#007E7A]">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/diskusi" className="hover:text-[#007E7A]">
          Forum Diskusi
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-700 font-semibold">Buat Diskusi Baru</span>
      </div>

      {/* Header Info Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#007E7A] text-white shadow-xs">
            Warga Peduli Sehat Bogor
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
            Kota & Kab. Bogor
          </span>
        </div>

        <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
          Buat Diskusi Baru
        </h1>

        <p className="text-xs sm:text-[13px] text-slate-600 max-w-3xl leading-relaxed">
          Mulai percakapan baru dengan komunitas kesehatan Bogor Sehat. Bagikan rujukan BPJS,
          tanya dokter, atau bagikan info faskes terdekat.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{errorMessage}</span>
            {errorMessage.includes("login") && (
              <div className="mt-1.5">
                <Link
                  href="/admin/login"
                  className="font-bold text-[#007E7A] hover:underline"
                >
                  Buka Halaman Login &rarr;
                </Link>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Form Card (Matching Screenshot Pixel-Perfect) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-9 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul Diskusi */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              Judul Diskusi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Placeholder"
              className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
            />
          </div>

          {/* Kategori Diskusi */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              Kategori Diskusi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className={`w-full h-11 px-3.5 pr-10 rounded-lg border border-slate-300 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition ${
                  kategori ? "text-slate-900" : "text-slate-400"
                }`}
              >
                <option value="" disabled>
                  Text
                </option>
                {KATEGORI_DISKUSI_OPTIONS.map((kat) => (
                  <option key={kat} value={kat} className="text-slate-800">
                    {kat}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronsUpDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Isi Diskusi with Formatting Toolbar */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              Isi Diskusi <span className="text-red-500">*</span>
            </label>
            <div className="rounded-lg border border-slate-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#007E7A] focus-within:border-[#007E7A] transition">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 bg-white text-slate-700">
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**")}
                  className="p-1.5 rounded hover:bg-slate-100 transition text-slate-700 hover:text-slate-900"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("*", "*")}
                  className="p-1.5 rounded hover:bg-slate-100 transition text-slate-700 hover:text-slate-900"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<u>", "</u>")}
                  className="p-1.5 rounded hover:bg-slate-100 transition text-slate-700 hover:text-slate-900"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n- ")}
                  className="p-1.5 rounded hover:bg-slate-100 transition text-slate-700 hover:text-slate-900"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("[", "](https://)")}
                  className="p-1.5 rounded hover:bg-slate-100 transition text-slate-700 hover:text-slate-900"
                  title="Insert Link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                required
                rows={8}
                value={isiDiskusi}
                onChange={(e) => setIsiDiskusi(e.target.value)}
                placeholder="Textarea"
                className="w-full p-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed bg-white"
              />
            </div>
          </div>

          {/* Lampiran (Opsional) - Drag & Drop Area */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              Lampiran (Opsional)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                isDragOver
                  ? "border-[#007E7A] bg-teal-50/50"
                  : "border-slate-300 hover:border-slate-400 bg-slate-50/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-[#E6F4F3] flex items-center justify-center mb-3 text-[#007E7A]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Seret file ke sini atau klik untuk unggah
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Format: JPG, PNG, PDF. Maks 5 MB per file
              </p>
            </div>

            {/* Render Selected Files List */}
            {lampiranFiles.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {lampiranFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 truncate">
                        {f.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-slate-400 hover:text-red-600 transition p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkbox Card: Rahasiakan Nama (Anonim) */}
          <div
            onClick={() => setIsAnonim(!isAnonim)}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer flex items-start gap-3 select-none hover:bg-slate-50 transition"
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition ${
                isAnonim
                  ? "bg-[#007E7A] text-white"
                  : "border border-slate-300 bg-white"
              }`}
            >
              {isAnonim && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-slate-900 cursor-pointer">
                Rahasiakan Nama (Anonim)
              </label>
              <p className="text-xs text-slate-500 leading-relaxed">
                Identitas Anda akan disembunyikan dan ditampilkan sebagai &quot;Anonim&quot; pada
                halaman publikasi diskusi ini. Namun, moderator tetap dapat memantau demi kepatuhan
                komunitas.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Link
              href="/diskusi"
              className="px-8 py-2.5 rounded-xl border border-[#007E7A] text-[#007E7A] hover:bg-teal-50 text-sm font-semibold transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={sedangKirim || !judul.trim() || !isiDiskusi.trim()}
              className="px-8 py-2.5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-sm font-bold flex items-center gap-2 transition shadow-xs disabled:opacity-50"
            >
              {sedangKirim ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
              <span>Publikasikan Diskusi</span>
            </button>
          </div>
        </form>
      </div>

      {/* Success Pop-up Modal (Matching Image 2 Pixel-Perfect) */}
      {suksesSimpan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] transition-all">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center w-full max-w-[320px] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center mb-4 shadow-sm">
              <Check className="w-9 h-9 text-white stroke-[3.2]" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">
              Data Berhasil Disimpan
            </h3>
            <p className="text-[13px] text-slate-500 mt-1">
              Perubahan telah tersimpan dengan sukses.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

