"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  PhoneCall,
  Mail,
  ShieldCheck,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { daftar_semua_poli } from "@/data/data_faskes";
import { BadgePoli } from "@/components/ui/badge_poli";

export default function FooterUtama() {
  const path_aktif = usePathname();

  // Hanya tampilkan footer di halaman beranda (/)
  if (path_aktif !== "/") {
    return null;
  }

  const poli_populer = daftar_semua_poli.slice(0, 6);

  return (
    <footer className="bg-white border-t border-slate-200/90 mt-auto">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-14 pb-24 md:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-slate-100">
          {/* Kolom 1: Identitas Bogor Sehat (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/images/logo-bogorsehat.png"
                alt="Bogor Sehat"
                className="h-11 w-auto object-contain"
              />
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed pr-2">
              Portal WebGIS Direktori Fasilitas Kesehatan &amp; Sistem Rekomendasi
              Rujukan Berbasis Spasial untuk masyarakat Kota Bogor dan Kabupaten
              Bogor.
            </p>
          </div>

          {/* Kolom 2: Navigasi Utama (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Menu Utama
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#007E7A] font-medium transition"
                >
                  Beranda Utama
                </Link>
              </li>
              <li>
                <Link
                  href="/peta"
                  className="hover:text-[#007E7A] font-medium transition"
                >
                  Peta Faskes
                </Link>
              </li>
              <li>
                <Link
                  href="/cari-faskes"
                  className="hover:text-[#007E7A] font-medium transition"
                >
                  Cari &amp; Filter Faskes
                </Link>
              </li>
              <li>
                <Link
                  href="/faskes/rsud-kota-bogor"
                  className="hover:text-[#007E7A] font-medium transition"
                >
                  Detail RS Rujukan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak & Darurat Medis (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Pusat Layanan &amp; Darurat
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#007E7A] shrink-0 mt-0.5" />
                <span>
                  Jl. Kesehatan No.3, Tanah Sareal, Kota Bogor, Jawa Barat 16161
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>
                  Darurat PSC 119 / IGD:{" "}
                  <strong className="text-slate-900">(0251) 8312292</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#007E7A] shrink-0" />
                <span>dinkes@kotabogor.go.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Baris Hak Cipta Bawah */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            &copy; 2026{" "}
            <strong className="text-slate-700">
              Bogor Sehat — Dinas Kesehatan Kota &amp; Kabupaten Bogor
            </strong>
            . Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}

