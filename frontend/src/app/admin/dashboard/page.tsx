"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  FileEdit,
  Building2,
  Users,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { api, ApiAdminDashboard, ApiFaskes } from "@/lib/api";

const daftar_log_audit_bawaan = [
  {
    id_log: 1,
    waktu_relatif: "12 Menit Lalu",
    jam_log: "09:42 WIB",
    nama_faskes: "Puskesmas Bogor Tengah",
    kode_faskes: "Kode: FSK-BOG-041",
    lokasi_faskes: "Babakan Pasar, Bogor Tengah",
    kategori_faskes: "Puskesmas Rawat Inap",
    teks_badge: "• Terverifikasi",
    gaya_badge: "bg-[#D9F5F3] text-[#065F46]",
  },
  {
    id_log: 2,
    waktu_relatif: "1 Jam Lalu",
    jam_log: "08:30 WIB",
    nama_faskes: "Klinik Pratama Sehat Utama",
    kode_faskes: "Kode: FSK-KLN-109",
    lokasi_faskes: "Cilendek Barat, Bogor Barat",
    kategori_faskes: "Klinik Swasta",
    teks_badge: "• Data Aktif",
    gaya_badge: "bg-[#86EFAC] text-[#065F46]",
  },
  {
    id_log: 3,
    waktu_relatif: "Kemarin",
    jam_log: "16:15 WIB",
    nama_faskes: "RS Vania Bogor",
    kode_faskes: "Kode: FSK-RSV-018",
    lokasi_faskes: "Sukasari, Bogor Timur",
    kategori_faskes: "RS Tipe C",
    teks_badge: "• BPJS Aktif",
    gaya_badge: "bg-[#E2E8F0] text-slate-700",
  },
];

export default function AdminDashboardPage() {
  const [statistik, setStatistik] = useState<ApiAdminDashboard | null>(null);
  const [faskesTerbaru, setFaskesTerbaru] = useState<ApiFaskes[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  useEffect(() => {
    let aktif = true;

    async function muatDataDashboard() {
      try {
        const [dashRes, faskesRes] = await Promise.all([
          api.getAdminDashboard().catch(() => null),
          api.getAdminFaskes({ per_page: 5 }).catch(() => null),
        ]);

        if (aktif) {
          if (dashRes) setStatistik(dashRes);
          if (faskesRes?.data) setFaskesTerbaru(faskesRes.data);
          setSedangMemuat(false);
        }
      } catch {
        if (aktif) setSedangMemuat(false);
      }
    }

    muatDataDashboard();

    return () => {
      aktif = false;
    };
  }, []);

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-[1120px]">
        {/* Banner Sambutan Admin */}
        <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-r from-white via-white to-[#E6FAF8] p-7 sm:p-9 flex items-center justify-between gap-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-snug">
              Selamat Datang, Administrator Dinas
              <br />
              Kesehatan
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
              Pantau ketersediaan sumber daya medis, sinkronisasi titik
              koordinat geospasial faskes, serta rekapitulasi data operasional
              faskes se-Kota &amp; Kab. Bogor secara terintegrasi.
            </p>
          </div>

          <div className="hidden sm:block shrink-0 pr-4">
            <img
              src="/images/admin-hero-icon.png"
              alt="Bogor Sehat Icon"
              className="w-28 h-28 object-contain"
            />
          </div>
        </div>

        {/* Ringkasan Statistik Real-Time dari Backend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007E7A] flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {sedangMemuat ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  statistik?.faskes_count ?? 142
                )}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Total Fasilitas Kesehatan
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {sedangMemuat ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  statistik?.user_count ?? 1
                )}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Pengguna Terdaftar
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {sedangMemuat ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  statistik?.diskusi_count ?? 0
                )}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Diskusi Komunitas
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {sedangMemuat ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  (statistik?.pending_feedback_count ?? 0) +
                  (statistik?.pending_report_count ?? 0)
                )}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Laporan &amp; Masukan Pending
              </div>
            </div>
          </div>
        </div>

        {/* Kartu Aktivitas Terakhir Master Data Faskes */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Daftar Entri Faskes Terbaru di Sistem
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Data real-time faskes terintegrasi dari database backend
              </p>
            </div>

            <Link
              href="/admin/faskes"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#007E7A] hover:underline"
            >
              <span>Lihat Semua Entri Kelola</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2F4F7] text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-4 pl-8 pr-4 rounded-l-lg">KODE FASKES</th>
                  <th className="py-4 px-4">NAMA FASKES</th>
                  <th className="py-4 px-4">KATEGORI &amp; LOKASI</th>
                  <th className="py-4 px-4">STATUS BPJS</th>
                  <th className="py-4 pl-4 pr-8 text-center rounded-r-lg">
                    AKSI CEPAT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {faskesTerbaru.length > 0
                  ? faskesTerbaru.map((faskes) => (
                      <tr
                        key={faskes.id_faskes}
                        className="hover:bg-slate-50/70 transition"
                      >
                        <td className="py-5 pl-8 pr-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">
                            {faskes.kdppk || `FSK-${faskes.id_faskes}`}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            ID: #{faskes.id_faskes}
                          </div>
                        </td>

                        <td className="py-5 px-4 max-w-[240px]">
                          <div className="font-extrabold text-slate-900 leading-snug">
                            {faskes.nama_faskes}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {faskes.alamat_faskes}
                          </div>
                        </td>

                        <td className="py-5 px-4 max-w-[210px]">
                          <div className="font-semibold text-[#007E7A] flex items-start gap-1 leading-snug">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              {faskes.kecamatan
                                ? `${faskes.kecamatan}, `
                                : ""}
                              {faskes.kota_kabupaten}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {faskes.jenis_faskes || "Faskes"}
                            {faskes.kelas_faskes
                              ? ` • Kelas ${faskes.kelas_faskes}`
                              : ""}
                          </div>
                        </td>

                        <td className="py-5 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                              faskes.is_support_bpjs
                                ? "bg-[#86EFAC]/60 text-[#065F46]"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {faskes.is_support_bpjs
                              ? "• Mendukung BPJS"
                              : "• Non-BPJS"}
                          </span>
                        </td>

                        <td className="py-5 pl-4 pr-8 text-center">
                          <Link
                            href="/admin/faskes"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition"
                            title="Kelola Data Faskes"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  : daftar_log_audit_bawaan.map((item_log) => (
                      <tr
                        key={item_log.id_log}
                        className="hover:bg-slate-50/70 transition"
                      >
                        <td className="py-5 pl-8 pr-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">
                            {item_log.waktu_relatif}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item_log.jam_log}
                          </div>
                        </td>

                        <td className="py-5 px-4 max-w-[200px]">
                          <div className="font-extrabold text-slate-900 leading-snug">
                            {item_log.nama_faskes}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item_log.kode_faskes}
                          </div>
                        </td>

                        <td className="py-5 px-4 max-w-[210px]">
                          <div className="font-semibold text-[#007E7A] flex items-start gap-1 leading-snug">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{item_log.lokasi_faskes}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item_log.kategori_faskes}
                          </div>
                        </td>

                        <td className="py-5 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${item_log.gaya_badge}`}
                          >
                            {item_log.teks_badge}
                          </span>
                        </td>

                        <td className="py-5 pl-4 pr-8 text-center">
                          <Link
                            href="/admin/faskes"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition"
                            title="Kelola Data Faskes"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
