"use client";

import React, { useEffect, useRef, useState } from "react";
import type LType from "leaflet";
import { DataFaskesItem, lokasi_default_pengguna } from "@/data/data_faskes";

interface PetaLeafletProps {
  daftar_faskes: DataFaskesItem[];
  faskes_terpilih?: DataFaskesItem | null;
  zoom_awal?: number;
  tampilkan_legenda?: boolean;
  tampilkan_kontrol_kanan_atas?: boolean;
  tampilkan_kontrol_kanan_bawah?: boolean;
  saat_pilih_faskes?: (faskes_item: DataFaskesItem) => void;
}

export default function PetaLeaflet({
  daftar_faskes,
  faskes_terpilih = null,
  zoom_awal = 13,
  tampilkan_legenda = false,
  tampilkan_kontrol_kanan_atas = false,
  tampilkan_kontrol_kanan_bawah = false,
  saat_pilih_faskes,
}: PetaLeafletProps) {
  const kontainer_peta_ref = useRef<HTMLDivElement | null>(null);
  const instansi_peta_ref = useRef<LType.Map | null>(null);
  const grup_marker_ref = useRef<LType.LayerGroup | null>(null);
  const [peta_siap, set_peta_siap] = useState(false);

  // Inisialisasi Peta Leaflet dengan Tile OpenStreetMap Tanpa Watermark
  useEffect(() => {
    let komponen_aktif = true;

    async function inisialisasi_leaflet() {
      if (!kontainer_peta_ref.current || instansi_peta_ref.current) return;
      const L = (await import("leaflet")).default;
      if (!komponen_aktif || !kontainer_peta_ref.current) return;

      const titik_pusat_awal: [number, number] = faskes_terpilih
        ? [faskes_terpilih.latitude, faskes_terpilih.longitude]
        : [
            lokasi_default_pengguna.latitude,
            lokasi_default_pengguna.longitude,
          ];

      const peta = L.map(kontainer_peta_ref.current, {
        center: titik_pusat_awal,
        zoom: zoom_awal,
        zoomControl: false,
      });

      // Menggunakan Tile OpenStreetMap Standar Resmi (Bebas Watermark & Gratis)
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(peta);

      // Tambahkan Pin Posisi Pengguna ("Posisi Anda")
      const ikon_pengguna = L.divIcon({
        className: "pin_lokasi_pengguna",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="position:relative;width:26px;height:26px;border-radius:9999px;background:#007E7A;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,126,122,0.45);display:flex;align-items:center;justify-content:center;">
              <div style="width:8px;height:8px;border-radius:9999px;background:#ffffff;"></div>
            </div>
            <div style="margin-top:4px;padding:3px 10px;border-radius:9999px;background:#ffffff;color:#007E7A;font-size:10px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,0.12);border:1px solid #e2e8f0;white-space:nowrap;">
              📍 Posisi Anda
            </div>
          </div>
        `,
        iconSize: [90, 48],
        iconAnchor: [45, 13],
      });

      const marker_pengguna = L.marker(
        [lokasi_default_pengguna.latitude, lokasi_default_pengguna.longitude],
        { icon: ikon_pengguna }
      ).addTo(peta);

      marker_pengguna.bindTooltip(
        `<div style="font-size:11px;font-weight:700;color:#0f172a;">Lokasi Anda Saat Ini</div>
         <div style="font-size:10px;color:#007E7A;font-weight:600;">${lokasi_default_pengguna.nama_jalan} (${lokasi_default_pengguna.koordinat_teks})</div>`,
        {
          direction: "top",
          offset: [0, -10],
          className: "tooltip_faskes_custom",
        }
      );

      grup_marker_ref.current = L.layerGroup().addTo(peta);
      instansi_peta_ref.current = peta;
      set_peta_siap(true);
    }

    inisialisasi_leaflet();

    return () => {
      komponen_aktif = false;
      if (instansi_peta_ref.current) {
        instansi_peta_ref.current.remove();
        instansi_peta_ref.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render Pin Faskes & Tooltip yang Menampilkan Badge Poli
  useEffect(() => {
    async function render_marker_faskes() {
      if (!peta_siap || !grup_marker_ref.current || !instansi_peta_ref.current)
        return;
      const L = (await import("leaflet")).default;

      grup_marker_ref.current.clearLayers();

      daftar_faskes.forEach((faskes_item) => {
        const sedang_dipilih =
          faskes_terpilih?.id_faskes === faskes_item.id_faskes;
        const adalah_rumah_sakit =
          faskes_item.kategori_faskes.includes("RUMAH SAKIT");

        const warna_pin = adalah_rumah_sakit ? "#DC2626" : "#007E7A";
        const simbol_pin = adalah_rumah_sakit ? "H" : "+";
        const ukuran_pin = sedang_dipilih ? 40 : 34;

        const ikon_faskes = L.divIcon({
          className: "pin_faskes_leaflet",
          html: `
            <div style="
              width:${ukuran_pin}px;
              height:${ukuran_pin}px;
              border-radius:${adalah_rumah_sakit ? "9999px" : "12px"};
              background:${warna_pin};
              color:#ffffff;
              font-weight:900;
              font-size:${sedang_dipilih ? "16px" : "14px"};
              display:flex;
              align-items:center;
              justify-content:center;
              border:${sedang_dipilih ? "3px solid #0f172a" : "2.5px solid #ffffff"};
              box-shadow:${
                sedang_dipilih
                  ? "0 6px 18px rgba(0,0,0,0.35)"
                  : "0 3px 10px rgba(0,0,0,0.22)"
              };
              cursor:pointer;
              transition:transform 0.2s ease;
            ">
              ${simbol_pin}
            </div>
          `,
          iconSize: [ukuran_pin, ukuran_pin],
          iconAnchor: [ukuran_pin / 2, ukuran_pin / 2],
        });

        // Susun HTML Badge Poli untuk di dalam Tooltip Pin
        const html_badge_poli = faskes_item.daftar_poli
          .slice(0, 4)
          .map(
            (nama_poli) =>
              `<span style="display:inline-block;padding:2px 7px;margin:2px 3px 2px 0;border-radius:9999px;background:#E6F4F3;color:#007E7A;border:1px solid #BCE3E0;font-size:10px;font-weight:700;">${nama_poli}</span>`
          )
          .join("");

        const html_sisa_poli =
          faskes_item.daftar_poli.length > 4
            ? `<span style="display:inline-block;padding:2px 6px;margin:2px 0;border-radius:9999px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:700;">+${
                faskes_item.daftar_poli.length - 4
              } Poli</span>`
            : "";

        const html_tooltip = `
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px;">
              <span style="font-size:9px;font-weight:800;color:#007E7A;text-transform:uppercase;">${
                faskes_item.kategori_faskes
              }</span>
              <span style="padding:1px 7px;border-radius:9999px;background:#FEF3C7;color:#92400E;font-size:10px;font-weight:800;">${
                faskes_item.jarak_km
              }</span>
            </div>
            <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:2px;">
              ${faskes_item.nama_faskes}
            </div>
            <div style="font-size:10px;color:#64748b;margin-bottom:6px;line-height:1.3;">
              ${faskes_item.alamat_lengkap}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">
              ${
                faskes_item.status_bpjs
                  ? `<span style="padding:2px 6px;border-radius:4px;background:#DCFCE7;color:#166534;font-size:9px;font-weight:800;">✓ BPJS Aktif</span>`
                  : ""
              }
              ${
                faskes_item.status_igd_24jam
                  ? `<span style="padding:2px 6px;border-radius:4px;background:#FEE2E2;color:#991B1B;font-size:9px;font-weight:800;">✳ UGD 24 Jam</span>`
                  : ""
              }
            </div>
            <div style="border-top:1px solid #f1f5f9;padding-top:6px;">
              <div style="font-size:9px;font-weight:700;color:#94a3b8;margin-bottom:3px;">LAYANAN POLI:</div>
              <div>${html_badge_poli}${html_sisa_poli}</div>
            </div>
          </div>
        `;

        const marker_item = L.marker(
          [faskes_item.latitude, faskes_item.longitude],
          { icon: ikon_faskes }
        );

        marker_item.bindTooltip(html_tooltip, {
          direction: "top",
          offset: [0, -18],
          opacity: 1,
          className: "tooltip_faskes_custom",
        });

        marker_item.on("click", () => {
          if (saat_pilih_faskes) {
            saat_pilih_faskes(faskes_item);
          }
          marker_item.openTooltip();
        });

        marker_item.addTo(grup_marker_ref.current!);
      });
    }

    render_marker_faskes();
  }, [daftar_faskes, faskes_terpilih, peta_siap, saat_pilih_faskes]);

  // Geser peta ke faskes_terpilih ketika berubah
  useEffect(() => {
    if (peta_siap && instansi_peta_ref.current && faskes_terpilih) {
      instansi_peta_ref.current.flyTo(
        [faskes_terpilih.latitude, faskes_terpilih.longitude],
        15,
        { duration: 0.7 }
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
    instansi_peta_ref.current?.flyTo(
      [lokasi_default_pengguna.latitude, lokasi_default_pengguna.longitude],
      14,
      { duration: 0.7 }
    );
  };

  return (
    <div className="relative w-full h-full">
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
            <span className="w-3 h-3 rounded-full bg-[#DC2626] inline-block shrink-0" />
            <span>Rumah Sakit / IGD 24 Jam (H)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-3 h-3 rounded-md bg-[#007E7A] inline-block shrink-0" />
            <span>Puskesmas / Klinik Pratama (+)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-[#007E7A] border-2 border-white shadow-sm inline-block shrink-0" />
            <span>Posisi Anda (Jl. Padjajaran)</span>
          </div>
        </div>
      )}
    </div>
  );
}
