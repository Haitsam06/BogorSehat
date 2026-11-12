"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Search, MessageSquare, User, ShieldCheck } from "lucide-react";
import { useFaskes } from "@/context/FaskesContext";

export default function Navbar() {
  const path_aktif = usePathname();
  const { pengguna, sudahLogin } = useFaskes();

  if (path_aktif.startsWith("/admin")) {
    return null;
  }

  const adalah_beranda = path_aktif === "/";
  const adalah_peta = path_aktif.startsWith("/peta");
  const adalah_cari_faskes =
    path_aktif.startsWith("/cari-faskes") || path_aktif.startsWith("/faskes");
  const adalah_forum =
    path_aktif.startsWith("/diskusi") || path_aktif.startsWith("/forum");

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-24 h-[76px] flex items-center justify-between">
        {/* Logo Bogor Sehat */}
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/images/logo-bogorsehat.png"
            alt="Bogor Sehat"
            className="h-11 w-auto object-contain"
          />
        </Link>

        {/* Navigasi Tengah */}
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

        {/* Ikon Portal Admin / Profil */}
        <div className="flex items-center gap-2">
          {sudahLogin && pengguna?.role_user === "admin" ? (
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-[#007A78] text-xs font-bold hover:bg-teal-100 transition"
              title="Ke Dashboard Admin"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Portal Admin</span>
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="p-2.5 rounded-full text-slate-600 hover:text-[#007A78] hover:bg-slate-100 transition"
              title="Login Portal Petugas"
            >
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
