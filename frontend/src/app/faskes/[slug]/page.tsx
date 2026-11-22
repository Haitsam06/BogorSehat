"use client";

import React, { use, useState, useEffect, useMemo } from "react";
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
  Stethoscope,
  MessageSquare,
  X,
} from "lucide-react";
import type { DataFaskesItem } from "@/data/data_faskes";
import PetaLeaflet from "@/components/map/peta_leaflet";
import ModalReportFaskes from "@/components/faskes/ModalReportFaskes";
import FaskesImageCarousel from "@/components/faskes/FaskesImageCarousel";
import StarRating from "@/components/ui/StarRating";
import {
  api,
  ApiFaskes,
  ApiKomentar,
  mapApiFaskesToItem,
  getAuthToken,
  getAuthUser,
  messageFromError,
} from "@/lib/api";
import { useFaskes } from "@/context/FaskesContext";

function hitungJarakKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function DetailFaskesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { lokasiPengguna } = useFaskes();

  const [faskesItem, setFaskesItem] = useState<DataFaskesItem | null>(null);
  const [rawApiFaskes, setRawApiFaskes] = useState<ApiFaskes | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanKesalahan, setPesanKesalahan] = useState<string | null>(null);

  // Comments state
  const [daftarKomentar, setDaftarKomentar] = useState<ApiKomentar[]>([]);
  const [teks_ulasan_baru, set_teks_ulasan_baru] = useState("");
  const [rating_bintang, set_rating_bintang] = useState(0);
  const [sedangKirimUlasan, setSedangKirimUlasan] = useState(false);
  const [balasKeId, setBalasKeId] = useState<number | null>(null);
  const [teksBalasan, setTeksBalasan] = useState("");
  const [sedangKirimBalasan, setSedangKirimBalasan] = useState(false);

  // Modal Report Faskes state
  const [modalFeedbackBuka, setModalFeedbackBuka] = useState(false);
  const [targetLaporKomentar, setTargetLaporKomentar] = useState<{
    id: number;
    ringkasan: string;
  } | null>(null);
  const [alasanLapor, setAlasanLapor] = useState("Komentar tidak relevan");
  const [catatanLapor, setCatatanLapor] = useState("");
  const [sedangLapor, setSedangLapor] = useState(false);

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
      const userCoords =
        lokasiPengguna?.latitude && lokasiPengguna?.longitude
          ? { latitude: lokasiPengguna.latitude, longitude: lokasiPengguna.longitude }
          : undefined;

      try {
        if (targetId) {
          const res = await api.getFaskesDetail(targetId, userCoords);
          if (aktif) {
            setRawApiFaskes(res);
            setFaskesItem(mapApiFaskesToItem(res));
          }
        } else {
          const resSearch = await api.getFaskes({
            search: slug,
            latitude: lokasiPengguna?.latitude,
            longitude: lokasiPengguna?.longitude,
          });
          const found = resSearch.data?.[0];
          if (found) {
            targetId = found.id_faskes;
            if (aktif) {
              setRawApiFaskes(found);
              setFaskesItem(mapApiFaskesToItem(found));
            }
          }
        }

        if (targetId) {
          const komRes = await api.getComments(targetId);
          if (aktif) {
            setDaftarKomentar(komRes.data || []);
          }
        } else if (aktif) {
          setPesanKesalahan("Fasilitas kesehatan tidak ditemukan.");
        }
      } catch (err) {
        if (aktif) {
          setFaskesItem(null);
          setPesanKesalahan(
            messageFromError(err, "Gagal memuat detail fasilitas kesehatan.")
          );
        }
      } finally {
        if (aktif) setSedangMemuat(false);
      }
    }

    muatDetail();

    return () => {
      aktif = false;
    };
  }, [slug, lokasiPengguna?.latitude, lokasiPengguna?.longitude]);

  // Jarak dinamis dihitung menggunakan useMemo tanpa conditional return sebelumnya
  const jarakDinamisKm = useMemo(() => {
    if (
      !lokasiPengguna?.latitude ||
      !lokasiPengguna?.longitude ||
      !faskesItem?.latitude ||
      !faskesItem?.longitude
    ) {
      return null;
    }
    return hitungJarakKm(
      lokasiPengguna.latitude,
      lokasiPengguna.longitude,
      faskesItem.latitude,
      faskesItem.longitude
    );
  }, [
    lokasiPengguna?.latitude,
    lokasiPengguna?.longitude,
    faskesItem?.latitude,
    faskesItem?.longitude,
  ]);

  const linkMapsTujuan = useMemo(() => {
    if (!faskesItem) return "";
    const lat = faskesItem.latitude;
    const lng = faskesItem.longitude;
    const nama = encodeURIComponent(faskesItem.nama_faskes);
    if (lokasiPengguna?.latitude && lokasiPengguna?.longitude) {
      return `https://www.google.com/maps/dir/?api=1&origin=${lokasiPengguna.latitude},${lokasiPengguna.longitude}&destination=${lat},${lng}+(${nama})`;
    }
    return (
      rawApiFaskes?.link_maps ||
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}+(${nama})`
    );
  }, [faskesItem, lokasiPengguna, rawApiFaskes]);

  const teksJarak =
    jarakDinamisKm !== null
      ? `${jarakDinamisKm.toFixed(1)} km`
      : faskesItem?.jarak_km || "";
  const waktuTempuh =
    jarakDinamisKm !== null
      ? `${Math.max(1, Math.round(jarakDinamisKm * 3))} mnt`
      : faskesItem?.waktu_tempuh || "";

  // Kirim ulasan baru
  const tanganiKirimUlasan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teks_ulasan_baru.trim() || !faskesItem) return;

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
        ...(rating_bintang > 0 ? { rating: rating_bintang } : {}),
      });
      setDaftarKomentar([baru, ...daftarKomentar]);
      set_teks_ulasan_baru("");
      set_rating_bintang(0);
      setPesanNotif({ tipe: "sukses", pesan: "Ulasan Anda berhasil dikirim." });
      const userCoords =
        lokasiPengguna?.latitude && lokasiPengguna?.longitude
          ? { latitude: lokasiPengguna.latitude, longitude: lokasiPengguna.longitude }
          : undefined;
      const refreshed = await api.getFaskesDetail(faskesItem.id_faskes, userCoords);
      setRawApiFaskes(refreshed);
      setFaskesItem(mapApiFaskesToItem(refreshed));
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal mengirim ulasan."),
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
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal mengirim balasan."),
      });
    } finally {
      setSedangKirimBalasan(false);
    }
  };

  // Hapus komentar
  const tanganiHapusKomentar = async (idKomentar: number) => {
    if (!faskesItem) return;
    try {
      await api.deleteComment(idKomentar);
      setDaftarKomentar((prev) =>
        prev.filter((k) => k.id_komentar !== idKomentar)
      );
      setPesanNotif({ tipe: "sukses", pesan: "Ulasan berhasil dihapus." });
      const userCoords =
        lokasiPengguna?.latitude && lokasiPengguna?.longitude
          ? { latitude: lokasiPengguna.latitude, longitude: lokasiPengguna.longitude }
          : undefined;
      const refreshed = await api.getFaskesDetail(faskesItem.id_faskes, userCoords);
      setRawApiFaskes(refreshed);
      setFaskesItem(mapApiFaskesToItem(refreshed));
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal menghapus ulasan."),
      });
    }
  };

  const tanganiLaporKomentar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLaporKomentar) return;

    if (!token) {
      setPesanNotif({
        tipe: "error",
        pesan: "Silakan login terlebih dahulu untuk melaporkan komentar.",
      });
      return;
    }

    setSedangLapor(true);
    try {
      await api.reportComment(targetLaporKomentar.id, {
        alasan: alasanLapor,
        catatan: catatanLapor.trim() || undefined,
      });
      setPesanNotif({
        tipe: "sukses",
        pesan: "Laporan komentar berhasil dikirim ke moderator.",
      });
      setTargetLaporKomentar(null);
      setCatatanLapor("");
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal mengirim laporan komentar."),
      });
    } finally {
      setSedangLapor(false);
    }
  };

  if (faskesItem === null) {
    return (
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-16 text-center space-y-3">
        {sedangMemuat ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-[#007E7A] mx-auto" />
            <p className="text-xs text-slate-500">Memuat detail faskes...</p>
          </>
        ) : (
          <>
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              {pesanKesalahan ?? "Fasilitas kesehatan tidak ditemukan."}
            </p>
            <Link
              href="/cari-faskes"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007E7A] text-white text-xs font-bold"
            >
              Kembali ke Pencarian Faskes
            </Link>
          </>
        )}
      </div>
    );
  }

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
                {teksJarak} dari lokasi Anda • Estimasi ~{waktuTempuh}
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
          {/* Kartu Galeri Foto (Carousel maks 5 / Fallback Logo + Warna), Deskripsi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <FaskesImageCarousel
              images={rawApiFaskes?.images}
              bannerUrl={rawApiFaskes?.banner_url}
              namaFaskes={faskesItem.nama_faskes}
              kategoriFaskes={faskesItem.kategori_faskes}
            />

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
          </div>

          {/* Section Ulasan & Diskusi Warga (Card Tunggal Terintegrasi) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
            {/* Header Ringkasan Skor (Redesain Bersih, Tanpa Card di Dalam Card) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Ulasan &amp; Pengalaman Pasien
                </h3>
                <p className="text-xs text-slate-500">
                  Ulasan dan diskusi pengalaman warga di {faskesItem.nama_faskes}
                </p>
              </div>

              {/* Skor Rating */}
              {faskesItem.jumlah_ulasan > 0 ? (
                <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200 px-4 py-2.5 rounded-2xl shrink-0 self-start sm:self-auto shadow-2xs">
                  <div className="text-2xl font-black text-amber-500 leading-none">
                    {faskesItem.rating_faskes}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, idx) => {
                        const terisi = idx < Math.round(Number(faskesItem.rating_faskes) || 0);
                        return (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              terisi ? "fill-amber-400 text-amber-400" : "text-amber-200"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[11px] font-bold text-amber-800">
                      {faskesItem.jumlah_ulasan} Ulasan Pasien
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shrink-0 self-start sm:self-auto">
                  <Star className="w-4 h-4 text-slate-300" />
                  <div>
                    <p className="text-xs font-bold text-slate-700 leading-none">Belum Dirating</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {daftarKomentar.length > 0 ? `${daftarKomentar.length} Diskusi` : "Belum ada ulasan"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Form Tambah Ulasan (Hanya tampil jika login) atau Prompt Login */}
            {token ? (
              <form onSubmit={tanganiKirimUlasan} className="border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 bg-slate-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#007E7A] text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                      {currentUser?.nama_user ? currentUser.nama_user.slice(0, 2).toUpperCase() : "WG"}
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {currentUser?.nama_user || "Pengguna Terdaftar"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Beri Rating:</span>
                    <StarRating
                      rating={rating_bintang}
                      interaktif={true}
                      onChange={(r) => set_rating_bintang(rating_bintang === r ? 0 : r)}
                      ukuran="besar"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={teks_ulasan_baru}
                  onChange={(e) => set_teks_ulasan_baru(e.target.value)}
                  placeholder="Bagikan ulasan detail mengenai keramahan tenaga medis, ketepatan jadwal poli, kebersihan fasilitas, dan efisiensi pelayanan farmasi obat..."
                  className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A] transition"
                />

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="submit"
                    disabled={sedangKirimUlasan || !teks_ulasan_baru.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold inline-flex items-center gap-1.5 transition disabled:opacity-50 shadow-2xs"
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
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <MessageSquare className="w-4 h-4 text-[#007E7A] shrink-0" />
                  <span>Silakan masuk ke akun untuk meninggalkan ulasan atau komentar pengalaman Anda.</span>
                </div>
                <Link
                  href="/masuk"
                  className="px-4 py-2 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold transition text-center shrink-0 shadow-2xs"
                >
                  Masuk untuk Mengulas
                </Link>
              </div>
            )}

            {/* Daftar Komentar & Ulasan Terintegrasi */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-900">
                Ulasan &amp; Diskusi Pasien ({daftarKomentar.length})
              </h4>

              {daftarKomentar.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-500 text-xs space-y-1">
                  <p className="font-semibold text-slate-700">Belum ada ulasan untuk fasilitas ini.</p>
                  <p>Jadilah yang pertama membagikan pengalaman pelayanan kesehatan Anda.</p>
                </div>
              ) : (
                daftarKomentar.map((item) => {
                  const idPenulis = item.user?.id_user ?? item.id_user;
                  const bolehHapus =
                    currentUser !== null &&
                    (currentUser.id_user === idPenulis ||
                      currentUser.role_user === "admin");

                  return (
                    <div
                      key={item.id_komentar}
                      className="rounded-xl border border-slate-200/90 p-4 sm:p-5 bg-slate-50/30 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#007E7A] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
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
                              {item.rating && item.rating > 0 && (
                                <StarRating rating={item.rating} ukuran="kecil" tampilkanSkor={false} />
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
                        <button
                          type="button"
                          onClick={() => {
                            setTargetLaporKomentar({
                              id: item.id_komentar,
                              ringkasan: item.body,
                            });
                            setAlasanLapor("Komentar tidak relevan");
                            setCatatanLapor("");
                          }}
                          className="text-slate-500 flex items-center gap-1 hover:text-rose-600"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Laporkan</span>
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
                            className="w-full p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
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
                        <div className="pl-4 space-y-2.5 border-l-2 border-slate-200 pt-2">
                          {item.replies.map((reply) => (
                            <div key={reply.id_komentar} className="bg-white p-3 rounded-xl border border-slate-150 space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">
                                  {reply.user?.nama_user || "Warga"}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {reply.created_at ? new Date(reply.created_at).toLocaleDateString("id-ID") : ""}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px]">{reply.body}</p>
                              {reply.replies && reply.replies.length > 0 && (
                                <div className="mt-1.5 pl-3 space-y-1 border-l border-slate-200">
                                  {reply.replies.map((sub) => (
                                    <div key={sub.id_komentar} className="text-[11px]">
                                      <span className="font-bold text-slate-900">
                                        {sub.user?.nama_user || "Warga"}:{" "}
                                      </span>
                                      <span className="text-slate-600">
                                        {sub.body}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
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
        </div>

        {/* Kolom Kanan: Peta Mini, Poliklinik, dan Sarana & Fasilitas */}
        <div className="lg:col-span-4 space-y-5">
          {/* Kartu Peta Mini & Petunjuk Arah */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
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
                  Kontak: {rawApiFaskes?.telp_faskes || "-"}
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

          {/* Kartu Daftar Poliklinik (Scrollable) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Poliklinik &amp; Spesialisasi
              </h3>
              {faskesItem.daftar_poli.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#E6F4F3] text-[#007E7A] text-[10px] font-extrabold shrink-0">
                  {faskesItem.daftar_poli.length}
                </span>
              )}
            </div>
            {faskesItem.daftar_poli.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Belum ada data poliklinik &amp; spesialisasi tercatat.
              </p>
            ) : (
              <div className="max-h-[280px] overflow-y-auto pr-1.5 space-y-2">
                {faskesItem.daftar_poli.map((namaPoli) => (
                  <div
                    key={namaPoli}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E6F4F3] text-[#007E7A] flex items-center justify-center shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-slate-800 leading-snug">
                        {namaPoli}
                      </span>
                      {faskesItem.status_bpjs && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold leading-none">
                          BPJS Aktif
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kartu Sarana & Fasilitas Penunjang Medis (Scrollable) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Sarana &amp; Fasilitas Penunjang Medis
              </h3>
              {rawApiFaskes?.fasilitas && rawApiFaskes.fasilitas.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#E6F4F3] text-[#007E7A] text-[10px] font-extrabold shrink-0">
                  {rawApiFaskes.fasilitas.length}
                </span>
              )}
            </div>
            {!rawApiFaskes?.fasilitas || rawApiFaskes.fasilitas.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Belum ada data sarana &amp; fasilitas penunjang medis tercatat.
              </p>
            ) : (
              <div className="max-h-[280px] overflow-y-auto pr-1.5 space-y-2.5">
                {rawApiFaskes.fasilitas.map((fas) => (
                  <div
                    key={fas.id_fasilitas}
                    className="flex items-start gap-2 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#007E7A] shrink-0 mt-0.5" />
                    <span className="leading-snug">{fas.nama_fasilitas}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
      {targetLaporKomentar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={tanganiLaporKomentar}
            className="w-full max-w-md bg-white rounded-2xl p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Laporkan Komentar
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {targetLaporKomentar.ringkasan}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTargetLaporKomentar(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
                aria-label="Tutup formulir laporan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block text-xs font-bold text-slate-800 space-y-1">
              <span>Alasan</span>
              <select
                value={alasanLapor}
                onChange={(e) => setAlasanLapor(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
              >
                <option value="Komentar tidak relevan">
                  Komentar tidak relevan
                </option>
                <option value="Informasi menyesatkan">
                  Informasi menyesatkan
                </option>
                <option value="Kata kasar atau ujaran kebencian">
                  Kata kasar atau ujaran kebencian
                </option>
                <option value="Spam atau promosi">Spam atau promosi</option>
              </select>
            </label>

            <label className="block text-xs font-bold text-slate-800 space-y-1">
              <span>Catatan (opsional)</span>
              <textarea
                rows={3}
                value={catatanLapor}
                onChange={(e) => setCatatanLapor(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
                placeholder="Jelaskan alasan laporan Anda..."
              />
            </label>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTargetLaporKomentar(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={sedangLapor}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {sedangLapor ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
