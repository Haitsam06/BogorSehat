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

export interface ApiSpesialisasi {
  id_spesialisasi: string;
  nama_spesialisasi: string;
}

export interface ApiFasilitas {
  id_fasilitas: number;
  nama_fasilitas: string;
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
  spesialisasi?: ApiSpesialisasi[];
  fasilitas?: ApiFasilitas[];
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
  id_user: number;
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
  indexFallback = 0
): DataFaskesItem {
  const images = [
    "/images/beranda-card-1.png",
    "/images/beranda-card-2.png",
    "/images/beranda-card-3.png",
    "/images/detail-photo-1.png",
    "/images/detail-photo-2.png",
  ];
  const gambar = images[(api.id_faskes + indexFallback) % images.length];

  const lat = Number(api.latitude) || -6.595;
  const lng = Number(api.longitude) || 106.799;

  const poliList =
    api.spesialisasi && api.spesialisasi.length > 0
      ? api.spesialisasi.map((s) => s.nama_spesialisasi)
      : ["Poli Umum", "Poli Anak", "Poli Gigi"];

  const hasIgd =
    api.fasilitas?.some((f) =>
      f.nama_fasilitas.toLowerCase().includes("igd")
    ) ??
    (api.jenis_faskes?.toLowerCase().includes("rumah sakit") || false);

  const jarakNum =
    typeof api.distance_km !== "undefined"
      ? Number(api.distance_km)
      : 1.2 + (api.id_faskes % 5) * 0.8;
  const estimasiMenit = Math.max(5, Math.round(jarakNum * 3));

  const wilayah: "KOTA_BOGOR" | "KABUPATEN_BOGOR" =
    api.kota_kabupaten?.toUpperCase().includes("KOTA")
      ? "KOTA_BOGOR"
      : "KABUPATEN_BOGOR";

  return {
    id_faskes: api.id_faskes,
    slug_faskes: String(api.id_faskes),
    kode_kemenkes: api.kdppk || `FSK-${api.id_faskes.toString().padStart(3, "0")}`,
    nama_faskes: api.nama_faskes,
    kategori_faskes: api.jenis_faskes || "Rumah Sakit",
    label_singkat_kategori: api.jenis_faskes || "Faskes",
    kelas_faskes: api.kelas_faskes ? `Kelas ${api.kelas_faskes}` : "Standar",
    alamat_lengkap: api.alamat_faskes,
    kecamatan: api.kecamatan || "",
    wilayah_kota_kab: wilayah,
    jarak_km: `${jarakNum.toFixed(1)} km`,
    waktu_tempuh: `${estimasiMenit} mnt`,
    rating_faskes: "4.8",
    jumlah_ulasan: 18 + (api.id_faskes % 40),
    status_bpjs: Boolean(api.is_support_bpjs),
    status_igd_24jam: hasIgd,
    telepon_darurat: Boolean(api.telp_faskes),
    latitude: lat,
    longitude: lng,
    koordinat_teks: `${lat.toFixed(4)}° S, ${lng.toFixed(4)}° E`,
    gambar_faskes: gambar,
    daftar_poli: poliList,
  };
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

  async getSpesialisasi(): Promise<ApiSpesialisasi[]> {
    const res = await request<ApiCollectionResponse<ApiSpesialisasi>>(
      "/spesialisasi"
    );
    return res.data;
  },

  async getFasilitas(): Promise<ApiFasilitas[]> {
    const res = await request<ApiCollectionResponse<ApiFasilitas>>("/fasilitas");
    return res.data;
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

  async getFaskesDetail(id: number | string): Promise<ApiFaskes> {
    const res = await request<ApiSingleResponse<ApiFaskes>>(`/faskes/${id}`);
    return res.data;
  },

  async getFaskesMap(): Promise<ApiFaskes[]> {
    const res = await request<ApiSingleResponse<ApiFaskes[]>>("/faskes/map");
    return res.data;
  },

  async getNearbyFaskes(
    latitude: number,
    longitude: number,
    radius = 10
  ): Promise<ApiFaskes[]> {
    const endpoint = `/faskes/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
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
  ): Promise<{ data: any }> {
    return request<{ data: any }>(`/diskusi/${idDiskusi}/report`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async reportReply(
    idTanggapan: number,
    data: { alasan: string; catatan?: string }
  ): Promise<{ data: any }> {
    return request<{ data: any }>(
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
};

