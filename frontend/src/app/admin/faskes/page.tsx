"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  PlusCircle,
  Search,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { FormAlert, SearchInput } from "@/components/ui";
import { api, ApiFaskes, ApiPaginationMeta, messageFromError } from "@/lib/api";

export default function AdminFaskesPage() {
  const [kata_kunci_admin, set_kata_kunci_admin] = useState("");
  const [daftarFaskes, setDaftarFaskes] = useState<ApiFaskes[]>([]);
  const [halamanAktif, setHalamanAktif] = useState(1);
  const [metaPaginasi, setMetaPaginasi] = useState<ApiPaginationMeta | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanStatus, setPesanStatus] = useState<{ tipe: "sukses" | "error"; pesan: string } | null>(null);

  const [idHapus, setIdHapus] = useState<number | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  const muatData = useCallback(async () => {
    setSedangMemuat(true);
    try {
      const res = await api.getAdminFaskes({
        search: kata_kunci_admin.trim() || undefined,
        page: halamanAktif,
        per_page: 15,
      });
      setDaftarFaskes(res.data || []);
      setMetaPaginasi(res.meta || null);
    } catch (err) {
      setPesanStatus({
        tipe: "error",
        pesan: messageFromError(err, "Gagal memuat data faskes dari server."),
      });
    } finally {
      setSedangMemuat(false);
    }
  }, [kata_kunci_admin, halamanAktif]);

  useEffect(() => {
    muatData();
  }, [muatData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setHalamanAktif(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [kata_kunci_admin]);

  const konfirmasiHapus = async () => {
    if (idHapus === null) return;
    setSedangHapus(true);
    try {
      await api.deleteFaskes(idHapus);
      setPesanStatus({ tipe: "sukses", pesan: "Faskes berhasil dihapus." });
      setIdHapus(null);
      muatData();
    } catch (err) {
      setPesanStatus({
        tipe: "error",
        pesan: messageFromError(err, "Gagal menghapus faskes."),
      });
    } finally {
      setSedangHapus(false);
    }
  };

  const unduhCsv = () => {
    if (daftarFaskes.length === 0) return;
    const header = "id,nama_faskes,jenis,kota_kabupaten,kecamatan,latitude,longitude,bpjs\n";
    const baris = daftarFaskes
      .map(
        (f) =>
          `"${f.id_faskes}","${f.nama_faskes.replace(/"/g, '""')}","${f.jenis_faskes || ""}","${f.kota_kabupaten}","${f.kecamatan || ""}","${f.latitude}","${f.longitude}","${f.bpjs_status}"`
      )
      .join("\n");
    const blob = new Blob([header + baris], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `data_faskes_bogor_halaman_${halamanAktif}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-[1120px]">
        {/* Notifikasi Status */}
        {pesanStatus && (
          <FormAlert
            tipe={pesanStatus.tipe}
            pesan={pesanStatus.pesan}
            onClose={() => setPesanStatus(null)}
          />
        )}

        {/* Baris Judul & Tombol Aksi */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900">
              Manajemen Data Fasilitas Kesehatan
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 max-w-xl leading-relaxed">
              Kelola direktori fasilitas kesehatan Kota &amp; Kab. Bogor: tambah faskes
              baru, perbarui data operasional, atau hapus faskes non-aktif
              secara terpusat untuk layanan publik.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <button
              type="button"
              onClick={unduhCsv}
              className="h-11 px-5 rounded-xl bg-[#E9ECEF] hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh CSV</span>
            </button>

            <Link
              href="/admin/faskes/tambah"
              className="h-11 px-5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Faskes Baru</span>
            </Link>
          </div>
        </div>

        {/* Kartu Pencarian */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <SearchInput
            value={kata_kunci_admin}
            onChange={(val) => set_kata_kunci_admin(val)}
            placeholder="Cari nama faskes, kode kemenkes (cth: 3271xxx), atau kecamatan..."
            className="!h-11"
          />
        </div>

        {/* Kartu Tabel Faskes */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2F4F7] text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-4 pl-8 pr-4">NO &amp; KODE</th>
                  <th className="py-4 px-4">NAMA FASILITAS, KATEGORI &amp; POLI</th>
                  <th className="py-4 px-4">KECAMATAN &amp; TITIK KOORDINAT GIS</th>
                  <th className="py-4 pl-4 pr-8 text-center">AKSI MANAJEMEN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sedangMemuat ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#007E7A]" />
                        <span>Memuat data faskes dari database backend...</span>
                      </div>
                    </td>
                  </tr>
                ) : daftarFaskes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      Tidak ada data faskes yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  daftarFaskes.map((item, index) => {
                    const noUrut = (metaPaginasi ? (metaPaginasi.current_page - 1) * metaPaginasi.per_page : 0) + index + 1;
                    const badgePoli = item.spesialisasi?.map((s) => s.nama_spesialisasi) || [];

                    return (
                      <tr key={item.id_faskes} className="hover:bg-slate-50/70 transition">
                        {/* Kolom 1 */}
                        <td className="py-4 pl-8 pr-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded bg-slate-200/80 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                              {noUrut}
                            </span>
                            <div>
                              <div className="font-extrabold text-slate-900 text-[13px]">
                                {item.kdppk || `FSK-${item.id_faskes}`}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                ID: #{item.id_faskes}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Kolom 2: Nama Faskes, Kategori, Kelas, Badge Poli & Alamat */}
                        <td className="py-4 px-4 min-w-[280px] max-w-[420px] space-y-1.5">
                          <div className="font-extrabold text-slate-900 text-[13px] leading-snug">
                            {item.nama_faskes}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#A5F3FC]/60 text-[#0E7490] whitespace-nowrap shrink-0">
                              {item.jenis_faskes || "Faskes"}
                            </span>
                            {item.kelas_faskes && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 whitespace-nowrap shrink-0">
                                Kls {item.kelas_faskes}
                              </span>
                            )}
                            {badgePoli.length > 0 ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-[#007E7A] border border-teal-200/80 whitespace-nowrap shrink-0"
                                title={badgePoli.join(", ")}
                              >
                                <Stethoscope className="w-3 h-3 text-[#007E7A]" />
                                <span>{badgePoli.length} Poli</span>
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-400 border border-slate-200/80 whitespace-nowrap shrink-0">
                                0 Poli
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {item.alamat_faskes}
                          </div>
                        </td>

                        {/* Kolom 3 */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-[13px] mb-1">
                            {item.kecamatan ? `${item.kecamatan}, ` : ""}
                            {item.kota_kabupaten}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div>
                              <div>{Number(item.latitude).toFixed(4)}°,</div>
                              <div>{Number(item.longitude).toFixed(4)}°</div>
                            </div>
                          </div>
                        </td>

                        {/* Kolom 4 */}
                        <td className="py-4 pl-4 pr-8 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/admin/faskes/${item.id_faskes}/edit`}
                              className="px-3 py-1.5 rounded-lg bg-[#EBEEF2] hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1.5 transition"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => setIdHapus(item.id_faskes)}
                              className="px-3 py-1.5 rounded-lg bg-[#EBEEF2] hover:bg-rose-50 text-[#D92D20] font-bold text-[11px] flex items-center gap-1.5 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginasi Bawah */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">
              Menampilkan{" "}
              <strong className="text-slate-900">
                {daftarFaskes.length}
              </strong>{" "}
              dari total{" "}
              <strong className="text-slate-900">
                {metaPaginasi?.total || daftarFaskes.length}
              </strong>{" "}
              faskes resmi
            </span>

            {metaPaginasi && metaPaginasi.last_page > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={halamanAktif <= 1}
                  onClick={() => setHalamanAktif((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold hover:bg-slate-200 disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1 text-slate-700 font-bold">
                  Halaman {metaPaginasi.current_page} dari {metaPaginasi.last_page}
                </span>
                <button
                  type="button"
                  disabled={halamanAktif >= metaPaginasi.last_page}
                  onClick={() => setHalamanAktif((p) => Math.min(metaPaginasi.last_page, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold hover:bg-slate-200 disabled:opacity-40"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialog Konfirmasi Hapus */}
      {idHapus !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900">Hapus Data Faskes?</h3>
              <p className="text-xs text-slate-500">
                Tindakan ini akan menghapus data fasilitas kesehatan #{idHapus} secara permanen dari basis data.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIdHapus(null)}
                className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={sedangHapus}
                onClick={konfirmasiHapus}
                className="flex-1 py-2 rounded-lg bg-[#D92D20] hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {sedangHapus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebarLayout>
  );
}
