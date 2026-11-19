"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  MapPin,
  Save,
  Search,
  Star,
  Stethoscope,
  Trash2,
  UploadCloud,
  Wrench,
  X,
} from "lucide-react";
import type LType from "leaflet";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { FaskesThumbnail } from "@/components/ui/faskes_thumbnail";
import {
  api,
  ApiFasilitas,
  ApiFaskesImage,
  ApiSpesialisasi,
  messageFromError,
} from "@/lib/api";

const DAFTAR_KECAMATAN_SUGGESTIONS = [
  "Bogor Barat",
  "Bogor Tengah",
  "Bogor Timur",
  "Bogor Selatan",
  "Bogor Utara",
  "Tanah Sareal",
  "Babakan Madang",
  "Bojonggede",
  "Caringin",
  "Cariu",
  "Ciampea",
  "Ciawi",
  "Cibinong",
  "Cibungbulang",
  "Cigombong",
  "Cigudeg",
  "Cijeruk",
  "Cileungsi",
  "Ciomas",
  "Cisarua",
  "Ciseeng",
  "Citeureup",
  "Dramaga",
  "Gunung Putri",
  "Gunung Sindur",
  "Jasinga",
  "Jonggol",
  "Kemang",
  "Klapanunggal",
  "Leuwiliang",
  "Leuwisadeng",
  "Megamendung",
  "Nanggung",
  "Pamijahan",
  "Parung",
  "Parung Panjang",
  "Ranca Bungur",
  "Rumpin",
  "Sukajaya",
  "Sukamakmur",
  "Sukaraja",
  "Tajurhalang",
  "Tamansari",
  "Tanjungsari",
  "Tenjo",
  "Tenjolaya",
];

const JENIS_FASKES_OPTIONS = [
  "Rumah Sakit",
  "Puskesmas",
  "KLINIK PRATAMA",
  "Klinik Utama",
  "DOKTER PRAKTIK PERORANGAN",
  "DOKTER GIGI",
  "APOTEK",
  "Laboratorium Medis",
];

const KELAS_FASKES_OPTIONS = [
  { value: "", label: "Tidak Ada / Non-Kelas" },
  { value: "A", label: "Kelas A" },
  { value: "B", label: "Kelas B" },
  { value: "C", label: "Kelas C" },
  { value: "D", label: "Kelas D" },
];

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];

function normalizeImageFlags(items: ApiFaskesImage[]): ApiFaskesImage[] {
  const sliced = items.slice(0, MAX_IMAGES);
  if (sliced.length === 0) return [];

  let bannerIdx = sliced.findIndex((img) => img.is_banner);
  if (bannerIdx === -1) bannerIdx = 0;

  let thumbnailIdx = sliced.findIndex((img) => img.is_thumbnail);
  if (thumbnailIdx === -1) thumbnailIdx = 0;

  return sliced.map((img, idx) => ({
    ...img,
    is_banner: idx === bannerIdx,
    is_thumbnail: idx === thumbnailIdx,
    sort_order: idx,
  }));
}

interface AdminFaskesFormProps {
  mode: "create" | "edit";
  faskesId?: number;
}

export default function AdminFaskesForm({
  mode,
  faskesId,
}: AdminFaskesFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // Form states
  const [kdppk, setKdppk] = useState("");
  const [namaFaskes, setNamaFaskes] = useState("");
  const [jenisFaskes, setJenisFaskes] = useState("Rumah Sakit");
  const [kelasFaskes, setKelasFaskes] = useState("");
  const [kotaKabupaten, setKotaKabupaten] = useState("KOTA BOGOR");
  const [kecamatan, setKecamatan] = useState("");
  const [alamatFaskes, setAlamatFaskes] = useState("");
  const [telpFaskes, setTelpFaskes] = useState("");
  const [isSupportBpjs, setIsSupportBpjs] = useState(true);
  const [latitude, setLatitude] = useState("-6.595000");
  const [longitude, setLongitude] = useState("106.799000");

  // Relations
  const [masterSpesialisasi, setMasterSpesialisasi] = useState<ApiSpesialisasi[]>([]);
  const [masterFasilitas, setMasterFasilitas] = useState<ApiFasilitas[]>([]);
  const [selectedSpesialisasi, setSelectedSpesialisasi] = useState<string[]>([]);
  const [selectedFasilitas, setSelectedFasilitas] = useState<number[]>([]);
  const [cariSpesialisasi, setCariSpesialisasi] = useState("");
  const [cariFasilitas, setCariFasilitas] = useState("");

  // Images (max 5)
  const [images, setImages] = useState<ApiFaskesImage[]>([]);
  const [sedangUpload, setSedangUpload] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading / submission states
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [modePilihTitik, setModePilihTitik] = useState(true);

  // Leaflet refs
  const petaContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LType.Map | null>(null);
  const markerRef = useRef<LType.Marker | null>(null);

  // Load master data and, in edit mode, faskes detail
  useEffect(() => {
    let aktif = true;

    async function muatAwal() {
      setSedangMemuat(true);
      setPesanError(null);

      try {
        const [spesList, fasList, detail] = await Promise.all([
          api.getAllSpesialisasi(),
          api.getAllFasilitas(),
          isEdit && faskesId ? api.getFaskesDetail(faskesId) : Promise.resolve(null),
        ]);

        if (!aktif) return;

        setMasterSpesialisasi(spesList);
        setMasterFasilitas(fasList);

        if (detail) {
          setKdppk(detail.kdppk || "");
          setNamaFaskes(detail.nama_faskes || "");
          setJenisFaskes(detail.jenis_faskes || "");
          setKelasFaskes(detail.kelas_faskes || "");
          setKotaKabupaten(detail.kota_kabupaten || "KOTA BOGOR");
          setKecamatan(detail.kecamatan || "");
          setAlamatFaskes(detail.alamat_faskes || "");
          setTelpFaskes(detail.telp_faskes || "");
          setIsSupportBpjs(Boolean(detail.is_support_bpjs));
          setLatitude(String(detail.latitude ?? "-6.595000"));
          setLongitude(String(detail.longitude ?? "106.799000"));
          setSelectedSpesialisasi(
            (detail.spesialisasi ?? []).map((s) => s.id_spesialisasi)
          );
          setSelectedFasilitas(
            (detail.fasilitas ?? []).map((f) => f.id_fasilitas)
          );
          setImages(normalizeImageFlags(detail.images ?? []));
        }
      } catch (err) {
        if (aktif) {
          setPesanError(
            messageFromError(err, "Gagal memuat data formulir faskes.")
          );
        }
      } finally {
        if (aktif) setSedangMemuat(false);
      }
    }

    muatAwal();

    return () => {
      aktif = false;
    };
  }, [isEdit, faskesId]);

  // Initialize Leaflet Map once form finished initial load
  useEffect(() => {
    if (sedangMemuat) return;
    let aktif = true;

    async function initMap() {
      if (!petaContainerRef.current || leafletMapRef.current) return;
      const L = (await import("leaflet")).default;
      if (!aktif || !petaContainerRef.current) return;

      const latNum = parseFloat(latitude) || -6.595;
      const lngNum = parseFloat(longitude) || 106.799;

      const map = L.map(petaContainerRef.current, {
        center: [latNum, lngNum],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: "custom-faskes-marker",
        html: `
          <div style="background-color: #007E7A; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2.5px solid #FFFFFF;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v12m-6-6h12"/>
            </svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([latNum, lngNum], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setLatitude(pos.lat.toFixed(6));
        setLongitude(pos.lng.toFixed(6));
      });

      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        setLatitude(e.latlng.lat.toFixed(6));
        setLongitude(e.latlng.lng.toFixed(6));
      });

      leafletMapRef.current = map;
      markerRef.current = marker;
    }

    initMap();

    return () => {
      aktif = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedangMemuat]);

  const syncMapToCoordinates = (latStr: string, lngStr: string) => {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng) && leafletMapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      leafletMapRef.current.setView([lat, lng], leafletMapRef.current.getZoom());
    }
  };

  const jenisOptions = useMemo(() => {
    if (!jenisFaskes || JENIS_FASKES_OPTIONS.includes(jenisFaskes)) {
      return JENIS_FASKES_OPTIONS;
    }
    return [jenisFaskes, ...JENIS_FASKES_OPTIONS];
  }, [jenisFaskes]);

  const kelasOptions = useMemo(() => {
    if (
      !kelasFaskes ||
      KELAS_FASKES_OPTIONS.some((opt) => opt.value === kelasFaskes)
    ) {
      return KELAS_FASKES_OPTIONS;
    }
    return [
      ...KELAS_FASKES_OPTIONS,
      { value: kelasFaskes, label: `Kelas ${kelasFaskes}` },
    ];
  }, [kelasFaskes]);

  const filteredSpesialisasi = useMemo(() => {
    const q = cariSpesialisasi.trim().toLowerCase();
    if (!q) return masterSpesialisasi;
    return masterSpesialisasi.filter(
      (item) =>
        item.nama_spesialisasi.toLowerCase().includes(q) ||
        item.id_spesialisasi.toLowerCase().includes(q)
    );
  }, [masterSpesialisasi, cariSpesialisasi]);

  const filteredFasilitas = useMemo(() => {
    const q = cariFasilitas.trim().toLowerCase();
    if (!q) return masterFasilitas;
    return masterFasilitas.filter((item) =>
      item.nama_fasilitas.toLowerCase().includes(q)
    );
  }, [masterFasilitas, cariFasilitas]);

  const toggleSpesialisasi = (id: string) => {
    setSelectedSpesialisasi((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFasilitas = (id: number) => {
    setSelectedFasilitas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const tanganiUploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setPesanError(null);
    const sisaSlot = MAX_IMAGES - images.length;
    if (sisaSlot <= 0) {
      setPesanError(`Maksimal ${MAX_IMAGES} gambar per fasilitas kesehatan.`);
      return;
    }

    const candidates = files.slice(0, sisaSlot);
    if (files.length > sisaSlot) {
      setPesanError(
        `Hanya ${sisaSlot} gambar lagi yang dapat ditambahkan (maksimal ${MAX_IMAGES} gambar per faskes).`
      );
    }

    for (const file of candidates) {
      if (!ALLOWED_IMAGE_MIMES.includes(file.type)) {
        setPesanError(
          `File "${file.name}" ditolak. Format yang didukung hanya JPG, PNG, atau WebP.`
        );
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setPesanError(
          `Ukuran file "${file.name}" melebihi batas maksimal 5MB.`
        );
        return;
      }
    }

    setSedangUpload(true);
    try {
      const uploadedItems: ApiFaskesImage[] = [];
      for (const file of candidates) {
        const res = await api.uploadFile(file, "faskes");
        uploadedItems.push({
          path: res.path,
          url: res.url,
          is_banner: false,
          is_thumbnail: false,
        });
      }

      setImages((prev) => normalizeImageFlags([...prev, ...uploadedItems]));
    } catch (err) {
      const errors = (err as Error & { errors?: Record<string, string[]> })?.errors;
      if (errors?.context) {
        setPesanError(
          "Backend belum mengaktifkan upload gambar faskes (context=faskes). Pastikan perubahan backend pada API Contracts.md sudah diterapkan."
        );
      } else {
        setPesanError(
          messageFromError(err, "Gagal mengunggah gambar faskes.")
        );
      }
    } finally {
      setSedangUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const setBannerImage = (targetIndex: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({ ...img, is_banner: idx === targetIndex }))
    );
  };

  const setThumbnailImage = (targetIndex: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({ ...img, is_thumbnail: idx === targetIndex }))
    );
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return normalizeImageFlags(next);
    });
  };

  const removeImage = (targetIndex: number) => {
    setImages((prev) =>
      normalizeImageFlags(prev.filter((_, idx) => idx !== targetIndex))
    );
  };

  const handleSimpanFaskes = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);

    if (!namaFaskes.trim()) {
      setPesanError("Nama resmi fasilitas kesehatan wajib diisi.");
      return;
    }

    if (!alamatFaskes.trim()) {
      setPesanError("Alamat lengkap faskes wajib diisi.");
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setPesanError("Latitude tidak valid (harus antara -90 sampai 90).");
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setPesanError("Longitude tidak valid (harus antara -180 sampai 180).");
      return;
    }

    setSedangSimpan(true);

    const normalizedImages = normalizeImageFlags(images);

    const basePayload = {
      kdppk: kdppk.trim() || null,
      nama_faskes: namaFaskes.trim(),
      jenis_faskes: jenisFaskes.trim() || null,
      kelas_faskes: kelasFaskes.trim() || null,
      kota_kabupaten: kotaKabupaten,
      kecamatan: kecamatan.trim() || null,
      alamat_faskes: alamatFaskes.trim(),
      telp_faskes: telpFaskes.trim() || null,
      latitude: latNum,
      longitude: lngNum,
      is_support_bpjs: isSupportBpjs,
      id_spesialisasi: selectedSpesialisasi,
      id_fasilitas: selectedFasilitas,
      images: normalizedImages,
    };

    try {
      if (isEdit && faskesId) {
        await api.updateFaskes(faskesId, basePayload);
      } else {
        await api.createFaskes({
          ...basePayload,
          kdppk: basePayload.kdppk ?? undefined,
          jenis_faskes: basePayload.jenis_faskes ?? undefined,
          kelas_faskes: basePayload.kelas_faskes ?? undefined,
          kecamatan: basePayload.kecamatan ?? undefined,
          telp_faskes: basePayload.telp_faskes ?? undefined,
        });
      }
      router.push("/admin/faskes");
    } catch (err) {
      setPesanError(
        messageFromError(
          err,
          isEdit
            ? "Gagal memperbarui data faskes."
            : "Gagal menambahkan data faskes. Silakan coba kembali."
        )
      );
    } finally {
      setSedangSimpan(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="max-w-[1040px] mx-auto space-y-6 pb-12">
        {/* Header & Tombol Kembali */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/faskes"
              className="p-2 text-slate-700 hover:text-slate-900 transition rounded-xl bg-white border border-slate-200 hover:bg-slate-50"
              title="Kembali ke Kelola Data Faskes"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {isEdit
                  ? "Edit Data Fasilitas Kesehatan"
                  : "Tambah Fasilitas Kesehatan Baru"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEdit
                  ? `Perbarui informasi operasional, koordinat GIS, layanan, serta galeri gambar faskes #${faskesId}.`
                  : "Lengkapi data fasilitas kesehatan untuk dipublikasikan pada direktori dan peta WebGIS BogorSehat."}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#007E7A] mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Memuat data formulir faskes...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSimpanFaskes} className="space-y-6">
            {/* SECTION 1: Identitas & Kategori Faskes */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-[#007E7A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Identitas &amp; Kategori Faskes
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Kode Faskes / KDPPK
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={kdppk}
                    onChange={(e) => setKdppk(e.target.value)}
                    placeholder="Contoh: 0117R007 atau 3271045"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                  />
                  <p className="text-[11px] text-slate-400">
                    Opsional, maksimal 20 karakter dan harus unik jika diisi
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Nama Resmi Fasilitas Kesehatan{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaFaskes}
                    onChange={(e) => setNamaFaskes(e.target.value)}
                    placeholder="Contoh: RSUD Kota Bogor"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Jenis Faskes
                  </label>
                  <select
                    value={jenisFaskes}
                    onChange={(e) => setJenisFaskes(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                  >
                    <option value="">-- Pilih Jenis Faskes --</option>
                    {jenisOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Kelas Pelayanan
                  </label>
                  <select
                    value={kelasFaskes}
                    onChange={(e) => setKelasFaskes(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                  >
                    {kelasOptions.map((item) => (
                      <option key={item.value || "none"} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={telpFaskes}
                    onChange={(e) => setTelpFaskes(e.target.value)}
                    placeholder="Contoh: 0251-8312292"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#007E7A]/40 transition">
                  <input
                    type="checkbox"
                    checked={isSupportBpjs}
                    onChange={(e) => setIsSupportBpjs(e.target.checked)}
                    className="w-4 h-4 rounded text-[#007E7A] focus:ring-[#007E7A] accent-[#007E7A]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Mendukung Pelayanan BPJS Kesehatan
                  </span>
                </label>
              </div>
            </div>

            {/* SECTION 2: Lokasi & Koordinat GIS */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-[#007E7A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Lokasi &amp; Titik Koordinat GIS
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Kota / Kabupaten <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={kotaKabupaten}
                    onChange={(e) => setKotaKabupaten(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                  >
                    <option value="KOTA BOGOR">KOTA BOGOR</option>
                    <option value="KAB. BOGOR">KAB. BOGOR</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    list="daftar-kecamatan-bogor"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    placeholder="Contoh: Bogor Barat"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition"
                  />
                  <datalist id="daftar-kecamatan-bogor">
                    {DAFTAR_KECAMATAN_SUGGESTIONS.map((kec) => (
                      <option key={kec} value={kec} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Alamat Lengkap Faskes <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={alamatFaskes}
                  onChange={(e) => setAlamatFaskes(e.target.value)}
                  placeholder="Contoh: Jl. DR. Sumeru No.120, Menteng, Kec. Bogor Barat"
                  className="w-full p-3 rounded-lg border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A] focus:border-[#007E7A] transition leading-relaxed"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#007E7A]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Koordinat Presisi GIS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <span className="block text-[11px] font-semibold text-slate-600">
                      Latitude (Lintang) <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      value={latitude}
                      onChange={(e) => {
                        setLatitude(e.target.value);
                        syncMapToCoordinates(e.target.value, longitude);
                      }}
                      placeholder="-6.595000"
                      className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[11px] font-semibold text-slate-600">
                      Longitude (Bujur) <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      value={longitude}
                      onChange={(e) => {
                        setLongitude(e.target.value);
                        syncMapToCoordinates(latitude, e.target.value);
                      }}
                      placeholder="106.799000"
                      className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
                    />
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <div ref={petaContainerRef} className="w-full h-56 sm:h-64" />
                  <button
                    type="button"
                    onClick={() => setModePilihTitik((prev) => !prev)}
                    className={`absolute bottom-3 right-3 z-[400] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                      modePilihTitik
                        ? "bg-[#007E7A] text-white"
                        : "bg-white text-slate-800 border border-slate-200"
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Klik Peta / Geser Pin</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: Spesialisasi & Fasilitas Penunjang */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-[#007E7A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Layanan Poliklinik &amp; Fasilitas Penunjang
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Spesialisasi */}
                <div className="space-y-3 border border-slate-200/80 rounded-xl p-4 bg-slate-50/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                      <Stethoscope className="w-4 h-4 text-[#007E7A]" />
                      <span>Poliklinik / Spesialisasi</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F4F3] text-[#007E7A] text-[10px] font-extrabold">
                      {selectedSpesialisasi.length} dipilih
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cariSpesialisasi}
                      onChange={(e) => setCariSpesialisasi(e.target.value)}
                      placeholder="Cari spesialisasi..."
                      className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5">
                    {filteredSpesialisasi.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-4 text-center">
                        Spesialisasi tidak ditemukan.
                      </p>
                    ) : (
                      filteredSpesialisasi.map((item) => {
                        const checked = selectedSpesialisasi.includes(
                          item.id_spesialisasi
                        );
                        return (
                          <label
                            key={item.id_spesialisasi}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-xs cursor-pointer transition ${
                              checked
                                ? "bg-teal-50/70 border-[#007E7A]/50 text-slate-900 font-semibold"
                                : "bg-white border-slate-200/70 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleSpesialisasi(item.id_spesialisasi)
                              }
                              className="w-3.5 h-3.5 rounded accent-[#007E7A]"
                            />
                            <span className="flex-1 truncate">
                              {item.nama_spesialisasi}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.id_spesialisasi}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Fasilitas Penunjang */}
                <div className="space-y-3 border border-slate-200/80 rounded-xl p-4 bg-slate-50/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                      <Wrench className="w-4 h-4 text-[#007E7A]" />
                      <span>Fasilitas Penunjang</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F4F3] text-[#007E7A] text-[10px] font-extrabold">
                      {selectedFasilitas.length} dipilih
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cariFasilitas}
                      onChange={(e) => setCariFasilitas(e.target.value)}
                      placeholder="Cari fasilitas penunjang..."
                      className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#007E7A]"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5">
                    {filteredFasilitas.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-4 text-center">
                        Fasilitas tidak ditemukan.
                      </p>
                    ) : (
                      filteredFasilitas.map((item) => {
                        const checked = selectedFasilitas.includes(
                          item.id_fasilitas
                        );
                        return (
                          <label
                            key={item.id_fasilitas}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-xs cursor-pointer transition ${
                              checked
                                ? "bg-teal-50/70 border-[#007E7A]/50 text-slate-900 font-semibold"
                                : "bg-white border-slate-200/70 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleFasilitas(item.id_fasilitas)}
                              className="w-3.5 h-3.5 rounded accent-[#007E7A]"
                            />
                            <span className="flex-1 truncate">
                              {item.nama_fasilitas}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Upload Gambar Faskes (Maks. 5 Gambar + Banner & Thumbnail) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-[#007E7A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Galeri Gambar Faskes (Maks. {MAX_IMAGES} Gambar)
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Unggah hingga {MAX_IMAGES} foto faskes untuk carousel detail,
                      lalu tentukan foto mana yang dijadikan <strong>Banner</strong>{" "}
                      dan <strong>Thumbnail</strong>.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {images.length} / {MAX_IMAGES} Gambar
                </span>
              </div>

              {/* Dropzone Upload */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (images.length < MAX_IMAGES && !sedangUpload) {
                    setIsDragOver(true);
                  }
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (images.length < MAX_IMAGES && !sedangUpload) {
                    void tanganiUploadFiles(e.dataTransfer.files);
                  }
                }}
                className={`rounded-xl border-2 border-dashed p-6 text-center transition ${
                  images.length >= MAX_IMAGES
                    ? "border-slate-200 bg-slate-50/70 opacity-60 cursor-not-allowed"
                    : isDragOver
                    ? "border-[#007E7A] bg-teal-50/40"
                    : "border-slate-300 hover:border-[#007E7A]/60 bg-slate-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  disabled={images.length >= MAX_IMAGES || sedangUpload}
                  onChange={(e) => {
                    if (e.target.files) {
                      void tanganiUploadFiles(e.target.files);
                    }
                  }}
                  className="hidden"
                />

                <div className="space-y-2">
                  <div className="w-11 h-11 rounded-xl bg-[#E6F4F3] text-[#007E7A] flex items-center justify-center mx-auto">
                    {sedangUpload ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {sedangUpload
                      ? "Mengunggah gambar ke server..."
                      : images.length >= MAX_IMAGES
                      ? `Batas maksimal ${MAX_IMAGES} gambar tercapai`
                      : "Seret gambar ke sini atau klik tombol untuk memilih"}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Format JPG, PNG, atau WebP • Maksimal 5MB per gambar
                  </p>
                  <div>
                    <button
                      type="button"
                      disabled={images.length >= MAX_IMAGES || sedangUpload}
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#007E7A]" />
                      <span>Pilih Gambar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Fallback Logo Jenis Faskes jika belum ada gambar */}
              {images.length === 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="w-44 h-28 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <FaskesThumbnail
                      gambar_faskes={null}
                      nama_faskes={namaFaskes || "Fasilitas Kesehatan"}
                      kategori_faskes={jenisFaskes}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-800">
                      Belum ada gambar diunggah
                    </p>
                    <p className="text-slate-500 leading-relaxed">
                      Selama belum ada foto yang diunggah, kartu faskes dan
                      halaman detail akan otomatis menampilkan logo &amp; warna
                      kategori <strong>{jenisFaskes || "Faskes"}</strong> di
                      samping sebagai placeholder resmi.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={`${img.path}-${idx}`}
                      className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs flex flex-col"
                    >
                      <div className="relative h-40 bg-slate-100">
                        <img
                          src={img.url}
                          alt={`Foto faskes ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/75 text-white text-[10px] font-bold">
                          Slide #{idx + 1}
                        </span>
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveImage(idx, -1)}
                            title="Geser ke kiri"
                            className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs disabled:opacity-40"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === images.length - 1}
                            onClick={() => moveImage(idx, 1)}
                            title="Geser ke kanan"
                            className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs disabled:opacity-40"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setBannerImage(idx)}
                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border transition ${
                              img.is_banner
                                ? "bg-[#007E7A] text-white border-[#007E7A]"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <LayoutTemplate className="w-3 h-3" />
                            <span>
                              {img.is_banner ? "Banner Aktif" : "Jadikan Banner"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setThumbnailImage(idx)}
                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border transition ${
                              img.is_thumbnail
                                ? "bg-amber-500 text-white border-amber-500"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <Star className="w-3 h-3" />
                            <span>
                              {img.is_thumbnail
                                ? "Thumbnail Aktif"
                                : "Jadikan Thumbnail"}
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="w-full py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus Gambar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/admin/faskes"
                className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={sedangSimpan || sedangUpload}
                className="px-6 py-2.5 rounded-xl bg-[#007E7A] hover:bg-[#006965] text-white font-bold text-xs flex items-center gap-2 transition shadow-xs disabled:opacity-50"
              >
                {sedangSimpan ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : isEdit ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {isEdit ? "Simpan Perubahan" : "Simpan & Publikasikan"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
