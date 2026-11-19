"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, Save, Wrench, X } from "lucide-react";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { api, messageFromError } from "@/lib/api";

interface AdminFasilitasFormProps {
  mode: "create" | "edit";
  fasilitasId?: number;
}

export default function AdminFasilitasForm({
  mode,
  fasilitasId,
}: AdminFasilitasFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [formId, setFormId] = useState(fasilitasId ? String(fasilitasId) : "");
  const [formNama, setFormNama] = useState("");
  const [sedangMemuat, setSedangMemuat] = useState(isEdit);
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !fasilitasId) return;
    let aktif = true;

    async function muatDetail() {
      setSedangMemuat(true);
      setPesanError(null);
      try {
        const detail = await api.getAdminFasilitasDetail(fasilitasId!);
        if (!aktif) return;
        setFormId(String(detail.id_fasilitas ?? fasilitasId!));
        setFormNama(detail.nama_fasilitas || "");
      } catch (err) {
        if (aktif) {
          setPesanError(
            messageFromError(err, "Gagal memuat detail fasilitas penunjang.")
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
  }, [isEdit, fasilitasId]);

  const tanganiSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);
    setSedangSimpan(true);

    try {
      if (isEdit && fasilitasId) {
        await api.updateAdminFasilitas(fasilitasId, {
          nama_fasilitas: formNama.trim(),
        });
      } else {
        await api.createAdminFasilitas({
          nama_fasilitas: formNama.trim(),
          id_fasilitas: formId.trim() ? Number(formId.trim()) : undefined,
        });
      }
      router.push("/admin/fasilitas-penunjang");
    } catch (err) {
      setPesanError(
        messageFromError(err, "Gagal menyimpan fasilitas penunjang.")
      );
    } finally {
      setSedangSimpan(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="max-w-[720px] mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/fasilitas-penunjang"
            className="p-2 text-slate-700 hover:text-slate-900 transition rounded-xl bg-white border border-slate-200 hover:bg-slate-50"
            title="Kembali ke Master Fasilitas Penunjang"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEdit
                ? "Edit Master Fasilitas Penunjang"
                : "Tambah Fasilitas Penunjang Baru"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit
                ? `Perbarui nama sarana/fasilitas penunjang untuk ID #${fasilitasId}.`
                : "Tambahkan sarana atau fasilitas penunjang medis baru ke master data."}
            </p>
          </div>
        </div>

        {pesanError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{pesanError}</span>
            <button
              type="button"
              onClick={() => setPesanError(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {sedangMemuat ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#007E7A] mx-auto" />
            <p className="text-xs text-slate-500">
              Memuat data fasilitas penunjang...
            </p>
          </div>
        ) : (
          <form
            onSubmit={tanganiSimpan}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5 text-xs"
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-[#E6F4F3] text-[#007E7A] flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Informasi Fasilitas Penunjang
              </h2>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                ID Fasilitas
              </label>
              <input
                type="number"
                min={1}
                disabled={isEdit}
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder="Kosongkan untuk ID otomatis"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A] disabled:bg-slate-100 disabled:text-slate-500"
              />
              <p className="text-[11px] text-slate-500">
                ID tidak dapat diubah setelah dibuat.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                Nama Fasilitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Contoh: Ruang Laktasi"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007E7A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Link
                href="/admin/fasilitas-penunjang"
                className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center transition"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={sedangSimpan}
                className="h-10 px-5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white text-xs font-extrabold inline-flex items-center gap-2 transition disabled:opacity-50"
              >
                {sedangSimpan ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isEdit ? "Simpan Perubahan" : "Simpan Fasilitas"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
