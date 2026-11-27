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
import FaskesCard from "@/components/faskes/FaskesCard";
import PaginasiNavigasi from "@/components/ui/PaginasiNavigasi";
import EmptyState from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui";
import {
  api,
  ApiFasilitas,
  ApiSpesialisasi,
  mapApiFaskesToItem,
  ApiPaginationMeta,
  messageFromError,
} from "@/lib/api";
import { useFaskes } from "@/context/FaskesContext";

const POLI_ID_MAP: Record<string, string> = {
  "Poli Umum": "UMU",
  "Poli Gigi": "GIG",
  "Poli Anak": "ANA",
  "Poli Jantung": "JAN",
  "Poli Penyakit Dalam": "INT",
  "Poli Kandungan": "OBG",
  "Poli Bedah": "BED",
  "Poli Mata": "MAT",
  "Poli THT": "THT",
  "Poli Saraf": "SAR",
  "UMUM": "UMU",
  "GIGI": "GIG",
  "ANAK": "ANA",
  "JANTUNG DAN PEMBULUH DARAH": "JAN",
  "PENYAKIT DALAM": "INT",
  "OBSTETRI DAN GINEKOLOGI": "OBG",
  "BEDAH": "BED",
  "MATA": "MAT",
  "TELINGA HIDUNG TENGGOROK- BEDAH KEPALA LEHER (THT-KL)": "THT",
  "SARAF": "SAR",
};

const ALIAS_LABEL_POLI: Record<string, string> = {
  "JANTUNG DAN PEMBULUH DARAH": "Poli Jantung",
  "OBSTETRI DAN GINEKOLOGI": "Poli Kandungan",
  "TELINGA HIDUNG TENGGOROK- BEDAH KEPALA LEHER (THT-KL)": "Poli THT",
  "PENYAKIT DALAM": "Poli Penyakit Dalam",
  "ANAK": "Poli Anak",
  "UMUM": "Poli Umum",
  "GIGI": "Poli Gigi",
  "BEDAH": "Poli Bedah",
  "MATA": "Poli Mata",
  "SARAF": "Poli Saraf",
};

function labelPoli(nama: string): string {
  const upper = nama.toUpperCase().trim();
  if (ALIAS_LABEL_POLI[upper]) {
    return ALIAS_LABEL_POLI[upper];
  }
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
  "Poli Umum": "UMUM",
  "Poli Gigi": "GIGI",
  "Poli Anak": "ANAK",
  "Poli Penyakit Dalam": "PENYAKIT DALAM",
  "Poli Bedah": "BEDAH",
  "Poli Mata": "MATA",
  "Poli Saraf": "SARAF",
};

function cocokPoli(namaSpesialisasi: string, filter: string): boolean {
  if (!filter || filter === "ALL") return false;
  if (labelPoli(namaSpesialisasi).toLowerCase() === filter.toLowerCase()) return true;
  if (namaSpesialisasi.toLowerCase() === filter.toLowerCase()) return true;
  if (ALIAS_POLI[filter] && namaSpesialisasi.toUpperCase() === ALIAS_POLI[filter]) return true;
  if (POLI_ID_MAP[filter] && POLI_ID_MAP[namaSpesialisasi] === POLI_ID_MAP[filter]) return true;
  return false;
}

const KECAMATAN_KOTA_BOGOR = [
  "Bogor Barat",
  "Bogor Selatan",
  "Bogor Tengah",
  "Bogor Timur",
  "Bogor Utara",
  "Tanah Sareal",
];

const KECAMATAN_KABUPATEN_BOGOR = [
  "Babakan Madang",
  "Bojonggede",
  "Caringin",
  "Cariu",
  "Ciampea",
  "Ciawi",
  "Cibinong",
  "Cibungbulang",
  "Cigombong",
  "Cigudeg",
  "Cijeruk",
  "Cileungsi",
  "Ciomas",
  "Cisarua",
  "Ciseeng",
  "Citeureup",
  "Dramaga",
  "Gunung Putri",
  "Gunung Sindur",
  "Jasinga",
  "Jonggol",
  "Kemang",
  "Klapanunggal",
  "Leuwiliang",
  "Leuwisadeng",
  "Megamendung",
  "Nanggung",
  "Pamijahan",
  "Parung",
  "Parung Panjang",
  "Rancabungur",
  "Rumpin",
  "Sukajaya",
  "Sukamakmur",
  "Sukaraja",
  "Tajurhalang",
  "Tamansari",
  "Tanjungsari",
  "Tenjo",
  "Tenjolaya",
];

// Seluruh kecamatan (Kota + Kabupaten Bogor) terurut alfabetis
const daftar_pilihan_kecamatan = [
  ...KECAMATAN_KOTA_BOGOR,
  ...KECAMATAN_KABUPATEN_BOGOR,
].sort((a, b) => a.localeCompare(b, "id"));

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
  const reqIdRef = useRef(0);
  const cariDariUrl = searchParams.get("search") || searchParams.get("q") || "";
  const poliDariUrl = searchParams.get("poli");
  const fasilitasDariUrl = searchParams.get("fasilitas");
  const kategoriDariUrl = searchParams.get("kategori") || searchParams.get("jenis") || "";

  const { lokasiPengguna } = useFaskes();

  const [kata_kunci_pencarian, set_kata_kunci_pencarian] = useState(cariDariUrl);
  const [kataKunciDebounce, setKataKunciDebounce] = useState(cariDariUrl);
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
      setKataKunciDebounce(cariDariUrl);
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

  // Debounce kata kunci pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      setKataKunciDebounce(kata_kunci_pencarian);
      setHalamanAktif(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [kata_kunci_pencarian]);

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

  const pilihanKecamatanTersedia = useMemo(() => {
    if (filter_wilayah === "KOTA_BOGOR") return KECAMATAN_KOTA_BOGOR;
    if (filter_wilayah === "KABUPATEN_BOGOR") return KECAMATAN_KABUPATEN_BOGOR;
    return daftar_pilihan_kecamatan;
  }, [filter_wilayah]);

  // Reset kecamatan jika tidak termasuk dalam wilayah yang baru dipilih
  useEffect(() => {
    if (
      filter_kecamatan !== "ALL" &&
      !pilihanKecamatanTersedia.includes(filter_kecamatan)
    ) {
      set_filter_kecamatan("ALL");
    }
  }, [pilihanKecamatanTersedia, filter_kecamatan]);

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
    const idSpesialisasi =
      filter_poli_aktif !== "ALL"
        ? POLI_ID_MAP[filter_poli_aktif] ||
        daftarPoli.find((item) =>
          cocokPoli(item.nama_spesialisasi, filter_poli_aktif)
        )?.id_spesialisasi ||
        undefined
        : undefined;

    if (
      filter_poli_aktif !== "ALL" &&
      !idSpesialisasi &&
      daftarPoli.length === 0
    ) {
      return;
    }

    const currentReqId = ++reqIdRef.current;
    setSedangMemuat(true);
    setPesanKesalahan(null);

    const bpjsParam =
      filter_bpjs === "BPJS_MENDUKUNG"
        ? "mendukung"
        : filter_bpjs === "BPJS_PROSES"
          ? "dalam_proses"
          : filter_bpjs === "BPJS_TIDAK"
            ? "tidak_mendukung"
            : undefined;

    const kotaParam =
      filter_wilayah === "KOTA_BOGOR"
        ? "KOTA BOGOR"
        : filter_wilayah === "KABUPATEN_BOGOR"
          ? "KAB. BOGOR"
          : undefined;

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
        search: kataKunciDebounce.trim() || undefined,
        kota_kabupaten: kotaParam,
        kecamatan: filter_kecamatan !== "ALL" ? filter_kecamatan : undefined,
        jenis_faskes: jenisParam,
        id_spesialisasi: idSpesialisasi,
        id_fasilitas: !Number.isNaN(idFasilitasNum) ? idFasilitasNum : undefined,
        bpjs_status: bpjsParam,
        latitude: lokasiPengguna?.latitude,
        longitude: lokasiPengguna?.longitude,
        page: halamanAktif,
        per_page: 12,
      });

      if (currentReqId !== reqIdRef.current) return;

      setDaftarFaskes((res.data || []).map((f, i) => mapApiFaskesToItem(f, i)));
      setMetaPaginasi(res.meta || null);
    } catch (err) {
      if (currentReqId !== reqIdRef.current) return;
      setDaftarFaskes([]);
      setMetaPaginasi(null);
      setPesanKesalahan(
        messageFromError(err, "Gagal memuat direktori faskes dari server.")
      );
    } finally {
      if (currentReqId === reqIdRef.current) {
        setSedangMemuat(false);
      }
    }
  }, [
    kataKunciDebounce,
    filter_wilayah,
    filter_kecamatan,
    filter_kategori,
    filter_poli_aktif,
    filter_fasilitas_aktif,
    filter_bpjs,
    filter_igd,
    halamanAktif,
    daftarPoli,
    lokasiPengguna?.latitude,
    lokasiPengguna?.longitude,
  ]);

  useEffect(() => {
    muatDataFaskes();
  }, [muatDataFaskes]);

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
    if (filter_poli_aktif === "ALL" || daftarPoli.length === 0) return;
    if (POLI_ID_MAP[filter_poli_aktif]) return;
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
          <SearchInput
            value={kata_kunci_pencarian}
            onChange={set_kata_kunci_pencarian}
            placeholder="Cari nama faskes, alamat, atau poli..."
          />

          {/* Tombol Filter di sebelah input pencarian (Hanya di Mobile/Tablet, disembunyikan di Desktop) */}
          <button
            type="button"
            onClick={() => setBukaFilterMobile((prev) => !prev)}
            className={`h-11 px-3 sm:px-4 rounded-xl border flex lg:hidden items-center gap-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${bukaFilterMobile || ada_filter_aktif
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
          className={`lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-4 lg:sticky lg:top-[92px] max-h-[75vh] lg:max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar ${bukaFilterMobile ? "block" : "hidden lg:block"
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
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition select-none ${terpilih
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
            daftar_pilihan={pilihanKecamatanTersedia}
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
            daftar_pilihan={
              daftarPoli.length > 0
                ? Array.from(
                  new Set(
                    daftarPoli.map((item) =>
                      labelPoli(item.nama_spesialisasi)
                    )
                  )
                )
                : [
                  "Poli Umum",
                  "Poli Gigi",
                  "Poli Anak",
                  "Poli Jantung",
                  "Poli Penyakit Dalam",
                  "Poli Kandungan",
                  "Poli Bedah",
                  "Poli Mata",
                  "Poli THT",
                  "Poli Saraf",
                ]
            }
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
                { nilai: "BPJS_MENDUKUNG", label: "Bekerja Sama BPJS" },
                { nilai: "BPJS_PROSES", label: "Dalam Proses Kerja Sama" },
                { nilai: "BPJS_TIDAK", label: "Belum Bekerja Sama" },
              ].map((opsi) => {
                const terpilih = filter_bpjs === opsi.nilai;
                return (
                  <label
                    key={opsi.nilai}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition select-none ${terpilih
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
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition select-none ${terpilih
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
            <EmptyState
              icon={Building2}
              judul="Fasilitas kesehatan tidak ditemukan"
              deskripsi="Coba sesuaikan kata kunci pencarian atau ubah kombinasi filter wilayah, jenis faskes, dan poliklinik."
              aksiLabel="Reset Filter"
              onAksi={reset_semua_filter}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {daftarFaskes.map((faskes_item, indeks) => (
                <FaskesCard
                  key={faskes_item.id_faskes}
                  faskes={faskes_item}
                  variant="grid"
                  prioritas={indeks === 0}
                />
              ))}
            </div>
          )}

          {/* Bar Paginasi */}
          <PaginasiNavigasi
            meta={metaPaginasi}
            halamanAktif={halamanAktif}
            saatGantiHalaman={setHalamanAktif}
          />
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
