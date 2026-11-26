import type { BpjsStatus } from "@/lib/api";

/**
 * Tiga keadaan kerjasama BPJS, mengikuti sumber Aplicares.
 * Sebelumnya hanya boolean sehingga "dalam proses" tidak bisa dibedakan
 * dari "belum bekerja sama".
 */
export const BPJS_STATUS_LABEL: Record<BpjsStatus, string> = {
  mendukung: "Mitra BPJS",
  dalam_proses: "Dalam Proses",
  tidak_mendukung: "Non-BPJS",
};

export const BPJS_STATUS_SHORT: Record<BpjsStatus, string> = {
  mendukung: "BPJS",
  dalam_proses: "Proses BPJS",
  tidak_mendukung: "Non-BPJS",
};

export const BPJS_STATUS_CLASS: Record<BpjsStatus, string> = {
  mendukung: "bg-emerald-50 text-emerald-700 border-emerald-200",
  dalam_proses: "bg-amber-50 text-amber-700 border-amber-200",
  tidak_mendukung: "bg-slate-100 text-slate-600 border-slate-200",
};
