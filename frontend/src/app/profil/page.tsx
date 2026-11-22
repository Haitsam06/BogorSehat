"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  ShieldCheck,
  Pencil,
  LogOut,
  Star,
  MessageSquare,
  ThumbsUp,
  Eye,
  Trash2,
  ExternalLink,
  Loader2,
  Calendar,
  AlertCircle,
  Building2,
  MessageCircle,
} from "lucide-react";
import { useFaskes } from "@/context/FaskesContext";
import {
  api,
  ApiKomentar,
  ApiDiskusi,
  ApiTanggapan,
  resolveStorageUrl,
  messageFromError,
} from "@/lib/api";
import EmptyState from "@/components/ui/EmptyState";
import UlasanCard from "@/components/faskes/UlasanCard";
import DiskusiCard from "@/components/forum/DiskusiCard";

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatTanggal(tanggalStr?: string | null): string {
  if (!tanggalStr) return "-";
  try {
    const d = new Date(tanggalStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return tanggalStr;
  }
}

export default function ProfilPage() {
  const router = useRouter();
  const { pengguna, sudahLogin, keluar } = useFaskes();

  const [daftarKomentar, setDaftarKomentar] = useState<ApiKomentar[]>([]);
  const [daftarDiskusi, setDaftarDiskusi] = useState<ApiDiskusi[]>([]);
  const [daftarTanggapan, setDaftarTanggapan] = useState<ApiTanggapan[]>([]);

  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanNotif, setPesanNotif] = useState<{ tipe: "sukses" | "error"; pesan: string } | null>(null);

  // Redirect jika belum login
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sudahLogin) {
        router.push("/masuk");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [sudahLogin, router]);

  const muatDataAktivitas = useCallback(async () => {
    if (!sudahLogin) return;
    setSedangMemuat(true);
    try {
      const [resKomentar, resDiskusi, resTanggapan] = await Promise.all([
        api.getMyComments(1),
        api.getMyDiscussions(1),
        api.getMyReplies(1),
      ]);
      setDaftarKomentar(resKomentar.data || []);
      setDaftarDiskusi(resDiskusi.data || []);
      setDaftarTanggapan(resTanggapan.data || []);
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal memuat riwayat aktivitas akun."),
      });
    } finally {
      setSedangMemuat(false);
    }
  }, [sudahLogin]);

  useEffect(() => {
    muatDataAktivitas();
  }, [muatDataAktivitas]);

  const tanganiHapusKomentar = async (idKomentar: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) return;
    try {
      await api.deleteComment(idKomentar);
      setDaftarKomentar((prev) => prev.filter((k) => k.id_komentar !== idKomentar));
      setPesanNotif({ tipe: "sukses", pesan: "Ulasan berhasil dihapus." });
    } catch (err) {
      setPesanNotif({ tipe: "error", pesan: messageFromError(err, "Gagal menghapus ulasan.") });
    }
  };

  const tanganiHapusDiskusi = async (idDiskusi: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus topik diskusi ini?")) return;
    try {
      await api.deleteDiscussion(idDiskusi);
      setDaftarDiskusi((prev) => prev.filter((d) => d.id_diskusi !== idDiskusi));
      setPesanNotif({ tipe: "sukses", pesan: "Topik diskusi berhasil dihapus." });
    } catch (err) {
      setPesanNotif({ tipe: "error", pesan: messageFromError(err, "Gagal menghapus topik diskusi.") });
    }
  };

  const tanganiKeluar = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      await keluar();
      router.push("/masuk");
    }
  };

  if (!pengguna) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-7 h-7 animate-spin text-[#007E7A]" />
          <span>Memuat profil akun...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] py-8 sm:py-12">
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Notifikasi Alert */}
        {pesanNotif && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              pesanNotif.tipe === "sukses"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pesanNotif.pesan}</span>
            </div>
            <button
              type="button"
              onClick={() => setPesanNotif(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-3"
            >
              ✕
            </button>
          </div>
        )}

        {/* =====================================================================
            1. KARTU HEADER PROFIL PENGGUNA
           ===================================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Foto Profil / Inisial */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#007E7A] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-sm overflow-hidden border-2 border-white">
              {pengguna.foto_profil ? (
                <img
                  src={resolveStorageUrl(pengguna.foto_profil)}
                  alt={pengguna.nama_user}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(pengguna.nama_user)}</span>
              )}
            </div>

            {/* Informasi Akun */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-snug">
                {pengguna.nama_user}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <div className="inline-flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-[#007E7A] shrink-0" />
                  <span>Kota Bogor, Jawa Barat</span>
                </div>

                <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Email &amp; HP Aktif</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                <span>{pengguna.email_user}</span>
                {pengguna.nomor_telepon && (
                  <span> • {pengguna.nomor_telepon}</span>
                )}
              </div>
            </div>
          </div>

          {/* Tombol Aksi Kanan */}
          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <Link
              href="/profil/edit"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-xs transition"
            >
              <Pencil className="w-3.5 h-3.5 text-[#007E7A]" />
              <span>Edit Profil Akun</span>
            </Link>

            <button
              type="button"
              onClick={tanganiKeluar}
              className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            2. SECTION: ULASAN ANDA
           ===================================================================== */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Ulasan Anda</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {daftarKomentar.length} ulasan
            </span>
          </div>

          <div className="bg-transparent rounded-2xl">
            {sedangMemuat ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#007E7A] mx-auto" />
                <p className="text-xs">Memuat ulasan faskes Anda...</p>
              </div>
            ) : daftarKomentar.length === 0 ? (
              <EmptyState
                ikon={Building2}
                judul="Belum Ada Ulasan"
                deskripsi="Belum ada ulasan yang Anda tulis. Berikan ulasan pada fasilitas kesehatan yang pernah Anda kunjungi."
                teksTombol="Cari Faskes Sekarang"
                hrefTombol="/cari-faskes"
              />
            ) : (
              <div className="max-h-[460px] overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
                {daftarKomentar.map((ulasan) => (
                  <UlasanCard
                    key={ulasan.id_komentar}
                    ulasan={ulasan}
                    currentUser={pengguna}
                    onHapus={tanganiHapusKomentar}
                    tampilkanFaskesInfo={true}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================================
            3. SECTION: DISKUSI SAYA
           ===================================================================== */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#007E7A]" />
              <span>Diskusi Komunitas Saya</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {daftarDiskusi.length} topik
            </span>
          </div>

          <div className="bg-transparent rounded-2xl">
            {sedangMemuat ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#007E7A] mx-auto" />
                <p className="text-xs">Memuat riwayat diskusi Anda...</p>
              </div>
            ) : daftarDiskusi.length === 0 ? (
              <EmptyState
                ikon={MessageCircle}
                judul="Belum Ada Diskusi"
                deskripsi="Belum ada topik diskusi yang Anda buat di forum komunitas."
                teksTombol="Buka Forum Komunitas"
                hrefTombol="/diskusi"
              />
            ) : (
              <div className="max-h-[460px] overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
                {daftarDiskusi.map((diskusi) => (
                  <DiskusiCard
                    key={diskusi.id_diskusi}
                    item={diskusi}
                    currentUser={pengguna}
                    onHapus={tanganiHapusDiskusi}
                    tampilkanDetailPenulis={false}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================================
            4. SECTION: TANGGAPAN DISKUSI SAYA
           ===================================================================== */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Tanggapan Diskusi Saya</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {daftarTanggapan.length} tanggapan
            </span>
          </div>

          <div className="bg-transparent rounded-2xl">
            {sedangMemuat ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#007E7A] mx-auto" />
                <p className="text-xs">Memuat tanggapan Anda...</p>
              </div>
            ) : daftarTanggapan.length === 0 ? (
              <EmptyState
                ikon={MessageSquare}
                judul="Belum Ada Tanggapan"
                deskripsi="Belum ada tanggapan yang Anda kirimkan pada diskusi warga."
                teksTombol="Beri Tanggapan di Forum"
                hrefTombol="/diskusi"
              />
            ) : (
              <div className="max-h-[460px] overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
                {daftarTanggapan.map((tanggapan) => (
                  <div
                    key={tanggapan.id_tanggapan_diskusi}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 hover:border-slate-300 transition space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-slate-400 font-medium">Menanggapi:</span>
                        <Link
                          href={`/diskusi/${tanggapan.id_diskusi}`}
                          className="font-bold text-slate-800 hover:text-[#007E7A] transition line-clamp-1"
                        >
                          {tanggapan.diskusi?.judul_diskusi || `Topik Diskusi #${tanggapan.id_diskusi}`}
                        </Link>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formatTanggal(tanggapan.created_at)}
                      </span>
                    </div>

                    {/* Isi Tanggapan (line-clamp-2) */}
                    <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-2">
                      {tanggapan.body}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-500">
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tanggapan.jumlah_suka || 0} Suka</span>
                      </span>

                      <Link
                        href={`/diskusi/${tanggapan.id_diskusi}`}
                        className="text-[11px] font-bold text-[#007E7A] hover:underline flex items-center gap-1"
                      >
                        <span>Lihat di Forum Diskusi</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
