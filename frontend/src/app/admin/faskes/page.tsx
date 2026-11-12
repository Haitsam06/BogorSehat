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
} from "lucide-react";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { DaftarBadgePoli } from "@/components/ui/badge_poli";
import { api, ApiFaskes, ApiPaginationMeta } from "@/lib/api";

interface FormFaskesState {
  nama_faskes: string;
  alamat_faskes: string;
  kota_kabupaten: string;
  kecamatan: string;
  latitude: string;
  longitude: string;
  kdppk: string;
  jenis_faskes: string;
  kelas_faskes: string;
  telp_faskes: string;
  is_support_bpjs: boolean;
}

const formAwal: FormFaskesState = {
  nama_faskes: "",
  alamat_faskes: "",
  kota_kabupaten: "KOTA BOGOR",
  kecamatan: "",
  latitude: "-6.5950",
  longitude: "106.7990",
  kdppk: "",
  jenis_faskes: "Rumah Sakit",
  kelas_faskes: "C",
  telp_faskes: "",
  is_support_bpjs: true,
};

export default function AdminFaskesPage() {
  const [kata_kunci_admin, set_kata_kunci_admin] = useState("");
  const [daftarFaskes, setDaftarFaskes] = useState<ApiFaskes[]>([]);
  const [halamanAktif, setHalamanAktif] = useState(1);
  const [metaPaginasi, setMetaPaginasi] = useState<ApiPaginationMeta | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanStatus, setPesanStatus] = useState<{ tipe: "sukses" | "error"; pesan: string } | null>(null);

  // Modal State
  const [modalBuka, setModalBuka] = useState(false);
  const [modeEdit, setModeEdit] = useState<number | null>(null); // null = tambah, number = id_faskes
  const [formData, setFormData] = useState<FormFaskesState>(formAwal);
  const [sedangSimpan, setSedangSimpan] = useState(false);
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
    } catch (err: any) {
      setPesanStatus({
        tipe: "error",
        pesan: err?.message || "Gagal memuat data faskes dari server.",
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

  const bukaModalTambah = () => {
    setModeEdit(null);
    setFormData(formAwal);
    setModalBuka(true);
  };

  const bukaModalEdit = (faskes: ApiFaskes) => {
    setModeEdit(faskes.id_faskes);
    setFormData({
      nama_faskes: faskes.nama_faskes,
      alamat_faskes: faskes.alamat_faskes,
      kota_kabupaten: faskes.kota_kabupaten,
      kecamatan: faskes.kecamatan || "",
      latitude: String(faskes.latitude),
      longitude: String(faskes.longitude),
      kdppk: faskes.kdppk || "",
      jenis_faskes: faskes.jenis_faskes || "Rumah Sakit",
      kelas_faskes: faskes.kelas_faskes || "",
      telp_faskes: faskes.telp_faskes || "",
      is_support_bpjs: Boolean(faskes.is_support_bpjs),
    });
    setModalBuka(true);
  };

  const tanganiSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSedangSimpan(true);
    setPesanStatus(null);

    const payload = {
      nama_faskes: formData.nama_faskes.trim(),
      alamat_faskes: formData.alamat_faskes.trim(),
      kota_kabupaten: formData.kota_kabupaten,
      kecamatan: formData.kecamatan.trim() || undefined,
      latitude: parseFloat(formData.latitude) || -6.595,
      longitude: parseFloat(formData.longitude) || 106.799,
      kdppk: formData.kdppk.trim() || undefined,
      jenis_faskes: formData.jenis_faskes.trim() || undefined,
      kelas_faskes: formData.kelas_faskes.trim() || undefined,
      telp_faskes: formData.telp_faskes.trim() || undefined,
      is_support_bpjs: formData.is_support_bpjs,
    };

    try {
      if (modeEdit !== null) {
        await api.updateFaskes(modeEdit, payload);
        setPesanStatus({ tipe: "sukses", pesan: "Data faskes berhasil diperbarui." });
      } else {
        await api.createFaskes(payload);
        setPesanStatus({ tipe: "sukses", pesan: "Faskes baru berhasil ditambahkan." });
      }
      setModalBuka(false);
      muatData();
    } catch (err: any) {
      setPesanStatus({
        tipe: "error",
        pesan: err?.message || "Gagal menyimpan data faskes.",
      });
    } finally {
      setSedangSimpan(false);
    }
  };

  const konfirmasiHapus = async () => {
    if (idHapus === null) return;
    setSedangHapus(true);
    try {
      await api.deleteFaskes(idHapus);
      setPesanStatus({ tipe: "sukses", pesan: "Faskes berhasil dihapus." });
      setIdHapus(null);
      muatData();
    } catch (err: any) {
      setPesanStatus({
        tipe: "error",
        pesan: err?.message || "Gagal menghapus faskes.",
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
          `"${f.id_faskes}","${f.nama_faskes.replace(/"/g, '""')}","${f.jenis_faskes || ""}","${f.kota_kabupaten}","${f.kecamatan || ""}","${f.latitude}","${f.longitude}","${f.is_support_bpjs ? "Ya" : "Tidak"}"`
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
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
              pesanStatus.tipe === "sukses"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {pesanStatus.tipe === "sukses" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{pesanStatus.pesan}</span>
            </div>
            <button
              type="button"
              onClick={() => setPesanStatus(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={kata_kunci_admin}
              onChange={(e) => set_kata_kunci_admin(e.target.value)}
              placeholder="Cari nama faskes, kode kemenkes (cth: 3271xxx), atau kecamatan..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F3F5F8] text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
            />
          </div>
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
                    const badgePoli = item.spesialisasi?.map((s) => s.nama_spesialisasi) || ["Poli Umum"];

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

                        {/* Kolom 2 */}
                        <td className="py-4 px-4 max-w-[340px] space-y-2">
                          <div className="font-extrabold text-slate-900 text-[13px]">
                            {item.nama_faskes}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#A5F3FC]/60 text-[#0E7490]">
                              {item.jenis_faskes || "Faskes"}
                            </span>
                            {item.kelas_faskes && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                Kls {item.kelas_faskes}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                              {item.alamat_faskes}
                            </span>
                          </div>
                          <DaftarBadgePoli
                            daftar_poli={badgePoli}
                            maksimal_tampil={3}
                            ukuran_badge="kecil"
                          />
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
                            <button
                              type="button"
                              onClick={() => bukaModalEdit(item)}
                              className="px-3 py-1.5 rounded-lg bg-[#EBEEF2] hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1.5 transition"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

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

      {/* Modal Tambah / Edit Faskes */}
      {modalBuka && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">
                {modeEdit ? "Edit Data Fasilitas Kesehatan" : "Tambah Faskes Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setModalBuka(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={tanganiSimpan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Nama Faskes *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama_faskes}
                    onChange={(e) => setFormData({ ...formData, nama_faskes: e.target.value })}
                    placeholder="Contoh: RSUD Kota Bogor"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Alamat Lengkap *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.alamat_faskes}
                    onChange={(e) => setFormData({ ...formData, alamat_faskes: e.target.value })}
                    placeholder="Jl. DR. Sumeru No.120"
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kota / Kabupaten *</label>
                  <select
                    value={formData.kota_kabupaten}
                    onChange={(e) => setFormData({ ...formData, kota_kabupaten: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                  >
                    <option value="KOTA BOGOR">KOTA BOGOR</option>
                    <option value="KAB. BOGOR">KAB. BOGOR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kecamatan</label>
                  <input
                    type="text"
                    value={formData.kecamatan}
                    onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                    placeholder="Bogor Barat"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jenis Faskes</label>
                  <select
                    value={formData.jenis_faskes}
                    onChange={(e) => setFormData({ ...formData, jenis_faskes: e.target.value })}
                    className="w-full h-10 px-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                  >
                    <option value="Rumah Sakit">Rumah Sakit</option>
                    <option value="Puskesmas">Puskesmas</option>
                    <option value="Klinik Pratama">Klinik Pratama</option>
                    <option value="Klinik Utama">Klinik Utama</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kelas Faskes</label>
                  <input
                    type="text"
                    value={formData.kelas_faskes}
                    onChange={(e) => setFormData({ ...formData, kelas_faskes: e.target.value })}
                    placeholder="A, B, C, D"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Latitude *</label>
                  <input
                    type="text"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="-6.5950"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Longitude *</label>
                  <input
                    type="text"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="106.7990"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kode Kemenkes / KDPPK</label>
                  <input
                    type="text"
                    value={formData.kdppk}
                    onChange={(e) => setFormData({ ...formData, kdppk: e.target.value })}
                    placeholder="3271012"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nomor Telepon</label>
                  <input
                    type="text"
                    value={formData.telp_faskes}
                    onChange={(e) => setFormData({ ...formData, telp_faskes: e.target.value })}
                    placeholder="0251-8321000"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_support_bpjs}
                    onChange={(e) => setFormData({ ...formData, is_support_bpjs: e.target.checked })}
                    className="w-4 h-4 rounded text-[#007E7A] focus:ring-[#007E7A] accent-[#007E7A]"
                  />
                  <span className="font-bold text-slate-800">Mendukung Pelayanan BPJS Kesehatan</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalBuka(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={sedangSimpan}
                  className="px-5 py-2 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {sedangSimpan && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{modeEdit ? "Simpan Perubahan" : "Tambahkan Faskes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
