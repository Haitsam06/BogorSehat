"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
  UserPlus,
} from "lucide-react";
import { api, messageFromError } from "@/lib/api";
import { useFaskes } from "@/context/FaskesContext";

type Mode = "masuk" | "daftar";

export default function MasukPage() {
  const router = useRouter();
  const { masuk } = useFaskes();
  const [mode, setMode] = useState<Mode>("masuk");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [sandi, setSandi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [tampilkanSandi, setTampilkanSandi] = useState(false);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const tanganiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);

    if (!email.trim() || !sandi) {
      setPesanError("Email dan kata sandi wajib diisi.");
      return;
    }

    if (mode === "daftar") {
      if (!nama.trim()) {
        setPesanError("Nama lengkap wajib diisi.");
        return;
      }
      if (sandi.length < 8) {
        setPesanError("Kata sandi minimal 8 karakter.");
        return;
      }
      if (sandi !== konfirmasi) {
        setPesanError("Konfirmasi kata sandi tidak cocok.");
        return;
      }
    }

    setSedangMemuat(true);
    try {
      if (mode === "daftar") {
        await api.register({
          nama_user: nama.trim(),
          email_user: email.trim(),
          password_user: sandi,
          password_user_confirmation: konfirmasi,
        });
      }

      const pengguna = await masuk(email.trim(), sandi);
      router.push(pengguna.role_user === "admin" ? "/admin/dashboard" : "/");
    } catch (err) {
      setPesanError(
        messageFromError(err, "Gagal memproses permintaan Anda.")
      );
      setSedangMemuat(false);
    }
  };

  const beralihMode = (targetMode: Mode) => {
    setMode(targetMode);
    setPesanError(null);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[1180px] bg-[#F4F7FA] rounded-[32px] px-6 sm:px-14 py-8 sm:py-11 space-y-8">
        {/* Badge Pemerintah Kota Bogor */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
            <Shield className="w-4 h-4 text-[#16A34A]" />
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

            <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-100/85">
              <span>Petugas Dinas Kesehatan?</span>
              <Link
                href="/admin/login"
                className="font-bold text-white hover:underline"
              >
                Portal Admin →
              </Link>
            </div>
          </div>

          {/* Panel Kanan (Form Masuk / Daftar User) */}
          <div className="lg:col-span-7 bg-white rounded-[22px] p-7 sm:p-10 shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#007E7A]">
                  {mode === "masuk" ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>AKSES PORTAL KEPENDUDUKAN</span>
                </div>
                <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">
                  {mode === "masuk" ? "Masuk Akun User" : "Daftar Akun Baru"}
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                  Akses layanan pemetaan fasilitas kesehatan, riwayat pencarian
                  faskes terdekat, dan forum diskusi kesehatan Kota Bogor.
                </p>
              </div>

              {pesanError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs font-semibold text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pesanError}</span>
                </div>
              )}

              <form onSubmit={tanganiSubmit} className="space-y-4 pt-1">
                {mode === "daftar" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="contoh: Budi Santoso"
                        className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F3F5F8] text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh: nama@email.com"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F3F5F8] text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                    />
                  </div>
                </div>

                {mode === "daftar" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Nomor Telepon{" "}
                      <span className="font-normal text-slate-400">
                        (opsional)
                      </span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                      <input
                        type="tel"
                        value={telepon}
                        onChange={(e) => setTelepon(e.target.value)}
                        placeholder="contoh: 0812XXXXXXXX"
                        className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F3F5F8] text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi Akun
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type={tampilkanSandi ? "text" : "password"}
                      required
                      value={sandi}
                      onChange={(e) => setSandi(e.target.value)}
                      placeholder={
                        mode === "masuk"
                          ? "Masukkan kata sandi Anda"
                          : "Buat kata sandi minimal 8 karakter"
                      }
                      className="w-full h-11 pl-11 pr-11 rounded-xl bg-[#F3F5F8] text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                    />
                    <button
                      type="button"
                      onClick={() => setTampilkanSandi((prev) => !prev)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-700"
                      aria-label={
                        tampilkanSandi
                          ? "Sembunyikan kata sandi"
                          : "Tampilkan kata sandi"
                      }
                    >
                      {tampilkanSandi ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {mode === "daftar" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                      <input
                        type={tampilkanSandi ? "text" : "password"}
                        required
                        value={konfirmasi}
                        onChange={(e) => setKonfirmasi(e.target.value)}
                        placeholder="Masukkan ulang kata sandi Anda"
                        className="w-full h-11 pl-11 pr-11 rounded-xl bg-[#F3F5F8] text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sedangMemuat}
                  className="w-full h-12 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {sedangMemuat ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === "masuk"
                          ? "Masuk ke BogorSehat"
                          : "Daftar Akun Baru"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-slate-600 text-center">
                {mode === "masuk" ? (
                  <>
                    Belum memiliki akun?{" "}
                    <button
                      type="button"
                      onClick={() => beralihMode("daftar")}
                      className="font-bold text-[#007E7A] hover:underline"
                    >
                      Daftar Akun Baru
                    </button>
                  </>
                ) : (
                  <>
                    Sudah memiliki akun?{" "}
                    <button
                      type="button"
                      onClick={() => beralihMode("masuk")}
                      className="font-bold text-[#007E7A] hover:underline"
                    >
                      Masuk ke Akun
                    </button>
                  </>
                )}
              </p>

              <div className="pt-2 border-t border-slate-100 flex justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#007E7A] transition py-1.5 px-3 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
