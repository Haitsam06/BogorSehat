"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { FormAlert, SearchInput } from "@/components/ui";
import { api, ApiMasterItem, ApiPaginationMeta } from "@/lib/api";

function messageFromError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function AdminFasilitasPenunjangPage() {
  const [daftar, setDaftar] = useState<ApiMasterItem[]>([]);
  const [meta, setMeta] = useState<ApiPaginationMeta | null>(null);
  const [halaman, setHalaman] = useState(1);
  const [kataKunci, setKataKunci] = useState("");
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesan, setPesan] = useState<{
    tipe: "sukses" | "error";
    pesan: string;
  } | null>(null);

  const [konfirmasi, setKonfirmasi] = useState<ApiMasterItem | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  const muatData = useCallback(async () => {
    setSedangMemuat(true);
    try {
      const res = await api.getAdminFasilitas({
        search: kataKunci.trim() || undefined,
        page: halaman,
        per_page: 15,
      });
      setDaftar(res.data || []);
      setMeta(res.meta || null);
    } catch (err) {
      setPesan({
        tipe: "error",
        pesan: messageFromError(err, "Gagal memuat master fasilitas penunjang."),
      });
    } finally {
      setSedangMemuat(false);
    }
  }, [halaman, kataKunci]);

  useEffect(() => {
    muatData();
  }, [muatData]);

  const tanganiHapus = async (item: ApiMasterItem, force = false) => {
    setSedangHapus(true);
    setPesan(null);
    try {
      await api.deleteAdminFasilitas(item.id_fasilitas ?? 0, force);
      setPesan({ tipe: "sukses", pesan: "Fasilitas berhasil dihapus." });
      setKonfirmasi(null);
      await muatData();
    } catch (err) {
      setPesan({
        tipe: "error",
        pesan: messageFromError(err, "Gagal menghapus fasilitas."),
      });
    } finally {
      setSedangHapus(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-[1120px]">
        {pesan && (
          <FormAlert
            tipe={pesan.tipe}
            pesan={pesan.pesan}
            onClose={() => setPesan(null)}
          />
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900">
              Master Fasilitas Penunjang
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 max-w-xl leading-relaxed">
              Kelola daftar sarana dan fasilitas penunjang yang tersedia pada
              fasilitas kesehatan se-Kota &amp; Kab. Bogor.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <Link
              href="/admin/fasilitas-penunjang/tambah"
              className="h-11 px-5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Fasilitas</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <SearchInput
            value={kataKunci}
            onChange={(val) => {
              setKataKunci(val);
              setHalaman(1);
            }}
            placeholder="Cari nama atau ID fasilitas penunjang..."
            className="!h-11"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2F4F7] text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-4 pl-8 pr-4">NO &amp; ID</th>
                  <th className="py-4 px-4">NAMA FASILITAS PENUNJANG</th>
                  <th className="py-4 px-4">DIPAKAI FASKES</th>
                  <th className="py-4 pl-4 pr-8 text-center">AKSI MANAJEMEN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sedangMemuat ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#007E7A]" />
                        <span>Memuat master fasilitas penunjang...</span>
                      </div>
                    </td>
                  </tr>
                ) : daftar.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      Tidak ada fasilitas yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  daftar.map((item, index) => {
                    const noUrut =
                      (meta ? (meta.current_page - 1) * meta.per_page : 0) +
                      index +
                      1;

                    return (
                      <tr
                        key={item.id_fasilitas}
                        className="hover:bg-slate-50/70 transition"
                      >
                        <td className="py-4 pl-8 pr-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded bg-slate-200/80 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                              {noUrut}
                            </span>
                            <div>
                              <div className="font-extrabold text-slate-900 text-[13px]">
                                ID: {item.id_fasilitas}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-[#007E7A] shrink-0" />
                            <span className="font-bold text-slate-900 text-[13px]">
                              {item.nama_fasilitas}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              item.faskes_count > 0
                                ? "bg-[#A5F3FC]/60 text-[#0E7490]"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.faskes_count} faskes
                          </span>
                        </td>
                        <td className="py-4 pl-4 pr-8">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/fasilitas-penunjang/${item.id_fasilitas}/edit`}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1.5 transition"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setKonfirmasi(item)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1.5 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">
              Menampilkan{" "}
              <strong className="text-slate-900">{daftar.length}</strong> dari
              total <strong className="text-slate-900">{meta?.total ?? 0}</strong>{" "}
              fasilitas penunjang
            </span>

            {meta && meta.last_page > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={halaman <= 1}
                  onClick={() => setHalaman((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold hover:bg-slate-200 disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1 text-slate-700 font-bold">
                  Halaman {meta.current_page} dari {meta.last_page}
                </span>
                <button
                  type="button"
                  disabled={halaman >= meta.last_page}
                  onClick={() =>
                    setHalaman((p) => Math.min(meta.last_page, p + 1))
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold hover:bg-slate-200 disabled:opacity-40"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {konfirmasi && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Hapus Fasilitas Penunjang?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fasilitas <strong>{konfirmasi.nama_fasilitas}</strong> (ID{" "}
              {konfirmasi.id_fasilitas}) akan dihapus dari basis data.
              {konfirmasi.faskes_count > 0 && (
                <>
                  {" "}
                  Data ini dipakai oleh{" "}
                  <strong>{konfirmasi.faskes_count} faskes</strong>; menghapusnya
                  juga menghapus relasi tersebut.
                </>
              )}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setKonfirmasi(null)}
                className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={sedangHapus}
                onClick={() =>
                  tanganiHapus(konfirmasi, konfirmasi.faskes_count > 0)
                }
                className="h-10 px-5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-2 transition disabled:opacity-50"
              >
                {sedangHapus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebarLayout>
  );
}
