"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPin,
  Search,
  MessageSquare,
  User,
  ShieldCheck,
} from "lucide-react";
import { useFaskes } from "@/context/FaskesContext";
import { resolveStorageUrl } from "@/lib/api";

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Navbar() {
  const path_aktif = usePathname();
  const { pengguna, sudahLogin } = useFaskes();

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
          label: "Profil",
          href: "/profil",
          icon: User,
          avatar: pengguna?.foto_profil ? resolveStorageUrl(pengguna.foto_profil) : undefined,
          inisial: getInitials(pengguna?.nama_user),
          aktif: path_aktif.startsWith("/profil"),
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
              className={`px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 transition ${adalah_beranda
                ? "bg-[#D9EFEF] text-[#007A78] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </Link>

            <Link
              href="/peta"
              className={`px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 transition ${adalah_peta
                ? "bg-[#D9EFEF] text-[#007A78] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Peta Faskes</span>
            </Link>

            <Link
              href="/cari-faskes"
              className={`px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 transition ${adalah_cari_faskes
                ? "bg-[#D9EFEF] text-[#007A78] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Search className="w-4 h-4" />
              <span>Cari Faskes</span>
            </Link>

            <Link
              href="/diskusi"
              className={`px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 transition ${adalah_forum
                ? "bg-[#D9EFEF] text-[#007A78] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Forum Komunitas</span>
            </Link>
          </nav>

          {/* Kanan: Profil/Masuk di Desktop, dan Tombol Search di Mobile */}
          <div className="flex items-center gap-2">
            {/* Tombol Search khusus Mobile: langsung membuka halaman pencarian */}
            <Link
              href="/cari-faskes"
              className={`md:hidden p-2 rounded-xl transition ${
                adalah_cari_faskes
                  ? "bg-[#D9EFEF] text-[#007A78]"
                  : "text-slate-700 hover:bg-slate-100 active:scale-95"
              }`}
              aria-label="Cari fasilitas kesehatan"
              title="Cari Fasilitas Kesehatan"
            >
              <Search className="w-5 h-5" />
            </Link>

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
                <Link
                  href="/profil"
                  className={`p-1 rounded-full transition flex items-center justify-center ${path_aktif.startsWith("/profil")
                    ? "ring-2 ring-[#007E7A] ring-offset-2"
                    : "hover:ring-2 hover:ring-slate-300 ring-offset-1"
                    }`}
                  title={`Profil: ${pengguna.nama_user}`}
                >
                  {pengguna.foto_profil ? (
                    <img
                      src={resolveStorageUrl(pengguna.foto_profil)}
                      alt={pengguna.nama_user}
                      className="w-9 h-9 rounded-full object-cover border border-[#007E7A]/40"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#007E7A] text-white flex items-center justify-center font-extrabold text-xs">
                      {getInitials(pengguna.nama_user)}
                    </div>
                  )}
                </Link>
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
        </div>
      </header>

      {/* Navigasi Bawah Khusus Mobile */}
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
                className={`relative flex flex-col items-center justify-center py-1 transition group select-none ${aktif
                  ? "text-[#007E7A] font-bold"
                  : "text-slate-400 hover:text-slate-600 font-medium"
                  }`}
              >
                {aktif && (
                  <span className="absolute -top-1.5 w-7 h-1 rounded-full bg-[#007E7A] shadow-[0_1px_4px_rgba(0,126,122,0.4)]" />
                )}
                <div
                  className={`p-1 rounded-xl transition-all ${aktif
                    ? "bg-[#D9EFEF]/70 scale-105"
                    : "group-hover:bg-slate-100"
                    }`}
                >
                  {"avatar" in item && item.avatar ? (
                    <img
                      src={item.avatar as string}
                      alt={item.label}
                      className="w-5 h-5 rounded-full object-cover border border-[#007E7A]"
                    />
                  ) : "inisial" in item && item.inisial ? (
                    <div className="w-5 h-5 rounded-full bg-[#007E7A] text-white flex items-center justify-center text-[9px] font-extrabold leading-none">
                      {item.inisial as string}
                    </div>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-[10px] leading-tight mt-0.5 tracking-tight truncate max-w-[68px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
