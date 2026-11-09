"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [tampilkan_sandi, set_tampilkan_sandi] = useState(false);
  const [email_petugas, set_email_petugas] = useState("");
  const [kata_sandi_petugas, set_kata_sandi_petugas] = useState("");
  const [sedang_memuat, set_sedang_memuat] = useState(false);
  const [pesan_error, set_pesan_error] = useState<string | null>(null);

  const tangani_submit_login = async (e: React.FormEvent) => {
    e.preventDefault();
    set_pesan_error(null);

    if (!email_petugas || !kata_sandi_petugas) {
      set_pesan_error("Silakan masukkan email dan kata sandi.");
      return;
    }

    set_sedang_memuat(true);
    try {
      const res = await api.login(email_petugas.trim(), kata_sandi_petugas);
      if (res.data.role_user !== "admin") {
        set_pesan_error("Akun Anda tidak memiliki hak akses administrator.");
        set_sedang_memuat(false);
        return;
      }
      router.push("/admin/dashboard");
    } catch (err: any) {
      set_pesan_error(
        err?.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda."
      );
      set_sedang_memuat(false);
    }
  };

  const isiAkunDemo = () => {
    set_email_petugas("admin@bogorsehat.test");
    set_kata_sandi_petugas("password");
    set_pesan_error(null);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[1180px] bg-[#F4F7FA] rounded-[32px] px-6 sm:px-14 py-8 sm:py-11 space-y-8">
        {/* Badge Pemerintah Kota Bogor */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
            <XCircle className="w-4 h-4 text-[#16A34A]" />
            <span>PEMERINTAH KOTA BOGOR • LAYANAN KESEHATAN RESMI</span>
          </div>
        </div>

        {/* Grid 2 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Panel Kiri */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#005B5C] via-[#006E6D] to-[#00837B] text-white p-7 sm:p-8 flex flex-col justify-between min-h-[480px]">
            <div className="w-48 h-48 rounded-full bg-white/10 absolute -top-10 -right-10 pointer-events-none" />
            <div className="w-56 h-56 rounded-full bg-white/10 absolute -bottom-16 -left-16 pointer-events-none" />

            <div className="relative z-10 space-y-7">
              <Link
                href="/"
                className="bg-white rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-sm inline-block"
              >
                <img
                  src="/images/logo-bogorsehat.png"
                  alt="Bogor Sehat"
                  className="h-8 w-auto object-contain"
                />
              </Link>

              <div className="space-y-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/90">
                  KAPABILITAS MODUL PORTAL:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h3 className="text-xs sm:text-[13px] font-bold text-white">
                        Kelola Master Data GIS Faskes
                      </h3>
                      <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                        Pembaruan koordinat spasial, status akreditasi, &amp;
                        radius layanan darurat.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h3 className="text-xs sm:text-[13px] font-bold text-white">
                        Monitoring Real-Time Layanan &amp; BPJS
                      </h3>
                      <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                        Sinkronisasi data faskes, ketersediaan sarana medis,
                        dan integrasi rute Google Maps.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h3 className="text-xs sm:text-[13px] font-bold text-white">
                        Validasi &amp; Moderasi Laporan
                      </h3>
                      <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                        Verifikasi masukan warga, keluhan faskes, serta ulasan
                        komunitas secara terpusat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Kanan: Form Login */}
          <div className="lg:col-span-7 bg-white rounded-[22px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8 sm:p-11 flex flex-col justify-center">
            <div className="max-w-lg w-full mx-auto space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#007E7A]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>AKSES PORTAL ADMINISTRATOR</span>
                </div>

                <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900">
                  Autentikasi Petugas
                </h1>

                <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                  Silakan masukkan akun resmi yang telah divalidasi oleh Dinas
                  Kesehatan Kota Bogor.
                </p>
              </div>

              {/* Notifikasi Error */}
              {pesan_error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{pesan_error}</span>
                </div>
              )}

              {/* Tombol Isi Otomatis Akun Admin Demo */}
              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/70 flex items-center justify-between gap-3 text-xs">
                <div className="text-slate-700">
                  <span className="font-bold text-[#007E7A]">Akun Seeder Default:</span>{" "}
                  <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-teal-200">
                    admin@bogorsehat.test
                  </code>
                </div>
                <button
                  type="button"
                  onClick={isiAkunDemo}
                  className="px-2.5 py-1 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Gunakan Akun</span>
                </button>
              </div>

              <form onSubmit={tangani_submit_login} className="space-y-5 pt-1">
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    ALAMAT EMAIL DINAS / EMAIL TERDAFTAR
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email_petugas}
                      onChange={(e) => set_email_petugas(e.target.value)}
                      placeholder="admin@bogorsehat.test"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F3F5F8] text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      KATA SANDI
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type={tampilkan_sandi ? "text" : "password"}
                      required
                      value={kata_sandi_petugas}
                      onChange={(e) => set_kata_sandi_petugas(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-11 pr-11 rounded-xl bg-[#F3F5F8] text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                    />
                    <button
                      type="button"
                      onClick={() => set_tampilkan_sandi(!tampilkan_sandi)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-700"
                    >
                      {tampilkan_sandi ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sedang_memuat}
                  className="w-full h-12 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {sedang_memuat ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <span>Masuk ke Portal Admin</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
