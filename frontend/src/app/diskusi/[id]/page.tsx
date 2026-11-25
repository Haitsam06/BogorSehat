"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Heart,
  MessageSquare,
  Eye,
  Share2,
  Trash2,
  Flag,
  Send,
  Camera,
  CornerUpLeft,
  ThumbsUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  api,
  ApiDiskusi,
  ApiTanggapan,
  getAuthUser,
  getAuthToken,
  messageFromError,
} from "@/lib/api";
import ModalReportKonten from "@/components/forum/ModalReportKonten";
import { FormAlert, FormTextarea } from "@/components/ui";

function formatTanggal(value?: string): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function DetailDiskusiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const idDiskusiNum = parseInt(id, 10);

  // Discussion state
  const [diskusi, setDiskusi] = useState<ApiDiskusi | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanKesalahan, setPesanKesalahan] = useState<string | null>(null);

  // Like states
  const [sudahLikeDiskusi, setSudahLikeDiskusi] = useState(false);
  const [jumlahLikeDiskusi, setJumlahLikeDiskusi] = useState(0);
  const [tanggapanDisukai, setTanggapanDisukai] = useState<number[]>([]);
  const [sedangLike, setSedangLike] = useState(false);
  const [sedangLikeTanggapan, setSedangLikeTanggapan] = useState<number | null>(
    null
  );

  // Reply form states
  const [teksTanggapan, setTeksTanggapan] = useState("");
  const [sedangKirimTanggapan, setSedangKirimTanggapan] = useState(false);
  // Nested reply states
  const [balasKeTanggapanId, setBalasKeTanggapanId] = useState<number | null>(
    null
  );
  const [teksSubBalasan, setTeksSubBalasan] = useState("");
  const [sedangKirimSubBalasan, setSedangKirimSubBalasan] = useState(false);


  // Report modal
  const [modalReportBuka, setModalReportBuka] = useState(false);
  const [targetReport, setTargetReport] = useState<{
    tipe: "diskusi" | "tanggapan";
    id: number;
    title: string;
  }>({
    tipe: "diskusi",
    id: idDiskusiNum,
    title: "",
  });

  // Notification
  const [pesanNotif, setPesanNotif] = useState<{
    tipe: "sukses" | "error";
    pesan: string;
  } | null>(null);

  const currentUser = getAuthUser();
  const token = getAuthToken();

  // Load from API if available
  useEffect(() => {
    let aktif = true;
    async function muatDetail() {
      if (isNaN(idDiskusiNum)) {
        setSedangMemuat(false);
        setPesanKesalahan("Diskusi tidak ditemukan.");
        return;
      }
      setSedangMemuat(true);
      setPesanKesalahan(null);
      try {
        const res = await api.getDiscussionDetail(idDiskusiNum);
        if (aktif) {
          setDiskusi(res);
          setJumlahLikeDiskusi(res.jumlah_suka ?? 0);
        }
      } catch (err) {
        if (aktif) {
          setDiskusi(null);
          setPesanKesalahan(
            messageFromError(err, "Gagal memuat detail diskusi.")
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
  }, [idDiskusiNum]);

  if (diskusi === null) {
    return (
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-16 text-center space-y-3">
        {sedangMemuat ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-[#007E7A] mx-auto" />
            <p className="text-xs text-slate-500">Memuat diskusi...</p>
          </>
        ) : (
          <>
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              {pesanKesalahan ?? "Diskusi tidak ditemukan."}
            </p>
            <Link
              href="/diskusi"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007E7A] text-white text-xs font-bold"
            >
              Kembali ke Forum Diskusi
            </Link>
          </>
        )}
      </div>
    );
  }

  // Check if current user is owner
  const isDiskusiOwner =
    currentUser !== null &&
    (diskusi.id_user === currentUser.id_user ||
      diskusi.user?.id_user === currentUser.id_user);

  // Toggle Like Discussion
  const handleToggleLike = async () => {
    if (!token) {
      setPesanNotif({
        tipe: "error",
        pesan: "Silakan login terlebih dahulu untuk menyukai diskusi.",
      });
      return;
    }
    if (sedangLike) return;

    setSedangLike(true);
    try {
      const res = sudahLikeDiskusi
        ? await api.unlikeDiscussion(diskusi.id_diskusi)
        : await api.likeDiscussion(diskusi.id_diskusi);
      setSudahLikeDiskusi(res.disukai);
      setJumlahLikeDiskusi(res.jumlah_suka);
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal memperbarui suka diskusi."),
      });
    } finally {
      setSedangLike(false);
    }
  };

  // Submit new response
  const handleKirimTanggapan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teksTanggapan.trim()) return;

    if (!token) {
      setPesanNotif({
        tipe: "error",
        pesan: "Silakan login terlebih dahulu untuk memberikan tanggapan.",
      });
      return;
    }

    setSedangKirimTanggapan(true);
    setPesanNotif(null);
    try {
      const newTanggapan = await api.addDiscussionReply(diskusi.id_diskusi, {
        body: teksTanggapan.trim(),
      });

      setDiskusi((prev) =>
        prev === null
          ? prev
          : {
              ...prev,
              tanggapan: [newTanggapan, ...(prev.tanggapan || [])],
            }
      );
      setTeksTanggapan("");
      setPesanNotif({
        tipe: "sukses",
        pesan: "Tanggapan Anda berhasil dikirim!",
      });
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal mengirim tanggapan."),
      });
    } finally {
      setSedangKirimTanggapan(false);
    }
  };

  // Submit nested reply
  const handleKirimSubBalasan = async (idParent: number) => {
    if (!teksSubBalasan.trim()) return;
    if (!token) {
      setPesanNotif({
        tipe: "error",
        pesan: "Silakan login terlebih dahulu untuk membalas tanggapan.",
      });
      return;
    }

    setSedangKirimSubBalasan(true);
    try {
      const newReply = await api.replyToReply(idParent, {
        body: teksSubBalasan.trim(),
      });

      setDiskusi((prev) =>
        prev === null
          ? prev
          : {
              ...prev,
              tanggapan: (prev.tanggapan || []).map((t) =>
                t.id_tanggapan_diskusi === idParent
                  ? { ...t, replies: [...(t.replies || []), newReply] }
                  : t
              ),
            }
      );

      setBalasKeTanggapanId(null);
      setTeksSubBalasan("");
      setPesanNotif({
        tipe: "sukses",
        pesan: "Balasan berhasil dikirim!",
      });
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal mengirim balasan."),
      });
    } finally {
      setSedangKirimSubBalasan(false);
    }
  };

  // Delete reply
  const handleHapusTanggapan = async (idTanggapan: number) => {
    if (!confirm("Hapus tanggapan ini?")) return;
    try {
      await api.deleteReply(idTanggapan);
      setDiskusi((prev) =>
        prev === null
          ? prev
          : {
              ...prev,
              tanggapan: (prev.tanggapan || []).filter(
                (t) => t.id_tanggapan_diskusi !== idTanggapan
              ),
            }
      );
      setPesanNotif({
        tipe: "sukses",
        pesan: "Tanggapan berhasil dihapus.",
      });
    } catch {
      setPesanNotif({
        tipe: "error",
        pesan: "Gagal menghapus tanggapan.",
      });
    }
  };

  // Delete own discussion
  const handleHapusDiskusi = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus diskusi ini?")) return;
    try {
      await api.deleteDiscussion(diskusi.id_diskusi);
      router.push("/diskusi");
    } catch {
      setPesanNotif({
        tipe: "error",
        pesan: "Gagal menghapus diskusi.",
      });
    }
  };

  // Share
  const handleBagikan = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setPesanNotif({
        tipe: "sukses",
        pesan: "Tautan diskusi berhasil disalin ke clipboard!",
      });
    }
  };

  const handleToggleLikeTanggapan = async (idTanggapan: number) => {
    if (!token) {
      setPesanNotif({
        tipe: "error",
        pesan: "Silakan login terlebih dahulu untuk menyukai tanggapan.",
      });
      return;
    }
    if (sedangLikeTanggapan === idTanggapan) return;

    setSedangLikeTanggapan(idTanggapan);
    const sudahDisukai = tanggapanDisukai.includes(idTanggapan);
    try {
      const res = sudahDisukai
        ? await api.unlikeReply(idTanggapan)
        : await api.likeReply(idTanggapan);

      setTanggapanDisukai((prev) =>
        res.disukai
          ? [...new Set([...prev, idTanggapan])]
          : prev.filter((id) => id !== idTanggapan)
      );
      setDiskusi((prev) =>
        prev === null
          ? prev
          : {
              ...prev,
              tanggapan: (prev.tanggapan || []).map((t) =>
                t.id_tanggapan_diskusi === idTanggapan
                  ? { ...t, jumlah_suka: res.jumlah_suka }
                  : {
                      ...t,
                      replies: (t.replies || []).map((r) =>
                        r.id_tanggapan_diskusi === idTanggapan
                          ? { ...r, jumlah_suka: res.jumlah_suka }
                          : r
                      ),
                    }
              ),
            }
      );
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal memperbarui suka tanggapan."),
      });
    } finally {
      setSedangLikeTanggapan(null);
    }
  };

  const authorName = diskusi.user?.nama_user || "Warga Bogor";
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const faskes = diskusi.faskes_terkait;
  const totalTanggapanCount =
    diskusi.jumlah_tanggapan ?? diskusi.tanggapan?.length ?? 0;

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
        <Link href="/" className="hover:text-[#007E7A]">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/diskusi" className="hover:text-[#007E7A]">
          Forum Diskusi
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-700 font-semibold truncate max-w-md">
          {diskusi.judul_diskusi}
        </span>
      </div>

      {/* Alert Notifikasi */}
      {pesanNotif && (
        <FormAlert
          tipe={pesanNotif.tipe}
          pesan={pesanNotif.pesan}
          onClose={() => setPesanNotif(null)}
        />
      )}

      {/* Konten Utama Diskusi & Tanggapan */}
      <div className="max-w-[880px] mx-auto space-y-6">
        {/* Card Konten Diskusi Utama */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          {/* Tag Nama Faskes / Kategori Diskusi */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {faskes ? (
                <Link
                  href={
                    faskes.id_faskes
                      ? `/faskes/${faskes.id_faskes}`
                      : `/cari-faskes?search=${encodeURIComponent(faskes.nama_faskes)}`
                  }
                  title="Kunjungi Profil Faskes"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-bold bg-[#E6F4F3] text-[#007E7A] border border-[#B3E0DC] hover:bg-[#d4edea] transition shadow-2xs group"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#007E7A] shrink-0" />
                  <span>{faskes.nama_faskes}</span>
                  {faskes.kota_kabupaten && (
                    <span className="text-[10px] text-teal-700/80 font-semibold">
                      • {faskes.kota_kabupaten}
                    </span>
                  )}
                </Link>
              ) : (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#E6F4F3] text-[#007E7A] border border-[#B3E0DC]">
                  {diskusi.kategori_diskusi || "Diskusi"}
                </span>
              )}
              {isDiskusiOwner && (
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Diskusi Saya
                </span>
              )}
            </div>
          </div>

            {/* Author row & action buttons */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#007E7A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {initials}
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 leading-tight">
                    {authorName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {diskusi.sublokasi_penulis ?? "Bogor"} •{" "}
                    {formatTanggal(diskusi.created_at)}
                  </p>
                </div>
              </div>

              {/* Action buttons on top right */}
              <div className="flex items-center gap-2">
                {isDiskusiOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={handleHapusDiskusi}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetReport({
                        tipe: "diskusi",
                        id: diskusi.id_diskusi,
                        title: diskusi.judul_diskusi,
                      });
                      setModalReportBuka(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                )}
              </div>
            </div>

            {/* Judul Diskusi */}
            <h1 className="text-xl sm:text-[23px] font-black text-slate-900 tracking-tight leading-snug">
              {diskusi.judul_diskusi}
            </h1>

            {/* Isi Konten Diskusi */}
            <div className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed space-y-3.5 whitespace-pre-line font-normal">
              {diskusi.body}
            </div>

            {/* Footer Bar: Likes, Comments count, Views count, Share */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-4 text-slate-500 font-medium">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  disabled={sedangLike}
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs ${
                    sudahLikeDiskusi
                      ? "bg-[#007E7A] text-white"
                      : "bg-[#007E7A] text-white hover:bg-[#006965]"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>{jumlahLikeDiskusi} Disukai</span>
                </button>

                <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>{totalTanggapanCount} Tanggapan</span>
                </span>

                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{diskusi.jumlah_dilihat ?? 0} Dilihat</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleBagikan}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </button>
            </div>
          </div>

          {/* Card Tulis Tanggapan Warga */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#007E7A]" />
              <span>Tulis Tanggapan Warga</span>
            </h3>

            <form onSubmit={handleKirimTanggapan} className="space-y-3">
              <FormTextarea
                required
                rows={4}
                value={teksTanggapan}
                onChange={(e) => setTeksTanggapan(e.target.value)}
                placeholder="Tulis tanggapan atau pengalaman Anda seputar topik ini... (Saling menghargai dan jaga kerahasiaan data medis)"
                className="leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lampirkan Bukti / Foto</span>
                  </button>
                  <span className="hidden sm:inline">Format JPG/PNG maks 2MB</span>
                </div>

                <button
                  type="submit"
                  disabled={sedangKirimTanggapan || !teksTanggapan.trim()}
                  className="px-5 py-2 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                >
                  {sedangKirimTanggapan ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Kirim</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section Diskusi & Tanggapan */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Diskusi & Tanggapan</span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-[#E6F4F3] text-[#007E7A] font-bold">
                {totalTanggapanCount}
              </span>
            </h3>

            {/* List Tanggapan */}
            <div className="space-y-3.5">
              {(diskusi.tanggapan || []).map((tanggapan) => {
                const isThreadAuthor =
                  tanggapan.user?.nama_user === authorName ||
                  tanggapan.id_user === diskusi.id_user;
                const isReplyOwner =
                  currentUser &&
                  (tanggapan.id_user === currentUser.id_user ||
                    tanggapan.user?.id_user === currentUser.id_user);
                const replyAuthorName =
                  tanggapan.user?.nama_user || "Warga Bogor";
                const replyInitials = replyAuthorName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={tanggapan.id_tanggapan_diskusi}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3"
                  >
                    {/* Header Tanggapan */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#007E7A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {replyInitials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900">
                              {replyAuthorName}
                            </h4>
                            {isThreadAuthor && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                Penulis Thread
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {formatTanggal(tanggapan.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Top right actions for reply */}
                      <div>
                        {isReplyOwner ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleHapusTanggapan(
                                  tanggapan.id_tanggapan_diskusi
                                )
                              }
                              className="p-1 text-red-500 hover:text-red-700 rounded transition"
                              title="Hapus tanggapan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetReport({
                                tipe: "tanggapan",
                                id: tanggapan.id_tanggapan_diskusi,
                                title: tanggapan.body.slice(0, 40) + "...",
                              });
                              setModalReportBuka(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[11px] font-semibold flex items-center gap-1 transition"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Report</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Isi Tanggapan */}
                    <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed pl-11">
                      {tanggapan.body}
                    </div>

                    {/* Footer Tanggapan: Suka & Balas */}
                    <div className="flex items-center gap-4 pl-11 pt-1 text-xs text-slate-500 font-medium">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleLikeTanggapan(
                            tanggapan.id_tanggapan_diskusi
                          )
                        }
                        disabled={
                          sedangLikeTanggapan ===
                          tanggapan.id_tanggapan_diskusi
                        }
                        className={`flex items-center gap-1 transition ${
                          tanggapanDisukai.includes(
                            tanggapan.id_tanggapan_diskusi
                          )
                            ? "text-[#007E7A] font-bold"
                            : "hover:text-[#007E7A]"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{tanggapan.jumlah_suka ?? 0} Suka</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setBalasKeTanggapanId(
                            balasKeTanggapanId ===
                              tanggapan.id_tanggapan_diskusi
                              ? null
                              : tanggapan.id_tanggapan_diskusi
                          )
                        }
                        className="flex items-center gap-1 hover:text-[#007E7A] transition"
                      >
                        <CornerUpLeft className="w-3.5 h-3.5" />
                        <span>Balas</span>
                      </button>
                    </div>

                    {/* Form Nested Sub-Balasan */}
                    {balasKeTanggapanId === tanggapan.id_tanggapan_diskusi && (
                      <div className="pl-11 pt-2 space-y-2">
                        <textarea
                          rows={2}
                          value={teksSubBalasan}
                          onChange={(e) => setTeksSubBalasan(e.target.value)}
                          placeholder={`Balas untuk ${replyAuthorName}...`}
                          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setBalasKeTanggapanId(null)}
                            className="px-3 py-1 rounded text-xs text-slate-600 hover:bg-slate-100"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            disabled={
                              sedangKirimSubBalasan || !teksSubBalasan.trim()
                            }
                            onClick={() =>
                              handleKirimSubBalasan(
                                tanggapan.id_tanggapan_diskusi
                              )
                            }
                            className="px-3 py-1 rounded bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold disabled:opacity-50"
                          >
                            Kirim Balasan
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Render Replies ke reply jika ada */}
                    {tanggapan.replies && tanggapan.replies.length > 0 && (
                      <div className="pl-11 pt-2 space-y-2">
                        {tanggapan.replies.map((sub) => (
                          <div
                            key={sub.id_tanggapan_diskusi}
                            className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">
                                {sub.user?.nama_user || "Warga"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {formatTanggal(sub.created_at)}
                              </span>
                            </div>
                            <p className="text-slate-600">{sub.body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      {/* Modal Report Konten */}
      <ModalReportKonten
        isOpen={modalReportBuka}
        onClose={() => setModalReportBuka(false)}
        targetType={targetReport.tipe}
        targetId={targetReport.id}
        judulKonten={targetReport.title}
        onSuccess={() => {
          setPesanNotif({
            tipe: "sukses",
            pesan: "Laporan konten berhasil dikirim ke moderator.",
          });
        }}
      />
    </div>
  );
}

