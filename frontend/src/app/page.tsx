"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Map,
  CornerUpRight,
  Phone,
  Layers,
  Stethoscope,
  ArrowRight,
  PhoneCall,
  ChevronDown,
  Sparkles,
  Activity,
  Compass,
  Loader2,
} from "lucide-react";
import {
  daftar_semua_poli,
  daftar_kategori_layanan,
  daftar_langkah_rujukan,
  daftar_pertanyaan_umum,
  DataFaskesItem,
} from "@/data/data_faskes";
import { BadgePoli } from "@/components/ui/badge_poli";
import { FaskesThumbnail } from "@/components/ui/faskes_thumbnail";
import FaskesCard from "@/components/faskes/FaskesCard";
import PetaLeaflet from "@/components/map/peta_leaflet";
import AnimasiScroll from "@/components/ui/animasi_scroll";
import {
  api,
  mapApiFaskesToItem,
  ApiHomeDashboard,
  messageFromError,
} from "@/lib/api";
import { useFaskes } from "@/context/FaskesContext";

export default function BerandaPage() {
  const { lokasiPengguna, deteksiLokasiGPS, memuatGPS } = useFaskes();
  const [daftarRekomendasi, setDaftarRekomendasi] = useState<DataFaskesItem[]>([]);
  const [daftarPeta, setDaftarPeta] = useState<DataFaskesItem[]>([]);
  const [pesanKesalahan, setPesanKesalahan] = useState<string | null>(null);
  const [dataHome, setDataHome] = useState<ApiHomeDashboard | null>(null);
  const [sedangMemuatNearby, setSedangMemuatNearby] = useState(false);
  const [id_faq_terbuka, set_id_faq_terbuka] = useState<number | null>(1);

  // 1. Muat ringkasan data /home (hanya sekali saat mount, tidak terpengaruh GPS)
  useEffect(() => {
    let aktif = true;

    async function muatHome() {
      try {
        const homeRes = await api.getHome();
        if (aktif && homeRes) {
          setDataHome(homeRes);
        }
      } catch (err) {
        if (aktif) {
          setPesanKesalahan(
            messageFromError(err, "Gagal memuat ringkasan data BogorSehat.")
          );
        }
      }
    }

    muatHome();

    return () => {
      aktif = false;
    };
  }, []);

  // 2. Muat rekomendasi faskes terdekat berdasarkan koordinat pengguna
  useEffect(() => {
    let aktif = true;

    async function muatNearby() {
      setSedangMemuatNearby(true);
      try {
        const nearbyRes = await api.getNearbyFaskes(
          lokasiPengguna.latitude,
          lokasiPengguna.longitude,
          15,
          { compact: true, limit: 12 }
        );
        if (aktif && nearbyRes && nearbyRes.length > 0) {
          const mapped = nearbyRes.map((f, i) => mapApiFaskesToItem(f, i));
          setDaftarRekomendasi(mapped.slice(0, 3));
          setDaftarPeta(mapped);
        }
      } catch (err) {
        if (aktif) {
          setPesanKesalahan(
            messageFromError(err, "Gagal memuat rekomendasi faskes terdekat.")
          );
        }
      } finally {
        if (aktif) setSedangMemuatNearby(false);
      }
    }

    muatNearby();

    return () => {
      aktif = false;
    };
  }, [lokasiPengguna.latitude, lokasiPengguna.longitude]);

  const toggle_item_faq = (id_faq: number) => {
    set_id_faq_terbuka((prev_id) => (prev_id === id_faq ? null : id_faq));
  };

  return (
    <div className="w-full pb-16 bg-white">
      {/* =====================================================================
          1. HERO SECTION (Teks di Depan Menimpa Background Gambar Siluet)
         ===================================================================== */}
      <section className="relative w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16 min-h-[440px] sm:min-h-[480px] lg:min-h-[500px] flex items-center overflow-hidden">
        {/* Gambar Background Siluet Bogor (Berada di Belakang Teks / Layer Dasar) */}
        <div className="absolute right-[-12px] sm:right-0 -top-8 sm:top-0 bottom-0 w-[95%] sm:w-[70%] lg:w-[60%] flex items-center sm:items-end justify-end pointer-events-none select-none z-0">
          <Image
            src="/images/hero-siluet-bogor.png"
            alt="Siluet Landmark Kota Bogor"
            width={612}
            height={408}
            priority
            className="h-full w-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[500px] object-contain object-right-center sm:object-right-bottom drop-shadow-xs"
          />
        </div>

        {/* Lapisan Gradasi Fade In Lembut (Dari Putih Halus ke Transparan Pekat di Kanan) */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-[70%] lg:w-[55%] bg-gradient-to-r from-white via-white/60 to-transparent pointer-events-none z-[1]" />

        {/* Konten Teks & Tombol Pintasan (Layer Terdepan: z-10 Rata Kiri) */}
        <div className="relative z-10 max-w-2xl flex flex-col items-start text-left">
          {/* Badge Lokasi GPS Pengguna */}
          <AnimasiScroll arah="atas" durasi_ms={600}>
            <button
              type="button"
              onClick={deteksiLokasiGPS}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#CDEAE8] shadow-xs text-[#007E7A] text-xs font-semibold mb-5 hover:border-[#007E7A] transition select-none cursor-pointer"
              title="Klik untuk mendeteksi koordinat GPS perangkat Anda"
            >
              <MapPin className="w-3.5 h-3.5 text-[#007E7A]" />
              <span>
                {memuatGPS ? "Mendeteksi posisi GPS..." : `Anda berada di ${lokasiPengguna.nama_jalan}`}
              </span>
            </button>
          </AnimasiScroll>

          {/* Judul Utama dengan Animasi Scroll */}
          <AnimasiScroll jeda_ms={100} durasi_ms={700}>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#1E232A] tracking-tight leading-[1.2] max-w-2xl drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              Temukan Fasilitas Kesehatan Terdekat di Bogor
              <br />
              dengan{" "}
              <span className="text-[#007E7A]">
                Cepat &amp; Akurat
              </span>
            </h1>
          </AnimasiScroll>

          {/* Subjudul dengan Animasi Scroll */}
          <AnimasiScroll jeda_ms={200} durasi_ms={700}>
            <p className="mt-4 text-sm sm:text-[15px] text-slate-600 max-w-xl leading-relaxed drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              Layanan informasi resmi untuk menemukan lokasi IGD, Puskesmas, dan
              Klinik terakreditasi BPJS di Kota &amp; Kabupaten Bogor berdasarkan
              rute terbaik dari lokasimu.
            </p>
          </AnimasiScroll>

          {/* Tombol Pintasan Cepat di Bawah Hero */}
          <AnimasiScroll jeda_ms={300} durasi_ms={700}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/peta"
                className="px-6 py-3 rounded-full bg-[#007E7A] hover:bg-[#006965] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition group"
              >
                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                <span>Buka Peta Interaktif</span>
              </Link>
              <Link
                href="/cari-faskes"
                className="px-6 py-3 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-[#007E7A] text-xs sm:text-sm font-bold border border-slate-200/90 shadow-2xs hover:border-[#007E7A] transition"
              >
                <span>Telusuri Semua Faskes</span>
              </Link>
            </div>
          </AnimasiScroll>
        </div>
      </section>

      {/* Kontainer Utama Landing Page */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 space-y-12">
        {/* =====================================================================
            2. TOP 3 REKOMENDASI FASKES TERDEKAT (Hover Lift & Staggered Reveal)
           ===================================================================== */}
        <AnimasiScroll arah="bawah" durasi_ms={600}>
          <section className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#007E7A] uppercase tracking-wider mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Rekomendasi Terdekat</span>
                </div>
                <h2 className="text-lg sm:text-[20px] font-extrabold text-slate-900">
                  Top 3 Rekomendasi Faskes dari Lokasi Anda
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Diurutkan secara otomatis berdasarkan kalkulasi jarak radial
                  koordinat GPS Anda saat ini.
                </p>
              </div>
            </div>

            {pesanKesalahan && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800 flex items-center gap-2">
                <span>{pesanKesalahan}</span>
              </div>
            )}

            {/* Grid 3 Kartu Rekomendasi dengan Stagger Animation */}
            {sedangMemuatNearby && daftarRekomendasi.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between h-[360px] animate-pulse"
                  >
                    <div className="h-[180px] bg-slate-100 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#007E7A]" />
                      <span className="text-[11px] text-slate-400 font-medium">Memuat rekomendasi...</span>
                    </div>
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                        <div className="h-5 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-full" />
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-between">
                        <div className="h-4 bg-slate-100 rounded w-1/4" />
                        <div className="h-4 bg-slate-100 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : daftarRekomendasi.length === 0 ? (
              <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                Belum ada faskes dalam radius 15 km dari lokasi Anda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {daftarRekomendasi.map((faskes_item, indeks) => (
                  <AnimasiScroll
                    key={faskes_item.id_faskes}
                    jeda_ms={indeks * 140}
                    durasi_ms={700}
                    className="h-full"
                  >
                    <FaskesCard
                      faskes={faskes_item}
                      variant="home"
                      className="h-full hover:-translate-y-1.5 transition-all duration-300"
                    />
                  </AnimasiScroll>
                ))}
              </div>
            )}
          </section>
        </AnimasiScroll>

        {/* =====================================================================
            3. SPLIT CARD: PANTAU SEBARAN & KAPASITAS FASKES SECARA REAL-TIME
           ===================================================================== */}
        <AnimasiScroll arah="skala" durasi_ms={700}>
          <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 hover:shadow-lg transition-shadow duration-300">
            <div className="lg:col-span-6 p-6 sm:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  Pantau Sebaran &amp; Kapasitas Faskes
                  <br />
                  Secara Real-Time
                </h2>

                <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                  Akses peta interaktif layar penuh dengan filter radius
                  lingkaran Haversine, buffer estimasi 15 menit berkendara,
                  serta titik faskes terverifikasi resmi oleh Dinas Kesehatan
                  Bogor.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-teal-50/40 border border-teal-100/80">
                    <div className="w-11 h-11 rounded-xl bg-[#007E7A] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {dataHome?.faskes_count ?? 0}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900">
                        Faskes Terdata &amp; Terpetakan
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Meliputi 6 Kecamatan Kota &amp; 40 Kecamatan Kabupaten
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/80">
                    <div className="w-11 h-11 rounded-xl bg-[#86EFAC] text-[#065F46] font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      100%
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900">
                        Koordinat Terverifikasi Lapangan
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Standar EPSG:4326 WGS84 Geodetik Resmi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/peta"
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition"
                >
                  <Map className="w-4 h-4" />
                  <span>Buka Peta Faskes</span>
                </Link>
              </div>
            </div>

            {/* Pratinjau Leaflet Map */}
            <div className="lg:col-span-6 relative h-[380px] lg:h-auto min-h-[380px] bg-slate-100">
              <PetaLeaflet
                daftar_faskes={daftarPeta}
                zoom_awal={13}
                tampilkan_legenda={true}
                tampilkan_kontrol_kanan_atas={true}
              />
            </div>
          </section>
        </AnimasiScroll>

        {/* =====================================================================
            4. EKSPLORASI KATEGORI FASKES & KATALOG POLIKLINIK (Stagger Cards)
           ===================================================================== */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-7">
          <AnimasiScroll durasi_ms={600}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Eksplorasi Kategori Faskes &amp; Poliklinik Bogor
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
                  Temukan fasilitas kesehatan sesuai jenjang rujukan BPJS
                  Kesehatan dan ketersediaan dokter spesialis.
                </p>
              </div>

              <Link
                href="/cari-faskes"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#007E7A] hover:underline shrink-0"
              >
                <span>Lihat Direktori Lengkap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimasiScroll>

          {/* Grid 4 Kartu Kategori Faskes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {daftar_kategori_layanan.map((item_kategori, idx) => (
              <AnimasiScroll
                key={item_kategori.id_kategori}
                jeda_ms={idx * 110}
                durasi_ms={650}
                className="h-full"
              >
                <Link
                  href={`/cari-faskes?kategori=${encodeURIComponent(item_kategori.jenis_query)}`}
                  className="group rounded-2xl border border-slate-200/80 bg-[#FAFDFD] hover:bg-white hover:border-[#007E7A] p-5 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-1 h-full"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#007E7A] text-white text-[11px] font-extrabold whitespace-nowrap shrink-0">
                        {item_kategori.jumlah_unit}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-extrabold text-slate-900 group-hover:text-[#007E7A] transition leading-snug">
                      {item_kategori.nama_kategori}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item_kategori.deskripsi_kategori}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#007E7A]">
                    <span>Telusuri Faskes</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </AnimasiScroll>
            ))}
          </div>

          {/* Bar Katalog Poliklinik (Badge Poli) */}
          <AnimasiScroll jeda_ms={200} durasi_ms={700}>
            <div className="rounded-2xl bg-[#F4F8F8] border border-[#D5ECEB] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                  <Stethoscope className="w-4 h-4 text-[#007E7A]" />
                  <span>
                    Pencarian Cepat Berdasarkan Poliklinik
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Klik salah satu badge poliklinik untuk menyaring faskes yang
                  memiliki layanan terkait:
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {daftar_semua_poli.map((nama_poli) => (
                  <Link key={nama_poli} href={`/cari-faskes?poli=${encodeURIComponent(nama_poli)}`}>
                    <BadgePoli nama_poli={nama_poli} ukuran_badge="sedang" />
                  </Link>
                ))}
              </div>
            </div>
          </AnimasiScroll>
        </section>

        {/* =====================================================================
            5. CARA KERJA & KEUNGGULAN SISTEM RUJUKAN (3 Langkah Mudah)
           ===================================================================== */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-7">
          <AnimasiScroll durasi_ms={600}>
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Temukan Faskes yang Tepat dalam 3 Langkah Mudah
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500">
                Dirancang untuk memangkas waktu pencarian layanan medis dan
                menghindari penolakan rujukan karena ketiadaan poli atau asuransi.
              </p>
            </div>
          </AnimasiScroll>

          {/* Grid 3 Langkah */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {daftar_langkah_rujukan.map((item_langkah, idx) => (
              <AnimasiScroll
                key={item_langkah.nomor_langkah}
                jeda_ms={idx * 150}
                durasi_ms={700}
                className="h-full"
              >
                <div className="relative rounded-2xl border border-slate-200/80 bg-[#FAFBFB] p-6 space-y-3 hover:border-[#007E7A]/40 hover:bg-white hover:shadow-md transition-all duration-300 h-full">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-[#007E7A] text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                      {item_langkah.nomor_langkah}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 pt-1">
                    {item_langkah.judul_langkah}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item_langkah.deskripsi_langkah}
                  </p>
                </div>
              </AnimasiScroll>
            ))}
          </div>
        </section>

        {/* =====================================================================
            6. BANNER TANGGAP DARURAT IGD 24 JAM & FAQ WARGA
           ===================================================================== */}
        <section
          id="darurat-igd"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Kiri: Banner Darurat IGD 24 Jam (5 cols) */}
          <div className="lg:col-span-5">
            <AnimasiScroll arah="kiri" durasi_ms={700} className="h-full">
              <div className="h-full rounded-3xl bg-gradient-to-br from-[#005B5C] via-[#006E6D] to-[#00837B] text-white p-7 sm:p-8 flex flex-col justify-between space-y-6 shadow-[0_8px_30px_rgba(0,126,122,0.18)]">
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">
                    Butuh Penanganan Medis Darurat Segera?
                  </h2>

                  <p className="text-xs sm:text-[13px] text-emerald-100/90 leading-relaxed">
                    Dalam kondisi darurat medis (*golden hour*), segera pantau
                    titik Rumah Sakit ber-IGD 24 Jam terdekat dari lokasi Anda
                    atau hubungi layanan ambulans darurat Pemerintah Bogor.
                  </p>

                  <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1 backdrop-blur-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                      Hotline Darurat Medis &amp; PSC 119 Bogor
                    </span>
                    <div className="text-lg font-extrabold text-white flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-emerald-300 animate-bounce" />
                      <span>119 / (0251) 8312292</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href="/peta"
                    className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-emerald-50 text-[#007E7A] text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <Map className="w-4 h-4" />
                    <span>Cari IGD di Peta</span>
                  </Link>
                  <Link
                    href="/cari-faskes"
                    className="py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center justify-center transition"
                  >
                    Daftar RS 24 Jam
                  </Link>
                </div>
              </div>
            </AnimasiScroll>
          </div>

          {/* Kanan: Pertanyaan Umum / FAQ Warga (7 cols) */}
          <div className="lg:col-span-7">
            <AnimasiScroll arah="kanan" durasi_ms={700} className="h-full">
              <div className="h-full bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Pertanyaan Umum Warga (FAQ)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informasi penting seputar layanan rujukan BPJS dan penggunaan
                    peta fasilitas kesehatan Bogor Sehat.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-center">
                  {daftar_pertanyaan_umum.map((item_faq) => {
                    const terbuka = id_faq_terbuka === item_faq.id_faq;
                    return (
                      <div key={item_faq.id_faq} className="py-3.5">
                        <button
                          type="button"
                          onClick={() => toggle_item_faq(item_faq.id_faq)}
                          className="w-full text-left flex items-center justify-between gap-4 text-xs sm:text-[13px] font-bold text-slate-900 hover:text-[#007E7A] transition"
                        >
                          <span>{item_faq.pertanyaan_warga}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${terbuka ? "rotate-180 text-[#007E7A]" : ""
                              }`}
                          />
                        </button>
                        {terbuka && (
                          <p className="mt-2 text-xs text-slate-600 leading-relaxed pr-6 animate-in fade-in duration-200">
                            {item_faq.jawaban_resmi}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimasiScroll>
          </div>
        </section>
      </div>
    </div>
  );
}
