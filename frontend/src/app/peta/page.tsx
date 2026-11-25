"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Navigation,
  X,
  ExternalLink,
  Loader2,
  Radar,
  SlidersHorizontal,
  Building2,
} from "lucide-react";
import type { DataFaskesItem } from "@/data/data_faskes";
import { lokasi_default_pengguna } from "@/data/data_faskes";
import {
  DATA_WILAYAH,
  BOGOR_DEFAULT_CENTER,
  BOGOR_DEFAULT_ZOOM,
  isInsideBogor,
} from "@/data/data_wilayah";
import { getFaskesVisual } from "@/components/ui/faskes_thumbnail";
import PetaLeaflet from "@/components/map/peta_leaflet";
import FilterWilayah, {
  FilterWilayahValue,
} from "@/components/map/FilterWilayah";
import { SearchInput } from "@/components/ui/SearchInput";
import { api, mapApiFaskesToItem, messageFromError } from "@/lib/api";
import { useFaskes } from "@/context/FaskesContext";

function hitungJarakKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const SIDEBAR_BATCH_SIZE = 30;

export default function PetaInteraktifPage() {
  const { lokasiPengguna } = useFaskes();
  const [daftarFaskes, setDaftarFaskes] = useState<DataFaskesItem[]>([]);
  const [pesanKesalahan, setPesanKesalahan] = useState<string | null>(null);
  const [kata_kunci_lokasi, set_kata_kunci_lokasi] = useState("");
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [hanyaDalamRadius, setHanyaDalamRadius] = useState<boolean>(false);
  const [faskes_terpilih, set_faskes_terpilih] = useState<DataFaskesItem | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [jumlahTampilSidebar, setJumlahTampilSidebar] = useState(SIDEBAR_BATCH_SIZE);
  const [tampilFilter, setTampilFilter] = useState(false);

  // State filter wilayah
  const [filterWilayah, setFilterWilayah] = useState<FilterWilayahValue>({
    wilayahId: null,
    kecamatan: null,
  });

  // Ambil data faskes dari API
  useEffect(() => {
    let aktif = true;

    async function muatPeta() {
      setSedangMemuat(true);
      try {
        const lat = lokasiPengguna.latitude || lokasi_default_pengguna.latitude;
        const lng = lokasiPengguna.longitude || lokasi_default_pengguna.longitude;

        const res = await api.getNearbyFaskes(lat, lng, 50, { compact: true });

        if (aktif && res && res.length > 0) {
          const mapped = res.map((f, i) => mapApiFaskesToItem(f, i));
          setDaftarFaskes(mapped);
          set_faskes_terpilih(mapped[0]);
        }
      } catch (err) {
        if (aktif) {
          setPesanKesalahan(
            messageFromError(err, "Gagal memuat titik faskes dari server.")
          );
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

  // Hitung apakah pengguna di luar Bogor
  const diluarBogor = useMemo(() => {
    const lat = lokasiPengguna.latitude;
    const lng = lokasiPengguna.longitude;
    // Gunakan titik default jika belum ada GPS (tidak dianggap di luar)
    if (lat === lokasi_default_pengguna.latitude && lng === lokasi_default_pengguna.longitude) return false;
    return !isInsideBogor(lat, lng);
  }, [lokasiPengguna.latitude, lokasiPengguna.longitude]);

  // Saring daftar faskes
  const daftar_faskes_terfilter = useMemo(() => {
    // Jika wilayah dipilih tapi belum memilih kecamatan (dan bukan "SEMUA"),
    // jangan langsung render semua faskes dulu agar peta tidak penuh
    if (filterWilayah.wilayahId && !filterWilayah.kecamatan) {
      return [];
    }

    const query = kata_kunci_lokasi.trim().toLowerCase();

    return daftarFaskes.filter((faskes_item) => {
      // Filter radius
      if (hanyaDalamRadius) {
        const jarak = hitungJarakKm(
          lokasiPengguna.latitude,
          lokasiPengguna.longitude,
          faskes_item.latitude,
          faskes_item.longitude
        );
        if (jarak > radiusKm) return false;
      }

      // Filter kecamatan / wilayah dari GeoJSON
      if (filterWilayah.wilayahId) {
        if (filterWilayah.kecamatan && filterWilayah.kecamatan !== "SEMUA") {
          if (
            faskes_item.kecamatan.toLowerCase() !==
            filterWilayah.kecamatan.toLowerCase()
          ) {
            return false;
          }
        } else if (filterWilayah.kecamatan === "SEMUA") {
          const wilayah = DATA_WILAYAH.find((w) => w.id === filterWilayah.wilayahId);
          if (wilayah) {
            const kecamatanLower = wilayah.kecamatan.map((k) => k.toLowerCase());
            if (!kecamatanLower.includes(faskes_item.kecamatan.toLowerCase())) {
              return false;
            }
          }
        }
      }

      // Filter kata kunci
      if (!query) return true;
      return (
        faskes_item.nama_faskes.toLowerCase().includes(query) ||
        faskes_item.alamat_lengkap.toLowerCase().includes(query) ||
        faskes_item.kecamatan.toLowerCase().includes(query) ||
        faskes_item.kategori_faskes.toLowerCase().includes(query) ||
        faskes_item.daftar_poli.some((poli) => poli.toLowerCase().includes(query))
      );
    });
  }, [
    kata_kunci_lokasi,
    daftarFaskes,
    hanyaDalamRadius,
    radiusKm,
    lokasiPengguna.latitude,
    lokasiPengguna.longitude,
    filterWilayah,
  ]);

  const tanganiPilihFaskes = useCallback((item_dipilih: DataFaskesItem) => {
    set_faskes_terpilih(item_dipilih);
    setTampilFilter(false);
  }, []);

  useEffect(() => {
    setJumlahTampilSidebar(SIDEBAR_BATCH_SIZE);
  }, [daftar_faskes_terfilter]);

  const daftarSidebarTampil = useMemo(
    () => daftar_faskes_terfilter.slice(0, jumlahTampilSidebar),
    [daftar_faskes_terfilter, jumlahTampilSidebar]
  );

  const tanganiScrollSidebar = (e: React.UIEvent<HTMLDivElement>) => {
    if (jumlahTampilSidebar >= daftar_faskes_terfilter.length) return;
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
      setJumlahTampilSidebar((prev) =>
        Math.min(prev + SIDEBAR_BATCH_SIZE, daftar_faskes_terfilter.length)
      );
    }
  };

  // Reset pilihan faskes saat berpindah wilayah tapi belum memilih kecamatan
  useEffect(() => {
    if (filterWilayah.wilayahId && !filterWilayah.kecamatan) {
      set_faskes_terpilih(null);
    }
  }, [filterWilayah.wilayahId, filterWilayah.kecamatan]);

  // Hitung bounds dan GeoJSON layers berdasarkan filter aktif
  const { fitBounds, geojsonLayers } = useMemo(() => {
    const wilayah = DATA_WILAYAH.find((w) => w.id === filterWilayah.wilayahId);

    if (!wilayah) {
      return { fitBounds: null, geojsonLayers: [] };
    }

    // Hanya muat layer GeoJSON wilayah terpilih (tidak memuat seluruh peta/wilayah lain)
    const layers = [
      {
        url: wilayah.geojsonFile,
        sorotKecamatan:
          filterWilayah.kecamatan && filterWilayah.kecamatan !== "SEMUA"
            ? filterWilayah.kecamatan
            : undefined,
        onKecamatanClick: (namaKec: string) => {
          setFilterWilayah((prev) => ({
            ...prev,
            kecamatan:
              prev.kecamatan?.toLowerCase() === namaKec.toLowerCase()
                ? null
                : namaKec,
          }));
        },
      },
    ];

    return {
      fitBounds: wilayah.bounds as [[number, number], [number, number]],
      geojsonLayers: layers,
    };
  }, [filterWilayah]);

  // Pusat default
  const pusatAwal: [number, number] = BOGOR_DEFAULT_CENTER;

  return (
    <div className="relative w-full h-[calc(100dvh-76px)] max-h-[calc(100dvh-76px)] overflow-hidden select-none bg-[#E8EEF2]">
      {pesanKesalahan && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-800 shadow-sm">
          {pesanKesalahan}
        </div>
      )}

      {/* Badge Luar Wilayah */}
      {diluarBogor && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800 shadow-sm flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          <span>Anda berada di luar wilayah Bogor</span>
        </div>
      )}

      {/* Peta Leaflet */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <PetaLeaflet
          daftar_faskes={daftar_faskes_terfilter}
          faskes_terpilih={faskes_terpilih}
          zoom_awal={BOGOR_DEFAULT_ZOOM}
          tampilkan_kontrol_kanan_bawah={true}
          tampilkan_radius={hanyaDalamRadius}
          radius_km={radiusKm}
          saat_pilih_faskes={tanganiPilihFaskes}
          geojson_layers={geojsonLayers}
          fit_bounds={fitBounds}
          pusat_awal={pusatAwal}
          batasi_bogor={true}
        />
      </div>

      {/* Panel Kiri Sidebar */}
      <aside className="hidden lg:flex absolute top-3 left-3 bottom-3 z-20 w-[300px] bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-white/80 p-3 flex-col justify-between overflow-hidden">
        <div className="flex flex-col h-full min-h-0 space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between pt-0.5 shrink-0">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                <span>Peta Faskes</span>
                {sedangMemuat && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#007E7A]" />
                )}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                {filterWilayah.wilayahId && !filterWilayah.kecamatan
                  ? "Pilih kecamatan di peta"
                  : `${daftar_faskes_terfilter.length} faskes terpetakan`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTampilFilter((v) => !v)}
              title="Tampilkan panel filter"
              className={`p-1.5 rounded-lg transition ${
                tampilFilter || filterWilayah.wilayahId
                  ? "bg-[#007E7A] text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Panel Filter (toggle) */}
          {tampilFilter ? (
            <div className="space-y-2.5 shrink-0">
              {/* Filter Wilayah */}
              <FilterWilayah
                value={filterWilayah}
                onChange={setFilterWilayah}
              />

              {/* Radius */}
              <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Radar className="w-3.5 h-3.5 text-[#007E7A]" />
                    <span>Radius Circle</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#007E7A]/10 text-[#007E7A] text-[10px] font-extrabold">
                    {radiusKm} km
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#007E7A]"
                />

                <div className="flex items-center justify-between gap-1">
                  {[1, 3, 5, 10, 20].map((nilai) => (
                    <button
                      key={nilai}
                      type="button"
                      onClick={() => setRadiusKm(nilai)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition ${
                        radiusKm === nilai
                          ? "bg-[#007E7A] text-white shadow-sm"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {nilai}km
                    </button>
                  ))}
                </div>

                <label className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70 cursor-pointer">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Hanya dalam radius
                  </span>
                  <input
                    type="checkbox"
                    checked={hanyaDalamRadius}
                    onChange={(e) => setHanyaDalamRadius(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-[#007E7A]"
                  />
                </label>
              </div>
            </div>
          ) : (
            /* Pencarian + badge aktif filter */
            <div className="shrink-0 space-y-2">
              <SearchInput
                value={kata_kunci_lokasi}
                onChange={set_kata_kunci_lokasi}
                placeholder="Cari faskes, poli, alamat..."
                className="!h-9 bg-slate-100/90 text-xs border border-slate-200/80 focus:border-[#007E7A] focus:ring-[#007E7A]/25"
                containerClassName="shrink-0"
              />
              {filterWilayah.wilayahId && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold text-[#047857] bg-emerald-50 border border-emerald-200/60 rounded-full px-2 py-0.5 flex items-center gap-1">
                    {filterWilayah.kecamatan === "SEMUA"
                      ? `Semua Kec. (${DATA_WILAYAH.find((w) => w.id === filterWilayah.wilayahId)?.nama})`
                      : filterWilayah.kecamatan
                      ? `Kec. ${filterWilayah.kecamatan}`
                      : `${DATA_WILAYAH.find((w) => w.id === filterWilayah.wilayahId)?.nama} (Pilih Kec.)`}
                    <button
                      type="button"
                      onClick={() => setFilterWilayah({ wilayahId: null, kecamatan: null })}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Daftar Kartu Faskes */}
          <div
            onScroll={tanganiScrollSidebar}
            className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0"
          >
            {filterWilayah.wilayahId && !filterWilayah.kecamatan ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center space-y-2.5 my-2">
                <div className="w-8 h-8 rounded-xl bg-[#059669] text-white flex items-center justify-center mx-auto shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">
                    Pilih Kecamatan di {DATA_WILAYAH.find((w) => w.id === filterWilayah.wilayahId)?.nama}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Klik salah satu bidang wilayah kecamatan pada peta atau pilih dari dropdown untuk melihat faskes.
                  </p>
                </div>
              </div>
            ) : sedangMemuat ? (
              <div className="py-12 px-4 text-center text-slate-400 space-y-2.5">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#007E7A]" />
                <p className="text-xs font-semibold text-slate-600">
                  Memuat data faskes...
                </p>
              </div>
            ) : daftar_faskes_terfilter.length === 0 ? (
              <div className="p-5 text-center text-slate-400 space-y-1.5">
                <Building2 className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs font-medium">
                  Tidak ada faskes yang cocok.
                </p>
              </div>
            ) : (
              <>
                {daftarSidebarTampil.map((faskes_item) => {
                  const sedang_dipilih =
                    faskes_terpilih?.id_faskes === faskes_item.id_faskes;
                  const { iconBgClass, Icon } = getFaskesVisual(
                    faskes_item.kategori_faskes
                  );

                  return (
                    <div
                      key={faskes_item.id_faskes}
                      onClick={() => tanganiPilihFaskes(faskes_item)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer space-y-1.5 select-none ${
                        sedang_dipilih
                          ? "bg-teal-50/40 border-[#007E7A] shadow-sm ring-1 ring-[#007E7A]"
                          : "bg-white/80 border-slate-200/90 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${iconBgClass}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          <div className="min-w-0">
                            <h3
                              className={`text-xs font-extrabold leading-tight line-clamp-1 ${
                                sedang_dipilih ? "text-[#007E7A]" : "text-slate-900"
                              }`}
                            >
                              {faskes_item.nama_faskes}
                            </h3>
                            <p className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">
                              {faskes_item.jarak_km} • {faskes_item.kecamatan}
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

                      <div className="flex items-center gap-1">
                        {faskes_item.status_bpjs && (
                          <span className="px-1 py-[1px] rounded bg-emerald-50 text-emerald-700 text-[8px] font-bold border border-emerald-200 leading-none">
                            BPJS
                          </span>
                        )}
                        {faskes_item.status_igd_24jam && (
                          <span className="px-1 py-[1px] rounded bg-rose-50 text-rose-700 text-[8px] font-bold border border-rose-200 leading-none">
                            UGD 24J
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {jumlahTampilSidebar < daftar_faskes_terfilter.length && (
                  <button
                    type="button"
                    onClick={() =>
                      setJumlahTampilSidebar((prev) =>
                        Math.min(prev + SIDEBAR_BATCH_SIZE, daftar_faskes_terfilter.length)
                      )
                    }
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition"
                  >
                    Muat lebih ({daftarSidebarTampil.length}/{daftar_faskes_terfilter.length})
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Kartu Faskes Terpilih Mengambang */}
      {faskes_terpilih && (
        <div className="absolute bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-[540px]">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {(() => {
                const { iconBgClass, Icon } = getFaskesVisual(faskes_terpilih.kategori_faskes);
                return (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm ${iconBgClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                );
              })()}

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
                      UGD 24J
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
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(faskes_terpilih.nama_faskes)},${faskes_terpilih.latitude},${faskes_terpilih.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-[#007E7A] hover:bg-[#006663] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
              >
                <Navigation className="w-3 h-3" />
                <span>Rute</span>
              </a>

              <Link
                href={`/faskes/${faskes_terpilih.slug_faskes}`}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Detail</span>
              </Link>

              <button
                type="button"
                onClick={() => set_faskes_terpilih(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
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
