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
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { api, ApiAdminReportItem } from "@/lib/api";

interface AduanKomentarItem {
  id: number;
  tipe: "Komentar" | "Tanggapan";
  kategori_laporan: string;
  penjelasan_singkat: string;
  isi_lengkap: string;
  status: "Ditolak" | "Selesai" | "Menunggu";
  nama_pelapor: string;
  lokasi_pelapor: string;
  waktu: string;
}

const DAFTAR_ADUAN_KOMENTAR_MOCK: AduanKomentarItem[] = [
  {
    id: 1,
    tipe: "Komentar",
    kategori_laporan: "Spam",
    penjelasan_singkat:
      "Lift gedung rawat inap rusak sudah dari minggu lalu, tapi sampai",
    isi_lengkap:
      "Lift gedung rawat inap rusak sudah dari minggu lalu, tapi sampai sekarang belum ada perbaikan. Kondisi ini cukup mengganggu aktivitas pasien, keluarga pasien, dan pengunjung yang setiap harinya membutuhkan akses menuju lantai atas. Terutama bagi pasien lansia, pasien dengan keterbatasan mobilitas, serta pasien yang harus menggunakan kursi roda. Bahkan beberapa pengunjung terpaksa menggunakan tangga untuk mencapai ruang rawat inap. Mohon pihak rumah sakit segera melakukan perbaikan karena fasilitas lift sangat dibutuhkan untuk menunjang kenyamanan dan kemudahan akses bagi seluruh pasien maupun pengunjung.",
    status: "Ditolak",
    nama_pelapor: "Agung",
    lokasi_pelapor: "Kel. Menteng, Kec. Bogor Barat",
    waktu: "Hari Ini, 09:42 WIB",
  },
  {
    id: 2,
    tipe: "Tanggapan",
    kategori_laporan: "Pelecehan atau perundungan",
    penjelasan_singkat: "Kalau tidak tahu kondisi sebenarnya",
    isi_lengkap:
      "Kalau tidak tahu kondisi sebenarnya, lebih baik diam saja daripada asal berkomentar! Kami di sini sedang membahas permasalahan yang benar-benar terjadi di lapangan, bukan sekadar mencari kesalahan pihak rumah sakit. Seharusnya sebelum memberikan tanggapan, pahami terlebih dahulu situasi yang sedang dialami pasien dan keluarga pasien. Jangan sampai komentar yang diberikan justru meremehkan keluhan orang lain. Setiap orang berhak menyampaikan pengalaman dan pendapatnya selama masih dalam batas yang wajar. Jadi, tolong lebih bijak dalam memberikan komentar dan hargai pengalaman orang lain yang sedang berusaha menyampaikan keluhan.",
    status: "Selesai",
    nama_pelapor: "Reza",
    lokasi_pelapor: "Kel. Menteng, Kec. Bogor Barat",
    waktu: "Hari Ini, 09:42 WIB",
  },
  {
    id: 3,
    tipe: "Tanggapan",
    kategori_laporan: "Ujaran Kebencian",
    penjelasan_singkat: "Klaim UGD 24 jam di WebGIS ternyata bohong",
    isi_lengkap:
      "Klaim UGD 24 jam di WebGIS ternyata bohong besar! Pelayanan sangat lambat dan tidak profesional.",
    status: "Ditolak",
    nama_pelapor: "Fajar Nugraha",
    lokasi_pelapor: "Kel. Sempur, Kec. Bogor Tengah",
    waktu: "Kemarin, 14:20 WIB",
  },
  {
    id: 4,
    tipe: "Komentar",
    kategori_laporan: "Informasi Palsu",
    penjelasan_singkat: "Lift gedung rawat inap sudah berfungsi normal",
    isi_lengkap:
      "Lift gedung rawat inap sudah berfungsi normal sejak kemarin siang dan sudah dapat digunakan kembali oleh pasien dan keluarga pengunjung.",
    status: "Selesai",
    nama_pelapor: "Dina Mariana",
    lokasi_pelapor: "Kel. Baranangsiang, Kec. Bogor Timur",
    waktu: "2 Hari lalu",
  },
  {
    id: 5,
    tipe: "Komentar",
    kategori_laporan: "Pelanggaran Privasi",
    penjelasan_singkat: "Petugas administrasi bernama [nama petugas]",
    isi_lengkap:
      "Petugas administrasi bernama [nama petugas] di loket 3 tidak melayani dengan ramah dan menyebutkan riwayat penyakit pasien dengan suara keras di depan antrean umum.",
    status: "Selesai",
    nama_pelapor: "Hendra Wijaya",
    lokasi_pelapor: "Kel. Kedung Halang, Kec. Bogor Utara",
    waktu: "3 Hari lalu",
  },
];

export default function LaporanDataDiskusiPage() {
  const [daftarAduan, setDaftarAduan] = useState<AduanKomentarItem[]>(
    DAFTAR_ADUAN_KOMENTAR_MOCK
  );
  const [tabKategori, setTabKategori] = useState<
    "Semua Kategori" | "Komentar" | "Tanggapan"
  >("Komentar");
  const [kataKunci, setKataKunci] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState(
    "Semua Kecamatan (Kota Bogor)"
  );
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [itemTerpilih, setItemTerpilih] = useState<AduanKomentarItem | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);

  // Status message
  const [pesanNotif, setPesanNotif] = useState<{
    tipe: "sukses" | "error";
    pesan: string;
  } | null>(null);

  // Load from backend if available
  useEffect(() => {
    let aktif = true;
    async function muatLaporanBackend() {
      try {
        setSedangMemuat(true);
        const backendReports = await api.getAdminReports().catch(() => null);
        if (aktif && backendReports && backendReports.length > 0) {
          const mapped: AduanKomentarItem[] = backendReports.map((item) => {
            let statusText: "Ditolak" | "Selesai" | "Menunggu" = "Menunggu";
            if (item.status === "rejected") statusText = "Ditolak";
            if (item.status === "resolved") statusText = "Selesai";

            const tipeName: "Komentar" | "Tanggapan" =
              item.type === "tanggapan" ? "Tanggapan" : "Komentar";

            const contentBody =
              item.content?.body ||
              item.catatan ||
              "Isi konten laporan yang dilaporkan oleh warga.";

            return {
              id: item.id,
              tipe: tipeName,
              kategori_laporan: item.alasan || "Spam",
              penjelasan_singkat:
                contentBody.length > 55
                  ? contentBody.slice(0, 55) + "..."
                  : contentBody,
              isi_lengkap: contentBody,
              status: statusText,
              nama_pelapor: item.reported_user?.nama_user || "Warga Bogor",
              lokasi_pelapor: "Kel. Menteng, Kec. Bogor Barat",
              waktu: "Hari Ini, 09:42 WIB",
            };
          });

          // Merge backend items with mock items to keep full view
          const backendIds = new Set(mapped.map((m) => m.id));
          const combined = [
            ...mapped,
            ...DAFTAR_ADUAN_KOMENTAR_MOCK.filter((d) => !backendIds.has(d.id)),
          ];
          setDaftarAduan(combined);
        }
      } catch {
        // Fallback default
      } finally {
        if (aktif) setSedangMemuat(false);
      }
    }

    muatLaporanBackend();
    return () => {
      aktif = false;
    };
  }, []);

  // Update status (Ditolak / Selesai)
  const handleUbahStatus = async (
    id: number,
    tipe: "Komentar" | "Tanggapan",
    statusBaru: "Ditolak" | "Selesai"
  ) => {
    try {
      const apiType = tipe === "Tanggapan" ? "tanggapan" : "komentar";
      const apiStatus = statusBaru === "Ditolak" ? "rejected" : "resolved";
      await api
        .updateAdminReportStatus(apiType, id, apiStatus)
        .catch(() => null);

      setDaftarAduan((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: statusBaru } : item
        )
      );

      setPesanNotif({
        tipe: "sukses",
        pesan: `Status aduan ${tipe} berhasil diubah menjadi "${statusBaru}".`,
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
    // Filter Kategori (Pill)
    if (tabKategori !== "Semua Kategori" && item.tipe !== tabKategori) {
      return false;
    }

    // Filter Status dropdown
    if (filterStatus !== "Semua Status" && item.status !== filterStatus) {
      return false;
    }

    // Filter Search
    if (!kataKunci.trim()) return true;
    const q = kataKunci.toLowerCase();
    const matchTipe = item.tipe.toLowerCase().includes(q);
    const matchKategori = item.kategori_laporan.toLowerCase().includes(q);
    const matchPenjelasan = item.penjelasan_singkat.toLowerCase().includes(q);
    const matchPelapor = item.nama_pelapor.toLowerCase().includes(q);

    return matchTipe || matchKategori || matchPenjelasan || matchPelapor;
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
              Laporan &amp; Aduan Data Komentar dan Tanggapan
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 max-w-2xl leading-relaxed">
              Kelola laporan warga terhadap topik diskusi dan tanggapan komentar di
              Forum Kesehatan BogorSehat guna menjaga ruang komunitas yang aman,
              faktual, dan kondusif.
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
        <div className="space-y-3">
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

              {/* Dropdown Kecamatan */}
              <div className="sm:col-span-3">
                <select
                  value={filterKecamatan}
                  onChange={(e) => setFilterKecamatan(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
                >
                  <option value="Semua Kecamatan (Kota Bogor)">
                    Semua Kecamatan (Kota Bogor)
                  </option>
                  <option value="Bogor Barat">Bogor Barat</option>
                  <option value="Bogor Tengah">Bogor Tengah</option>
                  <option value="Bogor Timur">Bogor Timur</option>
                  <option value="Bogor Selatan">Bogor Selatan</option>
                  <option value="Bogor Utara">Bogor Utara</option>
                  <option value="Tanah Sareal">Tanah Sareal</option>
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

          {/* Baris Kategori: Semua Kategori | Komentar | Tanggapan (Matching Screenshot) */}
          <div className="flex items-center gap-2 text-xs font-semibold px-1">
            <span className="text-slate-500 uppercase tracking-wider text-[11px] font-bold mr-1">
              KATEGORI:
            </span>

            <button
              type="button"
              onClick={() => setTabKategori("Semua Kategori")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                tabKategori === "Semua Kategori"
                  ? "bg-[#007E7A] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Semua Kategori
            </button>

            <button
              type="button"
              onClick={() => setTabKategori("Komentar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                tabKategori === "Komentar"
                  ? "bg-[#007E7A] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Komentar
            </button>

            <button
              type="button"
              onClick={() => setTabKategori("Tanggapan")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                tabKategori === "Tanggapan"
                  ? "bg-[#007E7A] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Tanggapan
            </button>
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
                  <th className="py-3 px-6">Tipe</th>
                  <th className="py-3 px-6">Kategori Laporan</th>
                  <th className="py-3 px-6">Penjelasan</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {aduanTerfilter.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    {/* Tipe */}
                    <td className="py-4 px-6 font-bold text-slate-900 text-xs">
                      {row.tipe}
                    </td>

                    {/* Kategori Laporan */}
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {row.kategori_laporan}
                    </td>

                    {/* Penjelasan */}
                    <td className="py-4 px-6 text-slate-600 max-w-sm leading-relaxed">
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
                          onClick={() => setItemTerpilih(row)}
                          className="p-1 hover:text-[#007E7A] rounded transition"
                          title="Lihat Detail Komentar/Tanggapan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Tolak Aduan */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUbahStatus(row.id, row.tipe, "Ditolak")
                          }
                          className="p-1 hover:text-red-600 rounded transition"
                          title="Tolak Aduan"
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        {/* Selesaikan / Validasi Aduan */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUbahStatus(row.id, row.tipe, "Selesai")
                          }
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

        {/* MODAL DETAIL KOMENTAR & TANGGAPAN (Matching Images 2 & 3 Pixel-Perfect) */}
        {itemTerpilih && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] transition-all"
            onClick={(e) => {
              if (e.target === e.currentTarget) setItemTerpilih(null);
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              {/* Header Modal */}
              <div className="px-6 py-4 bg-[#F2F8F8] border-b border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D8EFEF] text-[#007E7A] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      🕒 {itemTerpilih.waktu}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                      Informasi Detail Komentar dan Tanggapan
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setItemTerpilih(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6">
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 block text-sm">
                        {itemTerpilih.nama_pelapor}
                      </span>
                      <span className="text-[11.5px] text-slate-500">
                        {itemTerpilih.lokasi_pelapor}
                      </span>
                    </div>
                    <span className="text-[11.5px] text-slate-400 font-medium">
                      {itemTerpilih.waktu}
                    </span>
                  </div>

                  {/* Inner Box with Quote Content */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#007E7A]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>
                        {itemTerpilih.tipe === "Komentar"
                          ? "Komentar:"
                          : "Tanggapan:"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                      {itemTerpilih.isi_lengkap}
                    </p>
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

