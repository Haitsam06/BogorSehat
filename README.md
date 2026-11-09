# BogorSehat - Sistem Informasi & WebGIS Fasilitas Kesehatan Bogor

BogorSehat adalah platform web interaktif untuk pemetaan, pencarian, dan informasi fasilitas kesehatan (Rumah Sakit, Puskesmas, Klinik, dan Laboratorium) di wilayah **Kota Bogor** dan **Kabupaten Bogor**. Proyek ini dilengkapi dengan modul pencarian berbasis radius (GIS), direktori spesialisasi & sarana medis, ulasan pengguna, forum diskusi warga, serta panel administrasi faskes.

---

## Daftar Isi

- [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
- [Struktur Proyek](#-struktur-proyek)
- [Prasyarat Sistem (Prerequisites)](#-prasyarat-sistem-prerequisites)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Konfigurasi Backend (Laravel)](#2-konfigurasi-backend-laravel)
  - [3. Konfigurasi Frontend (Next.js)](#3-konfigurasi-frontend-nextjs)
- [Akun Default (Seeder)](#-akun-default-seeder)
- [Dokumentasi & Testing API](#-dokumentasi--testing-api)
- [Fitur Utama](#-fitur-utama)
- [Troubleshooting](#-troubleshooting)

---

## Arsitektur & Tech Stack

Platform ini dibangun menggunakan arsitektur decoupled (Backend API & Frontend Client):

### Backend
- **Framework**: Laravel 11/12 (PHP 8.3+)
- **Database**: SQLite (default, zero-configuration) atau MySQL/PostgreSQL
- **Autentikasi**: Token-based Bearer Authentication (API Tokens)
- **Code Style & Testing**: Laravel Pint, PHPUnit

### Frontend
- **Framework**: Next.js 15 (React 19, TypeScript, App Router)
- **Styling**: Tailwind CSS
- **Peta & GIS**: Leaflet & React-Leaflet
- **Icons**: Lucide React

### Sumber Data Master (CSV)
Data faskes dan fasilitas awal di-seed langsung dari berkas CSV resmi:
- `faskes_final.csv`: Data faskes lengkap beserta koordinat latitude/longitude, kelas, kontak, dan status BPJS.
- `master_spesialisasi_final.csv`: Data master spesialisasi medis dokter.
- `master_sarana_penunjang_final.csv`: Data sarana medis dan fasilitas penunjang.

---

## Struktur Proyek

```plaintext
BogorSehat/
├── backend/                             # RESTful API Backend (Laravel)
│   ├── app/Http/Controllers/            # Controller endpoints API
│   ├── database/migrations/             # Skema tabel database
│   ├── database/seeders/                # Seeder otomatis membaca CSV
│   └── routes/api.php                   # Definisi routing API
├── frontend/                            # Web App Client (Next.js 15)
│   ├── src/app/                         # Next.js App Router pages
│   ├── src/components/                  # Komponen UI & WebGIS Leaflet
│   └── public/                          # Aset statis & logo
├── API Contracts.md                     # Spesifikasi lengkap kontrak REST API
├── faskes_final.csv                     # Dataset master faskes
├── master_sarana_penunjang_final.csv    # Dataset master sarana penunjang
├── master_spesialisasi_final.csv        # Dataset master spesialisasi
└── README.md                            # Panduan instalasi dan dokumentasi proyek
```

---

## Prasyarat Sistem (Prerequisites)

Pastikan lingkungan lokal Anda telah terpasang:

1. **PHP**: Versi **8.3** atau lebih baru
   - Ekstensi PHP wajib aktif: `pdo_sqlite`, `mbstring`, `openssl`, `curl`, `fileinfo`.
2. **Composer**: Versi **2.x** ([Download Composer](https://getcomposer.org/))
3. **Node.js**: Versi **18.18.0+** atau **20.x+** ([Download Node.js](https://nodejs.org/))
4. **Git**: Untuk cloning repository

---

## Panduan Instalasi & Menjalankan

### 1. Clone Repository

Buka terminal / PowerShell dan clone repositori ini:

```bash
git clone https://github.com/username/BogorSehat.git
cd BogorSehat
```

---

### 2. Konfigurasi Backend (Laravel)

Buka terminal baru untuk backend:

```bash
cd backend
```

#### Langkah 2.1: Pasang Dependensi PHP
```bash
composer install
```

#### Langkah 2.2: Buat Berkas Konfigurasi Environment
Salin berkas `.env.example` menjadi `.env`:

- **Windows (PowerShell / CMD):**
  ```powershell
  copy .env.example .env
  ```
- **macOS / Linux:**
  ```bash
  cp .env.example .env
  ```

#### Langkah 2.3: Generate Application Key
```bash
php artisan key:generate
```

#### Langkah 2.4: Persiapan Database SQLite
Secara default konfigurasi `.env` menggunakan SQLite (`DB_CONNECTION=sqlite`). Pastikan berkas database SQLite tersedia:

- **Windows (PowerShell):**
  ```powershell
  New-Item -ItemType File -Force -Path database\database.sqlite
  ```
- **macOS / Linux:**
  ```bash
  touch database/database.sqlite
  ```

> *Catatan*: Jika ingin menggunakan MySQL, ubah variabel `DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` di berkas `.env` sesuai konfigurasi lokal Anda.

#### Langkah 2.5: Migrasi & Seeding Data dari CSV
Perintah ini akan membuat tabel dan otomatis mengisi data faskes, sarana penunjang, spesialisasi dari CSV root, serta akun admin default:

```bash
php artisan migrate:fresh --seed
```

#### Langkah 2.6: Jalankan Server Backend
```bash
php artisan serve
```
Backend API akan berjalan di: **`http://127.0.0.1:8000`**

---

### 3. Konfigurasi Frontend (Next.js)

Buka terminal terpisah untuk frontend:

```bash
cd frontend
```

#### Langkah 3.1: Pasang Dependensi Node.js
```bash
npm install
```

#### Langkah 3.2: Jalankan Development Server Frontend
```bash
npm run dev
```
Frontend Web App akan berjalan di: **`http://localhost:3000`**

---

## Akun Default (Seeder)

Setelah proses `php artisan migrate:fresh --seed` selesai, akun administrator default siap digunakan:

| Keterangan | Kredensial |
|---|---|
| **Email** | `admin@bogorsehat.test` |
| **Password** | `password` |
| **Role** | `admin` |
| **Akses Admin Portal** | `http://localhost:3000/admin/login` |

---

## Dokumentasi & Testing API

### Kontrak Endpoint REST API
Spesifikasi lengkap endpoint API (Request, Response, Payload, Status Code) tersedia di file:
[**API Contracts.md**](file:///c:/Users/ACER/Desktop/Kuliah/S5/Project/BogorSehat/API%20Contracts.md)

Ringkasan grup endpoint:
- **Autentikasi & Profil**: `/api/auth/register`, `/api/auth/login`, `/api/user`, `/api/profile`
- **Direktori Faskes & WebGIS**: `/api/home`, `/api/faskes`, `/api/faskes/map`, `/api/faskes/nearby`, `/api/faskes/{id}`
- **Ulasan & Rating**: `/api/faskes/{id}/komentar`, `/api/komentar/{id}/replies`
- **Forum Diskusi Kesehatan**: `/api/diskusi`, `/api/diskusi/{id}/tanggapan`
- **Manajemen Admin**: `/api/admin/dashboard`, `/api/admin/faskes`, `/api/admin/users`, `/api/admin/laporan`, `/api/admin/feedback-faskes`

### Menjalankan Uji Otomatis (Testing)
Dari dalam folder `backend/`:
```bash
# Menjalankan unit & feature tests
php artisan test

# Memeriksa standard kode (formatting)
vendor/bin/pint --test
```

---

## Fitur Utama

1. **Pencarian Faskes Cerdas**: Pencarian faskes berdasarkan nama, kecamatan, jenis (Rumah Sakit, Puskesmas, Klinik), kelas perawatan, dan filter penerimaan BPJS Kesehatan.
2. **WebGIS & Radius Terdekat**: Menemukan fasilitas kesehatan terdekat dari koordinat posisi pengguna dengan kalkulasi jarak kilometer (`distance_km`) dan integrasi rute Google Maps.
3. **Peta Interaktif (Leaflet)**: Peta interaktif dengan pin lokasi faskes beserta informasi cepat (popup kartu faskes).
4. **Ulasan & Penilaian (Rating)**: Fitur ulasan dan rating transparansi kualitas faskes dari masyarakat pengguna.
5. **Forum Diskusi Warga**: Ruang tanya jawab dan diskusi publik seputar pengalaman berobat dan tips layanan kesehatan.
6. **Panel Dashboard Admin**: Statistik faskes, laporan masukan dari warga, dan manajemen CRUD faskes & user.

---

## Troubleshooting

- **Error: `Database file does not exist` (SQLite)**:
  Pastikan berkas `backend/database/database.sqlite` sudah dibuat sebelum menjalankan migrasi.
- **Error: `cURL error 60: SSL certificate problem` saat `composer install`**:
  Pastikan konfigurasi `curl.cainfo` dan `openssl.cafile` mengarah ke file `cacert.pem` yang valid di `php.ini`.
- **Port 8000 atau 3000 bentrok**:
  - Jalankan backend di port lain: `php artisan serve --port=8080`
  - Jalankan frontend di port lain: `npm run dev -- -p 3001`

