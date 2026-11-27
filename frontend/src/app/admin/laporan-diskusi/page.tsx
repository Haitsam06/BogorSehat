"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Printer,
  Search,
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
import { CustomSelect, FormAlert, SearchInput } from "@/components/ui";
import { api, messageFromError } from "@/lib/api";

interface AduanKomentarItem {
  id: number;
  api_type: "komentar" | "diskusi" | "tanggapan";
  tipe: "Komentar" | "Tanggapan" | "Diskusi";
  kategori_laporan: string;
  penjelasan_singkat: string;
  isi_lengkap: string;
  status: "Ditolak" | "Selesai" | "Menunggu";
  nama_pelapor: string;
  kontak_pelapor: string;
  waktu: string;
  catatan: string | null;
}

const LABEL_TIPE = {
  komentar: "Komentar",
  diskusi: "Diskusi",
  tanggapan: "Tanggapan",
} as const;

const LABEL_STATUS = {
  pending: "Menunggu",
  resolved: "Selesai",
  rejected: "Ditolak",
} as const;

function formatWaktu(value: string): string {
  const tanggal = new Date(value);
  if (Number.isNaN(tanggal.getTime())) return "-";
  return tanggal.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function LaporanDataDiskusiPage() {
  const [daftarAduan, setDaftarAduan] = useState<AduanKomentarItem[]>([]);
  const [tabKategori, setTabKategori] = useState<
    "Semua Kategori" | "Komentar" | "Tanggapan" | "Diskusi"
  >("Komentar");
  const [kataKunci, setKataKunci] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [itemTerpilih, setItemTerpilih] = useState<AduanKomentarItem | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  const [pesanNotif, setPesanNotif] = useState<{
    tipe: "sukses" | "error";
    pesan: string;
  } | null>(null);

  useEffect(() => {
    let aktif = true;
    async function muatLaporanBackend() {
      try {
        setSedangMemuat(true);
        const laporan = await api.getAdminReports();
        if (!aktif) return;

        setDaftarAduan(
          laporan.map((item) => {
            const isi =
              item.content?.body ||
              item.catatan ||
              "Konten laporan tidak tersedia.";

            return {
              id: item.id,
              api_type: item.type,
              tipe: LABEL_TIPE[item.type],
              kategori_laporan: item.alasan,
              penjelasan_singkat:
                isi.length > 55 ? `${isi.slice(0, 55)}...` : isi,
              isi_lengkap: isi,
              status: LABEL_STATUS[item.status],
              nama_pelapor: item.reported_user?.nama_user || "Pengguna",
              kontak_pelapor: item.reported_user?.email_user || "-",
              waktu: formatWaktu(item.created_at),
              catatan: item.catatan ?? null,
            };
          })
        );
      } catch (err) {
        if (aktif) {
          setDaftarAduan([]);
          setPesanNotif({
            tipe: "error",
            pesan: messageFromError(err, "Gagal memuat laporan dari server."),
          });
        }
      } finally {
        if (aktif) setSedangMemuat(false);
      }
    }

    muatLaporanBackend();
    return () => {
      aktif = false;
    };
  }, []);

  const handleUbahStatus = async (
    row: AduanKomentarItem,
    statusBaru: "Ditolak" | "Selesai"
  ) => {
    try {
      const status = statusBaru === "Ditolak" ? "rejected" : "resolved";
      await api.updateAdminReportStatus(row.api_type, row.id, status);

      setDaftarAduan((prev) =>
        prev.map((item) =>
          item.id === row.id && item.api_type === row.api_type
            ? { ...item, status: statusBaru }
            : item
        )
      );

      setPesanNotif({
        tipe: "sukses",
        pesan: `Status aduan ${row.tipe} berhasil diubah menjadi "${statusBaru}".`,
      });
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal memperbarui status aduan."),
      });
    }
  };

  const aduanTerfilter = daftarAduan.filter((item) => {
    if (tabKategori !== "Semua Kategori" && item.tipe !== tabKategori) {
      return false;
    }

    if (filterStatus !== "Semua Status" && item.status !== filterStatus) {
      return false;
    }

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
          <FormAlert
            tipe={pesanNotif.tipe}
            pesan={pesanNotif.pesan}
            onClose={() => setPesanNotif(null)}
          />
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
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Input Pencarian */}
              <SearchInput
                value={kataKunci}
                onChange={setKataKunci}
                placeholder="Cari..."
                className="!h-10 text-xs border border-slate-200 bg-slate-50/50 focus:bg-white"
                containerClassName="w-full"
              />

              {/* Dropdown Status */}
              <div className="w-full sm:w-48 shrink-0">
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  highlightSelected={filterStatus !== "Semua Status"}
                  className="!h-10 !text-xs bg-slate-50/50"
                  options={[
                    { value: "Semua Status", label: "Semua Status" },
                    { value: "Menunggu", label: "Menunggu" },
                    { value: "Selesai", label: "Selesai" },
                    { value: "Ditolak", label: "Ditolak" },
                  ]}
                />
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

            <button
              type="button"
              onClick={() => setTabKategori("Diskusi")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                tabKategori === "Diskusi"
                  ? "bg-[#007E7A] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Diskusi
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
                {sedangMemuat ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#007E7A]" />
                      <p className="mt-2">Memuat laporan dari server...</p>
                    </td>
                  </tr>
                ) : aduanTerfilter.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      Tidak ada laporan yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  aduanTerfilter.map((row) => (
                  <tr
                    key={`${row.api_type}-${row.id}`}
                    className="hover:bg-slate-50/80 transition"
                  >
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
                          onClick={() => handleUbahStatus(row, "Ditolak")}
                          className="p-1 hover:text-red-600 rounded transition"
                          title="Tolak Aduan"
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        {/* Selesaikan / Validasi Aduan */}
                        <button
                          type="button"
                          onClick={() => handleUbahStatus(row, "Selesai")}
                          className="p-1 hover:text-emerald-600 rounded transition"
                          title="Setujui / Selesaikan Aduan"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-200/80 text-xs text-slate-500 font-medium">
            Menampilkan {aduanTerfilter.length} dari {daftarAduan.length} aduan.
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
                        {itemTerpilih.kontak_pelapor}
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
                          : itemTerpilih.tipe === "Diskusi"
                          ? "Diskusi:"
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

