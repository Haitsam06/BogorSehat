"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  Eye,
  Share2,
  ArrowRight,
  MapPin,
  Users,
  MoreVertical,
  Flag,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api, ApiDiskusi, getAuthUser, getAuthToken } from "@/lib/api";
import { daftar_diskusi_default } from "@/data/data_diskusi";
import ModalReportKonten from "@/components/forum/ModalReportKonten";
import ModalBuatDiskusi from "@/components/forum/ModalBuatDiskusi";

export default function ForumDiskusiPage() {
  const [tabAktif, setTabAktif] = useState<"semua" | "saya">("semua");
  const [kataKunci, setKataKunci] = useState("");
  const [daftarDiskusi, setDaftarDiskusi] = useState<ApiDiskusi[]>(daftar_diskusi_default);
  const [sedangMemuat, setSedangMemuat] = useState(false);

  // Modal states
  const [modalBuatBuka, setModalBuatBuka] = useState(false);
  const [modalReportBuka, setModalReportBuka] = useState(false);
  const [targetReportId, setTargetReportId] = useState<number>(1);
  const [targetReportTitle, setTargetReportTitle] = useState<string>("");

  // Dropdown menu state
  const [menuAktifId, setMenuAktifId] = useState<number | null>(null);

  // Status notification
  const [pesanNotif, setPesanNotif] = useState<{
    tipe: "sukses" | "error";
    pesan: string;
  } | null>(null);

  const currentUser = getAuthUser();
  const token = getAuthToken();

  // Load discussions from API if available, fallback to seed
  useEffect(() => {
    let aktif = true;
    async function muatData() {
      try {
        setSedangMemuat(true);
        if (tabAktif === "saya" && token) {
          const res = await api.getMyDiscussions().catch(() => null);
          if (aktif && res?.data && res.data.length > 0) {
            setDaftarDiskusi(res.data);
            return;
          }
        } else {
          const res = await api.getDiscussions().catch(() => null);
          if (aktif && res?.data && res.data.length > 0) {
            // Gabungkan atau pakai data backend jika ada
            const backendMap = new Map(res.data.map((d) => [d.id_diskusi, d]));
            const merged = [...res.data];
            daftar_diskusi_default.forEach((def) => {
              if (!backendMap.has(def.id_diskusi)) {
                merged.push(def);
              }
            });
            setDaftarDiskusi(merged);
            return;
          }
        }
      } catch {
        // Fallback tetap ke default
      } finally {
        if (aktif) setSedangMemuat(false);
      }
    }
    muatData();
    return () => {
      aktif = false;
    };
  }, [tabAktif, token]);

  // Filter berdasarkan pencarian & tab
  const diskusiTerfilter = daftarDiskusi.filter((item) => {
    const isOwner =
      currentUser &&
      (item.id_user === currentUser.id_user ||
        item.user?.id_user === currentUser.id_user);

    if (tabAktif === "saya" && !isOwner) {
      // Mock: jika user belum login atau di mock id=1 adalah user sendiri
      if (item.id_user !== 1) return false;
    }

    if (!kataKunci.trim()) return true;
    const q = kataKunci.toLowerCase();
    const matchJudul = item.judul_diskusi.toLowerCase().includes(q);
    const matchBody = item.body.toLowerCase().includes(q);
    const matchAuthor = item.user?.nama_user?.toLowerCase().includes(q);
    const matchFaskes = item.faskes_terkait?.nama_faskes
      ?.toLowerCase()
      .includes(q);

    return matchJudul || matchBody || matchAuthor || matchFaskes;
  });

  const jumlahSemua = daftarDiskusi.length > 2 ? daftarDiskusi.length : 142;
  const jumlahSaya = daftarDiskusi.filter(
    (d) =>
      d.id_user === 1 ||
      (currentUser && d.id_user === currentUser.id_user)
  ).length || 4;

  const handleBuatDiskusiSukses = (baru: ApiDiskusi) => {
    setDaftarDiskusi([baru, ...daftarDiskusi]);
    setPesanNotif({
      tipe: "sukses",
      pesan: "Diskusi baru berhasil dipublikasikan!",
    });
  };

  const handleHapusDiskusi = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus diskusi ini?")) return;
    try {
      await api.deleteDiscussion(id).catch(() => null);
      setDaftarDiskusi((prev) => prev.filter((d) => d.id_diskusi !== id));
      setPesanNotif({
        tipe: "sukses",
        pesan: "Diskusi berhasil dihapus.",
      });
    } catch {
      setPesanNotif({
        tipe: "error",
        pesan: "Gagal menghapus diskusi.",
      });
    }
  };

  const handleBagikan = (id: number, judul: string) => {
    const url = `${window.location.origin}/diskusi/${id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setPesanNotif({
        tipe: "sukses",
        pesan: "Tautan diskusi berhasil disalin ke papan klip!",
      });
    }
  };

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#007E7A]">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-700 font-semibold">Forum Diskusi</span>
      </div>

      {/* Alert Notifikasi */}
      {pesanNotif && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            pesanNotif.tipe === "sukses"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {pesanNotif.tipe === "sukses" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{pesanNotif.pesan}</span>
          </div>
          <button
            type="button"
            onClick={() => setPesanNotif(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner Forum Diskusi */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#007E7A] text-white flex items-center gap-1.5 shadow-xs">
                <Users className="w-3.5 h-3.5" />
                <span>Warga Peduli Sehat Bogor</span>
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                Kota & Kab. Bogor
              </span>
            </div>

            <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
              Forum Diskusi Kesehatan & Faskes Bogor
            </h1>

            <p className="text-xs sm:text-[13px] text-slate-600 max-w-2xl leading-relaxed">
              Ruang berbagi pengalaman, tanya jawab rujukan BPJS, ketersediaan obat,
              serta tips kesehatan antarpasien dan tenaga kesehatan di wilayah Bogor.
            </p>
          </div>

          <Link
            href="/diskusi/buat"
            className="self-start px-4 py-2.5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs sm:text-[13px] font-bold flex items-center gap-2 transition shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Diskusi Baru</span>
          </Link>
        </div>

        {/* Kotak Pencarian */}
        <div className="pt-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Cari topik, pertanyaan, dokter, rujukan, atau nama faskes..."
              className="w-full h-12 pl-11 pr-24 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E7A] focus:border-transparent transition"
            />
            <button
              type="button"
              className="absolute right-2 px-4 py-2 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <span>Cari</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Filter Diskusi */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTabAktif("semua")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold flex items-center gap-2 transition shadow-xs ${
            tabAktif === "semua"
              ? "bg-[#007E7A] text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Semua Diskusi</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10.5px] ${
              tabAktif === "semua"
                ? "bg-white/25 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {jumlahSemua}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTabAktif("saya")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold flex items-center gap-2 transition shadow-xs ${
            tabAktif === "saya"
              ? "bg-[#007E7A] text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Diskusi Saya</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10.5px] ${
              tabAktif === "saya"
                ? "bg-white/25 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {jumlahSaya}
          </span>
        </button>
      </div>

      {/* Daftar Item Diskusi */}
      <div className="space-y-4">
        {sedangMemuat ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#007E7A] mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Memuat diskusi warga...
            </p>
          </div>
        ) : diskusiTerfilter.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">
              Belum Ada Diskusi Ditemukan
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada diskusi yang sesuai dengan kriteria filter atau pencarian Anda.
            </p>
          </div>
        ) : (
          diskusiTerfilter.map((item) => {
            const isOwner =
              item.id_user === 1 ||
              (currentUser && item.id_user === currentUser.id_user);
            const authorName = item.user?.nama_user || "Warga Bogor";
            const initials = authorName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const totalTanggapan = item.tanggapan?.length || 18;
            const likesCount = item.jumlah_suka ?? 24;
            const viewsCount = item.jumlah_dilihat ?? 342;
            const faskesName =
              item.faskes_terkait?.nama_faskes ||
              (item.id_diskusi === 1
                ? "RSUD Kota Bogor"
                : item.id_diskusi === 2
                ? "RS Siloam Bogor"
                : undefined);

            return (
              <div
                key={item.id_diskusi}
                className="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-[#007E7A] p-5 sm:p-6 shadow-xs hover:shadow-md transition space-y-4 relative"
              >
                {/* Header Row: Badges & Three dots */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isOwner && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#007E7A] border border-teal-200">
                        Diskusi Saya
                      </span>
                    )}
                    {faskesName && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4F3] text-[#007E7A] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{faskesName}</span>
                      </span>
                    )}
                  </div>

                  {/* Dropdown Menu Tiga Titik */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setMenuAktifId(
                          menuAktifId === item.id_diskusi ? null : item.id_diskusi
                        )
                      }
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      aria-label="Opsi diskusi"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuAktifId === item.id_diskusi && (
                      <div className="absolute right-0 top-7 z-20 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-xs animate-in fade-in duration-100">
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => {
                              setMenuAktifId(null);
                              handleHapusDiskusi(item.id_diskusi);
                            }}
                            className="w-full px-3.5 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Diskusi</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setMenuAktifId(null);
                              setTargetReportId(item.id_diskusi);
                              setTargetReportTitle(item.judul_diskusi);
                              setModalReportBuka(true);
                            }}
                            className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                          >
                            <Flag className="w-3.5 h-3.5 text-rose-500" />
                            <span>Laporkan Konten</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#007E7A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {initials}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight">
                      {authorName}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      2 jam yang lalu • {item.sublokasi_penulis || "Bogor"}
                    </p>
                  </div>
                </div>

                {/* Judul & Cuplikan Konten */}
                <div className="space-y-1.5">
                  <Link
                    href={`/diskusi/${item.id_diskusi}`}
                    className="block group"
                  >
                    <h2 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-[#007E7A] transition leading-snug">
                      {item.judul_diskusi}
                    </h2>
                  </Link>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-3">
                    {item.body}
                  </p>
                </div>

                {/* Footer Interaksi */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-4 text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5 hover:text-[#007E7A] cursor-pointer">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{likesCount} Suka</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{totalTanggapan} Balasan</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{viewsCount} Dilihat</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleBagikan(item.id_diskusi, item.judul_diskusi)
                      }
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Bagikan tautan"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/diskusi/${item.id_diskusi}`}
                      className="px-3.5 py-1.5 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <span>Buka Diskusi ({totalTanggapan})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Report Konten */}
      <ModalReportKonten
        isOpen={modalReportBuka}
        onClose={() => setModalReportBuka(false)}
        targetType="diskusi"
        targetId={targetReportId}
        judulKonten={targetReportTitle}
        onSuccess={() => {
          setPesanNotif({
            tipe: "sukses",
            pesan: "Laporan konten berhasil dikirim ke moderator.",
          });
        }}
      />

      {/* Modal Buat Diskusi Baru */}
      <ModalBuatDiskusi
        isOpen={modalBuatBuka}
        onClose={() => setModalBuatBuka(false)}
        onSuccess={handleBuatDiskusiSukses}
      />
    </div>
  );
}

