"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  LogIn,
} from "lucide-react";
import { useFaskes } from "@/context/FaskesContext";
import { lokasi_default_pengguna } from "@/data/data_faskes";
import {
  api,
  ApiDiskusi,
  ApiPaginationMeta,
  getAuthUser,
  getAuthToken,
  messageFromError,
} from "@/lib/api";
import ModalReportKonten from "@/components/forum/ModalReportKonten";
import DiskusiCard from "@/components/forum/DiskusiCard";
import { EmptyState, FormAlert, SearchInput } from "@/components/ui";

/** Radius filter "Diskusi Faskes Terdekat", dalam kilometer. */
const RADIUS_TERDEKAT_KM = 3;

export default function ForumDiskusiPage() {
  const router = useRouter();
  const [tabAktif, setTabAktif] = useState<"semua" | "terdekat" | "saya">(
    "semua"
  );
  const [kataKunci, setKataKunci] = useState("");
  const [daftarDiskusi, setDaftarDiskusi] = useState<ApiDiskusi[]>([]);
  const [metaPaginasi, setMetaPaginasi] = useState<ApiPaginationMeta | null>(null);
  const [halaman, setHalaman] = useState(1);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [totalSemua, setTotalSemua] = useState(0);
  const [totalSaya, setTotalSaya] = useState(0);
  const [daftarTerdekat, setDaftarTerdekat] = useState<ApiDiskusi[]>([]);
  const [sedangMemuatTerdekat, setSedangMemuatTerdekat] = useState(true);
  const [galatTerdekat, setGalatTerdekat] = useState<string | null>(null);
  const [terdekatSudahDimuat, setTerdekatSudahDimuat] = useState(false);

  // Modal states
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

  const { sudahLogin, lokasiPengguna, deteksiLokasiGPS, memuatGPS } = useFaskes();
  const currentUser = getAuthUser();
  const token = getAuthToken();

  // Pelaporan konten butuh akun warga; tamu langsung diarahkan ke login.
  const bukaLaporan = (id: number, judul: string) => {
    if (!sudahLogin) {
      router.push("/masuk?next=/diskusi");
      return;
    }
    setTargetReportId(id);
    setTargetReportTitle(judul);
    setModalReportBuka(true);
  };

  useEffect(() => {
    // Tab "terdekat" punya loader sendiri: endpoint-nya tidak dipaginasi.
    if (tabAktif === "terdekat") return;

    let aktif = true;
    async function muatData() {
      if (tabAktif === "saya" && !token) {
        setDaftarDiskusi([]);
        setMetaPaginasi(null);
        setTotalSaya(0);
        setSedangMemuat(false);
        return;
      }

      try {
        setSedangMemuat(true);
        const res =
          tabAktif === "saya"
            ? await api.getMyDiscussions(halaman)
            : await api.getDiscussions(halaman);
        if (aktif) {
          setDaftarDiskusi((prev) =>
            halaman === 1 ? res.data || [] : [...prev, ...(res.data || [])]
          );
          setMetaPaginasi(res.meta ?? null);
          const totalCount = res.meta?.total ?? res.data?.length ?? 0;
          if (tabAktif === "semua") {
            setTotalSemua(totalCount);
          } else {
            setTotalSaya(totalCount);
          }
        }
      } catch (err) {
        if (aktif) {
          setDaftarDiskusi([]);
          setPesanNotif({
            tipe: "error",
            pesan: messageFromError(err, "Gagal memuat daftar diskusi."),
          });
        }
      } finally {
        if (aktif) setSedangMemuat(false);
      }
    }
    muatData();
    return () => {
      aktif = false;
    };
  }, [tabAktif, token, halaman]);

  // Muat jumlah diskusi pribadi secara independen di awal
  useEffect(() => {
    let aktif = true;
    async function muatCountSaya() {
      if (!token) {
        setTotalSaya(0);
        return;
      }
      try {
        const res = await api.getMyDiscussions(1);
        if (aktif) {
          setTotalSaya(res.meta?.total ?? res.data?.length ?? 0);
        }
      } catch {
        if (aktif) setTotalSaya(0);
      }
    }
    muatCountSaya();
    return () => {
      aktif = false;
    };
  }, [token]);

  useEffect(() => {
    if (tabAktif !== "terdekat") return;

    let aktif = true;
    async function muatTerdekat() {
      try {
        setSedangMemuatTerdekat(true);
        const data = await api.getNearbyDiscussions(
          lokasiPengguna.latitude,
          lokasiPengguna.longitude,
          RADIUS_TERDEKAT_KM
        );
        if (aktif) {
          setDaftarTerdekat(data);
          setGalatTerdekat(null);
        }
      } catch (err) {
        if (aktif) {
          setDaftarTerdekat([]);
          setGalatTerdekat(
            messageFromError(err, "Gagal memuat diskusi faskes terdekat.")
          );
        }
      } finally {
        if (aktif) {
          setSedangMemuatTerdekat(false);
          setTerdekatSudahDimuat(true);
        }
      }
    }
    muatTerdekat();
    return () => {
      aktif = false;
    };
  }, [tabAktif, lokasiPengguna.latitude, lokasiPengguna.longitude]);

  const sumberDiskusi = tabAktif === "terdekat" ? daftarTerdekat : daftarDiskusi;

  // Filter kata kunci berlaku untuk kedua sumber; tab "terdekat" tetap
  // memakai urutan jarak dari backend.
  const diskusiTerfilter = sumberDiskusi.filter((item) => {
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

  const jumlahSemua = totalSemua || (metaPaginasi?.total ?? daftarDiskusi.length);
  const jumlahSaya = totalSaya;
  const sedangMemuatAktif =
    tabAktif === "terdekat" ? sedangMemuatTerdekat : sedangMemuat;

  // Context memakai pusat Kota Bogor selama izin GPS belum diberikan.
  const memakaiLokasiDefault =
    lokasiPengguna.latitude === lokasi_default_pengguna.latitude &&
    lokasiPengguna.longitude === lokasi_default_pengguna.longitude;

  const handleHapusDiskusi = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus diskusi ini?")) return;
    try {
      await api.deleteDiscussion(id);
      // Hapus di kedua sumber: kartu yang sama bisa tampil di tab mana pun.
      setDaftarDiskusi((prev) => prev.filter((d) => d.id_diskusi !== id));
      setDaftarTerdekat((prev) => prev.filter((d) => d.id_diskusi !== id));
      setTotalSemua((prev) => Math.max(0, prev - 1));
      setTotalSaya((prev) => Math.max(0, prev - 1));
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
        <FormAlert
          tipe={pesanNotif.tipe}
          pesan={pesanNotif.pesan}
          onClose={() => setPesanNotif(null)}
        />
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
            href={sudahLogin ? "/diskusi/buat" : "/masuk?next=/diskusi/buat"}
            className="self-start px-4 py-2.5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs sm:text-[13px] font-bold flex items-center gap-2 transition shadow-xs shrink-0"
          >
            {sudahLogin ? (
              <Plus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{sudahLogin ? "Buat Diskusi Baru" : "Masuk untuk Buat Diskusi"}</span>
          </Link>
        </div>

        {/* Kotak Pencarian */}
        <div className="pt-1">
          <SearchInput
            value={kataKunci}
            onChange={(val) => {
              setKataKunci(val);
              setHalaman(1);
            }}
            placeholder="Cari topik, pertanyaan, dokter, rujukan, atau nama faskes..."
            className="!h-12 border border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Tabs Filter Diskusi */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => {
            setTabAktif("semua");
            setHalaman(1);
          }}
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
          onClick={() => {
            setTabAktif("terdekat");
            setHalaman(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold flex items-center gap-2 transition shadow-xs ${
            tabAktif === "terdekat"
              ? "bg-[#007E7A] text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Faskes Terdekat</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10.5px] ${
              tabAktif === "terdekat"
                ? "bg-white/25 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {terdekatSudahDimuat ? daftarTerdekat.length : `${RADIUS_TERDEKAT_KM} km`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTabAktif("saya");
            setHalaman(1);
          }}
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
        {tabAktif === "terdekat" && (
          <div className="bg-[#E6F4F3] border border-[#007E7A]/25 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11.5px] text-[#005F5C] flex items-center gap-2 leading-snug">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>
                {memakaiLokasiDefault
                  ? `Menampilkan faskes dalam ${RADIUS_TERDEKAT_KM} km dari pusat Kota Bogor. Aktifkan GPS untuk memakai lokasi Anda.`
                  : `Menampilkan diskusi faskes dalam ${RADIUS_TERDEKAT_KM} km dari ${lokasiPengguna.nama_jalan}.`}
              </span>
            </p>
            {memakaiLokasiDefault && (
              <button
                type="button"
                onClick={deteksiLokasiGPS}
                disabled={memuatGPS}
                className="px-3 py-1.5 rounded-lg bg-[#007E7A] hover:bg-[#006965] text-white text-[11px] font-bold transition disabled:opacity-60 shrink-0"
              >
                {memuatGPS ? "Mendeteksi..." : "Gunakan Lokasi Saya"}
              </button>
            )}
          </div>
        )}
        {galatTerdekat && tabAktif === "terdekat" && (
          <FormAlert
            tipe="error"
            pesan={galatTerdekat}
            onClose={() => setGalatTerdekat(null)}
          />
        )}

        {sedangMemuatAktif ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#007E7A] mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              {tabAktif === "terdekat"
                ? `Mencari diskusi faskes dalam radius ${RADIUS_TERDEKAT_KM} km...`
                : "Memuat diskusi warga..."}
            </p>
          </div>
        ) : diskusiTerfilter.length === 0 ? (
          <EmptyState
            icon={tabAktif === "terdekat" ? MapPin : MessageSquare}
            judul={
              tabAktif === "terdekat"
                ? "Belum Ada Diskusi di Sekitar Anda"
                : "Belum Ada Diskusi Ditemukan"
            }
            deskripsi={
              tabAktif === "terdekat"
                ? kataKunci.trim()
                  ? "Tidak ada diskusi faskes terdekat yang cocok dengan pencarian Anda."
                  : `Belum ada diskusi yang membahas faskes dalam radius ${RADIUS_TERDEKAT_KM} km dari ${memakaiLokasiDefault ? "pusat Kota Bogor" : "lokasi Anda"}.`
                : tabAktif === "saya" && !token
                ? "Masuk sebagai warga untuk melihat diskusi yang Anda buat."
                : "Tidak ada diskusi yang sesuai dengan kriteria filter atau pencarian Anda."
            }
          />
        ) : (
          diskusiTerfilter.map((item) => (
            <DiskusiCard
              key={item.id_diskusi}
              item={item}
              currentUser={currentUser}
              onHapus={handleHapusDiskusi}
              onLapor={bukaLaporan}
              onBagikan={handleBagikan}
            />
          ))
        )}

        {tabAktif !== "terdekat" &&
          metaPaginasi &&
          metaPaginasi.current_page < metaPaginasi.last_page && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setHalaman((prev) => prev + 1)}
                disabled={sedangMemuat}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition disabled:opacity-50"
              >
                {sedangMemuat ? "Memuat..." : "Muat Diskusi Lainnya"}
              </button>
            </div>
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

    </div>
  );
}

