"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
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

  return (
    <div className="max-w-[520px] mx-auto px-4 sm:px-6 py-12 w-full">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 sm:p-9 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900">
            {mode === "masuk" ? "Masuk ke BogorSehat" : "Daftar Akun Warga"}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {mode === "masuk"
              ? "Gunakan akun warga untuk menulis ulasan, berdiskusi, dan menyukai tanggapan."
              : "Buat akun untuk ikut berdiskusi dan berbagi pengalaman layanan kesehatan."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setMode("masuk");
              setPesanError(null);
            }}
            className={`h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mode === "masuk"
                ? "bg-white text-[#007E7A] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("daftar");
              setPesanError(null);
            }}
            className={`h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mode === "daftar"
                ? "bg-white text-[#007E7A] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar</span>
          </button>
        </div>

        {pesanError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{pesanError}</span>
          </div>
        )}

        <form onSubmit={tanganiSubmit} className="space-y-4">
          {mode === "daftar" && (
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-800">
                Nama Lengkap
              </span>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama sesuai identitas"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                required
              />
            </label>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-800">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-800">
              Kata Sandi
            </span>
            <div className="relative">
              <input
                type={tampilkanSandi ? "text" : "password"}
                value={sandi}
                onChange={(e) => setSandi(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full h-11 pl-3.5 pr-11 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                required
              />
              <button
                type="button"
                onClick={() => setTampilkanSandi((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700"
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
          </label>

          {mode === "daftar" && (
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-800">
                Konfirmasi Kata Sandi
              </span>
              <input
                type={tampilkanSandi ? "text" : "password"}
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                placeholder="Ulangi kata sandi"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                required
              />
            </label>
          )}

          <button
            type="submit"
            disabled={sedangMemuat}
            className="w-full h-11 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {sedangMemuat ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "masuk" ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>
              {mode === "masuk" ? "Masuk" : "Daftar dan Masuk"}
            </span>
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center leading-relaxed">
          Petugas Dinas Kesehatan dapat masuk melalui{" "}
          <Link href="/admin/login" className="font-bold text-[#007E7A]">
            Portal Admin
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
