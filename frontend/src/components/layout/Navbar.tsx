"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  MapPin,
  Search,
  MessageSquare,
  User,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useFaskes } from "@/context/FaskesContext";

export default function Navbar() {
  const path_aktif = usePathname();
  const router = useRouter();
  const { pengguna, sudahLogin, keluar } = useFaskes();

  const [modeSearch, setModeSearch] = useState(false);
  const [kataKunciSearch, setKataKunciSearch] = useState("");

  // Otomatis tutup mode search saat berpindah halaman
  useEffect(() => {
    setModeSearch(false);
  }, [path_aktif]);

  if (path_aktif.startsWith("/admin") || path_aktif.startsWith("/masuk")) {
    return null;
  }

  const adalah_beranda = path_aktif === "/";
  const adalah_peta = path_aktif.startsWith("/peta");
  const adalah_cari_faskes =
    path_aktif.startsWith("/cari-faskes") || path_aktif.startsWith("/faskes");
  const adalah_forum =
    path_aktif.startsWith("/diskusi") || path_aktif.startsWith("/forum");

  // 4 Tab Navigasi Bawah Mobile (Tanpa Tab Search)
  const itemNavigasiMobile = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
      aktif: adalah_beranda,
    },
    {
      label: "Peta",
      href: "/peta",
      icon: MapPin,
      aktif: adalah_peta,
    },
    {
      label: "Forum",
      href: "/diskusi",
      icon: MessageSquare,
      aktif: adalah_forum,
    },
    sudahLogin && pengguna?.role_user === "admin"
      ? {
          label: "Admin",
          href: "/admin/dashboard",
          icon: ShieldCheck,
          aktif: path_aktif.startsWith("/admin"),
        }
      : sudahLogin
      ? {
          label: "Akun",
          href: "/diskusi",
          icon: User,
          aktif: false,
        }
      : {
          label: "Masuk",
          href: "/masuk",
          icon: User,
          aktif: path_aktif.startsWith("/masuk"),
        },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-12 lg:px-24 h-[68px] sm:h-[76px] flex items-center justify-between">
          {modeSearch ? (
            /* Mode Search Mobile Layar Penuh di Header */
            <div className="flex items-center gap-2.5 w-full h-full py-2">
              {/* Tombol kembali berupa panah */}
              <button
                type="button"
                onClick={() => {
                  setModeSearch(false);
                  setKataKunciSearch("");
                }}
                className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition shrink-0"
                aria-label="Kembali dan tutup pencarian"
                title="Kembali"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>

              {/* Form Input Pencarian Mobile */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (kataKunciSearch.trim()) {
                    router.push(
                      `/cari-faskes?search=${encodeURIComponent(
                        kataKunciSearch.trim()
                      )}`
                    );
                    setModeSearch(false);
                  }
                }}
                className="flex-1 flex items-center bg-slate-100 rounded-xl px-3 h-10 border border-slate-200/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#007E7A] focus-within:border-[#007E7A] transition"
              >
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  autoFocus
                  value={kataKunciSearch}
                  onChange={(e) => setKataKunciSearch(e.target.value)}
                  placeholder="Cari faskes, poli, alamat..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {kataKunciSearch && (
                  <button
                    type="button"
                    onClick={() => setKataKunciSearch("")}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition shrink-0"
                    title="Hapus teks"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Tombol Filter di sebelah bar pencarian saat mode searching */}
              <button
                type="button"
                onClick={() => {
                  const q = kataKunciSearch.trim();
                  router.push(
                    q
                      ? `/cari-faskes?search=${encodeURIComponent(q)}`
                      : "/cari-faskes"
                  );
                  setModeSearch(false);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#007E7A] border border-slate-200/80 active:scale-95 transition shrink-0"
                title="Buka Filter Pencarian Lengkap"
                aria-label="Filter"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Tombol Cari Cepat */}
              <button
                type="button"
                onClick={() => {
                  if (kataKunciSearch.trim()) {
                    router.push(
                      `/cari-faskes?search=${encodeURIComponent(
                        kataKunciSearch.trim()
                      )}`
                    );
                    setModeSearch(false);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-[#007E7A] hover:bg-[#006663] text-white text-xs font-bold shrink-0 transition"
              >
                Cari
              </button>
            </div>
          ) : (
            /* Mode Header Normal */
            <>
              {/* Logo Bogor Sehat */}
              <Link href="/" className="flex items-center shrink-0">
                <img
                  src="/images/logo-bogorsehat.png"
                  alt="Bogor Sehat"
                  className="h-9 sm:h-11 w-auto object-contain"
                />
              </Link>

              {/* Navigasi Tengah (Desktop Only) */}
              <nav className="hidden md:flex items-center gap-3">
                <Link
                  href="/"
                  className={`px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 transition ${
                    adalah_beranda
                      ? "bg-[#D9EFEF] text-[#007A78] font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Beranda</span>
                  {adalah_beranda && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007A78] ml-0.5" />
                  )}
                </Link>

                <Link
                  href="/peta"
                  className={`px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 transition ${
                    adalah_peta
                      ? "bg-[#D9EFEF] text-[#007A78] font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Peta Interaktif</span>
                  {adalah_peta && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007A78] ml-0.5" />
                  )}
                </Link>

                <Link
                  href="/cari-faskes"
                  className={`px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 transition ${
                    adalah_cari_faskes
                      ? "bg-[#D9EFEF] text-[#007A78] font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Cari Faskes</span>
                  {adalah_cari_faskes && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007A78] ml-0.5" />
                  )}
                </Link>

                <Link
                  href="/diskusi"
                  className={`px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 transition ${
                    adalah_forum
                      ? "bg-[#D9EFEF] text-[#007A78] font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Forum Komunitas</span>
                  {adalah_forum && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007A78] ml-0.5" />
                  )}
                </Link>
              </nav>

              {/* Kanan: Profil/Masuk di Desktop, dan Tombol Search di Mobile */}
              <div className="flex items-center gap-2">
                {/* Tombol Search khusus Mobile (menggantikan tombol profil/masuk di mobile) */}
                <button
                  type="button"
                  onClick={() => setModeSearch(true)}
                  className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                  aria-label="Buka pencarian faskes"
                  title="Cari Fasilitas Kesehatan"
                >
                  <Search className="w-5 h-5 text-slate-700" />
                </button>

                {/* Profil / Portal Admin / Masuk (Desktop Only) */}
                <div className="hidden md:flex items-center gap-2">
                  {sudahLogin && pengguna?.role_user === "admin" ? (
                    <Link
                      href="/admin/dashboard"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-[#007A78] text-xs font-bold hover:bg-teal-100 transition"
                      title="Ke Dashboard Admin"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Portal Admin</span>
                    </Link>
                  ) : sudahLogin && pengguna ? (
                    <>
                      <span className="text-xs font-bold text-slate-700">
                        {pengguna.nama_user}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          void keluar();
                        }}
                        className="p-2.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Keluar akun"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/masuk"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                      title="Masuk atau daftar akun warga"
                    >
                      <User className="w-4 h-4" />
                      <span>Masuk</span>
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Navigasi Bawah Khusus Mobile (Hilang saat Mode Search) */}
      {!modeSearch && (
        <nav
          aria-label="Navigasi Bawah Mobile"
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5"
        >
          <div className="grid grid-cols-4 items-center justify-around max-w-md mx-auto">
            {itemNavigasiMobile.map((item) => {
              const Icon = item.icon;
              const aktif = item.aktif;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center py-1 transition group select-none ${
                    aktif
                      ? "text-[#007E7A] font-bold"
                      : "text-slate-400 hover:text-slate-600 font-medium"
                  }`}
                >
                  {aktif && (
                    <span className="absolute -top-1.5 w-7 h-1 rounded-full bg-[#007E7A] shadow-[0_1px_4px_rgba(0,126,122,0.4)]" />
                  )}
                  <div
                    className={`p-1 rounded-xl transition-all ${
                      aktif
                        ? "bg-[#D9EFEF]/70 scale-105"
                        : "group-hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] leading-tight mt-0.5 tracking-tight truncate max-w-[68px]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
