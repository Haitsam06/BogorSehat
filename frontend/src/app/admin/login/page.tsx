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
} from "lucide-react";

export default function AdminLoginPage() {
  const router_navigasi = useRouter();
  const [tampilkan_sandi, set_tampilkan_sandi] = useState(false);
  const [email_petugas, set_email_petugas] = useState("");
  const [kata_sandi_petugas, set_kata_sandi_petugas] = useState("");

  const tangani_submit_login = (e: React.FormEvent) => {
    e.preventDefault();
    router_navigasi.push("/admin/dashboard");
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
                className="bg-white rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-sm"
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
                        Monitoring Real-Time BOR &amp; Kamar
                      </h3>
                      <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                        Sinkronisasi kuota tempat tidur ICU, isolasi, &amp;
                        kapasitas UGD 24 jam.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h3 className="text-xs sm:text-[13px] font-bold text-white">
                        Validasi Antrean Faskes Primer
                      </h3>
                      <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                        Verifikasi kuota rujukan BPJS &amp; penjadwalan poli
                        rawat jalan.
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
                  <span>AKSES PORTAL KEPENDUDUKAN</span>
                </div>

                <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900">
                  Autentikasi Akses Petugas
                </h1>

                <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                  Silakan masukkan akun resmi yang telah divalidasi oleh Dinas
                  Kesehatan Kota Bogor.
                </p>
              </div>

              <form onSubmit={tangani_submit_login} className="space-y-5 pt-1">
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    ALAMAT EMAIL DINAS / EMAIL RESMI
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      value={email_petugas}
                      onChange={(e) => set_email_petugas(e.target.value)}
                      placeholder="nama.petugas@kotabogor.go.id atau email terdaftar"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F3F5F8] text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      KATA SANDI PORTAL PETUGAS
                    </label>
                    <button
                      type="button"
                      className="text-[11px] font-bold text-[#007E7A] underline"
                    >
                      Lupa Kata Sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type={tampilkan_sandi ? "text" : "password"}
                      value={kata_sandi_petugas}
                      onChange={(e) => set_kata_sandi_petugas(e.target.value)}
                      placeholder="Kombinasi huruf kapital, angka, & simbol"
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
                  className="w-full h-12 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-sm font-bold shadow-sm transition"
                >
                  Masuk
                </button>
              </form>

              <p className="text-center text-xs text-slate-600 pt-1">
                Belum memiliki akun?{" "}
                <Link
                  href="/admin/dashboard"
                  className="font-bold text-[#007E7A] underline"
                >
                  Daftar Akun Baru
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
