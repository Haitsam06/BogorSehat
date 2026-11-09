"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Info,
  MapPin,
  Navigation,
  X,
  ExternalLink,
  Building2,
  Loader2,
} from "lucide-react";
import {
  daftar_faskes_utama,
  DataFaskesItem,
  lokasi_default_pengguna,
} from "@/data/data_faskes";
import { DaftarBadgePoli } from "@/components/ui/badge_poli";
import PetaLeaflet from "@/components/map/peta_leaflet";
import { api, mapApiFaskesToItem } from "@/lib/api";
import { useFaskes } from "@/context/FaskesContext";

export default function PetaInteraktifPage() {
  const { lokasiPengguna } = useFaskes();
  const [daftarFaskes, setDaftarFaskes] = useState<DataFaskesItem[]>(daftar_faskes_utama);
  const [kata_kunci_lokasi, set_kata_kunci_lokasi] = useState("");
  const [faskes_terpilih, set_faskes_terpilih] = useState<DataFaskesItem | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  // Ambil data faskes untuk peta dari API
  useEffect(() => {
    let aktif = true;

    async function muatPeta() {
      setSedangMemuat(true);
      try {
        // Coba ambil dari nearby atau faskes list
        const res = await api.getNearbyFaskes(
          lokasiPengguna.latitude || lokasi_default_pengguna.latitude,
          lokasiPengguna.longitude || lokasi_default_pengguna.longitude,
          35
        );

        if (aktif && res && res.length > 0) {
          const mapped = res.map((f, i) => mapApiFaskesToItem(f, i));
          setDaftarFaskes(mapped);
          set_faskes_terpilih(mapped[0]);
        }
      } catch {
        // Fallback coba ambil dari /faskes?per_page=100
        try {
          const fRes = await api.getFaskes({ per_page: 100 });
          if (aktif && fRes.data && fRes.data.length > 0) {
            const mapped = fRes.data.map((f, i) => mapApiFaskesToItem(f, i));
            setDaftarFaskes(mapped);
            set_faskes_terpilih(mapped[0]);
          }
        } catch {
          // Fallback ke data bawaan
          if (aktif && daftar_faskes_utama.length > 0) {
            set_faskes_terpilih(daftar_faskes_utama[0]);
          }
        }
      } finally {
        if (aktif) setSedangMemuat(false);
      }
    }

    muatPeta();

    return () => {
      aktif = false;
    };
  }, [lokasiPengguna.latitude, lokasiPengguna.longitude]);

  // Saring daftar faskes berdasarkan kata kunci pencarian
  const daftar_faskes_terfilter = useMemo(() => {
    const query = kata_kunci_lokasi.trim().toLowerCase();
    if (!query) return daftarFaskes;

    return daftarFaskes.filter((faskes_item) => {
      return (
        faskes_item.nama_faskes.toLowerCase().includes(query) ||
        faskes_item.alamat_lengkap.toLowerCase().includes(query) ||
        faskes_item.kecamatan.toLowerCase().includes(query) ||
        faskes_item.kategori_faskes.toLowerCase().includes(query) ||
        faskes_item.daftar_poli.some((poli) =>
          poli.toLowerCase().includes(query)
        )
      );
    });
  }, [kata_kunci_lokasi, daftarFaskes]);

  return (
    <div className="relative w-full h-[calc(100dvh-76px)] max-h-[calc(100dvh-76px)] overflow-hidden select-none bg-[#E8EEF2]">
      {/* Komponen Peta Leaflet Layar Penuh dengan Tile OSM & Pin Tooltip */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <PetaLeaflet
          daftar_faskes={daftar_faskes_terfilter}
          faskes_terpilih={faskes_terpilih}
          zoom_awal={13}
          tampilkan_kontrol_kanan_bawah={true}
          saat_pilih_faskes={(item_dipilih) => set_faskes_terpilih(item_dipilih)}
        />
      </div>

      {/* Panel Kiri Mengambang: Menu List Faskes + Pencarian Terpadu */}
      <aside className="hidden lg:flex absolute top-3 left-3 bottom-3 z-20 w-[320px] bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-white/80 p-3.5 flex-col justify-between overflow-hidden">
        <div className="flex flex-col h-full min-h-0 space-y-2.5">
          {/* Header Panel */}
          <div className="flex items-center justify-between pt-0.5 shrink-0">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                <span>Lokasi Faskes</span>
                {sedangMemuat && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#007E7A]" />
                )}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                {daftar_faskes_terfilter.length} fasilitas kesehatan terpetakan
              </p>
            </div>
            <Link
              href="/cari-faskes"
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition shrink-0"
              title="Filter Lengkap"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Filter</span>
            </Link>
          </div>

          {/* Kotak Pencarian Faskes di Sisi Kiri */}
          <div className="relative flex items-center bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#007E7A]/25 focus-within:border-[#007E7A] rounded-xl border border-slate-200/80 px-2.5 py-1.5 transition shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={kata_kunci_lokasi}
              onChange={(e) => set_kata_kunci_lokasi(e.target.value)}
              placeholder="Cari faskes, poli, alamat..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 pl-2 focus:outline-none"
            />
            {kata_kunci_lokasi && (
              <button
                type="button"
                onClick={() => set_kata_kunci_lokasi("")}
                className="w-4 h-4 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition shrink-0"
                title="Hapus pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Daftar Kartu Faskes Terdekat (Scroll Mandiri di Dalam Panel) */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
            {daftar_faskes_terfilter.length === 0 ? (
              <div className="p-5 text-center text-slate-400 space-y-1.5">
                <Building2 className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs font-medium">
                  Tidak ada faskes yang cocok dengan pencarian.
                </p>
              </div>
            ) : (
              daftar_faskes_terfilter.map((faskes_item) => {
                const sedang_dipilih =
                  faskes_terpilih?.id_faskes === faskes_item.id_faskes;
                const adalah_rumah_sakit =
                  faskes_item.kategori_faskes.toUpperCase().includes("RUMAH SAKIT");

                return (
                  <div
                    key={faskes_item.id_faskes}
                    onClick={() => set_faskes_terpilih(faskes_item)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer space-y-1.5 select-none ${
                      sedang_dipilih
                        ? "bg-teal-50/40 border-[#007E7A] shadow-sm ring-1 ring-[#007E7A]"
                        : "bg-white/80 border-slate-200/90 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        {/* Ikon Kategori Faskes */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                            adalah_rumah_sakit ? "bg-red-600" : "bg-[#007E7A]"
                          }`}
                        >
                          {adalah_rumah_sakit ? "H" : "+"}
                        </div>

                        <div className="min-w-0">
                          <h3
                            className={`text-xs font-extrabold leading-tight line-clamp-1 ${
                              sedang_dipilih
                                ? "text-[#007E7A]"
                                : "text-slate-900"
                            }`}
                          >
                            {faskes_item.nama_faskes}
                          </h3>
                          <p className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">
                            {faskes_item.jarak_km} • {faskes_item.waktu_tempuh}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition ${
                          sedang_dipilih
                            ? "text-[#007E7A] translate-x-0.5"
                            : "text-slate-400"
                        }`}
                      />
                    </div>

                    {/* Tag Status BPJS / IGD */}
                    <div className="flex items-center gap-1">
                      {faskes_item.status_bpjs && (
                        <span className="px-1 py-[1px] rounded bg-emerald-50 text-emerald-700 text-[8px] font-bold border border-emerald-200 leading-none">
                          BPJS
                        </span>
                      )}
                      {faskes_item.status_igd_24jam && (
                        <span className="px-1 py-[1px] rounded bg-rose-50 text-rose-700 text-[8px] font-bold border border-rose-200 leading-none">
                          UGD 24 Jam
                        </span>
                      )}
                    </div>

                    {/* Badge Poli di Kartu Lokasi Terdekat */}
                    <DaftarBadgePoli
                      daftar_poli={faskes_item.daftar_poli}
                      maksimal_tampil={2}
                      ukuran_badge="mikro"
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Info Pembaruan Lokasi */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[10px] text-slate-500 shrink-0">
            <Info className="w-3 h-3 text-[#007E7A] shrink-0" />
            <span>Data koordinat resmi GIS Pemkot &amp; Pemkab Bogor.</span>
          </div>
        </div>
      </aside>

      {/* Kartu Faskes Terpilih Mengambang di Bawah */}
      {faskes_terpilih && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-[540px]">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all">
            {/* Kiri: Ikon & Detail Faskes */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs text-white shadow-sm ${
                  faskes_terpilih.kategori_faskes.toUpperCase().includes("RUMAH SAKIT")
                    ? "bg-red-600"
                    : "bg-[#007E7A]"
                }`}
              >
                {faskes_terpilih.kategori_faskes.toUpperCase().includes("RUMAH SAKIT")
                  ? "H"
                  : "+"}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 leading-none mb-0.5">
                  <span className="text-[9px] font-extrabold text-[#007E7A] uppercase tracking-wider">
                    {faskes_terpilih.label_singkat_kategori.replace("\n", " ")}
                  </span>
                  {faskes_terpilih.status_bpjs && (
                    <span className="px-1 py-[1px] rounded bg-emerald-50 text-emerald-700 text-[8px] font-bold border border-emerald-200 leading-none">
                      BPJS
                    </span>
                  )}
                  {faskes_terpilih.status_igd_24jam && (
                    <span className="px-1 py-[1px] rounded bg-rose-50 text-rose-700 text-[8px] font-bold border border-rose-200 leading-none">
                      UGD 24 Jam
                    </span>
                  )}
                </div>

                <Link
                  href={`/faskes/${faskes_terpilih.slug_faskes}`}
                  className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-[#007E7A] transition line-clamp-1 block leading-snug"
                >
                  {faskes_terpilih.nama_faskes}
                </Link>

                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  <span className="truncate">{faskes_terpilih.alamat_lengkap}</span>
                </p>

                <div className="mt-1">
                  <DaftarBadgePoli
                    daftar_poli={faskes_terpilih.daftar_poli}
                    maksimal_tampil={2}
                    ukuran_badge="mikro"
                  />
                </div>
              </div>
            </div>

            {/* Kanan: Tombol Aksi Simpel (Rute, Detail, Tutup) */}
            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  faskes_terpilih.nama_faskes
                )},${faskes_terpilih.latitude},${faskes_terpilih.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-[#007E7A] hover:bg-[#006663] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
                title="Buka Rute di Google Maps"
              >
                <Navigation className="w-3 h-3" />
                <span>Rute</span>
              </a>

              <Link
                href={`/faskes/${faskes_terpilih.slug_faskes}`}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition"
                title="Lihat Detail Fasilitas"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Detail</span>
              </Link>

              <button
                type="button"
                onClick={() => set_faskes_terpilih(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Tutup Kartu"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
