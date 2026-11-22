/**
 * BogorSehat API Client & Contract Interfaces
 * Mengacu pada spesifikasi di API Contracts.md
 */

import { DataFaskesItem } from "@/data/data_faskes";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// -------------------------------------------------------------
// Model Interfaces (sesuai API Contracts.md)
// -------------------------------------------------------------

export interface ApiAdminReportItem {
  type: "komentar" | "diskusi" | "tanggapan";
  id: number;
  status: "pending" | "resolved" | "rejected";
  alasan: string;
  content?: {
    body?: string;
    judul_diskusi?: string;
    [key: string]: unknown;
  } | null;
  catatan?: string | null;
  reported_user?: ApiUser | null;
  created_at: string;
  updated_at: string;
}

export interface ApiFeedbackFaskes {
  id_feedback_faskes: number;
  id_faskes: number;
  id_user: number;
  alasan: string;
  saran_perbaikan: string;
  status: "pending" | "resolved" | "rejected";
  catatan_admin?: string | null;
  created_at: string;
  updated_at?: string;
  faskes?: ApiFaskes;
  user?: ApiUser;
  // UI helpers
  kelurahan_pelapor?: string;
  kecamatan_pelapor?: string;
  bukti_lampiran?: Array<{
    url: string;
    caption: string;
  }>;
}

export interface ApiSpesialisasi {
  id_spesialisasi: string;
  nama_spesialisasi: string;
}

export interface ApiFasilitas {
  id_fasilitas: number;
  nama_fasilitas: string;
}

export interface ApiMasterItem {
  id_spesialisasi?: string;
  id_fasilitas?: number;
  nama_spesialisasi?: string;
  nama_fasilitas?: string;
  faskes_count: number;
}

export interface ApiFaskesImage {
  id_faskes_image?: number;
  path: string;
  url: string;
  is_banner: boolean;
  is_thumbnail: boolean;
  sort_order?: number;
}

export interface ApiUploadedFile {
  path: string;
  url: string;
  name: string;
  mime: string;
  size: number;
}

export interface ApiFaskes {
  id_faskes: number;
  kdppk: string | null;
  nama_faskes: string;
  jenis_faskes: string | null;
  kelas_faskes: string | null;
  alamat_faskes: string;
  provinsi: string;
  kecamatan: string | null;
  kota_kabupaten: string;
  longitude: string | number;
  latitude: string | number;
  telp_faskes: string | null;
  is_support_bpjs: boolean;
  link_maps: string | null;
  distance_km?: number | string;
  rating_avg?: number;
  rating_count?: number;
  has_igd?: boolean;
  spesialisasi?: ApiSpesialisasi[];
  fasilitas?: ApiFasilitas[];
  images?: ApiFaskesImage[];
  banner_url?: string | null;
  thumbnail_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ApiPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface ApiCollectionResponse<T> {
  data: T[];
  links?: ApiPaginationLinks;
  meta?: ApiPaginationMeta;
}

export interface ApiSingleResponse<T> {
  data: T;
}

export interface ApiUser {
  id_user: number;
  nama_user: string;
  email_user: string;
  role_user: "admin" | "user";
  foto_profil?: string | null;
  nomor_telepon?: string | null;
  jenis_kelamin?: string | null;
  tanggal_lahir?: string | null;
  created_at?: string;
}

export function resolveStorageUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath.startsWith("/storage") ? cleanPath : `/storage/${cleanPath.replace(/^\/+/, "")}`}`;
}

export interface ApiLoginResponse {
  data: ApiUser;
  token: string;
}

export interface ApiHomeDashboard {
  faskes_count: number;
  kota_kabupaten: string[];
  spesialisasi_count: number;
  fasilitas_count: number;
}

export interface ApiAdminDashboard {
  faskes_count: number;
  user_count: number;
  diskusi_count: number;
  pending_feedback_count: number;
  pending_report_count: number;
}

export interface ApiKomentar {
  id_komentar: number;
  id_faskes: number;
  id_user?: number;
  id_parent: number | null;
  body: string;
  rating: number | null;
  image_path?: string[] | null;
  created_at: string;
  user?: ApiUser;
  replies?: ApiKomentar[];
  faskes?: ApiFaskes;
}

export interface ApiFaskesTerkait {
  id_faskes?: number;
  nama_faskes: string;
  alamat: string;
  kecamatan?: string | null;
  kota_kabupaten?: string | null;
  jarak_km?: string;
  slug?: string;
  link_maps?: string;
  gambar?: string;
}

export interface ApiDiskusi {
  id_diskusi: number;
  id_user: number;
  judul_diskusi: string;
  kategori_diskusi: string;
  body: string;
  image_path?: string[] | null;
  created_at: string;
  updated_at?: string;
  user?: ApiUser;
  tanggapan?: ApiTanggapan[];
  faskes_terkait?: ApiFaskesTerkait;
  jumlah_suka?: number;
  jumlah_dilihat?: number;
  sublokasi_penulis?: string;
  jumlah_tanggapan?: number;
}

export interface ApiTanggapan {
  id_tanggapan_diskusi: number;
  id_diskusi: number;
  id_user: number;
  id_parent: number | null;
  body: string;
  image_path?: string[] | null;
  created_at: string;
  updated_at?: string;
  user?: ApiUser;
  replies?: ApiTanggapan[];
  jumlah_suka?: number;
  diskusi?: ApiDiskusi;
}

// -------------------------------------------------------------
// Token & Session Storage Helpers (Client-side)
// -------------------------------------------------------------

const TOKEN_KEY = "bogorsehat_token";
const USER_KEY = "bogorsehat_user";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthUser(): ApiUser | null {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function setAuthUser(user: ApiUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function buildAdminMasterQuery(
  endpoint: string,
  params: { search?: string; page?: number; per_page?: number }
): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append("search", params.search);
  if (params.page) searchParams.append("page", String(params.page));
  if (params.per_page) searchParams.append("per_page", String(params.per_page));
  const queryString = searchParams.toString();

  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

// -------------------------------------------------------------
// HTTP Request Wrapper
// -------------------------------------------------------------

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // If endpoint starts with http, use as is; otherwise prepend API_BASE_URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      responseData?.message ||
      responseData?.error ||
      `Permintaan gagal dengan status ${response.status}`;
    const error = new Error(errorMsg) as Error & {
      status?: number;
      errors?: Record<string, string[]>;
    };
    error.status = response.status;
    error.errors = responseData?.errors;
    throw error;
  }

  return responseData as T;
}

// -------------------------------------------------------------
// Data Adapter: ApiFaskes -> DataFaskesItem
// -------------------------------------------------------------

export function mapApiFaskesToItem(
  api: ApiFaskes,
  _indexFallback = 0
): DataFaskesItem {
  const galeriGambar = (api.images ?? []).slice(0, 5).map((img) => ({
    url: img.url,
    is_banner: Boolean(img.is_banner),
    is_thumbnail: Boolean(img.is_thumbnail),
  }));
  const gambar =
    api.thumbnail_url ||
    galeriGambar.find((img) => img.is_thumbnail)?.url ||
    galeriGambar[0]?.url ||
    "";
  const banner =
    api.banner_url ||
    galeriGambar.find((img) => img.is_banner)?.url ||
    galeriGambar[0]?.url ||
    "";

  const lat = Number(api.latitude) || -6.595;
  const lng = Number(api.longitude) || 106.799;

  const poliList =
    api.spesialisasi && api.spesialisasi.length > 0
      ? api.spesialisasi.map((s) => s.nama_spesialisasi)
      : [];

  const hasIgd =
    typeof api.has_igd === "boolean"
      ? api.has_igd
      : api.fasilitas?.some((f) =>
          f.nama_fasilitas.toLowerCase().includes("igd")
        ) ??
        (api.jenis_faskes?.toLowerCase().includes("rumah sakit") || false);

  const jarakNum =
    typeof api.distance_km !== "undefined" ? Number(api.distance_km) : 0;
  const estimasiMenit = Math.round(jarakNum * 3);

  const wilayah: "KOTA_BOGOR" | "KABUPATEN_BOGOR" =
    api.kota_kabupaten?.toUpperCase().includes("KOTA")
      ? "KOTA_BOGOR"
      : "KABUPATEN_BOGOR";

  const ratingCount = api.rating_count ?? 0;
  const sudahDirating = ratingCount > 0;

  return {
    id_faskes: api.id_faskes,
    slug_faskes: String(api.id_faskes),
    kode_kemenkes: api.kdppk || "-",
    nama_faskes: api.nama_faskes,
    kategori_faskes: api.jenis_faskes || "Faskes",
    label_singkat_kategori: api.jenis_faskes || "Faskes",
    kelas_faskes: api.kelas_faskes ? `Kelas ${api.kelas_faskes}` : "-",
    alamat_lengkap: api.alamat_faskes,
    kecamatan: api.kecamatan || "",
    wilayah_kota_kab: wilayah,
    jarak_km: `${jarakNum.toFixed(1)} km`,
    waktu_tempuh: `${estimasiMenit} mnt`,
    rating_faskes: sudahDirating
      ? Number(api.rating_avg ?? 0).toFixed(1)
      : "Belum Dirating",
    jumlah_ulasan: ratingCount,
    sudah_dirating: sudahDirating,
    status_bpjs: Boolean(api.is_support_bpjs),
    status_igd_24jam: hasIgd,
    telepon_darurat: Boolean(api.telp_faskes),
    latitude: lat,
    longitude: lng,
    koordinat_teks: `${lat.toFixed(4)}° S, ${lng.toFixed(4)}° E`,
    gambar_faskes: gambar,
    banner_faskes: banner,
    galeri_gambar: galeriGambar,
    daftar_poli: poliList,
  };
}

export function messageFromError(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message !== "") {
    return err.message;
  }
  return fallback;
}

// -------------------------------------------------------------
// Endpoint Functions
// -------------------------------------------------------------

export const api = {
  // --- Public Dashboard & Master Data ---
  async getHome(): Promise<ApiHomeDashboard> {
    const res = await request<ApiSingleResponse<ApiHomeDashboard>>("/home");
    return res.data;
  },

  async getSpesialisasi(
    page = 1
  ): Promise<ApiCollectionResponse<ApiSpesialisasi>> {
    return request<ApiCollectionResponse<ApiSpesialisasi>>(
      `/spesialisasi?page=${page}`
    );
  },

  async getAllSpesialisasi(): Promise<ApiSpesialisasi[]> {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("bogorsehat_spesialisasi_all");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    const res = await request<ApiCollectionResponse<ApiSpesialisasi>>(
      "/spesialisasi?all=1"
    );
    const items = res.data || [];
    if (typeof window !== "undefined" && items.length > 0) {
      try {
        sessionStorage.setItem(
          "bogorsehat_spesialisasi_all",
          JSON.stringify(items)
        );
      } catch {}
    }
    return items;
  },

  async getFasilitas(
    page = 1
  ): Promise<ApiCollectionResponse<ApiFasilitas>> {
    return request<ApiCollectionResponse<ApiFasilitas>>(
      `/fasilitas?page=${page}`
    );
  },

  async getAllFasilitas(): Promise<ApiFasilitas[]> {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("bogorsehat_fasilitas_all");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    const res = await request<ApiCollectionResponse<ApiFasilitas>>(
      "/fasilitas?all=1"
    );
    const items = res.data || [];
    if (typeof window !== "undefined" && items.length > 0) {
      try {
        sessionStorage.setItem("bogorsehat_fasilitas_all", JSON.stringify(items));
      } catch {}
    }
    return items;
  },

  // --- Faskes Directory & WebGIS ---
  async getFaskes(params: {
    search?: string;
    provinsi?: string;
    kecamatan?: string;
    kota_kabupaten?: string;
    jenis_faskes?: string;
    kelas_faskes?: string;
    is_support_bpjs?: number | boolean;
    id_spesialisasi?: string;
    id_fasilitas?: number;
    latitude?: number;
    longitude?: number;
    per_page?: number;
    page?: number;
  } = {}): Promise<ApiCollectionResponse<ApiFaskes>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "ALL") {
        if (key === "is_support_bpjs") {
          searchParams.append(key, val ? "1" : "0");
        } else {
          searchParams.append(key, String(val));
        }
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/faskes?${queryString}` : "/faskes";
    return request<ApiCollectionResponse<ApiFaskes>>(endpoint);
  },

  async getFaskesDetail(
    id: number | string,
    coords?: { latitude?: number; longitude?: number }
  ): Promise<ApiFaskes> {
    const searchParams = new URLSearchParams();
    if (coords?.latitude !== undefined && coords?.latitude !== null) {
      searchParams.append("latitude", String(coords.latitude));
    }
    if (coords?.longitude !== undefined && coords?.longitude !== null) {
      searchParams.append("longitude", String(coords.longitude));
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/faskes/${id}?${queryString}` : `/faskes/${id}`;
    const res = await request<ApiSingleResponse<ApiFaskes>>(endpoint);
    return res.data;
  },

  async getFaskesMap(): Promise<ApiFaskes[]> {
    const res = await request<ApiSingleResponse<ApiFaskes[]>>("/faskes/map");
    return res.data;
  },

  async getNearbyFaskes(
    latitude: number,
    longitude: number,
    radius = 10,
    options: { compact?: boolean; limit?: number } = {}
  ): Promise<ApiFaskes[]> {
    const compactParam = options.compact ? "&compact=1" : "";
    const limitParam = options.limit ? `&limit=${options.limit}` : "";
    const endpoint = `/faskes/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}${compactParam}${limitParam}`;
    const res = await request<ApiSingleResponse<ApiFaskes[]>>(endpoint);
    return res.data;
  },

  // --- Comments & Reviews ---
  async getComments(
    idFaskes: number | string,
    page = 1
  ): Promise<ApiCollectionResponse<ApiKomentar>> {
    return request<ApiCollectionResponse<ApiKomentar>>(
      `/faskes/${idFaskes}/komentar?page=${page}`
    );
  },

  async addComment(
    idFaskes: number | string,
    data: { body: string; rating?: number; image_path?: string[] }
  ): Promise<ApiKomentar> {
    const res = await request<ApiSingleResponse<ApiKomentar>>(
      `/faskes/${idFaskes}/komentar`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async replyComment(
    idKomentar: number,
    data: { body: string }
  ): Promise<ApiKomentar> {
    const res = await request<ApiSingleResponse<ApiKomentar>>(
      `/komentar/${idKomentar}/replies`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async deleteComment(idKomentar: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/komentar/${idKomentar}`, {
      method: "DELETE",
    });
  },

  async reportComment(
    idKomentar: number,
    data: { alasan: string; catatan?: string }
  ): Promise<{ message: string }> {
    return request<{ message: string }>(`/komentar/${idKomentar}/report`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // --- Feedback Faskes ---
  async sendFeedback(
    idFaskes: number | string,
    data: { alasan: string; saran_perbaikan: string }
  ): Promise<{ message: string }> {
    return request<{ message: string }>(`/faskes/${idFaskes}/feedback`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // --- Forum Diskusi ---
  async getDiscussions(page = 1): Promise<ApiCollectionResponse<ApiDiskusi>> {
    return request<ApiCollectionResponse<ApiDiskusi>>(`/diskusi?page=${page}`);
  },

  async getMyDiscussions(page = 1): Promise<ApiCollectionResponse<ApiDiskusi>> {
    return request<ApiCollectionResponse<ApiDiskusi>>(`/me/diskusi?page=${page}`);
  },

  async getDiscussionDetail(idDiskusi: number): Promise<ApiDiskusi> {
    const res = await request<ApiSingleResponse<ApiDiskusi>>(
      `/diskusi/${idDiskusi}`
    );
    return res.data;
  },

  async createDiscussion(data: {
    judul_diskusi: string;
    kategori_diskusi?: string;
    body: string;
    id_faskes?: number | null;
    image_path?: string[];
  }): Promise<ApiDiskusi> {
    const res = await request<ApiSingleResponse<ApiDiskusi>>("/diskusi", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteDiscussion(idDiskusi: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/diskusi/${idDiskusi}`, {
      method: "DELETE",
    });
  },

  async addDiscussionReply(
    idDiskusi: number,
    data: { body: string; image_path?: string[] }
  ): Promise<ApiTanggapan> {
    const res = await request<ApiSingleResponse<ApiTanggapan>>(
      `/diskusi/${idDiskusi}/tanggapan`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async replyToReply(
    idTanggapan: number,
    data: { body: string; image_path?: string[] }
  ): Promise<ApiTanggapan> {
    const res = await request<ApiSingleResponse<ApiTanggapan>>(
      `/tanggapan-diskusi/${idTanggapan}/replies`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async updateReply(
    idTanggapan: number,
    data: { body: string; image_path?: string[] }
  ): Promise<ApiTanggapan> {
    const res = await request<ApiSingleResponse<ApiTanggapan>>(
      `/tanggapan-diskusi/${idTanggapan}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async deleteReply(idTanggapan: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/tanggapan-diskusi/${idTanggapan}`, {
      method: "DELETE",
    });
  },

  async reportDiscussion(
    idDiskusi: number,
    data: { alasan: string; catatan?: string }
  ): Promise<{ data: unknown }> {
    return request<{ data: unknown }>(`/diskusi/${idDiskusi}/report`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async reportReply(
    idTanggapan: number,
    data: { alasan: string; catatan?: string }
  ): Promise<{ data: unknown }> {
    return request<{ data: unknown }>(
      `/tanggapan-diskusi/${idTanggapan}/report`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  // --- Auth & Profile ---
  async login(
    email_user: string,
    password_user: string
  ): Promise<ApiLoginResponse> {
    const res = await request<ApiLoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email_user, password_user }),
    });
    if (res.token) {
      setAuthToken(res.token);
      setAuthUser(res.data);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      removeAuthToken();
    }
  },

  async getCurrentUser(): Promise<ApiUser> {
    const res = await request<ApiSingleResponse<ApiUser>>("/user");
    return res.data;
  },

  async register(data: {
    nama_user: string;
    email_user: string;
    password_user: string;
    password_user_confirmation: string;
  }): Promise<ApiUser> {
    const res = await request<ApiSingleResponse<ApiUser>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async getProfile(): Promise<ApiUser> {
    const res = await request<ApiSingleResponse<ApiUser>>("/profile");
    return res.data;
  },

  async updateProfile(data: {
    nama_user?: string;
    email_user?: string;
    nomor_telepon?: string | null;
    jenis_kelamin?: string | null;
    tanggal_lahir?: string | null;
    foto_profil?: string | null;
    current_password?: string;
    password_user?: string;
    password_user_confirmation?: string;
  }): Promise<ApiUser> {
    const res = await request<ApiSingleResponse<ApiUser>>("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    setAuthUser(res.data);
    return res.data;
  },

  async getMyComments(
    page = 1
  ): Promise<ApiCollectionResponse<ApiKomentar>> {
    return request<ApiCollectionResponse<ApiKomentar>>(
      `/me/komentar?page=${page}`
    );
  },

  async getMyReplies(
    page = 1
  ): Promise<ApiCollectionResponse<ApiTanggapan>> {
    return request<ApiCollectionResponse<ApiTanggapan>>(
      `/me/tanggapan?page=${page}`
    );
  },

  async likeDiscussion(
    idDiskusi: number
  ): Promise<{ id_diskusi: number; disukai: boolean; jumlah_suka: number }> {
    const res = await request<
      ApiSingleResponse<{
        id_diskusi: number;
        disukai: boolean;
        jumlah_suka: number;
      }>
    >(`/diskusi/${idDiskusi}/suka`, { method: "POST" });
    return res.data;
  },

  async unlikeDiscussion(
    idDiskusi: number
  ): Promise<{ id_diskusi: number; disukai: boolean; jumlah_suka: number }> {
    const res = await request<
      ApiSingleResponse<{
        id_diskusi: number;
        disukai: boolean;
        jumlah_suka: number;
      }>
    >(`/diskusi/${idDiskusi}/suka`, { method: "DELETE" });
    return res.data;
  },

  async likeReply(idTanggapan: number): Promise<{
    id_tanggapan_diskusi: number;
    disukai: boolean;
    jumlah_suka: number;
  }> {
    const res = await request<
      ApiSingleResponse<{
        id_tanggapan_diskusi: number;
        disukai: boolean;
        jumlah_suka: number;
      }>
    >(`/tanggapan-diskusi/${idTanggapan}/suka`, { method: "POST" });
    return res.data;
  },

  async unlikeReply(idTanggapan: number): Promise<{
    id_tanggapan_diskusi: number;
    disukai: boolean;
    jumlah_suka: number;
  }> {
    const res = await request<
      ApiSingleResponse<{
        id_tanggapan_diskusi: number;
        disukai: boolean;
        jumlah_suka: number;
      }>
    >(`/tanggapan-diskusi/${idTanggapan}/suka`, { method: "DELETE" });
    return res.data;
  },

  async markDiscussionViewed(
    idDiskusi: number
  ): Promise<{ id_diskusi: number; jumlah_dilihat: number }> {
    const res = await request<
      ApiSingleResponse<{ id_diskusi: number; jumlah_dilihat: number }>
    >(`/diskusi/${idDiskusi}/dilihat`, { method: "POST" });
    return res.data;
  },

  async getAdminSpesialisasi(
    params: { search?: string; page?: number; per_page?: number } = {}
  ): Promise<ApiCollectionResponse<ApiMasterItem>> {
    return request<ApiCollectionResponse<ApiMasterItem>>(
      buildAdminMasterQuery("/admin/spesialisasi", params)
    );
  },

  async getAdminSpesialisasiDetail(id: string): Promise<ApiMasterItem> {
    try {
      const res = await request<ApiSingleResponse<ApiMasterItem>>(
        `/admin/spesialisasi/${encodeURIComponent(id)}`
      );
      return res.data;
    } catch (err) {
      const status = (err as Error & { status?: number })?.status;
      if (status !== 404 && status !== 405) {
        throw err;
      }

      const all = await this.getAllSpesialisasi();
      const found = all.find((item) => item.id_spesialisasi === id);
      if (!found) {
        throw new Error("Spesialisasi tidak ditemukan.");
      }

      return {
        id_spesialisasi: found.id_spesialisasi,
        nama_spesialisasi: found.nama_spesialisasi,
        faskes_count: 0,
      };
    }
  },

  async createAdminSpesialisasi(data: {
    id_spesialisasi: string;
    nama_spesialisasi: string;
  }): Promise<ApiMasterItem> {
    const res = await request<ApiSingleResponse<ApiMasterItem>>(
      "/admin/spesialisasi",
      { method: "POST", body: JSON.stringify(data) }
    );
    return res.data;
  },

  async updateAdminSpesialisasi(
    id: string,
    data: { nama_spesialisasi: string }
  ): Promise<ApiMasterItem> {
    const res = await request<ApiSingleResponse<ApiMasterItem>>(
      `/admin/spesialisasi/${encodeURIComponent(id)}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
    return res.data;
  },

  async deleteAdminSpesialisasi(
    id: string,
    force = false
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/admin/spesialisasi/${encodeURIComponent(id)}${force ? "?force=1" : ""}`,
      { method: "DELETE" }
    );
  },

  async getAdminFasilitas(
    params: { search?: string; page?: number; per_page?: number } = {}
  ): Promise<ApiCollectionResponse<ApiMasterItem>> {
    return request<ApiCollectionResponse<ApiMasterItem>>(
      buildAdminMasterQuery("/admin/fasilitas", params)
    );
  },

  async getAdminFasilitasDetail(id: number): Promise<ApiMasterItem> {
    try {
      const res = await request<ApiSingleResponse<ApiMasterItem>>(
        `/admin/fasilitas/${id}`
      );
      return res.data;
    } catch (err) {
      const status = (err as Error & { status?: number })?.status;
      if (status !== 404 && status !== 405) {
        throw err;
      }

      const all = await this.getAllFasilitas();
      const found = all.find((item) => item.id_fasilitas === id);
      if (!found) {
        throw new Error("Fasilitas penunjang tidak ditemukan.");
      }

      return {
        id_fasilitas: found.id_fasilitas,
        nama_fasilitas: found.nama_fasilitas,
        faskes_count: 0,
      };
    }
  },

  async createAdminFasilitas(data: {
    nama_fasilitas: string;
    id_fasilitas?: number;
  }): Promise<ApiMasterItem> {
    const res = await request<ApiSingleResponse<ApiMasterItem>>(
      "/admin/fasilitas",
      { method: "POST", body: JSON.stringify(data) }
    );
    return res.data;
  },

  async updateAdminFasilitas(
    id: number,
    data: { nama_fasilitas: string }
  ): Promise<ApiMasterItem> {
    const res = await request<ApiSingleResponse<ApiMasterItem>>(
      `/admin/fasilitas/${id}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
    return res.data;
  },

  async deleteAdminFasilitas(
    id: number,
    force = false
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/admin/fasilitas/${id}${force ? "?force=1" : ""}`,
      { method: "DELETE" }
    );
  },

  async getAdminUsers(
    page = 1
  ): Promise<ApiCollectionResponse<ApiUser>> {
    return request<ApiCollectionResponse<ApiUser>>(
      `/admin/users?page=${page}`
    );
  },

  async getAdminUser(idUser: number): Promise<ApiUser> {
    const res = await request<ApiSingleResponse<ApiUser>>(
      `/admin/users/${idUser}`
    );
    return res.data;
  },

  async updateAdminUser(
    idUser: number,
    data: Partial<{
      nama_user: string;
      email_user: string;
      password_user: string;
      password_user_confirmation: string;
      role_user: "admin" | "user";
      foto_profil: string | null;
    }>
  ): Promise<ApiUser> {
    const res = await request<ApiSingleResponse<ApiUser>>(
      `/admin/users/${idUser}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async deleteAdminUser(idUser: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/users/${idUser}`, {
      method: "DELETE",
    });
  },

  // --- Admin Endpoints (Require role_user=admin) ---
  async getAdminDashboard(): Promise<ApiAdminDashboard> {
    const res = await request<ApiSingleResponse<ApiAdminDashboard>>(
      "/admin/dashboard"
    );
    return res.data;
  },

  async getAdminFaskes(params: {
    search?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<ApiCollectionResponse<ApiFaskes>> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append("search", params.search);
    if (params.page) searchParams.append("page", String(params.page));
    if (params.per_page) searchParams.append("per_page", String(params.per_page));

    const q = searchParams.toString();
    return request<ApiCollectionResponse<ApiFaskes>>(
      q ? `/admin/faskes?${q}` : "/admin/faskes"
    );
  },

  async uploadFile(
    file: File,
    context: "diskusi" | "tanggapan" | "komentar" | "faskes" | "profile" = "profile"
  ): Promise<ApiUploadedFile> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      headers,
      body: formData,
    });

    const responseData = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMsg =
        responseData?.message ||
        responseData?.error ||
        `Unggah file gagal dengan status ${response.status}`;
      const error = new Error(errorMsg) as Error & {
        status?: number;
        errors?: Record<string, string[]>;
      };
      error.status = response.status;
      error.errors = responseData?.errors;
      throw error;
    }

    return (responseData as ApiSingleResponse<ApiUploadedFile>).data;
  },

  async createFaskes(data: {
    nama_faskes: string;
    alamat_faskes: string;
    kota_kabupaten: string;
    latitude: number;
    longitude: number;
    kdppk?: string;
    jenis_faskes?: string;
    kelas_faskes?: string;
    kecamatan?: string;
    provinsi?: string;
    telp_faskes?: string;
    is_support_bpjs?: boolean;
    link_maps?: string;
    id_spesialisasi?: string[];
    id_fasilitas?: number[];
    images?: ApiFaskesImage[];
  }): Promise<ApiFaskes> {
    const res = await request<ApiSingleResponse<ApiFaskes>>("/admin/faskes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateFaskes(
    idFaskes: number,
    data: Partial<{
      nama_faskes: string;
      alamat_faskes: string;
      kota_kabupaten: string;
      latitude: number;
      longitude: number;
      kdppk?: string | null;
      jenis_faskes?: string | null;
      kelas_faskes?: string | null;
      kecamatan?: string | null;
      provinsi?: string;
      telp_faskes?: string | null;
      is_support_bpjs?: boolean;
      link_maps?: string;
      id_spesialisasi?: string[];
      id_fasilitas?: number[];
      images?: ApiFaskesImage[];
    }>
  ): Promise<ApiFaskes> {
    const res = await request<ApiSingleResponse<ApiFaskes>>(
      `/admin/faskes/${idFaskes}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async deleteFaskes(idFaskes: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/faskes/${idFaskes}`, {
      method: "DELETE",
    });
  },

  async getAdminFeedbacks(status?: string): Promise<ApiFeedbackFaskes[]> {
    const endpoint = status ? `/admin/feedback-faskes?status=${status}` : "/admin/feedback-faskes";
    const res = await request<ApiSingleResponse<ApiFeedbackFaskes[]>>(endpoint);
    return res.data;
  },

  async updateAdminFeedback(
    idFeedback: number,
    data: { status: "pending" | "resolved" | "rejected"; catatan_admin?: string }
  ): Promise<ApiFeedbackFaskes> {
    const res = await request<ApiSingleResponse<ApiFeedbackFaskes>>(
      `/admin/feedback-faskes/${idFeedback}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async deleteAdminFeedback(idFeedback: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/feedback-faskes/${idFeedback}`, {
      method: "DELETE",
    });
  },

  async getAdminReports(status?: string): Promise<ApiAdminReportItem[]> {
    const endpoint = status ? `/admin/laporan?status=${status}` : "/admin/laporan";
    const res = await request<ApiSingleResponse<ApiAdminReportItem[]>>(endpoint);
    return res.data;
  },

  async updateAdminReportStatus(
    type: string,
    id: number,
    status: "pending" | "resolved" | "rejected"
  ): Promise<ApiAdminReportItem> {
    const res = await request<ApiSingleResponse<ApiAdminReportItem>>(
      `/admin/laporan/${type}/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
    return res.data;
  },

  async deleteAdminReport(type: string, id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/laporan/${type}/${id}`, {
      method: "DELETE",
    });
  },
};

