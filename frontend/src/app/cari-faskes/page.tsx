"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  AlertCircle,
  X,
} from "lucide-react";
import type { DataFaskesItem } from "@/data/data_faskes";
import { FaskesThumbnail } from "@/components/ui/faskes_thumbnail";
import DropdownPencarian from "@/components/ui/dropdown_pencarian";
import {
  api,
  ApiFasilitas,
  ApiSpesialisasi,
  mapApiFaskesToItem,
  ApiPaginationMeta,
  messageFromError,
} from "@/lib/api";
import { useFaskes } from "@/context/FaskesContext";

function labelPoli(nama: string): string {
  const rapi = nama
    .toLowerCase()
    .split(" ")
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(" ");
  return `Poli ${rapi}`;
}

const ALIAS_POLI: Record<string, string> = {
  "Poli Jantung": "JANTUNG DAN PEMBULUH DARAH",
  "Poli Kandungan": "OBSTETRI DAN GINEKOLOGI",
  "Poli THT": "TELINGA HIDUNG TENGGOROK- BEDAH KEPALA LEHER (THT-KL)",
};

function cocokPoli(namaSpesialisasi: string, filter: string): boolean {
  return (
    labelPoli(namaSpesialisasi) === filter ||
    namaSpesialisasi === ALIAS_POLI[filter]
  );
}

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
  "Klinik",
  "Apotek",
];

function CariFaskesKonten() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wadahKartuRef = useRef<HTMLDivElement | null>(null);
  const cariDariUrl = searchParams.get("search") || searchParams.get("q") || "";
  const poliDariUrl = searchParams.get("poli");
  const fasilitasDariUrl = searchParams.get("fasilitas");
  const kategoriDariUrl = searchParams.get("kategori") || searchParams.get("jenis") || "";

  const { lokasiPengguna } = useFaskes();

  const [kata_kunci_pencarian, set_kata_kunci_pencarian] = useState(cariDariUrl);
  const [filter_wilayah, set_filter_wilayah] = useState("ALL");
  const [filter_kecamatan, set_filter_kecamatan] = useState("ALL");
  const [filter_kategori, set_filter_kategori] = useState(kategoriDariUrl || "ALL");
  const [filter_poli_aktif, set_filter_poli_aktif] = useState(poliDariUrl || "ALL");
  const [filter_fasilitas_aktif, set_filter_fasilitas_aktif] = useState(
    fasilitasDariUrl || "ALL"
  );
  const [filter_bpjs, set_filter_bpjs] = useState("ALL");
  const [filter_igd, set_filter_igd] = useState("ALL");
  const [bukaFilterMobile, setBukaFilterMobile] = useState(false);

  const [daftarFaskes, setDaftarFaskes] = useState<DataFaskesItem[]>([]);
  const [daftarPoli, setDaftarPoli] = useState<ApiSpesialisasi[]>([]);
  const [daftarFasilitas, setDaftarFasilitas] = useState<ApiFasilitas[]>([]);
  const [metaPaginasi, setMetaPaginasi] = useState<ApiPaginationMeta | null>(null);
  const [halamanAktif, setHalamanAktif] = useState(1);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanKesalahan, setPesanKesalahan] = useState<string | null>(null);

  // Sinkronkan filter jika URL query berubah
  useEffect(() => {
    if (kategoriDariUrl) {
      set_filter_kategori(kategoriDariUrl);
    }
  }, [kategoriDariUrl]);

  useEffect(() => {
    if (cariDariUrl !== kata_kunci_pencarian) {
      set_kata_kunci_pencarian(cariDariUrl);
    }
  }, [cariDariUrl]);

  useEffect(() => {
    if (poliDariUrl) {
      set_filter_poli_aktif(poliDariUrl);
    }
  }, [poliDariUrl]);

  useEffect(() => {
    if (fasilitasDariUrl) {
      set_filter_fasilitas_aktif(fasilitasDariUrl);
    }
  }, [fasilitasDariUrl]);

  // Gulir ke atas kontainer kartu saat berganti halaman
  useEffect(() => {
    if (wadahKartuRef.current) {
      wadahKartuRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [halamanAktif]);

  // Reset semua filter
  const reset_semua_filter = () => {
    set_kata_kunci_pencarian("");
    set_filter_wilayah("ALL");
    set_filter_kecamatan("ALL");
    set_filter_kategori("ALL");
    set_filter_poli_aktif("ALL");
    set_filter_fasilitas_aktif("ALL");
    set_filter_bpjs("ALL");
    set_filter_igd("ALL");
    setHalamanAktif(1);
    router.replace("/cari-faskes");
  };

  const ada_filter_aktif =
    kata_kunci_pencarian !== "" ||
    filter_wilayah !== "ALL" ||
    filter_kecamatan !== "ALL" ||
    filter_kategori !== "ALL" ||
    filter_poli_aktif !== "ALL" ||
    filter_fasilitas_aktif !== "ALL" ||
    filter_bpjs !== "ALL" ||
    filter_igd !== "ALL";

  const opsiFasilitas = useMemo(() => {
    const nameCounts = new Map<string, number>();
    daftarFasilitas.forEach((item) => {
      nameCounts.set(
        item.nama_fasilitas,
        (nameCounts.get(item.nama_fasilitas) ?? 0) + 1
      );
    });

    return daftarFasilitas.map((item) => ({
      value: String(item.id_fasilitas),
      label:
        (nameCounts.get(item.nama_fasilitas) ?? 0) > 1
          ? `${item.nama_fasilitas} (#${item.id_fasilitas})`
          : item.nama_fasilitas,
    }));
  }, [daftarFasilitas]);

  const muatDataFaskes = useCallback(async () => {
    setSedangMemuat(true);
    setPesanKesalahan(null);

    const bpjsParam =
      filter_bpjs === "BPJS_YA" ? 1 : filter_bpjs === "BPJS_TIDAK" ? 0 : undefined;

    const kotaParam =
      filter_wilayah === "KOTA_BOGOR"
        ? "KOTA BOGOR"
        : filter_wilayah === "KABUPATEN_BOGOR"
        ? "KAB. BOGOR"
        : undefined;
    const poliTerpilih = daftarPoli.find((item) =>
      cocokPoli(item.nama_spesialisasi, filter_poli_aktif)
    );

    const jenisParam =
      filter_kategori !== "ALL"
        ? filter_kategori
        : filter_igd === "IGD_YA"
        ? "Rumah Sakit"
        : undefined;

    const idFasilitasNum =
      filter_fasilitas_aktif !== "ALL" ? Number(filter_fasilitas_aktif) : NaN;

    try {
      const res = await api.getFaskes({
        search: kata_kunci_pencarian.trim() || undefined,
        kota_kabupaten: kotaParam,
        kecamatan: filter_kecamatan !== "ALL" ? filter_kecamatan : undefined,
        jenis_faskes: jenisParam,
        id_spesialisasi: poliTerpilih?.id_spesialisasi,
        id_fasilitas: !Number.isNaN(idFasilitasNum) ? idFasilitasNum : undefined,
        is_support_bpjs: bpjsParam,
        latitude: lokasiPengguna?.latitude,
        longitude: lokasiPengguna?.longitude,
        page: halamanAktif,
        per_page: 12,
      });

      setDaftarFaskes((res.data || []).map((f, i) => mapApiFaskesToItem(f, i)));
      setMetaPaginasi(res.meta || null);
    } catch (err) {
      setDaftarFaskes([]);
      setMetaPaginasi(null);
      setPesanKesalahan(
        messageFromError(err, "Gagal memuat direktori faskes dari server.")
      );
    } finally {
      setSedangMemuat(false);
    }
  }, [
    kata_kunci_pencarian,
    filter_wilayah,
    filter_kecamatan,
    filter_kategori,
    filter_poli_aktif,
    filter_fasilitas_aktif,
    filter_bpjs,
    filter_igd,
    halamanAktif,
    daftarPoli,
    lokasiPengguna.latitude,
    lokasiPengguna.longitude,
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

  useEffect(() => {
    let aktif = true;

    Promise.all([
      api.getAllSpesialisasi().catch(() => []),
      api.getAllFasilitas().catch(() => []),
    ]).then(([poliItems, fasilitasItems]) => {
      if (!aktif) return;
      setDaftarPoli(poliItems);
      setDaftarFasilitas(fasilitasItems);
    });

    return () => {
      aktif = false;
    };
  }, []);

  useEffect(() => {
    setHalamanAktif(1);
  }, [
    filter_wilayah,
    filter_kecamatan,
    filter_kategori,
    filter_poli_aktif,
    filter_fasilitas_aktif,
    filter_bpjs,
    filter_igd,
  ]);

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q");
    if (q !== null) {
      set_kata_kunci_pencarian(q);
    }
  }, [searchParams]);

  useEffect(() => {
    if (filter_poli_aktif === "ALL" || daftarPoli.length === 0) return;
    const valid = daftarPoli.some((item) =>
      cocokPoli(item.nama_spesialisasi, filter_poli_aktif)
    );
    if (!valid) set_filter_poli_aktif("ALL");
  }, [daftarPoli, filter_poli_aktif]);

  useEffect(() => {
    if (filter_fasilitas_aktif === "ALL" || daftarFasilitas.length === 0) return;
    const valid = daftarFasilitas.some(
      (item) => String(item.id_fasilitas) === filter_fasilitas_aktif
    );
    if (!valid) set_filter_fasilitas_aktif("ALL");
  }, [daftarFasilitas, filter_fasilitas_aktif]);

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

      {/* Kotak Pencarian Cepat & Tombol Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={kata_kunci_pencarian}
              onChange={(e) => set_kata_kunci_pencarian(e.target.value)}
              placeholder="Cari nama faskes, alamat, atau poli..."
              className="w-full h-11 pl-11 pr-9 rounded-xl bg-[#F4F6F8] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A] transition"
            />
            {kata_kunci_pencarian && (
              <button
                type="button"
                onClick={() => set_kata_kunci_pencarian("")}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-0.5"
                title="Hapus kata kunci"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tombol Filter di sebelah input pencarian */}
          <button
            type="button"
            onClick={() => setBukaFilterMobile((prev) => !prev)}
            className={`h-11 px-3 sm:px-4 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
              bukaFilterMobile || ada_filter_aktif
                ? "bg-[#007E7A] text-white border-[#007E7A] shadow-xs"
                : "bg-[#F4F6F8] text-slate-700 border-slate-200 hover:bg-slate-200/80"
            }`}
            title={bukaFilterMobile ? "Sembunyikan Filter" : "Buka Filter"}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {ada_filter_aktif && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Grid Utama: Filter + Daftar Faskes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Sidebar Filter (Dapat dibuka/tutup di mobile & scrollable) */}
        <aside
          className={`lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-4 lg:sticky lg:top-[92px] max-h-[75vh] lg:max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar ${
            bukaFilterMobile ? "block" : "hidden lg:block"
          }`}
        >
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
            daftar_pilihan={daftarPoli.map((item) =>
              labelPoli(item.nama_spesialisasi)
            )}
            nilai_terpilih={filter_poli_aktif}
            saat_memilih={(nilai) => set_filter_poli_aktif(nilai)}
            placeholder_pencarian="Cari poliklinik..."
            teks_default="Semua Poliklinik"
          />

          {/* Filter Fasilitas Penunjang */}
          <DropdownPencarian
            label="Fasilitas Penunjang"
            daftar_pilihan={opsiFasilitas}
            nilai_terpilih={filter_fasilitas_aktif}
            saat_memilih={(nilai) => set_filter_fasilitas_aktif(nilai)}
            placeholder_pencarian="Cari sarana & fasilitas..."
            teks_default="Semua Fasilitas Penunjang"
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

        {/* Kolom Kanan: Hasil Pencarian (Scrollable mandiri) */}
        <div
          ref={wadahKartuRef}
          className="lg:col-span-9 space-y-5 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 custom-scrollbar"
        >
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

          {pesanKesalahan && !sedangMemuat && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{pesanKesalahan}</span>
            </div>
          )}

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
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div>
                    <Link
                      href={`/faskes/${faskes_item.slug_faskes}`}
                      className="group block relative h-[160px] bg-slate-100 overflow-hidden"
                    >
                      <FaskesThumbnail
                        gambar_faskes={faskes_item.gambar_faskes}
                        nama_faskes={faskes_item.nama_faskes}
                        kategori_faskes={faskes_item.kategori_faskes}
                        className="w-full h-full"
                      />
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[#007E7A] text-[10px] font-extrabold shadow-xs">
                        {faskes_item.jarak_km}
                      </span>
                    </Link>

                    <div className="p-4 sm:p-5 pb-3 space-y-2.5">
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

                      <p className="text-xs text-slate-500 line-clamp-1">
                        {faskes_item.alamat_lengkap}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star
                            className={`w-3.5 h-3.5 ${
                              faskes_item.jumlah_ulasan > 0
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                          <span
                            className={
                              faskes_item.jumlah_ulasan > 0
                                ? "text-xs font-extrabold text-slate-900"
                                : "text-[11px] font-semibold text-slate-500"
                            }
                          >
                            {faskes_item.jumlah_ulasan > 0
                              ? faskes_item.rating_faskes
                              : "Belum Dirating"}
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
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 flex items-center gap-1.5">
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
