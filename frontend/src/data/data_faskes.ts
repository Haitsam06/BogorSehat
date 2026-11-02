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
  status_bpjs: boolean;
  status_igd_24jam: boolean;
  telepon_darurat: boolean;
  latitude: number;
  longitude: number;
  koordinat_teks: string;
  gambar_faskes: string;
  daftar_poli: string[];
}

export interface KategoriLayananItem {
  id_kategori: number;
  nama_kategori: string;
  jumlah_unit: string;
  deskripsi_kategori: string;
  label_status: string;
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

export const daftar_faskes_utama: DataFaskesItem[] = [
  {
    id_faskes: 1,
    slug_faskes: "rsud-kota-bogor",
    kode_kemenkes: "3271012",
    nama_faskes: "RSUD Kota Bogor",
    kategori_faskes: "RUMAH SAKIT UMUM DAERAH",
    label_singkat_kategori: "Rumah\nSakit",
    kelas_faskes: "Tipe B",
    alamat_lengkap:
      "Jl. DR. Sumeru No.120, RT.03/RW.20, Menteng, Bogor Barat",
    kecamatan: "Bogor Barat",
    wilayah_kota_kab: "KOTA_BOGOR",
    jarak_km: "1.2 km",
    waktu_tempuh: "5 menit berkendara",
    rating_faskes: "4.8",
    jumlah_ulasan: 124,
    status_bpjs: true,
    status_igd_24jam: true,
    telepon_darurat: true,
    latitude: -6.582319,
    longitude: 106.778841,
    koordinat_teks: "-6.5872° S, 106.7728° E",
    gambar_faskes: "/images/beranda-card-1.png",
    daftar_poli: [
      "Poli Umum",
      "Poli Anak",
      "Poli Jantung",
      "Poli Penyakit Dalam",
      "Poli Bedah",
      "Poli Saraf",
    ],
  },
  {
    id_faskes: 2,
    slug_faskes: "puskesmas-bogor-timur",
    kode_kemenkes: "3271104",
    nama_faskes: "Puskesmas Bogor Timur",
    kategori_faskes: "PUSKESMAS KECAMATAN",
    label_singkat_kategori: "Puskesmas",
    kelas_faskes: "Rawat Inap",
    alamat_lengkap:
      "Jl. Baranangsiang Indah No.1, RT.01/RW.11, Katulampa, Bogor Timur",
    kecamatan: "Bogor Timur",
    wilayah_kota_kab: "KOTA_BOGOR",
    jarak_km: "1.8 km",
    waktu_tempuh: "5 menit berkendara",
    rating_faskes: "4.6",
    jumlah_ulasan: 88,
    status_bpjs: true,
    status_igd_24jam: false,
    telepon_darurat: false,
    latitude: -6.60542,
    longitude: 106.81432,
    koordinat_teks: "-6.6054° S, 106.8143° E",
    gambar_faskes: "/images/beranda-card-2.png",
    daftar_poli: ["Poli Umum", "Poli Gigi", "Poli Anak", "Poli Kandungan"],
  },
  {
    id_faskes: 3,
    slug_faskes: "rs-pmi-bogor",
    kode_kemenkes: "3271023",
    nama_faskes: "RS PMI Bogor",
    kategori_faskes: "RUMAH SAKIT SWASTA / PMI",
    label_singkat_kategori: "Rumah\nSakit",
    kelas_faskes: "Tipe B",
    alamat_lengkap: "Jl. Rumah Sakit No.1, Tegallega, Bogor Tengah",
    kecamatan: "Bogor Tengah",
    wilayah_kota_kab: "KOTA_BOGOR",
    jarak_km: "2.4 km",
    waktu_tempuh: "6 menit berkendara",
    rating_faskes: "4.7",
    jumlah_ulasan: 310,
    status_bpjs: true,
    status_igd_24jam: true,
    telepon_darurat: true,
    latitude: -6.59921,
    longitude: 106.80582,
    koordinat_teks: "-6.5992° S, 106.8058° E",
    gambar_faskes: "/images/beranda-card-3.png",
    daftar_poli: [
      "Poli Umum",
      "Poli Anak",
      "Poli Penyakit Dalam",
      "Poli Mata",
      "Poli THT",
    ],
  },
  {
    id_faskes: 4,
    slug_faskes: "puskesmas-bogor-tengah",
    kode_kemenkes: "3271101",
    nama_faskes: "Puskesmas Bogor Tengah",
    kategori_faskes: "PUSKESMAS",
    label_singkat_kategori: "Puskesmas",
    kelas_faskes: "Faskes Tk. 1",
    alamat_lengkap: "Jl. Kantana No.12, Babakan, Bogor Tengah",
    kecamatan: "Bogor Tengah",
    wilayah_kota_kab: "KOTA_BOGOR",
    jarak_km: "2.5 km",
    waktu_tempuh: "6 menit berkendara",
    rating_faskes: "4.5",
    jumlah_ulasan: 64,
    status_bpjs: true,
    status_igd_24jam: false,
    telepon_darurat: false,
    latitude: -6.59442,
    longitude: 106.79315,
    koordinat_teks: "-6.5944° S, 106.7931° E",
    gambar_faskes: "/images/beranda-card-2.png",
    daftar_poli: ["Poli Umum", "Poli Gigi", "Poli Anak"],
  },
  {
    id_faskes: 5,
    slug_faskes: "rs-bmc-mayapada",
    kode_kemenkes: "3271034",
    nama_faskes: "RS BMC Mayapada",
    kategori_faskes: "RUMAH SAKIT SWASTA",
    label_singkat_kategori: "Rumah Sakit",
    kelas_faskes: "Tipe C",
    alamat_lengkap: "Jl. Pajajaran Indah V No.97, Baranangsiang",
    kecamatan: "Bogor Timur",
    wilayah_kota_kab: "KOTA_BOGOR",
    jarak_km: "3.1 km",
    waktu_tempuh: "8 menit berkendara",
    rating_faskes: "4.7",
    jumlah_ulasan: 190,
    status_bpjs: true,
    status_igd_24jam: true,
    telepon_darurat: true,
    latitude: -6.60712,
    longitude: 106.80954,
    koordinat_teks: "-6.6071° S, 106.8095° E",
    gambar_faskes: "/images/beranda-card-3.png",
    daftar_poli: [
      "Poli Umum",
      "Poli Jantung",
      "Poli Penyakit Dalam",
      "Poli Kandungan",
    ],
  },
  {
    id_faskes: 6,
    slug_faskes: "klinik-kimia-farma-juanda",
    kode_kemenkes: "3271211",
    nama_faskes: "Klinik Kimia Farma Juanda",
    kategori_faskes: "KLINIK PRATAMA",
    label_singkat_kategori: "Klinik\nPratama",
    kelas_faskes: "Pratama",
    alamat_lengkap: "Jl. Ir. H. Juanda No.32, Bogor Tengah",
    kecamatan: "Bogor Tengah",
    wilayah_kota_kab: "KOTA_BOGOR",
    jarak_km: "1.8 km",
    waktu_tempuh: "4 menit berkendara",
    rating_faskes: "4.3",
    jumlah_ulasan: 52,
    status_bpjs: true,
    status_igd_24jam: false,
    telepon_darurat: false,
    latitude: -6.6012,
    longitude: 106.7962,
    koordinat_teks: "-6.6012° S, 106.7962° E",
    gambar_faskes: "/images/beranda-card-2.png",
    daftar_poli: ["Poli Umum", "Poli Gigi"],
  },
  {
    id_faskes: 7,
    slug_faskes: "rsia-pasutri-bogor",
    kode_kemenkes: "3271088",
    nama_faskes: "RSIA Pasutri Bogor",
    kategori_faskes: "RUMAH SAKIT KIA",
    label_singkat_kategori: "Rumah Sakit",
    kelas_faskes: "Tipe C",
    alamat_lengkap: "Jl. Landbow No.1, Cikeas, Cibinong",
    kecamatan: "Cibinong",
    wilayah_kota_kab: "KABUPATEN_BOGOR",
    jarak_km: "5.4 km",
    waktu_tempuh: "12 menit berkendara",
    rating_faskes: "4.6",
    jumlah_ulasan: 112,
    status_bpjs: true,
    status_igd_24jam: true,
    telepon_darurat: true,
    latitude: -6.5651,
    longitude: 106.8012,
    koordinat_teks: "-6.5651° S, 106.8012° E",
    gambar_faskes: "/images/beranda-card-1.png",
    daftar_poli: ["Poli Anak", "Poli Kandungan", "Poli Umum"],
  },
  {
    id_faskes: 8,
    slug_faskes: "puskesmas-tanah-sareal",
    kode_kemenkes: "3271105",
    nama_faskes: "Puskesmas Tanah Sareal",
    kategori_faskes: "PUSKESMAS",
    label_singkat_kategori: "Puskesmas",
    kelas_faskes: "Faskes Tk. 1",
    alamat_lengkap: "Jl. Kesehatan No.3, Tanah Sareal",
    kecamatan: "Tanah Sareal",
    wilayah_kota_kab: "KOTA_BOGOR",
    jarak_km: "2.1 km",
    waktu_tempuh: "5 menit berkendara",
    rating_faskes: "4.4",
    jumlah_ulasan: 76,
    status_bpjs: true,
    status_igd_24jam: false,
    telepon_darurat: false,
    latitude: -6.56843,
    longitude: 106.79728,
    koordinat_teks: "-6.5684° S, 106.79728° E",
    gambar_faskes: "/images/beranda-card-2.png",
    daftar_poli: ["Poli Umum", "Poli Gigi", "Poli Anak"],
  },
];
