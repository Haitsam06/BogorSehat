"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Search,
  SlidersHorizontal,
  Star,
  RotateCcw,
  Building2,
  Navigation,
} from "lucide-react";
import { daftar_faskes_utama, daftar_semua_poli } from "@/data/data_faskes";
import { DaftarBadgePoli } from "@/components/ui/badge_poli";
import DropdownPencarian from "@/components/ui/dropdown_pencarian";

const daftar_pilihan_kecamatan = [
  "Bogor Barat",
  "Bogor Tengah",
  "Bogor Timur",
  "Bogor Selatan",
  "Bogor Utara",
  "Tanah Sareal",
  "Cibinong",
  "Ciawi",
  "Sukaraja",
  "Babakan Madang",
  "Gunung Putri",
  "Bojonggede",
];

const daftar_pilihan_kategori = [
  "Rumah Sakit Umum",
  "Rumah Sakit KIA / Khusus",
  "Puskesmas",
  "Klinik Pratama",
  "Klinik Utama",
];

export default function CariFaskesPage() {
  const [kata_kunci_pencarian, set_kata_kunci_pencarian] = useState("");
  const [filter_wilayah, set_filter_wilayah] = useState("ALL");
  const [filter_kecamatan, set_filter_kecamatan] = useState("ALL");
  const [filter_kategori, set_filter_kategori] = useState("ALL");
  const [filter_poli_aktif, set_filter_poli_aktif] = useState("ALL");
  const [filter_bpjs, set_filter_bpjs] = useState("ALL");
  const [filter_igd, set_filter_igd] = useState("ALL");

  // Reset semua filter
  const reset_semua_filter = () => {
    set_kata_kunci_pencarian("");
    set_filter_wilayah("ALL");
    set_filter_kecamatan("ALL");
    set_filter_kategori("ALL");
    set_filter_poli_aktif("ALL");
    set_filter_bpjs("ALL");
    set_filter_igd("ALL");
  };

  const ada_filter_aktif =
    kata_kunci_pencarian !== "" ||
    filter_wilayah !== "ALL" ||
    filter_kecamatan !== "ALL" ||
    filter_kategori !== "ALL" ||
    filter_poli_aktif !== "ALL" ||
    filter_bpjs !== "ALL" ||
    filter_igd !== "ALL";

  // Filter gabungan faskes
  const daftar_faskes_tersaring = useMemo(() => {
    return daftar_faskes_utama.filter((faskes_item) => {
      // 1. Pencarian teks
      const q = kata_kunci_pencarian.trim().toLowerCase();
      const cocok_nama =
        !q ||
        faskes_item.nama_faskes.toLowerCase().includes(q) ||
        faskes_item.alamat_lengkap.toLowerCase().includes(q) ||
        faskes_item.daftar_poli.some((p) => p.toLowerCase().includes(q));

      // 2. Filter wilayah biasa (2-3 opsi)
      const cocok_wilayah =
        filter_wilayah === "ALL" ||
        faskes_item.wilayah_kota_kab === filter_wilayah;

      // 3. Filter kecamatan (dropdown dengan search)
      const cocok_kecamatan =
        filter_kecamatan === "ALL" ||
        faskes_item.kecamatan.toLowerCase() === filter_kecamatan.toLowerCase();

      // 4. Filter kategori/jenis faskes (dropdown dengan search)
      let cocok_kategori = true;
      if (filter_kategori !== "ALL") {
        if (filter_kategori === "Rumah Sakit Umum") {
          cocok_kategori =
            faskes_item.kategori_faskes.includes("RUMAH SAKIT") &&
            !faskes_item.kategori_faskes.includes("KIA");
        } else if (filter_kategori === "Rumah Sakit KIA / Khusus") {
          cocok_kategori = faskes_item.kategori_faskes.includes("KIA");
        } else if (filter_kategori === "Puskesmas") {
          cocok_kategori = faskes_item.kategori_faskes.includes("PUSKESMAS");
        } else if (filter_kategori === "Klinik Pratama") {
          cocok_kategori = faskes_item.kategori_faskes.includes("PRATAMA");
        } else if (filter_kategori === "Klinik Utama") {
          cocok_kategori = faskes_item.kategori_faskes.includes("UTAMA");
        }
      }

      // 5. Filter poli (dropdown dengan search)
      const cocok_poli =
        filter_poli_aktif === "ALL" ||
        faskes_item.daftar_poli.includes(filter_poli_aktif);

      // 6. Filter status BPJS biasa (2-3 opsi)
      const cocok_bpjs =
        filter_bpjs === "ALL" ||
        (filter_bpjs === "BPJS_YA" && faskes_item.status_bpjs) ||
        (filter_bpjs === "BPJS_TIDAK" && !faskes_item.status_bpjs);

      // 7. Filter UGD 24 Jam biasa (2-3 opsi)
      const cocok_igd =
        filter_igd === "ALL" ||
        (filter_igd === "IGD_YA" && faskes_item.status_igd_24jam);

      return (
        cocok_nama &&
        cocok_wilayah &&
        cocok_kecamatan &&
        cocok_kategori &&
        cocok_poli &&
        cocok_bpjs &&
        cocok_igd
      );
    });
  }, [
    kata_kunci_pencarian,
    filter_wilayah,
    filter_kecamatan,
    filter_kategori,
    filter_poli_aktif,
    filter_bpjs,
    filter_igd,
  ]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#007E7A]">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-600 font-semibold">Cari Faskes</span>
      </div>

      {/* Judul Halaman */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
          Pencarian Fasilitas Kesehatan Bogor
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 max-w-3xl leading-relaxed">
          Temukan rumah sakit, puskesmas, dan klinik terdekat dengan filter
          akurat wilayah administratif, kelas faskes, ketersediaan layanan
          poliklinik, serta kepesertaan BPJS Kesehatan.
        </p>
      </div>

      {/* Kotak Pencarian Cepat */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={kata_kunci_pencarian}
            onChange={(e) => set_kata_kunci_pencarian(e.target.value)}
            placeholder="Cari nama faskes, alamat, atau poli..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F4F6F8] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A] transition"
          />
        </div>
      </div>

      {/* Grid Utama (Sidebar Filter Dikecilkan ke lg:col-span-3, Konten Lebih Luas di lg:col-span-9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Sidebar Filter (Lebih Ramping Kesamping) */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-4">
          {/* Header Filter */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#007E7A]" />
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">
                Filter Pencarian
              </h2>
            </div>
            {ada_filter_aktif && (
              <button
                type="button"
                onClick={reset_semua_filter}
                className="text-[11px] font-bold text-[#007E7A] hover:underline flex items-center gap-1"
                title="Reset Semua Filter"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 1. Filter Radio Button (2-3 Pilihan): Kota / Kabupaten */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Kota / Kabupaten
            </label>
            <div className="space-y-1">
              {[
                { nilai: "ALL", label: "Semua Wilayah" },
                { nilai: "KOTA_BOGOR", label: "Kota Bogor" },
                { nilai: "KABUPATEN_BOGOR", label: "Kabupaten Bogor" },
              ].map((opsi) => {
                const terpilih = filter_wilayah === opsi.nilai;
                return (
                  <label
                    key={opsi.nilai}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      terpilih
                        ? "bg-teal-50/50 border-[#007E7A] text-[#007E7A] font-bold"
                        : "border-slate-100 hover:bg-slate-50 text-slate-600 font-medium"
                    }`}
                  >
                    <input
                      type="radio"
                      name="filter_wilayah"
                      value={opsi.nilai}
                      checked={terpilih}
                      onChange={() => set_filter_wilayah(opsi.nilai)}
                      className="w-3.5 h-3.5 text-[#007E7A] focus:ring-[#007E7A] accent-[#007E7A]"
                    />
                    <span>{opsi.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Filter Dropdown dengan Search (Banyak Pilihan): Kecamatan */}
          <DropdownPencarian
            label="Kecamatan"
            daftar_pilihan={daftar_pilihan_kecamatan}
            nilai_terpilih={filter_kecamatan}
            saat_memilih={(nilai) => set_filter_kecamatan(nilai)}
            placeholder_pencarian="Cari kecamatan..."
            teks_default="Semua Kecamatan"
          />

          {/* 3. Filter Dropdown dengan Search (Banyak Pilihan): Jenis / Kategori Faskes */}
          <DropdownPencarian
            label="Jenis Faskes"
            daftar_pilihan={daftar_pilihan_kategori}
            nilai_terpilih={filter_kategori}
            saat_memilih={(nilai) => set_filter_kategori(nilai)}
            placeholder_pencarian="Cari jenis faskes..."
            teks_default="Semua Jenis Faskes"
          />

          {/* 4. Filter Dropdown dengan Search (Banyak Pilihan): Layanan Poli */}
          <DropdownPencarian
            label="Layanan Poliklinik"
            daftar_pilihan={daftar_semua_poli}
            nilai_terpilih={filter_poli_aktif}
            saat_memilih={(nilai) => set_filter_poli_aktif(nilai)}
            placeholder_pencarian="Cari poliklinik..."
            teks_default="Semua Poliklinik"
          />

          {/* 5. Filter Radio Button (2-3 Pilihan): Kemitraan BPJS */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800">
              Kemitraan BPJS
            </label>
            <div className="space-y-1">
              {[
                { nilai: "ALL", label: "Semua Faskes" },
                { nilai: "BPJS_YA", label: "✓ Menerima BPJS" },
                { nilai: "BPJS_TIDAK", label: "Non-BPJS" },
              ].map((opsi) => {
                const terpilih = filter_bpjs === opsi.nilai;
                return (
                  <label
                    key={opsi.nilai}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      terpilih
                        ? "bg-teal-50/50 border-[#007E7A] text-[#007E7A] font-bold"
                        : "border-slate-100 hover:bg-slate-50 text-slate-600 font-medium"
                    }`}
                  >
                    <input
                      type="radio"
                      name="filter_bpjs"
                      value={opsi.nilai}
                      checked={terpilih}
                      onChange={() => set_filter_bpjs(opsi.nilai)}
                      className="w-3.5 h-3.5 text-[#007E7A] focus:ring-[#007E7A] accent-[#007E7A]"
                    />
                    <span>{opsi.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 6. Filter Radio Button (2-3 Pilihan): UGD 24 Jam */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Layanan Darurat
            </label>
            <div className="space-y-1">
              {[
                { nilai: "ALL", label: "Semua Jam Operasional" },
                { nilai: "IGD_YA", label: "✳ Siaga IGD 24 Jam" },
              ].map((opsi) => {
                const terpilih = filter_igd === opsi.nilai;
                return (
                  <label
                    key={opsi.nilai}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      terpilih
                        ? "bg-teal-50/50 border-[#007E7A] text-[#007E7A] font-bold"
                        : "border-slate-100 hover:bg-slate-50 text-slate-600 font-medium"
                    }`}
                  >
                    <input
                      type="radio"
                      name="filter_igd"
                      value={opsi.nilai}
                      checked={terpilih}
                      onChange={() => set_filter_igd(opsi.nilai)}
                      className="w-3.5 h-3.5 text-[#007E7A] focus:ring-[#007E7A] accent-[#007E7A]"
                    />
                    <span>{opsi.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Kolom Kanan: Daftar Kartu Faskes (lg:col-span-9) */}
        <div className="lg:col-span-9 space-y-5">
          {/* Info Jumlah Hasil Ditemukan */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan{" "}
              <strong className="text-slate-900 font-extrabold">
                {daftar_faskes_tersaring.length}
              </strong>{" "}
              fasilitas kesehatan
            </span>
          </div>

          {daftar_faskes_tersaring.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">
                Fasilitas kesehatan tidak ditemukan
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba sesuaikan kata kunci pencarian atau ubah kombinasi filter
                wilayah, jenis faskes, dan poliklinik.
              </p>
              <button
                type="button"
                onClick={reset_semua_filter}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007E7A] text-white text-xs font-bold shadow-sm hover:bg-[#006663] transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {daftar_faskes_tersaring.map((faskes_item) => (
                <div
                  key={faskes_item.id_faskes}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-2.5">
                    {/* Baris Kategori & Jarak */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#007E7A] block">
                          {faskes_item.kategori_faskes}
                        </span>
                        <Link
                          href={`/faskes/${faskes_item.slug_faskes}`}
                          className="text-sm sm:text-base font-extrabold text-slate-900 hover:text-[#007E7A] transition mt-0.5 block line-clamp-1"
                        >
                          {faskes_item.nama_faskes}
                        </Link>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#D9F2F0] text-[#007E7A] text-[10px] font-extrabold shrink-0">
                        {faskes_item.jarak_km}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {faskes_item.alamat_lengkap}
                    </p>

                    {/* Rating & Status */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-extrabold text-slate-900">
                          {faskes_item.rating_faskes}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {faskes_item.status_bpjs && (
                          <span className="px-1.5 py-[1px] rounded bg-emerald-50 text-emerald-700 text-[8px] font-bold border border-emerald-200">
                            BPJS
                          </span>
                        )}
                        {faskes_item.status_igd_24jam && (
                          <span className="px-1.5 py-[1px] rounded bg-rose-50 text-rose-700 text-[8px] font-bold border border-rose-200">
                            UGD 24 Jam
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badge Poli di Kartu Cari Faskes */}
                    <div className="pt-0.5">
                      <DaftarBadgePoli
                        daftar_poli={faskes_item.daftar_poli}
                        maksimal_tampil={3}
                        ukuran_badge="mikro"
                      />
                    </div>
                  </div>

                  {/* Tombol Aksi: Lihat Detail + Kotak Persegi Petunjuk Arah di Kanan (Proporsional & Pas) */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Link
                      href={`/faskes/${faskes_item.slug_faskes}`}
                      className="flex-1 h-[38px] rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold flex items-center justify-center transition shadow-xs"
                    >
                      Lihat Detail
                    </Link>
                    <Link
                      href="/peta"
                      className="w-[38px] h-[38px] rounded-xl border border-slate-200/90 hover:border-[#007E7A] hover:bg-teal-50/50 text-[#007E7A] flex items-center justify-center transition shrink-0"
                      title="Petunjuk Arah di Peta"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bar Paginasi */}
          <div className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">
              Halaman <strong className="text-slate-900">1</strong> dari{" "}
              {Math.max(1, Math.ceil(daftar_faskes_tersaring.length / 6))}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="px-2.5 py-1 text-slate-400 flex items-center gap-1 cursor-default"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                className="w-6 h-6 rounded bg-[#007E7A] text-white font-bold text-[11px]"
              >
                1
              </button>

              <button
                type="button"
                className="px-2.5 py-1 text-[#007E7A] font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
