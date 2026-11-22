export interface DataFaskesItem {
  id_faskes: number;
  slug_faskes: string;
  kode_kemenkes: string;
  nama_faskes: string;
  kategori_faskes: string;
  label_singkat_kategori: string;
  kelas_faskes: string;
  alamat_lengkap: string;
  kecamatan: string;
  wilayah_kota_kab: "KOTA_BOGOR" | "KABUPATEN_BOGOR";
  jarak_km: string;
  waktu_tempuh: string;
  rating_faskes: string;
  jumlah_ulasan: number;
  sudah_dirating?: boolean;
  status_bpjs: boolean;
  status_igd_24jam: boolean;
  telepon_darurat: boolean;
  latitude: number;
  longitude: number;
  koordinat_teks: string;
  gambar_faskes: string;
  banner_faskes?: string;
  galeri_gambar?: Array<{
    url: string;
    is_banner: boolean;
    is_thumbnail: boolean;
  }>;
  daftar_poli: string[];
}

export interface KategoriLayananItem {
  id_kategori: number;
  nama_kategori: string;
  jumlah_unit: string;
  deskripsi_kategori: string;
  label_status?: string;
}

export interface LangkahRujukanItem {
  nomor_langkah: string;
  judul_langkah: string;
  deskripsi_langkah: string;
  tag_fitur: string;
}

export interface PertanyaanUmumItem {
  id_faq: number;
  pertanyaan_warga: string;
  jawaban_resmi: string;
}

export const lokasi_default_pengguna = {
  nama_jalan: "Jl. Padjajaran",
  latitude: -6.595038,
  longitude: 106.799012,
  koordinat_teks: "-6.5950° S, 106.7990° E",
};

export const daftar_semua_poli: string[] = [
  "Poli Umum",
  "Poli Gigi",
  "Poli Anak",
  "Poli Jantung",
  "Poli Penyakit Dalam",
  "Poli Kandungan",
  "Poli Bedah",
  "Poli Mata",
  "Poli THT",
  "Poli Saraf",
];

export const daftar_kategori_layanan: KategoriLayananItem[] = [
  {
    id_kategori: 1,
    nama_kategori: "Rumah Sakit Umum & Khusus",
    jumlah_unit: "28 Unit RS",
    deskripsi_kategori:
      "Fasilitas rujukan tingkat lanjutan (FKRTL) Kelas A, B, C, dan D dengan layanan dokter spesialis lengkap.",
    label_status: "IGD 24 Jam",
  },
  {
    id_kategori: 2,
    nama_kategori: "Puskesmas & Pustu",
    jumlah_unit: "54 Puskesmas",
    deskripsi_kategori:
      "Pelayanan kesehatan dasar tingkat pertama (FKTP) milik pemerintah di seluruh kecamatan Kota & Kab. Bogor.",
    label_status: "Mitra BPJS",
  },
  {
    id_kategori: 3,
    nama_kategori: "Klinik Pratama & Utama",
    jumlah_unit: "42 Klinik",
    deskripsi_kategori:
      "Layanan rawat jalan terpadu, pemeriksaan medis umum, gigi, serta klinik bersalin terakreditasi resmi.",
    label_status: "Terverifikasi",
  },
  {
    id_kategori: 4,
    nama_kategori: "Apotek & Farmasi",
    jumlah_unit: "18 Apotek",
    deskripsi_kategori:
      "Penyedia obat resep rujukan balik (PRB) BPJS Kesehatan dan kebutuhan farmasi klinis masyarakat.",
    label_status: "Resep & PRB",
  },
];

export const daftar_langkah_rujukan: LangkahRujukanItem[] = [
  {
    nomor_langkah: "01",
    judul_langkah: "Deteksi Titik Lokasi Anda",
    deskripsi_langkah:
      "Sistem mengidentifikasi titik koordinat keberadaan Anda di wilayah Kota atau Kabupaten Bogor sebagai pusat pencarian.",
    tag_fitur: "Geolokasi Spasial",
  },
  {
    nomor_langkah: "02",
    judul_langkah: "Pilih Poliklinik & Status BPJS",
    deskripsi_langkah:
      "Saring fasilitas kesehatan berdasarkan ketersediaan poliklinik spesialis (Badge Poli), kelas RS, dan kemitraan BPJS.",
    tag_fitur: "Filter Multikriteria",
  },
  {
    nomor_langkah: "03",
    judul_langkah: "Panduan Rute & IGD Terdekat",
    deskripsi_langkah:
      "Dapatkan rekomendasi 3 faskes terdekat lengkap dengan peta interaktif, estimasi waktu tempuh, dan kontak darurat.",
    tag_fitur: "Rekomendasi Rute",
  },
];

export const daftar_pertanyaan_umum: PertanyaanUmumItem[] = [
  {
    id_faq: 1,
    pertanyaan_warga:
      "Apakah seluruh fasilitas kesehatan di Bogor Sehat menerima pasien BPJS Kesehatan?",
    jawaban_resmi:
      "Sebagian besar rumah sakit, puskesmas, dan klinik yang terdaftar telah bermitra resmi dengan BPJS Kesehatan. Anda dapat melihat label '✓ BPJS Aktif' pada setiap kartu faskes atau menyaringnya melalui halaman Cari Faskes.",
  },
  {
    id_faq: 2,
    pertanyaan_warga:
      "Bagaimana cara menemukan Unit Gawat Darurat (IGD) 24 Jam terdekat saat kondisi darurat?",
    jawaban_resmi:
      "Anda dapat langsung melihat kartu rekomendasi dengan label merah '✳ UGD 24 Jam' di halaman Beranda atau membuka Peta Interaktif untuk melihat pin merah bertanda 'H' yang beroperasi penuh 24 jam.",
  },
  {
    id_faq: 3,
    pertanyaan_warga:
      "Bagaimana cara mengetahui poliklinik spesialis yang tersedia di suatu rumah sakit?",
    jawaban_resmi:
      "Setiap kartu faskes, halaman Detail Faskes, serta tooltip pin pada Peta Interaktif telah dilengkapi dengan Badge Poli (seperti Poli Anak, Poli Jantung, Poli Penyakit Dalam) untuk memudahkan Anda sebelum berkunjung.",
  },
  {
    id_faq: 4,
    pertanyaan_warga:
      "Seberapa akurat titik koordinat dan jarak fasilitas kesehatan pada peta?",
    jawaban_resmi:
      "Seluruh titik lokasi menggunakan standar geodetik EPSG:4326 (WGS 84) yang telah diverifikasi dan disinkronisasikan bersama data Dinas Kesehatan Kota & Kabupaten Bogor.",
  },
];
