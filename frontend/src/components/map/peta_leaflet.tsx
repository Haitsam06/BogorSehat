"use client";

import React, { useEffect, useRef, useState } from "react";
import type LType from "leaflet";
import { DataFaskesItem } from "@/data/data_faskes";
import { BOGOR_DEFAULT_CENTER, BOGOR_MAX_BOUNDS, isInsideBogor } from "@/data/data_wilayah";
import { useFaskes } from "@/context/FaskesContext";
import { getFaskesVisual } from "@/components/ui/faskes_thumbnail";

export interface GeoJsonLayerConfig {
  /** URL geojson (dari /public) */
  url: string;
  /** Nama kecamatan yang disorot (opsional) */
  sorotKecamatan?: string | null;
  /** Callback ketika user klik polygon kecamatan */
  onKecamatanClick?: (namaKecamatan: string) => void;
}

interface PetaLeafletProps {
  daftar_faskes: DataFaskesItem[];
  faskes_terpilih?: DataFaskesItem | null;
  zoom_awal?: number;
  tampilkan_legenda?: boolean;
  tampilkan_kontrol_kanan_atas?: boolean;
  tampilkan_kontrol_kanan_bawah?: boolean;
  tampilkan_radius?: boolean;
  radius_km?: number;
  saat_pilih_faskes?: (faskes_item: DataFaskesItem) => void;
  /** Config layer GeoJSON wilayah (opsional) */
  geojson_layers?: GeoJsonLayerConfig[];
  /** Fit peta ke bounding box ini saat mount atau saat nilai berubah */
  fit_bounds?: [[number, number], [number, number]] | null;
  /** Pusat default peta */
  pusat_awal?: [number, number];
  /** Batasi pergerakan peta ke wilayah Bogor */
  batasi_bogor?: boolean;
}

const MARKER_BATCH_SIZE = 60;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createMarkerIcon(
  L: typeof LType,
  faskes_item: DataFaskesItem,
  sedang_dipilih: boolean
): LType.DivIcon {
  const { hexColor, svgInner } = getFaskesVisual(faskes_item.kategori_faskes);
  const ukuran_pin = sedang_dipilih ? 40 : 34;
  const ukuran_ikon = sedang_dipilih ? 18 : 16;
  const size = 36;

  return L.divIcon({
    className: "pin_faskes_leaflet_wrapper",
    html: `
      <div class="faskes-marker-box ${sedang_dipilih ? "is-selected" : ""}" style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
      ">
        <!-- Titik Warna Lingkaran (Default: Ringan, Cepat, Tanpa Beban SVG) -->
        <div class="faskes-dot" style="
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: ${hexColor};
          border: 2px solid #ffffff;
          box-shadow: 0 1.5px 5px rgba(0,0,0,0.3);
          pointer-events: none;
        "></div>

        <!-- Ikon Pin Lingkaran (Hanya Ditampilkan Saat Hover atau Sedang Dipilih) -->
        <div class="faskes-hover-bubble" style="
          width: ${ukuran_pin}px;
          height: ${ukuran_pin}px;
          border-radius: 9999px;
          background: ${hexColor};
          color: #ffffff;
          display: none;
          align-items: center;
          justify-content: center;
          border: ${sedang_dipilih ? "3px solid #0f172a" : "2.5px solid #ffffff"};
          box-shadow: ${sedang_dipilih
        ? "0 6px 20px rgba(0,0,0,0.4)"
        : "0 4px 14px rgba(0,0,0,0.28)"
      };
          pointer-events: none;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="${ukuran_ikon}" height="${ukuran_ikon}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${svgInner}</svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function buildTooltipHtml(faskes_item: DataFaskesItem): string {
  return `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px;">
        <span style="font-size:9px;font-weight:800;color:#007E7A;text-transform:uppercase;">${escapeHtml(
    faskes_item.kategori_faskes
  )}</span>
        <span style="padding:1px 7px;border-radius:9999px;background:#FEF3C7;color:#92400E;font-size:10px;font-weight:800;">${escapeHtml(
    faskes_item.jarak_km
  )}</span>
      </div>
      <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:2px;">
        ${escapeHtml(faskes_item.nama_faskes)}
      </div>
      <div style="font-size:10px;color:#64748b;margin-bottom:6px;line-height:1.3;">
        ${escapeHtml(faskes_item.alamat_lengkap)}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${faskes_item.bpjs_status === "mendukung"
      ? `<span style="padding:2px 6px;border-radius:4px;background:#DCFCE7;color:#166534;font-size:9px;font-weight:800;">✓ BPJS Aktif</span>`
      : faskes_item.bpjs_status === "dalam_proses"
        ? `<span style="padding:2px 6px;border-radius:4px;background:#FEF3C7;color:#92400E;font-size:9px;font-weight:800;">Proses BPJS</span>`
        : `<span style="padding:2px 6px;border-radius:4px;background:#E2E8F0;color:#475569;font-size:9px;font-weight:800;">Non-BPJS</span>`
    }
        ${faskes_item.status_igd_24jam
      ? `<span style="padding:2px 6px;border-radius:4px;background:#FEE2E2;color:#991B1B;font-size:9px;font-weight:800;">✳ UGD 24 Jam</span>`
      : ""
    }
      </div>
    </div>
  `;
}

export default function PetaLeaflet({
  daftar_faskes,
  faskes_terpilih = null,
  zoom_awal = 13,
  tampilkan_legenda = false,
  tampilkan_kontrol_kanan_atas = false,
  tampilkan_kontrol_kanan_bawah = false,
  tampilkan_radius = false,
  radius_km = 5,
  saat_pilih_faskes,
  geojson_layers = [],
  fit_bounds = null,
  pusat_awal,
  batasi_bogor = false,
}: PetaLeafletProps) {
  const { lokasiPengguna, deteksiLokasiGPS } = useFaskes();
  const kontainer_peta_ref = useRef<HTMLDivElement | null>(null);
  const instansi_peta_ref = useRef<LType.Map | null>(null);
  const leaflet_lib_ref = useRef<typeof LType | null>(null);
  const grup_marker_ref = useRef<LType.LayerGroup | null>(null);
  const marker_pengguna_ref = useRef<LType.Marker | null>(null);
  const circle_radius_ref = useRef<LType.Circle | null>(null);
  // Refs untuk GeoJSON layers (supaya bisa diupdate tanpa reinit peta)
  const geojson_layer_refs = useRef<Map<string, LType.GeoJSON>>(new Map());

  const markersByIdRef = useRef<
    Map<number, { marker: LType.Marker; item: DataFaskesItem }>
  >(new Map());
  const prevSelectedIdRef = useRef<number | null>(null);
  const selectedIdRef = useRef<number | null>(
    faskes_terpilih?.id_faskes ?? null
  );
  const saatPilihFaskesRef = useRef(saat_pilih_faskes);

  selectedIdRef.current = faskes_terpilih?.id_faskes ?? null;
  saatPilihFaskesRef.current = saat_pilih_faskes;

  const [peta_siap, set_peta_siap] = useState(false);

  // Inisialisasi Peta Leaflet dengan Tile OpenStreetMap Tanpa Watermark
  useEffect(() => {
    let komponen_aktif = true;

    async function inisialisasi_leaflet() {
      if (!kontainer_peta_ref.current || instansi_peta_ref.current) return;
      const L = (await import("leaflet")).default;
      if (!komponen_aktif || !kontainer_peta_ref.current) return;

      leaflet_lib_ref.current = L;

      // Tentukan titik pusat awal
      const titik_pusat_awal: [number, number] = pusat_awal
        ? pusat_awal
        : faskes_terpilih
          ? [faskes_terpilih.latitude, faskes_terpilih.longitude]
          : isInsideBogor(lokasiPengguna.latitude, lokasiPengguna.longitude)
            ? [lokasiPengguna.latitude, lokasiPengguna.longitude]
            : BOGOR_DEFAULT_CENTER;

      const mapOptions: LType.MapOptions = {
        center: titik_pusat_awal,
        zoom: zoom_awal,
        zoomControl: false,
      };

      // Batasi pergerakan ke wilayah Bogor
      if (batasi_bogor) {
        mapOptions.maxBounds = BOGOR_MAX_BOUNDS;
        mapOptions.maxBoundsViscosity = 1.0;
        mapOptions.minZoom = 11;
      }

      const peta = L.map(kontainer_peta_ref.current, mapOptions);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        bounds: batasi_bogor ? BOGOR_MAX_BOUNDS : undefined,
      }).addTo(peta);

      const ikon_pengguna = L.divIcon({
        className: "pin_lokasi_pengguna",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="position:relative;width:26px;height:26px;border-radius:9999px;background:#007E7A;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,126,122,0.45);display:flex;align-items:center;justify-content:center;">
              <div style="width:8px;height:8px;border-radius:9999px;background:#ffffff;"></div>
            </div>
            <div style="margin-top:4px;padding:3px 10px;border-radius:9999px;background:#ffffff;color:#007E7A;font-size:10px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,0.12);border:1px solid #e2e8f0;white-space:nowrap;">
              Posisi Anda
            </div>
          </div>
        `,
        iconSize: [90, 48],
        iconAnchor: [45, 13],
      });

      const marker_pengguna = L.marker(
        [lokasiPengguna.latitude, lokasiPengguna.longitude],
        { icon: ikon_pengguna }
      ).addTo(peta);

      const koordinat_teks = `${lokasiPengguna.latitude.toFixed(5)}, ${lokasiPengguna.longitude.toFixed(5)}`;
      marker_pengguna.bindTooltip(
        `<div style="font-size:11px;font-weight:700;color:#0f172a;">Lokasi Anda Saat Ini</div>
         <div style="font-size:10px;color:#007E7A;font-weight:600;">${escapeHtml(
          lokasiPengguna.nama_jalan
        )} (${koordinat_teks})</div>`,
        {
          direction: "top",
          offset: [0, -10],
          className: "tooltip_faskes_custom",
        }
      );

      marker_pengguna_ref.current = marker_pengguna;

      if (tampilkan_radius && radius_km > 0) {
        circle_radius_ref.current = L.circle(
          [lokasiPengguna.latitude, lokasiPengguna.longitude],
          {
            radius: radius_km * 1000,
            color: "#007E7A",
            fillColor: "#007E7A",
            fillOpacity: 0.1,
            weight: 2,
            dashArray: "6, 6",
          }
        ).addTo(peta);
      }

      grup_marker_ref.current = L.layerGroup().addTo(peta);
      instansi_peta_ref.current = peta;
      set_peta_siap(true);

      // Fit ke fit_bounds jika disediakan
      if (fit_bounds) {
        peta.fitBounds(fit_bounds, { padding: [20, 20] });
      }
    }

    inisialisasi_leaflet();

    return () => {
      komponen_aktif = false;
      if (instansi_peta_ref.current) {
        instansi_peta_ref.current.remove();
        instansi_peta_ref.current = null;
      }
      leaflet_lib_ref.current = null;
      grup_marker_ref.current = null;
      markersByIdRef.current.clear();
      geojson_layer_refs.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === GeoJSON Layer Wilayah ===
  useEffect(() => {
    if (!peta_siap || !instansi_peta_ref.current) return;
    const peta = instansi_peta_ref.current;
    const L = leaflet_lib_ref.current;
    if (!L) return;
    // Capture non-null L untuk dipakai di dalam async function
    const LeafletLib = L;

    let aktif = true;

    async function muatGeojsonLayers() {
      // Hapus layer lama yang tidak ada di config baru
      const urlsBaru = new Set(geojson_layers.map((c) => c.url));
      for (const [url, layer] of geojson_layer_refs.current.entries()) {
        if (!urlsBaru.has(url)) {
          peta.removeLayer(layer);
          geojson_layer_refs.current.delete(url);
        }
      }

      for (const config of geojson_layers) {
        try {
          const res = await fetch(config.url);
          if (!aktif) return;
          const geojsonData = await res.json();
          if (!aktif) return;

          // Hapus layer lama untuk URL ini jika ada
          if (geojson_layer_refs.current.has(config.url)) {
            peta.removeLayer(geojson_layer_refs.current.get(config.url)!);
          }

          const layer = LeafletLib.geoJSON(geojsonData, {
            style: (feature) => {
              const namaKec: string = feature?.properties?.NAMOBJ ?? "";
              const disorot = config.sorotKecamatan
                ? namaKec.toLowerCase() === config.sorotKecamatan.toLowerCase()
                : false;

              return {
                fillColor: "#059669",
                fillOpacity: disorot ? 0.35 : 0.08,
                color: disorot ? "#047857" : "#059669",
                weight: disorot ? 2.5 : 1.2,
                opacity: 0.7,
              };
            },
            onEachFeature: (feature, lyr) => {
              const namaKec: string = feature?.properties?.NAMOBJ ?? "";
              if (namaKec) {
                lyr.bindTooltip(namaKec, {
                  permanent: false,
                  className: "tooltip_faskes_custom",
                  direction: "center",
                  sticky: true,
                });
              }

              lyr.on("click", () => {
                if (namaKec && config.onKecamatanClick) {
                  config.onKecamatanClick(namaKec);
                }
              });

              lyr.on("mouseover", () => {
                (lyr as LType.Path).setStyle({
                  fillColor: "#059669",
                  fillOpacity: 0.25,
                  weight: 2,
                  color: "#047857",
                });
              });

              lyr.on("mouseout", () => {
                const disorot = config.sorotKecamatan
                  ? namaKec.toLowerCase() === config.sorotKecamatan?.toLowerCase()
                  : false;
                (lyr as LType.Path).setStyle({
                  fillColor: "#059669",
                  fillOpacity: disorot ? 0.35 : 0.08,
                  weight: disorot ? 2.5 : 1.2,
                  color: disorot ? "#047857" : "#059669",
                });
              });
            },
          }).addTo(peta);

          geojson_layer_refs.current.set(config.url, layer);
        } catch {
          // ignore fetch error (offline / file tidak ada)
        }
      }
    }

    muatGeojsonLayers();

    return () => {
      aktif = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peta_siap, geojson_layers]);

  // === Fit bounds saat berubah (misal: pilih wilayah/kecamatan) ===
  useEffect(() => {
    if (!peta_siap || !instansi_peta_ref.current || !fit_bounds) return;
    instansi_peta_ref.current.flyToBounds(fit_bounds, {
      padding: [20, 20],
      duration: 0.6,
      maxZoom: fit_bounds[0][0] === fit_bounds[1][0] ? 14 : undefined,
    });
  }, [fit_bounds, peta_siap]);

  // Render poin-poin faskes secara bertahap per frame tanpa membangun HTML tooltip di awal.
  // Badge card tooltip baru dibuat secara lazy saat marker di-hover atau diklik.
  useEffect(() => {
    if (!peta_siap || !grup_marker_ref.current) return;

    let cancelled = false;
    let rafId: number | null = null;

    async function render_marker_faskes() {
      const L = leaflet_lib_ref.current ?? (await import("leaflet")).default;
      if (cancelled || !grup_marker_ref.current) return;

      const markerGroup = grup_marker_ref.current;
      markerGroup.clearLayers();
      markersByIdRef.current.clear();
      prevSelectedIdRef.current = null;

      const appendBatch = (startIndex: number) => {
        if (cancelled) return;
        const endIndex = Math.min(
          startIndex + MARKER_BATCH_SIZE,
          daftar_faskes.length
        );

        for (let i = startIndex; i < endIndex; i += 1) {
          const faskes_item = daftar_faskes[i];
          const sedang_dipilih =
            selectedIdRef.current === faskes_item.id_faskes;

          const marker_item = L.marker(
            [faskes_item.latitude, faskes_item.longitude],
            {
              icon: createMarkerIcon(L, faskes_item, sedang_dipilih),
              zIndexOffset: sedang_dipilih ? 500 : 0,
            }
          );

          const ensureTooltipBound = () => {
            if (!marker_item.getTooltip()) {
              marker_item.bindTooltip(buildTooltipHtml(faskes_item), {
                direction: "top",
                offset: [0, -20],
                opacity: 1,
                className: "tooltip_faskes_custom",
              });
            }
          };

          const handleFirstHover = () => {
            ensureTooltipBound();
            marker_item.off("mouseover", handleFirstHover);
            marker_item.openTooltip();
          };

          marker_item.on("mouseover", handleFirstHover);
          marker_item.on("click", () => {
            ensureTooltipBound();
            saatPilihFaskesRef.current?.(faskes_item);
            marker_item.openTooltip();
          });

          marker_item.addTo(markerGroup);
          markersByIdRef.current.set(faskes_item.id_faskes, {
            marker: marker_item,
            item: faskes_item,
          });

          if (sedang_dipilih) {
            prevSelectedIdRef.current = faskes_item.id_faskes;
          }
        }

        if (endIndex < daftar_faskes.length && !cancelled) {
          rafId = window.requestAnimationFrame(() => appendBatch(endIndex));
        }
      };

      appendBatch(0);
    }

    render_marker_faskes();

    return () => {
      cancelled = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [daftar_faskes, peta_siap]);

  // Perbarui hanya ikon marker yang dipilih/sebelumnya dipilih tanpa membuat ulang seluruh pin
  useEffect(() => {
    const L = leaflet_lib_ref.current;
    if (!peta_siap || !L) return;

    const prevId = prevSelectedIdRef.current;
    const nextId = faskes_terpilih?.id_faskes ?? null;
    if (prevId === nextId) return;

    if (prevId !== null) {
      const prevEntry = markersByIdRef.current.get(prevId);
      if (prevEntry) {
        prevEntry.marker.setIcon(createMarkerIcon(L, prevEntry.item, false));
        prevEntry.marker.setZIndexOffset(0);
      }
    }

    if (nextId !== null) {
      const nextEntry = markersByIdRef.current.get(nextId);
      if (nextEntry) {
        nextEntry.marker.setIcon(createMarkerIcon(L, nextEntry.item, true));
        nextEntry.marker.setZIndexOffset(500);
      }
    }

    prevSelectedIdRef.current = nextId;
  }, [faskes_terpilih, peta_siap]);

  // Perbarui pin posisi pengguna ketika lokasi GPS berubah
  useEffect(() => {
    if (!peta_siap || !marker_pengguna_ref.current || !instansi_peta_ref.current)
      return;

    marker_pengguna_ref.current.setLatLng([
      lokasiPengguna.latitude,
      lokasiPengguna.longitude,
    ]);

    const koordinat_teks = `${lokasiPengguna.latitude.toFixed(5)}, ${lokasiPengguna.longitude.toFixed(5)}`;
    marker_pengguna_ref.current.setTooltipContent(
      `<div style="font-size:11px;font-weight:700;color:#0f172a;">Lokasi Anda Saat Ini</div>
       <div style="font-size:10px;color:#007E7A;font-weight:600;">${escapeHtml(
        lokasiPengguna.nama_jalan
      )} (${koordinat_teks})</div>`
    );

    if (!faskes_terpilih) {
      instansi_peta_ref.current.flyTo(
        [lokasiPengguna.latitude, lokasiPengguna.longitude],
        14,
        { duration: 0.7 }
      );
    }
  }, [
    lokasiPengguna.latitude,
    lokasiPengguna.longitude,
    lokasiPengguna.nama_jalan,
    faskes_terpilih,
    peta_siap,
  ]);

  // Perbarui circle radius di peta saat lokasi atau radius_km berubah
  useEffect(() => {
    async function perbarui_circle_radius() {
      if (!peta_siap || !instansi_peta_ref.current) return;

      if (!tampilkan_radius || radius_km <= 0) {
        if (circle_radius_ref.current) {
          circle_radius_ref.current.remove();
          circle_radius_ref.current = null;
        }
        return;
      }

      if (circle_radius_ref.current) {
        circle_radius_ref.current.setLatLng([
          lokasiPengguna.latitude,
          lokasiPengguna.longitude,
        ]);
        circle_radius_ref.current.setRadius(radius_km * 1000);
      } else {
        const L = leaflet_lib_ref.current ?? (await import("leaflet")).default;
        if (!instansi_peta_ref.current) return;
        circle_radius_ref.current = L.circle(
          [lokasiPengguna.latitude, lokasiPengguna.longitude],
          {
            radius: radius_km * 1000,
            color: "#007E7A",
            fillColor: "#007E7A",
            fillOpacity: 0.1,
            weight: 2,
            dashArray: "6, 6",
          }
        ).addTo(instansi_peta_ref.current);
      }
    }

    perbarui_circle_radius();
  }, [
    lokasiPengguna.latitude,
    lokasiPengguna.longitude,
    radius_km,
    tampilkan_radius,
    peta_siap,
  ]);

  // Geser peta ke faskes_terpilih ketika berubah
  useEffect(() => {
    if (peta_siap && instansi_peta_ref.current && faskes_terpilih) {
      instansi_peta_ref.current.flyTo(
        [faskes_terpilih.latitude, faskes_terpilih.longitude],
        15,
        { duration: 0.5 }
      );
    }
  }, [faskes_terpilih, peta_siap]);

  const perbesar_peta = () => {
    instansi_peta_ref.current?.zoomIn();
  };

  const perkecil_peta = () => {
    instansi_peta_ref.current?.zoomOut();
  };

  const pusatkan_lokasi_pengguna = () => {
    deteksiLokasiGPS();
    instansi_peta_ref.current?.flyTo(
      [lokasiPengguna.latitude, lokasiPengguna.longitude],
      14,
      { duration: 0.7 }
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* CSS Khusus Penanda Faskes: Titik Ringan Default & Bubble Lingkaran Animasi Saat Hover */}
      <style>{`
        .pin_faskes_leaflet_wrapper {
          background: transparent !important;
          border: none !important;
        }
        .faskes-marker-box .faskes-dot {
          display: block;
        }
        .faskes-marker-box .faskes-hover-bubble {
          display: none;
        }
        /* Saat kursor diarahkan ke marker (hover): sembunyikan titik, tampilkan ikon lingkaran */
        .faskes-marker-box:hover .faskes-dot {
          display: none !important;
        }
        .faskes-marker-box:hover .faskes-hover-bubble {
          display: flex !important;
          animation: faskesPopAnim 0.16s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .pin_faskes_leaflet_wrapper:hover {
          z-index: 1000 !important;
        }
        /* Saat pin sedang dipilih di peta / sidebar */
        .faskes-marker-box.is-selected .faskes-dot {
          display: none !important;
        }
        .faskes-marker-box.is-selected .faskes-hover-bubble {
          display: flex !important;
        }
        .pin_faskes_leaflet_wrapper:has(.is-selected) {
          z-index: 850 !important;
        }
        @keyframes faskesPopAnim {
          0% {
            transform: scale(0.65);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <div ref={kontainer_peta_ref} className="w-full h-full z-0" />

      {/* Kontrol Zoom & Pusatkan Lokasi (Kanan Atas - Sesuai Beranda.png) */}
      {tampilkan_kontrol_kanan_atas && (
        <div className="absolute top-4 right-4 z-[400] bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col divide-y divide-slate-100">
          <button
            type="button"
            onClick={perbesar_peta}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold text-lg transition"
            title="Perbesar Peta"
          >
            +
          </button>
          <button
            type="button"
            onClick={perkecil_peta}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold text-lg transition"
            title="Perkecil Peta"
          >
            −
          </button>
          <button
            type="button"
            onClick={pusatkan_lokasi_pengguna}
            className="w-10 h-10 flex items-center justify-center text-[#007E7A] hover:bg-slate-50 text-sm font-bold transition"
            title="Pusatkan ke Posisi Anda"
          >
            ◎
          </button>
        </div>
      )}

      {/* Kontrol Zoom & Pusatkan Lokasi (Kanan Bawah - Sesuai Halaman Peta) */}
      {tampilkan_kontrol_kanan_bawah && (
        <div className="absolute bottom-28 right-6 z-[400] flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden flex flex-col divide-y divide-slate-100">
            <button
              type="button"
              onClick={perbesar_peta}
              className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold text-xl transition"
              title="Perbesar Peta (+)"
            >
              +
            </button>
            <button
              type="button"
              onClick={perkecil_peta}
              className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold text-xl transition"
              title="Perkecil Peta (−)"
            >
              −
            </button>
          </div>
          <button
            type="button"
            onClick={pusatkan_lokasi_pengguna}
            className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 text-[#007E7A] hover:bg-slate-50 flex items-center justify-center text-base font-bold transition"
            title="Pusatkan ke Lokasi Saya"
          >
            ◎
          </button>
        </div>
      )}

      {/* Legenda Peta Spasial */}
      {tampilkan_legenda && (
        <div className="absolute bottom-6 left-6 z-[400] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-3.5 space-y-2 text-xs">
          <div className="font-extrabold text-slate-900 flex items-center justify-between gap-4">
            <span>Legenda Peta Spasial</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-[#DC2626] inline-block shrink-0 shadow-xs" />
            <span>Rumah Sakit / IGD 24 Jam (H)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-[#007E7A] inline-block shrink-0 shadow-xs" />
            <span>Puskesmas / Klinik Pratama (+)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-[#D97706] inline-block shrink-0 shadow-xs" />
            <span>Apotek &amp; Lainnya</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-[#007E7A] border-2 border-white shadow-xs inline-block shrink-0" />
            <span>Posisi Anda ({lokasiPengguna.nama_jalan})</span>
          </div>
        </div>
      )}
    </div>
  );
}
