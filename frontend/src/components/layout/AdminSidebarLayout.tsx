"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Building2, LogOut, User, ChevronRight } from "lucide-react";

export default function AdminSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path_aktif = usePathname();
  const adalah_dashboard = path_aktif === "/admin/dashboard";
  const adalah_kelola_faskes = path_aktif.startsWith("/admin/faskes");

  return (
    <div className="min-h-screen flex bg-[#F8FAFB]">
      {/* Sidebar Kiri */}
      <aside className="w-[270px] bg-[#FAFBFB] border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none">
        <div className="p-5 space-y-8">
          <Link href="/" className="block pt-1">
            <img
              src="/images/logo-bogorsehat.png"
              alt="Bogor Sehat"
              className="h-11 w-auto object-contain"
            />
          </Link>

          <div className="space-y-2">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              MENU NAVIGASI
            </p>

            <nav className="space-y-1.5">
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold transition ${
                  adalah_dashboard
                    ? "bg-[#007E7A] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Dashboard Admin</span>
              </Link>

              <Link
                href="/admin/faskes"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold transition ${
                  adalah_kelola_faskes
                    ? "bg-[#007E7A] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Kelola Data Faskes</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Tombol Logout Admin */}
        <div className="bg-[#F2F4F7] px-6 py-5 border-t border-slate-200/70">
          <Link
            href="/admin/login"
            className="flex items-center gap-2.5 text-[13px] font-bold text-[#D92D20] hover:text-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Portal</span>
          </Link>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[68px] bg-white border-b border-slate-200/80 px-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px]">
            <Link
              href="/"
              className="font-semibold text-[#007E7A] hover:underline"
            >
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">Portal Administrasi Faskes</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#007E7A] text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[13px] font-bold text-slate-900">
              Admin Dinkes Kota Bogor
            </span>
          </div>
        </header>

        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  );
}
