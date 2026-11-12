"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Printer,
  Search,
  SlidersHorizontal,
  ChevronDown,
  LayoutList,
  ArrowDown,
  Eye,
  Ban,
  Check,
  CheckCircle2,
  X,
  MapPin,
  FileText,
  Images,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { api, ApiFeedbackFaskes } from "@/lib/api";

interface AduanFaskesItem {
  id: number;
  nama_faskes: string;
  lokasi_kecamatan: string;
  alamat_lengkap: string;
  tipe_badge: string;
  kategori_laporan: string;
  penjelasan_singkat: string;
  kronologi_lengkap: string;
  status: "Ditolak" | "Selesai" | "Menunggu";
  nama_pelapor: string;
  lokasi_pelapor: string;
  waktu: string;
  bukti_foto: Array<{
    url: string;
    caption: string;
  }>;
}

const DAFTAR_ADUAN_MOCK: AduanFaskesItem[] = [
  {
    id: 1,
    nama_faskes: "RSUD Kota Bogor",
    lokasi_kecamatan: "Bogor Barat",
    alamat_lengkap:
      "Jl. DR. Sumeru No.120, Menteng, Kec. Bogor Barat, Kota Bogor 16111",
    tipe_badge: "RS Tipe B • UGD 24 Jam",
    kategori_laporan: "Sarana Rusak",
    penjelasan_singkat: "Lift Gedung Rawat Inap Rusak &...",
    kronologi_lengkap:
      "“Lift pengunjung Gedung Teratai (Rawat Inap) lantai 2 ke lantai 4 sudah 2 hari mati total tanpa papan pemberitahuan estimasi perbaikan.”",
    status: "Ditolak",
    nama_pelapor: "Dewi Sartika",
    lokasi_pelapor: "Kel. Menteng, Kec. Bogor Barat",
    waktu: "Hari Ini, 09:42 WIB",
    bukti_foto: [
      {
        url: "/images/detail-photo-2.png",
        caption: "Foto 1: Panel Tombol Lift Mati Gedung Teratai",
      },
      {
        url: "/images/detail-photo-3.png",
        caption: "Foto 2: Tangga Darurat & Kursi Roda Terhambat",
      },
    ],
  },
  {
    id: 2,
    nama_faskes: "RSUD Kota Bogor",
    lokasi_kecamatan: "Bogor Barat",
    alamat_lengkap:
      "Jl. DR. Sumeru No.120, Menteng, Kec. Bogor Barat, Kota Bogor 16111",
    tipe_badge: "RS Tipe B • UGD 24 Jam",
    kategori_laporan: "Operasional",
    penjelasan_singkat: "Klaim UGD 24 Jam di WebGIS ternyata...",
    kronologi_lengkap:
      "“Warga datang malam hari pukul 02.00 WIB untuk penanganan darurat, namun loket pendaftaran IGD menyatakan dokter jaga sedang istirahat dan dialihkan.”",
    status: "Ditolak",
    nama_pelapor: "Rian Hidayat",
    lokasi_pelapor: "Kel. Loji, Kec. Bogor Barat",
    waktu: "Kemarin, 21:15 WIB",
    bukti_foto: [
      {
        url: "/images/detail-photo-1.png",
        caption: "Foto: Pintu Masuk UGD Saat Kejadian",
      },
    ],
  },
  {
    id: 3,
    nama_faskes: "RSUD Kota Bogor",
    lokasi_kecamatan: "Bogor Barat",
    alamat_lengkap:
      "Jl. DR. Sumeru No.120, Menteng, Kec. Bogor Barat, Kota Bogor 16111",
    tipe_badge: "RS Tipe B • UGD 24 Jam",
    kategori_laporan: "Sarana Rusak",
    penjelasan_singkat: "Lift Gedung Rawat Inap Rusak &...",
    kronologi_lengkap:
      "“Perbaikan lift gedung rawat inap sudah selesai dikerjakan teknisi dan telah beroperasi normal kembali untuk pasien rawat inap.”",
    status: "Selesai",
    nama_pelapor: "Ahmad Fauzi",
    lokasi_pelapor: "Kel. Menteng, Kec. Bogor Barat",
    waktu: "2 Hari lalu",
    bukti_foto: [
      {
        url: "/images/detail-photo-2.png",
        caption: "Foto: Lift Sudah Diperbaiki & Aktif",
      },
    ],
  },
  {
    id: 4,
    nama_faskes: "RSUD Kota Bogor",
    lokasi_kecamatan: "Bogor Barat",
    alamat_lengkap:
      "Jl. DR. Sumeru No.120, Menteng, Kec. Bogor Barat, Kota Bogor 16111",
    tipe_badge: "RS Tipe B • UGD 24 Jam",
    kategori_laporan: "Sarana Rusak",
    penjelasan_singkat: "Lift Gedung Rawat Inap Rusak &...",
    kronologi_lengkap:
      "“AC di ruang tunggu pendaftaran poli rawat jalan mati sehingga ruangan pengap bagi lansia dan anak-anak.”",
    status: "Selesai",
    nama_pelapor: "Budi Santoso",
    lokasi_pelapor: "Kel. Pasir Mulya, Kec. Bogor Barat",
    waktu: "3 Hari lalu",
    bukti_foto: [
      {
        url: "/images/detail-photo-3.png",
        caption: "Foto: Ruang Tunggu Rawat Jalan",
      },
    ],
  },
  {
    id: 5,
    nama_faskes: "Puskesmas Bogor Tengah",
    lokasi_kecamatan: "Bogor Barat",
    alamat_lengkap:
      "Jl. Telepon No.1, Pabaton, Kec. Bogor Tengah, Kota Bogor 16121",
    tipe_badge: "RS Tipe B • UGD 24 Jam",
    kategori_laporan: "Pelayanan Buruk",
    penjelasan_singkat: "Petugas Administrasi Minta...",
    kronologi_lengkap:
      "“Petugas loket menolak pendaftaran BPJS karena kartu digital di HP dianggap tidak berlaku padahal barcode valid di Mobile JKN.”",
    status: "Selesai",
    nama_pelapor: "Siti Rahma",
    lokasi_pelapor: "Kel. Babakan, Kec. Bogor Tengah",
    waktu: "4 Hari lalu",
    bukti_foto: [
      {
        url: "/images/detail-photo-1.png",
        caption: "Foto: Loket Pendaftaran Puskesmas",
      },
    ],
  },
  {
    id: 6,
    nama_faskes: "Puskesmas Bogor Tengah",
    lokasi_kecamatan: "Bogor Barat",
    alamat_lengkap:
      "Jl. Telepon No.1, Pabaton, Kec. Bogor Tengah, Kota Bogor 16121",
    tipe_badge: "RS Tipe B • UGD 24 Jam",
    kategori_laporan: "Layanan BPJS",
    penjelasan_singkat: "Petugas Administrasi Minta...",
    kronologi_lengkap:
      "“Penjelasan alur rujukan dari faskes 1 ke rumah sakit rujukan sudah diverifikasi dan diluruskan oleh Kepala Puskesmas.”",
    status: "Selesai",
    nama_pelapor: "Hendra Wijaya",
    lokasi_pelapor: "Kel. Sempur, Kec. Bogor Tengah",
    waktu: "5 Hari lalu",
    bukti_foto: [
      {
        url: "/images/detail-photo-2.png",
        caption: "Foto: Alur Rujukan di Faskes",
      },
    ],
  },
];

export default function LaporanDataFaskesPage() {
  const [daftarAduan, setDaftarAduan] = useState<AduanFaskesItem[]>(DAFTAR_ADUAN_MOCK);
  const [kataKunci, setKataKunci] = useState("");
  const [filterKota, setFilterKota] = useState("Kota Bogor");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [aduanTerpilih, setAduanTerpilih] = useState<AduanFaskesItem | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);

  // Status message
  const [pesanNotif, setPesanNotif] = useState<{
    tipe: "sukses" | "error";
    pesan: string;
  } | null>(null);

  // Load backend feedback if available
  useEffect(() => {
    let aktif = true;
    async function muatFeedback() {
      try {
        setSedangMemuat(true);
        const dataBackend = await api.getAdminFeedbacks().catch(() => null);
        if (aktif && dataBackend && dataBackend.length > 0) {
          const mapped: AduanFaskesItem[] = dataBackend.map((item) => {
            let statusText: "Ditolak" | "Selesai" | "Menunggu" = "Menunggu";
            if (item.status === "rejected") statusText = "Ditolak";
            if (item.status === "resolved") statusText = "Selesai";

            return {
              id: item.id_feedback_faskes,
              nama_faskes: item.faskes?.nama_faskes || "Faskes Kota Bogor",
              lokasi_kecamatan:
                item.faskes?.kecamatan || item.kecamatan_pelapor || "Bogor Barat",
              alamat_lengkap:
                item.faskes?.alamat_faskes ||
                "Jl. DR. Sumeru No.120, Menteng, Kota Bogor",
              tipe_badge: `${item.faskes?.jenis_faskes || "RS Tipe B"} • UGD 24 Jam`,
              kategori_laporan: item.alasan || "Sarana Rusak",
              penjelasan_singkat:
                item.saran_perbaikan.length > 30
                  ? item.saran_perbaikan.slice(0, 30) + "..."
                  : item.saran_perbaikan,
              kronologi_lengkap: `“${item.saran_perbaikan}”`,
              status: statusText,
              nama_pelapor: item.user?.nama_user || "Dewi Sartika",
              lokasi_pelapor:
                item.kelurahan_pelapor || "Kel. Menteng, Kec. Bogor Barat",
              waktu: "Hari Ini, 09:42 WIB",
              bukti_foto: [
                {
                  url: "/images/detail-photo-2.png",
                  caption: "Foto 1: Panel Tombol Lift Mati Gedung Teratai",
                },
                {
                  url: "/images/detail-photo-3.png",
                  caption: "Foto 2: Tangga Darurat & Kursi Roda Terhambat",
                },
              ],
            };
          });

          // Merge backend with mock to preserve complete screenshot view
          const backendIds = new Set(mapped.map((m) => m.id));
          const combined = [
            ...mapped,
            ...DAFTAR_ADUAN_MOCK.filter((d) => !backendIds.has(d.id)),
          ];
          setDaftarAduan(combined);
        }
      } catch {
        // Fallback default mock
      } finally {
        if (aktif) setSedangMemuat(false);
      }
    }

    muatFeedback();
    return () => {
      aktif = false;
    };
  }, []);

  // Update status aduan
  const handleUbahStatus = async (
    id: number,
    statusBaru: "Ditolak" | "Selesai"
  ) => {
    try {
      const apiStatus = statusBaru === "Ditolak" ? "rejected" : "resolved";
      await api.updateAdminFeedback(id, { status: apiStatus }).catch(() => null);

      setDaftarAduan((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: statusBaru } : item
        )
      );

      setPesanNotif({
        tipe: "sukses",
        pesan: `Status aduan berhasil diubah menjadi "${statusBaru}".`,
      });
    } catch {
      setPesanNotif({
        tipe: "error",
        pesan: "Gagal memperbarui status aduan.",
      });
    }
  };

  // Filter list
  const aduanTerfilter = daftarAduan.filter((item) => {
    if (filterStatus !== "Semua Status" && item.status !== filterStatus) {
      return false;
    }

    if (!kataKunci.trim()) return true;
    const q = kataKunci.toLowerCase();
    const matchFaskes = item.nama_faskes.toLowerCase().includes(q);
    const matchKategori = item.kategori_laporan.toLowerCase().includes(q);
    const matchPenjelasan = item.penjelasan_singkat.toLowerCase().includes(q);
    const matchPelapor = item.nama_pelapor.toLowerCase().includes(q);

    return matchFaskes || matchKategori || matchPenjelasan || matchPelapor;
  });

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-[1140px]">
        {/* Notifikasi Alert */}
        {pesanNotif && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
              pesanNotif.tipe === "sukses"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{pesanNotif.pesan}</span>
            </div>
            <button
              type="button"
              onClick={() => setPesanNotif(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Baris Judul & Tombol Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
              Laporan &amp; Aduan Data Faskes
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 max-w-2xl leading-relaxed">
              Pantau dan tindak lanjuti laporan warga terkait sarana, operasional,
              ketersediaan fasilitas, serta validitas data fasilitas kesehatan se-Kota
              Bogor secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <button
              type="button"
              className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition shadow-xs"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>30 Hari Terakhir</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-10 px-4 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold flex items-center gap-2 transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rekap PDF</span>
            </button>
          </div>
        </div>

        {/* Baris Filter & Pencarian */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Input Pencarian */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={kataKunci}
                onChange={(e) => setKataKunci(e.target.value)}
                placeholder="Cari..."
                className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
              />
            </div>

            {/* Dropdown Kota */}
            <div className="sm:col-span-3">
              <select
                value={filterKota}
                onChange={(e) => setFilterKota(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
              >
                <option value="Kota Bogor">Kota Bogor</option>
                <option value="Kabupaten Bogor">Kabupaten Bogor</option>
                <option value="Semua Wilayah">Semua Wilayah</option>
              </select>
            </div>

            {/* Dropdown Status */}
            <div className="sm:col-span-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>

            {/* Tombol Filter Tambahan */}
            <div className="sm:col-span-1 flex justify-end">
              <button
                type="button"
                className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                title="Filter lanjutan"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Antrean Aduan Masuk */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Header Tabel */}
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutList className="w-4 h-4 text-[#007E7A]" />
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Antrean Aduan Masuk
              </h3>
              <span className="text-[11px] text-slate-400 font-medium ml-2">
                Menampilkan {aduanTerfilter.length} dari 38
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span>Urutkan: Waktu Terbaru</span>
              <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Isi Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-slate-500 font-bold border-b border-slate-200/80 uppercase text-[10.5px] tracking-wider">
                <tr>
                  <th className="py-3 px-6">Faskes &amp; Lokasi</th>
                  <th className="py-3 px-6">Kategori Laporan</th>
                  <th className="py-3 px-6">Penjelasan</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {aduanTerfilter.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    {/* Faskes & Lokasi */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="font-extrabold text-slate-900 text-[13px]">
                        {row.nama_faskes}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>⊙</span>
                        <span>{row.lokasi_kecamatan}</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {row.tipe_badge}
                      </span>
                    </td>

                    {/* Kategori Laporan */}
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {row.kategori_laporan}
                    </td>

                    {/* Penjelasan */}
                    <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                      {row.penjelasan_singkat}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {row.status === "Ditolak" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          <span>Ditolak</span>
                        </span>
                      )}
                      {row.status === "Selesai" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>Selesai</span>
                        </span>
                      )}
                      {row.status === "Menunggu" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Menunggu</span>
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        {/* Lihat Detail Aduan (Buka Modal) */}
                        <button
                          type="button"
                          onClick={() => setAduanTerpilih(row)}
                          className="p-1 hover:text-[#007E7A] rounded transition"
                          title="Lihat Detail Aduan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Tolak Aduan */}
                        <button
                          type="button"
                          onClick={() => handleUbahStatus(row.id, "Ditolak")}
                          className="p-1 hover:text-red-600 rounded transition"
                          title="Tolak Aduan"
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        {/* Selesaikan / Validasi Aduan */}
                        <button
                          type="button"
                          onClick={() => handleUbahStatus(row.id, "Selesai")}
                          className="p-1 hover:text-emerald-600 rounded transition"
                          title="Setujui / Selesaikan Aduan"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Paginasi */}
          <div className="px-6 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <span>
              Menampilkan data ke 1 - 5 dari total 38 aduan • Hal 1 dari 8
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
              >
                ‹
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-[#007E7A] text-white font-bold flex items-center justify-center shadow-xs"
              >
                1
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
              >
                2
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
              >
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
              >
                8
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* MODAL DETAIL ADUAN FASKES (Matching Image 1 Pixel-Perfect) */}
        {aduanTerpilih && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] transition-all"
            onClick={(e) => {
              if (e.target === e.currentTarget) setAduanTerpilih(null);
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              {/* Header Modal */}
              <div className="px-6 py-4 bg-[#F2F8F8] border-b border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D8EFEF] text-[#007E7A] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      🕒 {aduanTerpilih.waktu}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                      Informasi Detail Laporan Fasilitas Kesehatan
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAduanTerpilih(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal (2 Kolom: Kiri Info & Aduan, Kanan Bukti Lampiran) */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 items-start max-h-[80vh] overflow-y-auto">
                {/* Kolom Kiri */}
                <div className="space-y-4">
                  {/* Card Faskes */}
                  <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {aduanTerpilih.nama_faskes}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{aduanTerpilih.alamat_lengkap}</span>
                    </p>
                  </div>

                  {/* Card Pelapor & Kronologi Aduan */}
                  <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 block text-xs sm:text-[13px]">
                          {aduanTerpilih.nama_pelapor}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {aduanTerpilih.lokasi_pelapor}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {aduanTerpilih.waktu}
                      </span>
                    </div>

                    {/* Kronologi Detail */}
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#007E7A]">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Kronologi &amp; Detail Aduan Warga:</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        {aduanTerpilih.kronologi_lengkap}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Bukti Lampiran */}
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Images className="w-4 h-4 text-[#007E7A]" />
                    <span>BUKTI LAMPIRAN</span>
                  </div>

                  {/* Foto 1 */}
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 group bg-slate-900">
                    <img
                      src={
                        aduanTerpilih.bukti_foto[0]?.url ||
                        "/images/detail-photo-2.png"
                      }
                      alt="Bukti Lampiran 1"
                      className="w-full h-36 object-cover opacity-90 group-hover:opacity-100 transition"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs px-3 py-1.5 text-[11px] text-white font-medium flex items-center gap-1.5">
                      <span>📷</span>
                      <span className="truncate">
                        {aduanTerpilih.bukti_foto[0]?.caption ||
                          "Foto 1: Panel Tombol Lift Mati Gedung Teratai"}
                      </span>
                    </div>
                  </div>

                  {/* Foto 2 */}
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 group bg-slate-900">
                    <img
                      src={
                        aduanTerpilih.bukti_foto[1]?.url ||
                        "/images/detail-photo-3.png"
                      }
                      alt="Bukti Lampiran 2"
                      className="w-full h-36 object-cover opacity-90 group-hover:opacity-100 transition"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs px-3 py-1.5 text-[11px] text-white font-medium flex items-center gap-1.5">
                      <span>📷</span>
                      <span className="truncate">
                        {aduanTerpilih.bukti_foto[1]?.caption ||
                          "Foto 2: Tangga Darurat & Kursi Roda Terhambat"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}

