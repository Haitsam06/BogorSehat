import { ApiDiskusi } from "@/lib/api";

export const daftar_diskusi_default: ApiDiskusi[] = [
  {
    id_diskusi: 1,
    id_user: 1,
    judul_diskusi:
      "Pengalaman Rujukan Faskes Tingkat 1 Puskesmas Bogor Timur ke Poli Jantung RSUD Kota Bogor via Mobile JKN",
    kategori_diskusi: "Rujukan BPJS & Prosedur",
    body: `Halo warga Bogor semua, ingin berbagi pengalaman positif proses rujukan berjenjang BPJS Kesehatan dari Puskesmas Bogor Timur ke Poli Jantung Terpadu RSUD Kota Bogor yang saya jalani kemarin pagi. Ternyata sistem Integrasi GIS dan Mobile JKN sekarang sudah jauh lebih efisien tanpa tumpukan fotokopi berkas.

1. Langkah Awal di Faskes 1 (Puskesmas Bogor Timur):
Datang pukul 08.00 WIB untuk pemeriksaan awal dokter umum di poli dewasa. Setelah pemeriksaan EKG menunjukkan indikasi aritmia, dokter langsung membuat rujukan digital via aplikasi PCare BPJS. Surat rujukan langsung muncul otomatis di aplikasi Mobile JKN saya dalam hitungan 2 menit.

2. Registrasi Mandiri di RSUD Kota Bogor:
Saya dapat jadwal di Poli Jantung hari berikutnya. Tips penting bagi teman-teman: sebaiknya tiba sekitar jam 07.30. Pasien tidak perlu lagi antre di loket verifikasi berkas manual lantai 1. Langsung naik ke Lantai 2 Gedung Rawat Jalan, lalu lakukan tapping barcode kartu BPJS digital di Mesin Anjungan Pendaftaran Mandiri (APM). Nomor rekam medis langsung tercetak otomatis dalam waktu kurang dari 30 detik.

3. Pelayanan Dokter & Farmasi:
Pukul 08.45 WIB nama saya sudah dipanggil perawat untuk tensi dan validasi klinis. Penjelasan dokter spesialis sangat transparan dan resep obat kronis langsung ditransfer secara elektronik ke Apotek Farmasi Depo 2.`,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    user: {
      id_user: 1,
      nama_user: "Ahmad Fauzi",
      email_user: "ahmad.fauzi@warga.bogor.go.id",
      role_user: "user",
    },
    sublokasi_penulis: "Puskesmas Bogor Timur",
    jumlah_suka: 24,
    jumlah_dilihat: 342,
    faskes_terkait: {
      id_faskes: 1,
      nama_faskes: "RSUD Kota Bogor",
      alamat: "Jl. DR. Sumeru No.120, Menteng, Kec. Bogor Barat",
      jarak_km: "1.2 km",
      slug: "rsud-kota-bogor",
      link_maps:
        "https://www.google.com/maps/dir/?api=1&destination=RSUD+Kota+Bogor",
      gambar: "/images/detail-photo-1.png",
    },
    tanggapan: [
      {
        id_tanggapan_diskusi: 101,
        id_diskusi: 1,
        id_user: 1,
        id_parent: null,
        body: "Tambahan info: Tempat parkir motor di RSUD ada di gedung parkir belakang. Jika bawa kendaraan roda empat, sangat dianjurkan tiba sebelum jam 07.15 WIB karena slot parkir cepat penuh terutama di hari Senin & Kamis.",
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        jumlah_suka: 9,
        user: {
          id_user: 1,
          nama_user: "Ahmad Fauzi",
          email_user: "ahmad.fauzi@warga.bogor.go.id",
          role_user: "user",
        },
      },
      {
        id_tanggapan_diskusi: 102,
        id_diskusi: 1,
        id_user: 5,
        id_parent: null,
        body: "Terima kasih infonya mas Ahmad Fauzi! Sangat membantu. Untuk poli jantung dokternya setiap hari kerja tersedia atau ada hari-hari tertentu saja ya?",
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        jumlah_suka: 4,
        user: {
          id_user: 5,
          nama_user: "Bambang Pamungkas",
          email_user: "bambang.p@warga.bogor.go.id",
          role_user: "user",
        },
      },
    ],
  },
  {
    id_diskusi: 2,
    id_user: 2,
    judul_diskusi:
      "Rekomendasi USG 4D dan Dokter Obgyn Ramah BPJS di Area Bogor Selatan / RS Siloam",
    kategori_diskusi: "Rekomendasi Faskes & Dokter",
    body: `Halo warga Bogor! Saya ingin meminta rekomendasi dari teman-teman yang mungkin pernah melakukan pemeriksaan kehamilan menggunakan BPJS di sekitar Bogor Selatan, khususnya di RS Siloam atau fasilitas kesehatan lainnya.

Saat ini saya sedang mencari informasi mengenai layanan USG 4D dan dokter spesialis kandungan (Obgyn) yang ramah, komunikatif, serta memberikan penjelasan dengan baik selama pemeriksaan.

Ada beberapa hal yang ingin saya tanyakan:

1. Pengalaman USG 4D
Apakah ada yang pernah melakukan USG 4D di RS Siloam atau rumah sakit sekitar Bogor Selatan? Bagaimana kualitas hasil USG dan pelayanan yang diberikan oleh dokter maupun petugasnya?

2. Rekomendasi Dokter Obgyn
Bagi teman-teman yang pernah memeriksakan kandungan di RS Siloam atau rumah sakit sekitar Bogor, boleh rekomendasikan dokter obgyn yang ramah, sabar, dan informatif?

Saya berharap bisa mendapatkan informasi berdasarkan pengalaman langsung dari teman-teman agar tidak salah memilih tempat pemeriksaan.

Terima kasih sebelumnya atas rekomendasi dan informasinya. Semoga bisa membantu ibu hamil lainnya yang sedang mencari layanan pemeriksaan kandungan di wilayah Bogor. 😊`,
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    user: {
      id_user: 2,
      nama_user: "Dewi Sartika",
      email_user: "dewi.sartika@warga.bogor.go.id",
      role_user: "user",
    },
    sublokasi_penulis: "Puskesmas Bogor Tengah",
    jumlah_suka: 45,
    jumlah_dilihat: 500,
    faskes_terkait: {
      id_faskes: 2,
      nama_faskes: "RS Siloam Bogor",
      alamat:
        "Jl. Raya Pajajaran No.27, RT.01/RW.04, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128",
      jarak_km: "1.2 km",
      slug: "rs-siloam-bogor",
      link_maps:
        "https://www.google.com/maps/dir/?api=1&destination=RS+Siloam+Bogor",
      gambar: "/images/detail-photo-2.png",
    },
    tanggapan: [
      {
        id_tanggapan_diskusi: 201,
        id_diskusi: 2,
        id_user: 6,
        id_parent: null,
        body: "Halo Bu Dewi, saya pernah mendengar rekomendasi RS Siloam Bogor untuk pemeriksaan kandungan. Untuk USG 4D, sebaiknya Ibu menghubungi bagian pendaftaran terlebih dahulu untuk memastikan jadwal dokter dan biaya pemeriksaannya. Kalau menggunakan BPJS, biasanya perlu mengikuti prosedur rujukan dan ketentuan pemeriksaan yang berlaku. Semoga Ibu mendapatkan dokter obgyn yang cocok dan pelayanannya memuaskan. 😊",
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        jumlah_suka: 50,
        user: {
          id_user: 6,
          nama_user: "Siti Aminah",
          email_user: "siti.aminah@warga.bogor.go.id",
          role_user: "user",
        },
      },
    ],
  },
];

