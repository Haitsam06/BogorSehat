"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Navigation,
  Map,
  Share2,
  ExternalLink,
  Star,
  Send,
  Pencil,
  Trash2,
  CornerUpLeft,
  ThumbsUp,
  Flag,
} from "lucide-react";
import { daftar_faskes_utama } from "@/data/data_faskes";
import { BadgePoli, DaftarBadgePoli } from "@/components/ui/badge_poli";
import PetaLeaflet from "@/components/map/peta_leaflet";

export default function DetailFaskesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [teks_ulasan_baru, set_teks_ulasan_baru] = useState("");

  const faskes_detail =
    daftar_faskes_utama.find((item) => item.slug_faskes === slug) ||
    daftar_faskes_utama[0];

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-7 w-full space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#007E7A]">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/cari-faskes" className="hover:text-[#007E7A]">
          Cari Faskes
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-600">Detail Faskes</span>
      </div>

      {/* Kartu Header Fasilitas */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-slate-900">
            {faskes_detail.nama_faskes}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {faskes_detail.alamat_lengkap}, Kota Bogor, Jawa Barat 16112
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            <span className="font-bold text-[#B45309] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>
                {faskes_detail.jarak_km} dari lokasi Anda (Jl. Pajajaran) •
                Estimasi ~{faskes_detail.waktu_tempuh}
              </span>
            </span>
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{faskes_detail.koordinat_teks}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <Link
            href="/peta"
            className="px-6 py-2 rounded-lg bg-[#EBEEF2] hover:bg-slate-200 text-[#007E7A] text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Lokasi</span>
          </Link>
          <button
            type="button"
            className="px-6 py-2 rounded-lg bg-[#EBEEF2] hover:bg-slate-200 text-[#007E7A] text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan</span>
          </button>
        </div>
      </div>

      {/* Grid 2 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Kartu Galeri Foto, Deskripsi, dan Badge Poli */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-8">
                <img
                  src="/images/detail-photo-1.png"
                  alt={faskes_detail.nama_faskes}
                  className="w-full h-[260px] sm:h-[290px] object-cover rounded-xl"
                />
              </div>
              <div className="sm:col-span-4 flex flex-col gap-2.5">
                <img
                  src="/images/detail-photo-2.png"
                  alt="Ruang Tunggu Faskes"
                  className="w-full h-[140px] object-cover rounded-xl"
                />
                <img
                  src="/images/detail-photo-3.png"
                  alt="Fasilitas Medis"
                  className="w-full h-[140px] object-cover rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <h2 className="text-base font-extrabold text-slate-900">
                Tentang {faskes_detail.nama_faskes}
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                Rumah Sakit Umum Daerah (RSUD) Kota Bogor merupakan fasilitas
                pelayanan rujukan tingkat lanjutan (FKRTL) milik Pemerintah Kota
                Bogor. Menyediakan layanan komprehensif mulai dari Instalasi
                Gawat Darurat 24 jam dengan sistem triase modern, pelayanan
                poliklinik 22 dokter spesialis &amp; subspesialis, perawatan
                intensif (ICU, ICCU, NICU, PICU), hingga pusat penanganan
                penyakit kardiovaskular dan hemodialisa terintegrasi.
              </p>
            </div>

            {/* Seksi Layanan Poliklinik */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Layanan Poliklinik Tersedia
              </h3>
              <DaftarBadgePoli
                daftar_poli={faskes_detail.daftar_poli}
                maksimal_tampil={10}
                ukuran_badge="kecil"
              />
            </div>
          </div>

          {/* Kartu Ringkasan Skor & Input Ulasan */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div className="bg-[#F3F6F9] rounded-xl p-4 flex items-center gap-5">
              <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-[#007E7A]">
                  {faskes_detail.rating_faskes}
                </div>
                <div className="flex items-center justify-center gap-0.5 my-1">
                  {[...Array(5)].map((_, indeks_bintang) => (
                    <Star
                      key={indeks_bintang}
                      className="w-3 h-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <div className="text-[10px] text-slate-500">342 Ulasan</div>
              </div>
              <div className="text-xs font-extrabold text-slate-800">
                Ulasan Terverifikasi Warga &amp; Pasien Bogor
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#007E7A] text-white font-bold text-xs flex items-center justify-center">
                  AF
                </div>
                <span className="text-xs font-bold text-slate-900">
                  Ahmad Fauzi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700">
                  Beri Rating:
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, indeks_bintang) => (
                    <Star
                      key={indeks_bintang}
                      className="w-4 h-4 fill-amber-400 text-amber-400 cursor-pointer"
                    />
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                value={teks_ulasan_baru}
                onChange={(e) => set_teks_ulasan_baru(e.target.value)}
                placeholder="Bagikan ulasan detail mengenai keramahan tenaga medis, ketepatan jadwal, kebersihan fasilitas, dan efisiensi farmasi obat..."
                className="w-full p-3.5 rounded-xl bg-[#F3F6F9] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />

              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Ulasan</span>
              </button>
            </div>
          </div>

          {/* Daftar Ulasan & Diskusi */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-extrabold text-slate-900">
              Ulasan &amp; Diskusi
            </h3>

            {/* Ulasan 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#007E7A] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    AF
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Ahmad Fauzi
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#D9F2F0] text-[#007E7A] text-[10px] font-bold">
                        Ulasan Saya
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center text-amber-400">
                        ★★★★★
                      </span>
                      <span>• 2 hari yang lalu •</span>
                      <BadgePoli nama_poli="Poli Jantung" ukuran_badge="kecil" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1.5 text-slate-600 hover:text-slate-900"
                    title="Edit Ulasan"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Pelayanan di Poli Jantung RSUD Kota Bogor sangat tertib dengan
                antrean pendaftaran online P-Care Mobile JKN. Dokter Farhan
                sangat ramah, menjelaskan diagnosis penyakit secara
                komprehensif, dan obat BPJS terlayani cepat di loket farmasi
                lantai 1 dalam waktu kurang dari 20 menit.
              </p>

              <div className="flex items-center gap-4 pt-1 text-[11px]">
                <button
                  type="button"
                  className="font-bold text-[#007E7A] flex items-center gap-1 hover:underline"
                >
                  <CornerUpLeft className="w-3 h-3" />
                  <span>Balas (1 balasan resmi)</span>
                </button>
                <span className="text-slate-500 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-amber-500" />
                  <span>24 Warga terbantu</span>
                </span>
              </div>
            </div>

            {/* Ulasan 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#15803D] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  SR
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Siti Rahmawati
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                    <span className="flex items-center text-amber-400">
                      ★★★★★
                    </span>
                    <span>• 1 minggu lalu •</span>
                    <BadgePoli
                      nama_poli="Poli Penyakit Dalam"
                      ukuran_badge="kecil"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Masuk IGD malam hari karena tensi mendadak tinggi di atas 180.
                Tim dokter jaga dan perawat langsung sigap memberikan tindakan
                oksigen dan infus. Syarat administrasi darurat BPJS tidak
                dipersulit dan ruangan triasenya cukup steril dan lega.
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-slate-800"
                  >
                    <CornerUpLeft className="w-3 h-3" />
                    <span>Balas</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-slate-800"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Suka (18)</span>
                  </button>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-rose-600"
                >
                  <Flag className="w-3 h-3" />
                  <span>Laporkan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kartu Lokasi dengan Peta Leaflet + Pin Tooltip (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-900">
              <MapPin className="w-4 h-4 text-[#007E7A]" />
              <span>Lokasi</span>
            </div>
          </div>

          <div className="h-56 rounded-xl overflow-hidden border border-slate-200">
            <PetaLeaflet
              daftar_faskes={[faskes_detail]}
              faskes_terpilih={faskes_detail}
              zoom_awal={15}
            />
          </div>

          <div className="text-[11px] space-y-1">
            <span className="font-bold text-slate-900 block">
              Alamat Resmi:
            </span>
            <p className="text-slate-500 leading-relaxed">
              {faskes_detail.alamat_lengkap}, Kota Bogor, Jawa Barat 16112
            </p>
          </div>

          <Link
            href="/peta"
            className="w-full py-2.5 px-4 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Navigasi Rute Cepat (Google Maps)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
