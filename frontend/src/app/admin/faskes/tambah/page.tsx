"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Camera,
  Download,
  AlertCircle,
  Loader2,
  X,
  Crosshair,
} from "lucide-react";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { api } from "@/lib/api";
import type LType from "leaflet";

const DAFTAR_KECAMATAN = [
  "Tanah Sareal",
  "Bogor Tengah",
  "Bogor Timur",
  "Bogor Barat",
  "Bogor Selatan",
  "Bogor Utara",
  "Cibinong",
  "Ciawi",
  "Gunung Putri",
  "Citeureup",
  "Cileungsi",
  "Bojonggede",
  "Ciampea",
  "Dramaga",
];

const DAFTAR_TIPE_KELAS = [
  "Tipe C (Umum)",
  "Tipe A (Umum)",
  "Tipe B (Umum)",
  "Tipe D (Umum)",
  "Klinik Pratama",
  "Klinik Utama",
  "Puskesmas Non-DTP",
  "Puskesmas DTP",
  "Laboratorium Medis",
];

const DAFTAR_KATEGORI_JENIS = [
  "Rumah Sakit Umum (RSU)",
  "Rumah Sakit Khusus (RSK)",
  "Puskesmas",
  "Klinik Pratama",
  "Klinik Utama",
  "Apotek / Farmasi",
  "Laboratorium Medis",
];

const DAFTAR_STATUS_KEPEMILIKAN = [
  "Swasta / Korporasi Kesehatan",
  "Pemerintah Daerah (Pemda)",
  "Kementerian Kesehatan (Kemenkes)",
  "BUMN / Militer / Kepolisian",
  "Organisasi Sosial / Yayasan",
];

export default function TambahFaskesBaruPage() {
  const router = useRouter();

  // Section 1: Identitas & Kategori
  const [kodeFaskes, setKodeFaskes] = useState("3271045");
  const [tipeKelas, setTipeKelas] = useState("Tipe C (Umum)");
  const [namaFaskes, setNamaFaskes] = useState("RS Hermina Bogor");
  const [kategoriJenis, setKategoriJenis] = useState("Rumah Sakit Umum (RSU)");
  const [statusKepemilikan, setStatusKepemilikan] = useState(
    "Swasta / Korporasi Kesehatan"
  );

  // Section 2: Lokasi
  const [kecamatan, setKecamatan] = useState("Tanah Sareal");
  const [kelurahan, setKelurahan] = useState("Cibadak");
  const [alamatLengkap, setAlamatLengkap] = useState(
    "Jl. KH. R. Abdullah Bin Nuh No. 34, RT.04/RW.02"
  );
  const [kodePos, setKodePos] = useState("16166");
  const [latitude, setLatitude] = useState("-6.559483");
  const [longitude, setLongitude] = useState("106.772591");

  // Section 3: Foto
  const [fotoPreview, setFotoPreview] = useState("/images/detail-photo-1.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & Leaflet Map refs
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [modePilihTitik, setModePilihTitik] = useState(false);

  const petaContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LType.Map | null>(null);
  const markerRef = useRef<LType.Marker | null>(null);

  // Inisialisasi Peta Leaflet
  useEffect(() => {
    let aktif = true;

    async function initMap() {
      if (!petaContainerRef.current || leafletMapRef.current) return;
      const L = (await import("leaflet")).default;
      if (!aktif || !petaContainerRef.current) return;

      const latNum = parseFloat(latitude) || -6.559483;
      const lngNum = parseFloat(longitude) || 106.772591;

      const map = L.map(petaContainerRef.current, {
        center: [latNum, lngNum],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }
      ).addTo(map);

      // Custom Hospital / Faskes Marker Icon
      const customIcon = L.divIcon({
        className: "custom-faskes-marker",
        html: `
          <div style="background-color: #007E7A; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2.5px solid #FFFFFF;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v12m-6-6h12"/>
            </svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([latNum, lngNum], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setLatitude(pos.lat.toFixed(6));
        setLongitude(pos.lng.toFixed(6));
      });

      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        setLatitude(e.latlng.lat.toFixed(6));
        setLongitude(e.latlng.lng.toFixed(6));
      });

      leafletMapRef.current = map;
      markerRef.current = marker;
    }

    initMap();

    return () => {
      aktif = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Sync Marker when input coordinates change
  const syncMapToCoordinates = (latStr: string, lngStr: string) => {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng) && leafletMapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      leafletMapRef.current.setView([lat, lng], leafletMapRef.current.getZoom());
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFotoPreview(url);
    }
  };

  const handleSimpanFaskes = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);

    if (!namaFaskes.trim()) {
      setPesanError("Nama resmi fasilitas kesehatan wajib diisi.");
      return;
    }

    if (!alamatLengkap.trim()) {
      setPesanError("Alamat lengkap faskes wajib diisi.");
      return;
    }

    setSedangSimpan(true);

    const latNum = parseFloat(latitude) || -6.559483;
    const lngNum = parseFloat(longitude) || 106.772591;

    const kotaKab = "KOTA BOGOR";

    const payload = {
      nama_faskes: namaFaskes.trim(),
      alamat_faskes: alamatLengkap.trim(),
      kota_kabupaten: kotaKab,
      kecamatan: kecamatan.trim(),
      latitude: latNum,
      longitude: lngNum,
      kdppk: kodeFaskes.trim() || undefined,
      jenis_faskes: kategoriJenis,
      kelas_faskes: tipeKelas.replace("Tipe ", "").replace(" (Umum)", ""),
      is_support_bpjs: true,
    };

    try {
      await api.createFaskes(payload);
      router.push("/admin/faskes");
    } catch (err: any) {
      setPesanError(
        err?.message || "Gagal menambahkan data faskes. Silakan coba kembali."
      );
    } finally {
      setSedangSimpan(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="max-w-[1020px] mx-auto space-y-6 pb-12">
        {/* Tombol Kembali & Judul Halaman */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/faskes"
            className="p-1 text-slate-700 hover:text-slate-900 transition rounded-lg hover:bg-slate-100"
            title="Kembali ke Kelola Data Faskes"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tambah Fasilitas Kesehatan Baru
          </h1>
        </div>

        {/* Error Alert */}
        {pesanError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{pesanError}</span>
            <button
              type="button"
              onClick={() => setPesanError(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSimpanFaskes} className="space-y-6">
          {/* SECTION 1: Identitas & Kategori Faskes */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
            {/* Header Section */}
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-[#007E7A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Identitas &amp; Kategori Faskes
              </h2>
            </div>

            {/* Row 1: Kode Faskes & Tipe/Kelas Pelayanan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Kode Faskes / Kemenkes ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={kodeFaskes}
                    onChange={(e) => setKodeFaskes(e.target.value)}
                    placeholder="3271045"
                    className="w-full h-11 px-3.5 pr-10 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  7 digit numerik resmi Kemenkes RI
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Tipe / Kelas Pelayanan <span className="text-red-500">*</span>
                </label>
                <select
                  value={tipeKelas}
                  onChange={(e) => setTipeKelas(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                >
                  {DAFTAR_TIPE_KELAS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Klasifikasi fasilitas berdasarkan izin operasional
                </p>
              </div>
            </div>

            {/* Row 2: Nama Resmi Fasilitas Kesehatan */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Nama Resmi Fasilitas Kesehatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaFaskes}
                onChange={(e) => setNamaFaskes(e.target.value)}
                placeholder="RS Hermina Bogor"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
              />
            </div>

            {/* Row 3: Kategori/Jenis Faskes & Status Kepemilikan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Kategori / Jenis Faskes <span className="text-red-500">*</span>
                </label>
                <select
                  value={kategoriJenis}
                  onChange={(e) => setKategoriJenis(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                >
                  {DAFTAR_KATEGORI_JENIS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Status Kepemilikan <span className="text-red-500">*</span>
                </label>
                <select
                  value={statusKepemilikan}
                  onChange={(e) => setStatusKepemilikan(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                >
                  {DAFTAR_STATUS_KEPEMILIKAN.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Lokasi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
            {/* Header Section */}
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-[#007E7A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="text-base font-bold text-slate-900">Lokasi</h2>
            </div>

            {/* Row 1: Kecamatan & Kelurahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                >
                  {DAFTAR_KECAMATAN.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Kelurahan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kelurahan}
                  onChange={(e) => setKelurahan(e.target.value)}
                  placeholder="Cibadak"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                />
              </div>
            </div>

            {/* Row 2: Alamat Lengkap */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Alamat Lengkap Faskes <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={alamatLengkap}
                onChange={(e) => setAlamatLengkap(e.target.value)}
                placeholder="Jl. KH. R. Abdullah Bin Nuh No. 34, RT.04/RW.02"
                className="w-full p-3 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition leading-relaxed"
              />
            </div>

            {/* Row 3: Kode Pos */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Kode Pos
              </label>
              <input
                type="text"
                value={kodePos}
                onChange={(e) => setKodePos(e.target.value)}
                placeholder="16166"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
              />
            </div>

            {/* Row 4: Koordinat Presisi GIS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#007E7A]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Koordinat Presisi GIS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <span className="block text-[11px] text-slate-500">
                    Latitude (Lintang)
                  </span>
                  <input
                    type="text"
                    required
                    value={latitude}
                    onChange={(e) => {
                      setLatitude(e.target.value);
                      syncMapToCoordinates(e.target.value, longitude);
                    }}
                    placeholder="-6.559483"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-[11px] text-slate-500">
                    Longitude (Bujur)
                  </span>
                  <input
                    type="text"
                    required
                    value={longitude}
                    onChange={(e) => {
                      setLongitude(e.target.value);
                      syncMapToCoordinates(latitude, e.target.value);
                    }}
                    placeholder="106.772591"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
                  />
                </div>
              </div>

              {/* Map Preview GIS */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <div ref={petaContainerRef} className="w-full h-52 sm:h-64" />

                {/* Top Badge: Radius Kota Bogor (Aman) */}
                <div className="absolute top-3 left-3 z-[400] px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-slate-800 flex items-center gap-2 shadow-xs border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Radius Kota Bogor (Aman)</span>
                </div>

                {/* Bottom Right Button: Pilih Titik di Peta */}
                <button
                  type="button"
                  onClick={() => {
                    setModePilihTitik(!modePilihTitik);
                  }}
                  className={`absolute bottom-3 right-3 z-[400] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                    modePilihTitik
                      ? "bg-[#007E7A] text-white"
                      : "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5 text-[#007E7A]" />
                  <span>Pilih Titik di Peta</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                * Titik pin digunakan untuk algoritma pencarian rute terdekat warga dari
                lokasi gawat darurat.
              </p>
            </div>

            {/* Subsection: Foto Tampak Depan Faskes */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">
                Foto Tampak Depan Faskes
              </label>

              <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <img
                  src={fotoPreview}
                  alt="Tampak depan faskes"
                  className="w-24 h-16 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                />

                <div className="space-y-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ganti Foto Gedung</span>
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Format JPG/PNG, maksimal 3MB resolusi 1200×800
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Link
              href="/admin/faskes"
              className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={sedangSimpan}
              className="px-6 py-2.5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white font-bold text-xs flex items-center gap-2 transition shadow-xs disabled:opacity-50"
            >
              {sedangSimpan ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Simpan &amp; Publikasikan</span>
            </button>
          </div>
        </form>
      </div>
    </AdminSidebarLayout>
  );
}
