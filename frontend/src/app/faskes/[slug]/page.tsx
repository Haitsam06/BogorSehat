"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Navigation,
  Map,
  Share2,
  ExternalLink,
  Star,
  Send,
  Trash2,
  CornerUpLeft,
  ThumbsUp,
  Flag,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  daftar_faskes_utama,
  DataFaskesItem,
} from "@/data/data_faskes";
import { BadgePoli, DaftarBadgePoli } from "@/components/ui/badge_poli";
import PetaLeaflet from "@/components/map/peta_leaflet";
import ModalReportFaskes from "@/components/faskes/ModalReportFaskes";
import {
  api,
  ApiFaskes,
  ApiKomentar,
  mapApiFaskesToItem,
  getAuthToken,
  getAuthUser,
} from "@/lib/api";

export default function DetailFaskesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [faskesItem, setFaskesItem] = useState<DataFaskesItem>(() => {
    return (
      daftar_faskes_utama.find((item) => item.slug_faskes === slug) ||
      daftar_faskes_utama[0]
    );
  });
  const [rawApiFaskes, setRawApiFaskes] = useState<ApiFaskes | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  // Comments state
  const [daftarKomentar, setDaftarKomentar] = useState<ApiKomentar[]>([]);
  const [teks_ulasan_baru, set_teks_ulasan_baru] = useState("");
  const [rating_bintang, set_rating_bintang] = useState(5);
  const [sedangKirimUlasan, setSedangKirimUlasan] = useState(false);
  const [balasKeId, setBalasKeId] = useState<number | null>(null);
  const [teksBalasan, setTeksBalasan] = useState("");
  const [sedangKirimBalasan, setSedangKirimBalasan] = useState(false);

  // Modal Report Faskes state
  const [modalFeedbackBuka, setModalFeedbackBuka] = useState(false);

  // Status message
  const [pesanNotif, setPesanNotif] = useState<{
    tipe: "sukses" | "error";
    pesan: string;
  } | null>(null);

  const currentUser = getAuthUser();
  const token = getAuthToken();

  // Muat data faskes & ulasan dari API
  useEffect(() => {
    let aktif = true;

    async function muatDetail() {
      setSedangMemuat(true);

      const idFaskes = parseInt(slug, 10);
      let targetId: number | null = !isNaN(idFaskes) ? idFaskes : null;

      try {
        if (targetId) {
          const res = await api.getFaskesDetail(targetId);
          if (aktif && res) {
            setRawApiFaskes(res);
            setFaskesItem(mapApiFaskesToItem(res));
          }
        } else {
          // Cari berdasarkan slug/nama
          const resSearch = await api.getFaskes({ search: slug });
          if (aktif && resSearch.data && resSearch.data.length > 0) {
            const found = resSearch.data[0];
            targetId = found.id_faskes;
            setRawApiFaskes(found);
            setFaskesItem(mapApiFaskesToItem(found));
          }
        }

        // Muat komentar jika ada ID
        if (targetId) {
          const komRes = await api.getComments(targetId).catch(() => null);
          if (aktif && komRes?.data) {
            setDaftarKomentar(komRes.data);
          }
        }
      } catch {
        // Fallback tetap ke faskesItem awal
      } finally {
        if (aktif) setSedangMemuat(false);
      }
    }

    muatDetail();

    return () => {
      aktif = false;
    };
  }, [slug]);

  // Kirim ulasan baru
  const tanganiKirimUlasan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teks_ulasan_baru.trim()) return;

    if (!token) {
      setPesanNotif({
        tipe: "error",
        pesan: "Silakan login terlebih dahulu melalui portal untuk memberikan ulasan.",
      });
      return;
    }

    setSedangKirimUlasan(true);
    setPesanNotif(null);
    try {
      const baru = await api.addComment(faskesItem.id_faskes, {
        body: teks_ulasan_baru.trim(),
        rating: rating_bintang,
      });
      setDaftarKomentar([baru, ...daftarKomentar]);
      set_teks_ulasan_baru("");
      setPesanNotif({ tipe: "sukses", pesan: "Ulasan Anda berhasil dikirim." });
    } catch (err: any) {
      setPesanNotif({
        tipe: "error",
        pesan: err?.message || "Gagal mengirim ulasan.",
      });
    } finally {
      setSedangKirimUlasan(false);
    }
  };

  // Kirim balasan komentar
  const tanganiKirimBalasan = async (idKomentar: number) => {
    if (!teksBalasan.trim()) return;

    if (!token) {
      setPesanNotif({
        tipe: "error",
        pesan: "Silakan login terlebih dahulu untuk membalas komentar.",
      });
      return;
    }

    setSedangKirimBalasan(true);
    try {
      const balasan = await api.replyComment(idKomentar, {
        body: teksBalasan.trim(),
      });
      // Masukkan ke replies komentar terkait
      setDaftarKomentar((prev) =>
        prev.map((k) => {
          if (k.id_komentar === idKomentar) {
            return {
              ...k,
              replies: [...(k.replies || []), balasan],
            };
          }
          return k;
        })
      );
      setBalasKeId(null);
      setTeksBalasan("");
      setPesanNotif({ tipe: "sukses", pesan: "Balasan berhasil dikirim." });
    } catch (err: any) {
      setPesanNotif({
        tipe: "error",
        pesan: err?.message || "Gagal mengirim balasan.",
      });
    } finally {
      setSedangKirimBalasan(false);
    }
  };

  // Hapus komentar
  const tanganiHapusKomentar = async (idKomentar: number) => {
    try {
      await api.deleteComment(idKomentar);
      setDaftarKomentar((prev) =>
        prev.filter((k) => k.id_komentar !== idKomentar)
      );
      setPesanNotif({ tipe: "sukses", pesan: "Ulasan berhasil dihapus." });
    } catch (err: any) {
      setPesanNotif({
        tipe: "error",
        pesan: err?.message || "Gagal menghapus ulasan.",
      });
    }
  };

  const linkMapsTujuan =
    rawApiFaskes?.link_maps ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      faskesItem.nama_faskes
    )}%2C+${faskesItem.latitude}%2C+${faskesItem.longitude}`;

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-7 w-full space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#007E7A]">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/cari-faskes" className="hover:text-[#007E7A]">
          Cari Faskes
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-600">Detail Faskes</span>
      </div>

      {/* Alert Notifikasi Status */}
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

      {/* Kartu Header Fasilitas */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#D9F2F0] text-[#007E7A] uppercase">
              {faskesItem.kategori_faskes}
            </span>
            {faskesItem.status_bpjs && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ Mitra BPJS
              </span>
            )}
            {faskesItem.status_igd_24jam && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                IGD 24 Jam
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900">
            {faskesItem.nama_faskes}
          </h1>

          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {faskesItem.alamat_lengkap}, {faskesItem.kecamatan ? `${faskesItem.kecamatan}, ` : ""}
              {faskesItem.wilayah_kota_kab === "KOTA_BOGOR" ? "Kota Bogor" : "Kabupaten Bogor"}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            <span className="font-bold text-[#B45309] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>
                {faskesItem.jarak_km} dari lokasi Anda • Estimasi ~{faskesItem.waktu_tempuh}
              </span>
            </span>
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{faskesItem.koordinat_teks}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <Link
            href="/peta"
            className="px-5 py-2.5 rounded-lg bg-[#EBEEF2] hover:bg-slate-200 text-[#007E7A] text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Lihat Peta</span>
          </Link>
          <button
            type="button"
            onClick={() => setModalFeedbackBuka(true)}
            className="px-4 py-2.5 rounded-lg bg-[#EBEEF2] hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            title="Laporkan ketidaksesuaian data faskes"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Laporkan Informasi</span>
          </button>
        </div>
      </div>

      {/* Grid 2 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Kartu Galeri Foto, Deskripsi, dan Badge Poli */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-8">
                <img
                  src="/images/detail-photo-1.png"
                  alt={faskesItem.nama_faskes}
                  className="w-full h-[260px] sm:h-[290px] object-cover rounded-xl"
                />
              </div>
              <div className="sm:col-span-4 flex flex-col gap-2.5">
                <img
                  src="/images/detail-photo-2.png"
                  alt="Ruang Tunggu Faskes"
                  className="w-full h-[140px] object-cover rounded-xl"
                />
                <img
                  src="/images/detail-photo-3.png"
                  alt="Fasilitas Medis"
                  className="w-full h-[140px] object-cover rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <h2 className="text-base font-extrabold text-slate-900">
                Tentang {faskesItem.nama_faskes}
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                Fasilitas pelayanan kesehatan resmi terdata di wilayah{" "}
                {faskesItem.wilayah_kota_kab === "KOTA_BOGOR" ? "Kota Bogor" : "Kabupaten Bogor"}.
                Menyediakan pelayanan medis tingkat {faskesItem.kelas_faskes} dengan ketersediaan
                layanan darurat, poliklinik spesialis, serta integrasi rujukan BPJS Kesehatan.
              </p>
            </div>

            {/* Seksi Layanan Poliklinik */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Layanan Poliklinik &amp; Spesialisasi Tersedia
              </h3>
              <DaftarBadgePoli
                daftar_poli={faskesItem.daftar_poli}
                maksimal_tampil={12}
                ukuran_badge="kecil"
              />
            </div>

            {/* Sarana & Fasilitas Penunjang (dari database jika ada) */}
            {rawApiFaskes?.fasilitas && rawApiFaskes.fasilitas.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Sarana &amp; Fasilitas Penunjang Medis
                </h3>
                <div className="flex flex-wrap gap-2">
                  {rawApiFaskes.fasilitas.map((fas) => (
                    <span
                      key={fas.id_fasilitas}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      ✓ {fas.nama_fasilitas}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kartu Ringkasan Skor & Input Ulasan */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div className="bg-[#F3F6F9] rounded-xl p-4 flex items-center gap-5">
              <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-3 text-center shrink-0">
                <div className="text-2xl font-extrabold text-[#007E7A]">
                  {faskesItem.rating_faskes}
                </div>
                <div className="flex items-center justify-center gap-0.5 my-1">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className="w-3 h-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <div className="text-[10px] text-slate-500">
                  {daftarKomentar.length > 0 ? `${daftarKomentar.length} Ulasan` : "Ulasan Terverifikasi"}
                </div>
              </div>
              <div className="text-xs font-extrabold text-slate-800">
                Ulasan &amp; Pengalaman Warga/Pasien di {faskesItem.nama_faskes}
              </div>
            </div>

            {/* Form Tambah Ulasan */}
            <form onSubmit={tanganiKirimUlasan} className="border border-slate-100 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#007E7A] text-white font-bold text-xs flex items-center justify-center">
                    {currentUser?.nama_user ? currentUser.nama_user.slice(0, 2).toUpperCase() : "WG"}
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {currentUser?.nama_user || "Warga Bogor Sehat (Login untuk Mengulas)"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-700">Rating:</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((bintang) => (
                      <button
                        key={bintang}
                        type="button"
                        onClick={() => set_rating_bintang(bintang)}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-4 h-4 cursor-pointer transition ${
                            bintang <= rating_bintang
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                rows={3}
                value={teks_ulasan_baru}
                onChange={(e) => set_teks_ulasan_baru(e.target.value)}
                placeholder="Bagikan ulasan detail mengenai keramahan tenaga medis, ketepatan jadwal poli, kebersihan fasilitas, dan efisiensi pelayanan farmasi obat..."
                className="w-full p-3.5 rounded-xl bg-[#F3F6F9] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
              />

              <div className="flex items-center justify-between pt-1">
                {!token && (
                  <Link
                    href="/admin/login"
                    className="text-[11px] font-bold text-[#007E7A] hover:underline"
                  >
                    Masuk akun portal untuk mengirim ulasan
                  </Link>
                )}
                <button
                  type="submit"
                  disabled={sedangKirimUlasan || !teks_ulasan_baru.trim()}
                  className="px-5 py-2 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold inline-flex items-center gap-1.5 transition disabled:opacity-50 ml-auto"
                >
                  {sedangKirimUlasan ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Kirim Ulasan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Daftar Komentar & Ulasan */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-extrabold text-slate-900">
              Ulasan &amp; Diskusi ({daftarKomentar.length})
            </h3>

            {daftarKomentar.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-slate-500 text-xs space-y-1">
                <p className="font-semibold text-slate-700">Belum ada ulasan untuk fasilitas ini.</p>
                <p>Jadilah yang pertama membagikan pengalaman pelayanan kesehatan Anda.</p>
              </div>
            ) : (
              daftarKomentar.map((item) => {
                const bolehHapus =
                  currentUser &&
                  (currentUser.id_user === item.id_user || currentUser.role_user === "admin");

                return (
                  <div
                    key={item.id_komentar}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#007E7A] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {item.user?.nama_user ? item.user.nama_user.slice(0, 2).toUpperCase() : "WG"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {item.user?.nama_user || "Warga"}
                            </span>
                            {item.user?.role_user === "admin" && (
                              <span className="px-2 py-0.5 rounded bg-teal-50 text-[#007E7A] text-[9px] font-bold">
                                Petugas Resmi
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                            {item.rating && (
                              <span className="flex items-center text-amber-400">
                                {"★".repeat(item.rating)}
                              </span>
                            )}
                            <span>• {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "Baru saja"}</span>
                          </div>
                        </div>
                      </div>

                      {bolehHapus && (
                        <button
                          type="button"
                          onClick={() => tanganiHapusKomentar(item.id_komentar)}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {item.body}
                    </p>

                    {/* Tombol Balas */}
                    <div className="flex items-center gap-4 pt-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setBalasKeId(balasKeId === item.id_komentar ? null : item.id_komentar)}
                        className="font-bold text-[#007E7A] flex items-center gap-1 hover:underline"
                      >
                        <CornerUpLeft className="w-3 h-3" />
                        <span>Balas ({item.replies?.length || 0})</span>
                      </button>
                    </div>

                    {/* Form Input Balasan */}
                    {balasKeId === item.id_komentar && (
                      <div className="pt-2 pl-4 border-l-2 border-[#007E7A] space-y-2">
                        <textarea
                          rows={2}
                          value={teksBalasan}
                          onChange={(e) => setTeksBalasan(e.target.value)}
                          placeholder="Tulis balasan Anda..."
                          className="w-full p-2.5 rounded-lg bg-[#F3F6F9] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setBalasKeId(null)}
                            className="px-3 py-1 rounded-md text-slate-500 text-xs hover:bg-slate-100"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            disabled={sedangKirimBalasan || !teksBalasan.trim()}
                            onClick={() => tanganiKirimBalasan(item.id_komentar)}
                            className="px-4 py-1.5 rounded-md bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold disabled:opacity-50"
                          >
                            Kirim Balasan
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Daftar Balasan Bertingkat */}
                    {item.replies && item.replies.length > 0 && (
                      <div className="pl-4 space-y-2.5 border-l-2 border-slate-100 pt-2">
                        {item.replies.map((reply) => (
                          <div key={reply.id_komentar} className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">
                                {reply.user?.nama_user || "Warga"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {reply.created_at ? new Date(reply.created_at).toLocaleDateString("id-ID") : ""}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px]">{reply.body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan: Peta Mini & Petunjuk Arah */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-900">
              <MapPin className="w-4 h-4 text-[#007E7A]" />
              <span>Titik Lokasi GIS</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              WGS84 EPSG:4326
            </span>
          </div>

          <div className="h-56 rounded-xl overflow-hidden border border-slate-200">
            <PetaLeaflet
              daftar_faskes={[faskesItem]}
              faskes_terpilih={faskesItem}
              zoom_awal={15}
            />
          </div>

          <div className="text-[11px] space-y-1">
            <span className="font-bold text-slate-900 block">
              Alamat Resmi:
            </span>
            <p className="text-slate-500 leading-relaxed">
              {faskesItem.alamat_lengkap}, {faskesItem.kecamatan ? `${faskesItem.kecamatan}, ` : ""}
              {faskesItem.wilayah_kota_kab === "KOTA_BOGOR" ? "Kota Bogor" : "Kabupaten Bogor"}
            </p>
            {faskesItem.telepon_darurat && (
              <p className="text-slate-700 font-semibold pt-1">
                Kontak: {rawApiFaskes?.telp_faskes || "0251-8321000"}
              </p>
            )}
          </div>

          <a
            href={linkMapsTujuan}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Navigasi Rute Cepat (Google Maps)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Modal Laporkan Informasi Faskes */}
      <ModalReportFaskes
        isOpen={modalFeedbackBuka}
        onClose={() => setModalFeedbackBuka(false)}
        faskesId={faskesItem.id_faskes}
        namaFaskes={faskesItem.nama_faskes}
        onSuccess={() => {
          setPesanNotif({
            tipe: "sukses",
            pesan: "Laporan informasi faskes berhasil dikirim ke Admin.",
          });
        }}
      />
    </div>
  );
}
