"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { FormInput, FormPassword, FormAlert } from "@/components/ui";

type Mode = "masuk" | "daftar";

function MasukKonten() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { masuk } = useFaskes();
  const [mode, setMode] = useState<Mode>("masuk");

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [sandi, setSandi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  /** Tujuan setelah masuk, mis. `/diskusi/buat` saat diarahkan dari sana. */
  const tujuanSetelahMasuk = (): string => {
    const next = searchParams.get("next");
    // Hanya izinkan path internal agar `?next=` tidak bisa jadi open redirect.
    if (next && next.startsWith("/") && !next.startsWith("//")) return next;
    return "/";
  };

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
      if (pengguna.role_user === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(tujuanSetelahMasuk());
      }
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
    <div className="min-h-screen bg-white flex items-center justify-center p-3 sm:p-6 lg:p-4">
      <div className={`w-full max-w-[1180px] bg-[#F4F7FA] rounded-[32px] px-5 sm:px-12 ${mode === 'daftar' ? 'py-5 sm:py-6 space-y-4' : 'py-7 sm:py-9 space-y-6'}`}>
        {/* Badge Pemerintah Kota Bogor */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
            <Shield className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>PEMERINTAH KOTA BOGOR • LAYANAN KESEHATAN RESMI</span>
          </div>
        </div>

        {/* Grid 2 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Panel Kiri */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#005B5C] via-[#006E6D] to-[#00837B] text-white p-6 sm:p-7 flex flex-col justify-between">
            <div className="w-48 h-48 rounded-full bg-white/10 absolute -top-10 -right-10 pointer-events-none" />
            <div className="w-56 h-56 rounded-full bg-white/10 absolute -bottom-16 -left-16 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 transition hover:opacity-90 py-1"
              >
                <img
                  src="/images/logo-bogorsehat.png"
                  alt="Bogor Sehat"
                  className="h-8 sm:h-9 w-auto object-contain brightness-0 invert"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </Link>

              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/90">
                  KAPABILITAS MODUL PORTAL:
                </p>

                <div className="space-y-3.5">
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

          {/* Panel Kanan (Form Masuk / Daftar User) */}
          <div className="lg:col-span-7 bg-white rounded-[22px] p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className={`${mode === "daftar" ? "space-y-3" : "space-y-5"}`}>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#007E7A]">
                  {mode === "masuk" ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>AKSES PORTAL KEPENDUDUKAN</span>
                </div>
                <h1 className={`${mode === "daftar" ? "text-xl sm:text-2xl" : "text-2xl sm:text-[28px]"} font-extrabold text-slate-900 leading-tight`}>
                  {mode === "masuk" ? "Masuk Akun User" : "Daftar Akun Baru"}
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Akses layanan pemetaan fasilitas kesehatan, riwayat pencarian
                  faskes terdekat, dan forum diskusi kesehatan Kota Bogor.
                </p>
              </div>

              {pesanError && (
                <FormAlert
                  tipe="error"
                  pesan={pesanError}
                  onClose={() => setPesanError(null)}
                />
              )}

              <form
                onSubmit={tanganiSubmit}
                className={`${mode === "daftar" ? "space-y-2.5 max-h-[50vh] sm:max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar" : "space-y-3.5"} pt-1`}
              >
                {mode === "daftar" && (
                  <FormInput
                    label="Nama Lengkap"
                    required
                    icon={User}
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="contoh: Budi Santoso"
                  />
                )}

                <FormInput
                  label="Alamat Email"
                  required
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: nama@email.com"
                />

                {mode === "daftar" && (
                  <FormInput
                    label="Nomor Telepon"
                    type="tel"
                    icon={Phone}
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="contoh: 0812XXXXXXXX"
                    helperText="(opsional)"
                  />
                )}

                <FormPassword
                  label="Kata Sandi Akun"
                  required
                  value={sandi}
                  onChange={(e) => setSandi(e.target.value)}
                  placeholder={
                    mode === "masuk"
                      ? "Masukkan kata sandi Anda"
                      : "Buat kata sandi minimal 8 karakter"
                  }
                />

                {mode === "daftar" && (
                  <FormPassword
                    label="Konfirmasi Kata Sandi"
                    required
                    value={konfirmasi}
                    onChange={(e) => setKonfirmasi(e.target.value)}
                    placeholder="Masukkan ulang kata sandi Anda"
                  />
                )}

                <button
                  type="submit"
                  disabled={sedangMemuat}
                  className="w-full h-10 sm:h-11 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
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

              <div className="pt-1.5 border-t border-slate-100 flex justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#007E7A] transition py-1 px-3 rounded-lg hover:bg-slate-50"
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

export default function MasukPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Memuat halaman masuk...
        </div>
      }
    >
      <MasukKonten />
    </Suspense>
  );
}
