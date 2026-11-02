"use client";

import React, { useState } from "react";
import {
  Download,
  PlusCircle,
  Search,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { DaftarBadgePoli } from "@/components/ui/badge_poli";

const daftar_faskes_admin = [
  {
    nomor_urut: 1,
    kode_kemenkes: "3271012",
    nama_faskes: "RSUD Kota Bogor",
    label_kategori: "Rumah Sakit",
    gaya_badge_kategori: "bg-[#A5F3FC] text-[#0E7490]",
    alamat_singkat: "Jl. DR. Sumeru No.120, RT.03/RW.2",
    kecamatan: "Bogor Barat",
    latitude_teks: "-6.589145,",
    longitude_teks: "106.772390",
    daftar_poli: ["Poli Umum", "Poli Anak", "Poli Jantung", "Poli Bedah"],
  },
  {
    nomor_urut: 2,
    kode_kemenkes: "3271023",
    nama_faskes: "RS PMI Kota Bogor",
    label_kategori: "Rumah Sakit",
    gaya_badge_kategori: "bg-[#A5F3FC] text-[#0E7490]",
    alamat_singkat: "Jl. Rumah Sakit I No.4, Tegallega",
    kecamatan: "Bogor Tengah",
    latitude_teks: "-6.598210,",
    longitude_teks: "106.805400",
    daftar_poli: ["Poli Umum", "Poli Anak", "Poli Penyakit Dalam"],
  },
  {
    nomor_urut: 3,
    kode_kemenkes: "3271105",
    nama_faskes: "Puskesmas Tanah Sareal",
    label_kategori: "Puskesmas",
    gaya_badge_kategori: "bg-[#86EFAC] text-[#065F46]",
    alamat_singkat: "Jl. Kesehatan No.1, Kebon Pedes",
    kecamatan: "Tanah Sareal",
    latitude_teks: "-6.568430,",
    longitude_teks: "106.797280",
    daftar_poli: ["Poli Umum", "Poli Gigi", "Poli Anak"],
  },
  {
    nomor_urut: 4,
    kode_kemenkes: "3271045",
    nama_faskes: "RS Siloam Bogor",
    label_kategori: "Rumah Sakit",
    gaya_badge_kategori: "bg-[#A5F3FC] text-[#0E7490]",
    alamat_singkat: "Jl. Pajajaran No.27, Babakan",
    kecamatan: "Bogor Tengah",
    latitude_teks: "-6.595120,",
    longitude_teks: "106.804150",
    daftar_poli: ["Poli Umum", "Poli Jantung", "Poli Saraf"],
  },
  {
    nomor_urut: 5,
    kode_kemenkes: "3271220",
    nama_faskes: "Klinik Pratama Sehat Mandiri",
    label_kategori: "Klinik Pratama",
    gaya_badge_kategori: "bg-[#FDE68A] text-[#92400E]",
    alamat_singkat: "Jl. Raya Tajur No.88, Muarasar",
    kecamatan: "Bogor Timur",
    latitude_teks: "-6.634120,",
    longitude_teks: "106.832900",
    daftar_poli: ["Poli Umum", "Poli Gigi"],
  },
];

export default function AdminFaskesPage() {
  const [kata_kunci_admin, set_kata_kunci_admin] = useState("");

  const daftar_tersaring = daftar_faskes_admin.filter(
    (item) =>
      item.nama_faskes
        .toLowerCase()
        .includes(kata_kunci_admin.toLowerCase()) ||
      item.kode_kemenkes.includes(kata_kunci_admin) ||
      item.kecamatan.toLowerCase().includes(kata_kunci_admin.toLowerCase())
  );

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-[1120px]">
        {/* Baris Judul & Tombol Aksi */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900">
              Manajemen Data Fasilitas Kesehatan
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 max-w-xl leading-relaxed">
              Kelola direktori fasilitas kesehatan Kota Bogor: tambah faskes
              baru, perbarui data operasional, atau hapus faskes non-aktif
              secara terpusat untuk layanan publik.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <button
              type="button"
              className="h-11 px-5 rounded-xl bg-[#E9ECEF] hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh CSV</span>
            </button>

            <button
              type="button"
              className="h-11 px-5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Faskes Baru</span>
            </button>
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
                  <th className="py-4 pl-10 pr-4">NO &amp; KODE KEMENKES</th>
                  <th className="py-4 px-4">
                    NAMA FASILITAS, KATEGORI &amp; POLI
                  </th>
                  <th className="py-4 px-4">
                    KECAMATAN &amp; TITIK KOORDINAT GIS
                  </th>
                  <th className="py-4 pl-4 pr-8 text-center">
                    AKSI MANAJEMEN
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {daftar_tersaring.map((item_faskes) => (
                  <tr
                    key={item_faskes.nomor_urut}
                    className="hover:bg-slate-50/70 transition"
                  >
                    {/* Kolom 1: No & Kode Kemenkes */}
                    <td className="py-4 pl-10 pr-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-slate-200/80 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {item_faskes.nomor_urut}
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-900 text-[13px]">
                            {item_faskes.kode_kemenkes}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-tight">
                            Kemenkes
                            <br />
                            ID
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kolom 2: Nama Fasilitas, Kategori & Badge Poli */}
                    <td className="py-4 px-4 max-w-[360px] space-y-2">
                      <div className="font-extrabold text-slate-900 text-[13px]">
                        {item_faskes.nama_faskes}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap leading-tight shrink-0 ${item_faskes.gaya_badge_kategori}`}
                        >
                          {item_faskes.label_kategori}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {item_faskes.alamat_singkat}
                        </span>
                      </div>
                      <DaftarBadgePoli
                        daftar_poli={item_faskes.daftar_poli}
                        maksimal_tampil={3}
                        ukuran_badge="kecil"
                      />
                    </td>

                    {/* Kolom 3: Kecamatan & Koordinat */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-[13px] mb-1">
                        {item_faskes.kecamatan}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <div>{item_faskes.latitude_teks}</div>
                          <div>{item_faskes.longitude_teks}</div>
                        </div>
                      </div>
                    </td>

                    {/* Kolom 4: Aksi Manajemen */}
                    <td className="py-4 pl-4 pr-8 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-[#EBEEF2] hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1.5 transition"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-[#EBEEF2] hover:bg-rose-50 text-[#D92D20] font-bold text-[11px] flex items-center gap-1.5 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginasi Bawah */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">
              Menampilkan{" "}
              <strong className="text-slate-900">
                {daftar_tersaring.length}
              </strong>{" "}
              dari total{" "}
              <strong className="text-slate-900">
                {daftar_faskes_admin.length}
              </strong>{" "}
              faskes resmi
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-semibold"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-[#007E7A] text-white font-bold text-[11px]"
              >
                1
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-semibold"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
