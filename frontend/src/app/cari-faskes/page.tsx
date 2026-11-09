"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Search,
  SlidersHorizontal,
  Star,
  RotateCcw,
  Building2,
  Navigation,
  Loader2,
} from "lucide-react";
import {
  daftar_faskes_utama,
  daftar_semua_poli,
  DataFaskesItem,
} from "@/data/data_faskes";
import { DaftarBadgePoli } from "@/components/ui/badge_poli";
import DropdownPencarian from "@/components/ui/dropdown_pencarian";
import { api, mapApiFaskesToItem, ApiPaginationMeta } from "@/lib/api";

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
  "Cijeruk",
  "Ciampea",
  "Citeureup",
  "Parung",
];

const daftar_pilihan_kategori = [
  "Rumah Sakit",
  "Puskesmas",
  "Klinik Pratama",
  "Klinik Utama",
];

function CariFaskesKonten() {
  const searchParams = useSearchParams();
  const poliDariUrl = searchParams.get("poli");

  const [kata_kunci_pencarian, set_kata_kunci_pencarian] = useState("");
  const [filter_wilayah, set_filter_wilayah] = useState("ALL");
  const [filter_kecamatan, set_filter_kecamatan] = useState("ALL");
  const [filter_kategori, set_filter_kategori] = useState("ALL");
  const [filter_poli_aktif, set_filter_poli_aktif] = useState(poliDariUrl || "ALL");
  const [filter_bpjs, set_filter_bpjs] = useState("ALL");
  const [filter_igd, set_filter_igd] = useState("ALL");

  const [daftarFaskes, setDaftarFaskes] = useState<DataFaskesItem[]>([]);
  const [metaPaginasi, setMetaPaginasi] = useState<ApiPaginationMeta | null>(null);
  const [halamanAktif, setHalamanAktif] = useState(1);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  // Reset semua filter
  const reset_semua_filter = () => {
    set_kata_kunci_pencarian("");
    set_filter_wilayah("ALL");
    set_filter_kecamatan("ALL");
    set_filter_kategori("ALL");
    set_filter_poli_aktif("ALL");
    set_filter_bpjs("ALL");
    set_filter_igd("ALL");
    setHalamanAktif(1);
  };

  const ada_filter_aktif =
    kata_kunci_pencarian !== "" ||
    filter_wilayah !== "ALL" ||
    filter_kecamatan !== "ALL" ||
    filter_kategori !== "ALL" ||
    filter_poli_aktif !== "ALL" ||
    filter_bpjs !== "ALL" ||
    filter_igd !== "ALL";

  const muatDataFaskes = useCallback(async () => {
    setSedangMemuat(true);

    const bpjsParam =
      filter_bpjs === "BPJS_YA" ? 1 : filter_bpjs === "BPJS_TIDAK" ? 0 : undefined;

    const kotaParam =
      filter_wilayah === "KOTA_BOGOR"
        ? "KOTA BOGOR"
        : filter_wilayah === "KABUPATEN_BOGOR"
        ? "KAB. BOGOR"
        : undefined;

    try {
      const res = await api.getFaskes({
        search: kata_kunci_pencarian.trim() || undefined,
        kota_kabupaten: kotaParam,
        kecamatan: filter_kecamatan !== "ALL" ? filter_kecamatan : undefined,
        jenis_faskes: filter_kategori !== "ALL" ? filter_kategori : undefined,
        is_support_bpjs: bpjsParam,
        page: halamanAktif,
        per_page: 12,
      });

      if (res && res.data && res.data.length > 0) {
        let mapped = res.data.map((f, i) => mapApiFaskesToItem(f, i));

        // Client-side filtering for poli and igd if requested
        if (filter_poli_aktif !== "ALL") {
          mapped = mapped.filter((f) =>
            f.daftar_poli.some((p) =>
              p.toLowerCase().includes(filter_poli_aktif.toLowerCase())
            )
          );
        }
        if (filter_igd === "IGD_YA") {
          mapped = mapped.filter((f) => f.status_igd_24jam);
        }

        setDaftarFaskes(mapped);
        setMetaPaginasi(res.meta || null);
      } else {
        setDaftarFaskes([]);
        setMetaPaginasi(null);
      }
    } catch {
      // Fallback ke data_faskes static jika backend belum aktif
      const filtered = daftar_faskes_utama.filter((item) => {
        const q = kata_kunci_pencarian.trim().toLowerCase();
        const cocokNama =
          !q ||
          item.nama_faskes.toLowerCase().includes(q) ||
          item.alamat_lengkap.toLowerCase().includes(q);
        const cocokWilayah =
          filter_wilayah === "ALL" || item.wilayah_kota_kab === filter_wilayah;
        const cocokKec =
          filter_kecamatan === "ALL" ||
          item.kecamatan.toLowerCase() === filter_kecamatan.toLowerCase();
        const cocokKat =
          filter_kategori === "ALL" ||
          item.kategori_faskes.toLowerCase().includes(filter_kategori.toLowerCase());
        const cocokPoli =
          filter_poli_aktif === "ALL" ||
          item.daftar_poli.includes(filter_poli_aktif);
        const cocokBpjs =
          filter_bpjs === "ALL" ||
          (filter_bpjs === "BPJS_YA" && item.status_bpjs) ||
          (filter_bpjs === "BPJS_TIDAK" && !item.status_bpjs);
        const cocokIgd = filter_igd === "ALL" || item.status_igd_24jam;

        return (
          cocokNama &&
          cocokWilayah &&
          cocokKec &&
          cocokKat &&
          cocokPoli &&
          cocokBpjs &&
          cocokIgd
        );
      });
      setDaftarFaskes(filtered);
      setMetaPaginasi(null);
    } finally {
      setSedangMemuat(false);
    }
  }, [
    kata_kunci_pencarian,
    filter_wilayah,
    filter_kecamatan,
    filter_kategori,
    filter_poli_aktif,
    filter_bpjs,
    filter_igd,
    halamanAktif,
  ]);

  useEffect(() => {
    muatDataFaskes();
  }, [muatDataFaskes]);

  // Debounce kata kunci
  useEffect(() => {
    const timer = setTimeout(() => {
      setHalamanAktif(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [kata_kunci_pencarian]);

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

      {/* Grid Utama: Filter + Daftar Faskes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Sidebar Filter */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-4">
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

          {/* Filter Wilayah */}
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

          {/* Filter Kecamatan */}
          <DropdownPencarian
            label="Kecamatan"
            daftar_pilihan={daftar_pilihan_kecamatan}
            nilai_terpilih={filter_kecamatan}
            saat_memilih={(nilai) => set_filter_kecamatan(nilai)}
            placeholder_pencarian="Cari kecamatan..."
            teks_default="Semua Kecamatan"
          />

          {/* Filter Jenis Faskes */}
          <DropdownPencarian
            label="Jenis Faskes"
            daftar_pilihan={daftar_pilihan_kategori}
            nilai_terpilih={filter_kategori}
            saat_memilih={(nilai) => set_filter_kategori(nilai)}
            placeholder_pencarian="Cari jenis faskes..."
            teks_default="Semua Jenis Faskes"
          />

          {/* Filter Layanan Poli */}
          <DropdownPencarian
            label="Layanan Poliklinik"
            daftar_pilihan={daftar_semua_poli}
            nilai_terpilih={filter_poli_aktif}
            saat_memilih={(nilai) => set_filter_poli_aktif(nilai)}
            placeholder_pencarian="Cari poliklinik..."
            teks_default="Semua Poliklinik"
          />

          {/* Filter BPJS */}
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

          {/* Filter UGD 24 Jam */}
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

        {/* Kolom Kanan: Hasil Pencarian */}
        <div className="lg:col-span-9 space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan{" "}
              <strong className="text-slate-900 font-extrabold">
                {daftarFaskes.length}
              </strong>{" "}
              fasilitas kesehatan {metaPaginasi ? `dari total ${metaPaginasi.total}` : ""}
            </span>
            {sedangMemuat && (
              <span className="flex items-center gap-1.5 text-[#007E7A]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memuat data...</span>
              </span>
            )}
          </div>

          {sedangMemuat ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#007E7A]" />
              <p className="text-xs text-slate-500">Memuat direktori faskes...</p>
            </div>
          ) : daftarFaskes.length === 0 ? (
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
              {daftarFaskes.map((faskes_item) => (
                <div
                  key={faskes_item.id_faskes}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-2.5">
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

                    <div className="pt-0.5">
                      <DaftarBadgePoli
                        daftar_poli={faskes_item.daftar_poli}
                        maksimal_tampil={3}
                        ukuran_badge="mikro"
                      />
                    </div>
                  </div>

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
          {metaPaginasi && metaPaginasi.last_page > 1 && (
            <div className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">
                Halaman <strong className="text-slate-900">{metaPaginasi.current_page}</strong> dari{" "}
                <strong className="text-slate-900">{metaPaginasi.last_page}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={halamanAktif <= 1}
                  onClick={() => setHalamanAktif((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 flex items-center gap-1 disabled:opacity-40 disabled:hover:text-slate-600"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <span className="w-7 h-7 rounded bg-[#007E7A] text-white font-bold text-[11px] flex items-center justify-center">
                  {metaPaginasi.current_page}
                </span>

                <button
                  type="button"
                  disabled={halamanAktif >= metaPaginasi.last_page}
                  onClick={() => setHalamanAktif((p) => Math.min(metaPaginasi.last_page, p + 1))}
                  className="px-2.5 py-1 text-[#007E7A] font-semibold flex items-center gap-1 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CariFaskesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Memuat halaman pencarian...
        </div>
      }
    >
      <CariFaskesKonten />
    </Suspense>
  );
}
