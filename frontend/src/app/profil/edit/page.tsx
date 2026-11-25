"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Camera,
  CheckCircle2,
  Loader2,
  Save,
  ArrowLeft,
  UserCog,
  Info,
} from "lucide-react";
import { useFaskes } from "@/context/FaskesContext";
import { api, resolveStorageUrl, messageFromError } from "@/lib/api";
import { FormInput, FormPassword, FormSelect, FormAlert } from "@/components/ui";

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function EditProfilPage() {
  const router = useRouter();
  const { pengguna, sudahLogin, perbaruiPengguna } = useFaskes();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [fotoProfil, setFotoProfil] = useState<string | null>(null);

  // Password State
  const [sandiSaatIni, setSandiSaatIni] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [konfirmasiSandi, setKonfirmasiSandi] = useState("");

  // Status State
  const [sedangUnggahFoto, setSedangUnggahFoto] = useState(false);
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
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

  // Isi data pengguna ke form
  useEffect(() => {
    if (pengguna) {
      setNama(pengguna.nama_user || "");
      setEmail(pengguna.email_user || "");
      setTelepon(pengguna.nomor_telepon || "");
      setJenisKelamin(pengguna.jenis_kelamin || "");
      setTanggalLahir(pengguna.tanggal_lahir ? pengguna.tanggal_lahir.split("T")[0] : "");
      setFotoProfil(pengguna.foto_profil || null);
    }
  }, [pengguna]);

  // Tangani pemilihan file foto profil
  const tanganiPilihFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setPesanNotif({ tipe: "error", pesan: "Ukuran foto maksimal 2 MB." });
      return;
    }

    setSedangUnggahFoto(true);
    setPesanNotif(null);
    try {
      const res = await api.uploadFile(file, "profile");
      setFotoProfil(res.path);
      setPesanNotif({ tipe: "sukses", pesan: "Foto profil berhasil diunggah." });
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal mengunggah foto profil."),
      });
    } finally {
      setSedangUnggahFoto(false);
    }
  };

  const tanganiHapusFoto = () => {
    setFotoProfil(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const tanganiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanNotif(null);

    if (!nama.trim()) {
      setPesanNotif({ tipe: "error", pesan: "Nama lengkap wajib diisi." });
      return;
    }

    if (!email.trim()) {
      setPesanNotif({ tipe: "error", pesan: "Alamat email wajib diisi." });
      return;
    }

    if (sandiBaru) {
      if (!sandiSaatIni) {
        setPesanNotif({
          tipe: "error",
          pesan: "Masukkan kata sandi saat ini untuk mengubah kata sandi baru.",
        });
        return;
      }
      if (sandiBaru.length < 8) {
        setPesanNotif({
          tipe: "error",
          pesan: "Kata sandi baru minimal 8 karakter.",
        });
        return;
      }
      if (sandiBaru !== konfirmasiSandi) {
        setPesanNotif({
          tipe: "error",
          pesan: "Konfirmasi kata sandi baru tidak cocok.",
        });
        return;
      }
    }

    setSedangMenyimpan(true);
    try {
      const updatedUser = await api.updateProfile({
        nama_user: nama.trim(),
        email_user: email.trim(),
        nomor_telepon: telepon.trim() || null,
        jenis_kelamin: jenisKelamin || null,
        tanggal_lahir: tanggalLahir || null,
        foto_profil: fotoProfil,
        current_password: sandiSaatIni || undefined,
        password_user: sandiBaru || undefined,
        password_user_confirmation: konfirmasiSandi || undefined,
      });

      perbaruiPengguna(updatedUser);
      setPesanNotif({ tipe: "sukses", pesan: "Profil akun berhasil diperbarui." });
      
      // Kosongkan form password setelah berhasil
      setSandiSaatIni("");
      setSandiBaru("");
      setKonfirmasiSandi("");

      setTimeout(() => {
        router.push("/profil");
      }, 900);
    } catch (err) {
      setPesanNotif({
        tipe: "error",
        pesan: messageFromError(err, "Gagal memperbarui data profil."),
      });
    } finally {
      setSedangMenyimpan(false);
    }
  };

  if (!pengguna) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-7 h-7 animate-spin text-[#007E7A]" />
          <span>Memuat data profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] py-8 sm:py-12">
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Tombol Kembali ke Profil */}
        <Link
          href="/profil"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#007E7A] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Profil</span>
        </Link>

        {/* Header Halaman Edit Profil */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCog className="w-6 h-6 text-[#007E7A]" />
            <span>Pengaturan &amp; Edit Profil Akun</span>
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500">
            Kelola informasi data diri dan keamanan akun Anda.
          </p>
        </div>

        {/* Notifikasi Alert */}
        {pesanNotif && (
          <FormAlert
            tipe={pesanNotif.tipe}
            pesan={pesanNotif.pesan}
            onClose={() => setPesanNotif(null)}
          />
        )}

        <form onSubmit={tanganiSubmit} className="space-y-6">
          {/* =====================================================================
              CARD 1: FOTO PROFIL & IDENTITAS DASAR
             ===================================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="space-y-1 pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#007E7A]" />
                <span>Foto Profil &amp; Identitas Dasar</span>
              </h2>
              <p className="text-xs text-slate-500">
                Informasi identitas kependudukan dan sarana kontak terdaftar
              </p>
            </div>

            {/* Unggah Foto Profil */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#007E7A] text-white flex items-center justify-center font-black text-2xl shrink-0 overflow-hidden shadow-sm border-2 border-white">
                  {fotoProfil ? (
                    <img
                      src={resolveStorageUrl(fotoProfil)}
                      alt={nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(nama)}</span>
                  )}
                </div>

                {sedangUnggahFoto && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    Foto Wajah Resmi
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    Format JPG, PNG atau WebP (Maksimal 2 MB). Dianjurkan foto formal atau semi-formal untuk verifikasi layanan kependudukan.
                  </p>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={tanganiPilihFoto}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sedangUnggahFoto}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#007E7A]" />
                    <span>{sedangUnggahFoto ? "Mengunggah..." : "Ubah Foto"}</span>
                  </button>

                  {fotoProfil && (
                    <button
                      type="button"
                      onClick={tanganiHapusFoto}
                      className="px-3 py-1.5 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-bold transition"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Grid Input Form Identitas Dasar (Modular Components) */}
            <div className="space-y-4">
              <FormInput
                label="Nama Lengkap"
                required
                icon={User}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Alamat Email"
                  required
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: nama@email.com"
                  labelExtra={
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Terverifikasi</span>
                    </span>
                  }
                />

                <FormInput
                  label="Nomor Telepon / WhatsApp"
                  type="tel"
                  icon={Phone}
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="contoh: 081234567890"
                  helperText="Digunakan untuk notifikasi antrean & darurat 119."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Jenis Kelamin"
                  value={jenisKelamin}
                  onChange={(e) => setJenisKelamin(e.target.value)}
                  options={[
                    { value: "", label: "Pilih Jenis Kelamin" },
                    { value: "Laki-laki", label: "Laki-laki" },
                    { value: "Perempuan", label: "Perempuan" },
                  ]}
                />

                <FormInput
                  label="Tanggal Lahir"
                  type="date"
                  icon={Calendar}
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* =====================================================================
              CARD 2: KEAMANAN KATA SANDI (OPSIONAL)
             ===================================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#007E7A]" />
                  <span>Keamanan Kata Sandi</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Kosongkan jika Anda tidak ingin memperbarui kata sandi akun
                </p>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                Opsional
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormPassword
                label="Kata Sandi Saat Ini"
                value={sandiSaatIni}
                onChange={(e) => setSandiSaatIni(e.target.value)}
                placeholder="••••••••"
              />

              <FormPassword
                label="Kata Sandi Baru"
                value={sandiBaru}
                onChange={(e) => setSandiBaru(e.target.value)}
                placeholder="Minimal 8 karakter"
              />

              <FormPassword
                label="Konfirmasi Sandi Baru"
                value={konfirmasiSandi}
                onChange={(e) => setKonfirmasiSandi(e.target.value)}
                placeholder="Ulangi kata sandi"
              />
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#007E7A] shrink-0" />
              <span>Gunakan kombinasi minimal 8 karakter dengan huruf kapital, angka, dan simbol untuk keamanan maksimal.</span>
            </p>
          </div>

          {/* =====================================================================
              ACTION BAR BAWAH: BATAL & SIMPAN
             ===================================================================== */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/profil"
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-2xs"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={sedangMenyimpan}
              className="px-6 py-2.5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {sedangMenyimpan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
