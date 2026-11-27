"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Search,
  MapPin,
  Building2,
} from "lucide-react";
import {
  api,
  ApiFaskes,
  getAuthToken,
  messageFromError,
} from "@/lib/api";
import { FormInput, FormSelect, FormAlert } from "@/components/ui";

const KATEGORI_DISKUSI_OPTIONS = [
  { nilai: "kesehatan", label: "Tips & Informasi Kesehatan Umum" },
  { nilai: "fasilitas", label: "Rekomendasi Faskes & Dokter" },
  { nilai: "layanan", label: "Rujukan BPJS & Prosedur Layanan" },
  { nilai: "lainnya", label: "Lainnya" },
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

  // Faskes selection states (Opsional)
  const [daftarFaskes, setDaftarFaskes] = useState<ApiFaskes[]>([]);
  const [faskesTerpilih, setFaskesTerpilih] = useState<ApiFaskes | null>(null);
  const [faskesSearchText, setFaskesSearchText] = useState("");
  const [dropdownFaskesBuka, setDropdownFaskesBuka] = useState(false);
  const [sedangMemuatFaskes, setSedangMemuatFaskes] = useState(false);
  const dropdownFaskesRef = useRef<HTMLDivElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pembuatan diskusi butuh akun warga; yang belum masuk langsung dialihkan
  // ke halaman login sehingga form tidak sempat tampil.
  const [siapMembuat, setSiapMembuat] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      setSiapMembuat(true);
      return;
    }
    // `next` mengembalikan pengguna ke form ini setelah berhasil masuk.
    router.replace("/masuk?next=/diskusi/buat");
  }, [router]);

  useEffect(() => {
    let aktif = true;
    async function muatFaskes() {
      try {
        setSedangMemuatFaskes(true);
        const data = await api.getFaskesMap();
        if (aktif && Array.isArray(data)) {
          setDaftarFaskes(data);
        }
      } catch (err) {
        console.error("Gagal memuat faskes:", err);
      } finally {
        if (aktif) setSedangMemuatFaskes(false);
      }
    }
    muatFaskes();
    return () => {
      aktif = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownFaskesRef.current &&
        !dropdownFaskesRef.current.contains(event.target as Node)
      ) {
        setDropdownFaskesBuka(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        id_faskes: faskesTerpilih ? faskesTerpilih.id_faskes : null,
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
    } catch (err) {
      setErrorMessage(
        messageFromError(
          err,
          "Gagal mempublikasikan diskusi. Silakan coba kembali."
        )
      );
    } finally {
      setSedangKirim(false);
    }
  };

  const faskesTerfilter = daftarFaskes
    .filter((f) => {
      if (!faskesSearchText.trim()) return true;
      const q = faskesSearchText.toLowerCase();
      return (
        f.nama_faskes.toLowerCase().includes(q) ||
        (f.jenis_faskes && f.jenis_faskes.toLowerCase().includes(q)) ||
        (f.kecamatan && f.kecamatan.toLowerCase().includes(q)) ||
        (f.kota_kabupaten && f.kota_kabupaten.toLowerCase().includes(q))
      );
    })
    .slice(0, 20);

  if (!siapMembuat) {
    return (
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-24 w-full text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#007E7A] mx-auto" />
        <p className="text-xs text-slate-500 font-medium">
          Mengalihkan ke halaman masuk...
        </p>
      </div>
    );
  }

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
        <FormAlert
          tipe="error"
          pesan={errorMessage}
          link={
            errorMessage.includes("login")
              ? { href: "/masuk", label: "Masuk untuk Publikasi Diskusi" }
              : undefined
          }
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Main Form Card (Matching Screenshot Pixel-Perfect) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-9 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul Diskusi */}
          <FormInput
            label="Judul Diskusi"
            required
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Placeholder"
            className="h-11 rounded-lg border border-slate-300 bg-white"
          />

          {/* Kategori Diskusi */}
          <FormSelect
            label="Kategori Diskusi"
            required
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            options={[
              { value: "", label: "Text", disabled: true },
              ...KATEGORI_DISKUSI_OPTIONS.map((kat) => ({
                value: kat.nilai,
                label: kat.label,
              })),
            ]}
            className="h-11 rounded-lg border border-slate-300 bg-white"
          />

          {/* Fasilitas Kesehatan Terkait (Opsional Searchable Dropdown) */}
          <div className="space-y-2" ref={dropdownFaskesRef}>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-900">
                Fasilitas Kesehatan Terkait{" "}
                <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
              </label>
              {faskesTerpilih && (
                <button
                  type="button"
                  onClick={() => {
                    setFaskesTerpilih(null);
                    setFaskesSearchText("");
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Hapus Pilihan</span>
                </button>
              )}
            </div>

            {faskesTerpilih ? (
              <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/60 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#007E7A] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {faskesTerpilih.nama_faskes}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {faskesTerpilih.jenis_faskes || "Faskes"}
                      {faskesTerpilih.kecamatan ? ` • Kec. ${faskesTerpilih.kecamatan}` : ""}
                      {faskesTerpilih.kota_kabupaten ? ` • ${faskesTerpilih.kota_kabupaten}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFaskesTerpilih(null);
                    setFaskesSearchText("");
                    setDropdownFaskesBuka(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-teal-300 bg-white text-[#007E7A] hover:bg-teal-50 text-xs font-semibold shrink-0 transition"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={faskesSearchText}
                    onFocus={() => setDropdownFaskesBuka(true)}
                    onChange={(e) => {
                      setFaskesSearchText(e.target.value);
                      setDropdownFaskesBuka(true);
                    }}
                    placeholder="Cari nama rumah sakit, puskesmas, klinik (mis: RSUD, Siloam, Kimia Farma)..."
                    className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                  />
                  <div className="absolute right-3.5 pointer-events-none text-slate-400">
                    <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </div>

                {dropdownFaskesBuka && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 z-30">
                    {sedangMemuatFaskes ? (
                      <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#007E7A]" />
                        <span>Memuat data faskes Bogor...</span>
                      </div>
                    ) : faskesTerfilter.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        Tidak ada faskes yang cocok dengan pencarian &quot;{faskesSearchText}&quot;
                      </div>
                    ) : (
                      <>
                        <div className="px-3.5 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Daftar Faskes Bogor ({faskesTerfilter.length})</span>
                          {faskesSearchText && (
                            <button
                              type="button"
                              onClick={() => setFaskesSearchText("")}
                              className="text-teal-600 hover:underline capitalize font-semibold text-xs"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        {faskesTerfilter.map((item) => (
                          <button
                            key={item.id_faskes}
                            type="button"
                            onClick={() => {
                              setFaskesTerpilih(item);
                              setDropdownFaskesBuka(false);
                              setFaskesSearchText("");
                            }}
                            className="w-full text-left p-3 hover:bg-teal-50/70 transition flex items-center justify-between gap-3 group"
                          >
                            <div className="min-w-0">
                              <p className="text-xs sm:text-[13px] font-semibold text-slate-800 group-hover:text-[#007E7A] truncate">
                                {item.nama_faskes}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {item.kecamatan ? `Kec. ${item.kecamatan}, ` : ""}
                                {item.kota_kabupaten ?? "Bogor"}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 group-hover:bg-[#007E7A] group-hover:text-white shrink-0 transition whitespace-nowrap">
                              {item.jenis_faskes || "Faskes"}
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            <p className="text-[11.5px] text-slate-500">
              Cantumkan faskes jika diskusi berhubungan dengan layanan atau fasilitas kesehatan tertentu.
            </p>
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

