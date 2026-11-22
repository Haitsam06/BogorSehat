# BogorSehat REST API Contracts

Base URL: `/api`

Backend only. Frontend integration is out of scope for this repository.

## Conventions

- Request and response format: `application/json`.
- Protected endpoints require `Authorization: Bearer <token>`.
- Successful single-resource response:

```json
{"data": {}}
```

- Successful collection response uses Laravel pagination:

```json
{"data": [], "links": {}, "meta": {}}
```

- Validation failure: HTTP `422` with `message` and `errors`.
- Missing/invalid token: HTTP `401`.
- Insufficient role or ownership: HTTP `403`.
- Missing resource: HTTP `404`.
- Admin role: `role_user=admin`.
- Regular role: `role_user=user`.

## Authentication and profile

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register regular user |
| POST | `/auth/login` | Public | Login user/admin; returns bearer token |
| POST | `/auth/logout` | Token | Revoke current bearer token |
| GET | `/user` | Token | Current authenticated user |
| GET | `/profile` | Token | Current profile |
| PUT | `/profile` | Token | Update current profile |

### Register body

```json
{
  "nama_user": "User Name",
  "email_user": "user@example.test",
  "password_user": "password123",
  "password_user_confirmation": "password123"
}
```

### Login body

```json
{
  "email_user": "user@example.test",
  "password_user": "password123"
}
```

Login response includes `data` and a plain `token`. Store the token securely; it is not returned again.

## Public dashboard and faskes

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/home` | Public | Public dashboard counts and available cities |
| GET | `/faskes` | Public | Paginated faskes list |
| GET | `/faskes/{id_faskes}` | Public | Faskes detail with specializations and facilities |
| GET | `/faskes/map` | Public | Map marker data |
| GET | `/faskes/nearby` | Public | Faskes within radius, sorted by distance |
| GET | `/spesialisasi` | Public | Paginated specialization master data |
| GET | `/fasilitas` | Public | Paginated facility master data |

### Faskes list query parameters

- `search`: partial `nama_faskes` match.
- `provinsi`: exact province match. Dataset seed value: `JAWA BARAT`.
- `kecamatan`: partial district match extracted from source addresses where available.
- `kota_kabupaten`: exact city/regency match.
- `jenis_faskes`: exact type match.
- `kelas_faskes`: exact class match.
- `is_support_bpjs`: boolean (`0` or `1`).
- `id_spesialisasi`: specialization ID.
- `id_fasilitas`: one or more supporting-facility IDs. Accepts a single value, a comma-separated list, or repeated `id_fasilitas[]` parameters; a faskes matches when it has any of the requested facilities.
- `latitude`: optional user latitude, `-90` to `90`.
- `longitude`: optional user longitude, `-180` to `180`.
- `per_page`: maximum `100`; default `15`.
- `page`: pagination page.

Results are ordered by service type: `Rumah Sakit` → `Klinik` → `Puskesmas` → `Dokter Praktik Perorangan` → `Dokter Gigi` → `Apotek` → `Optik`, then alphabetically by `nama_faskes`. Unknown or empty types come last. `GET /faskes/nearby` keeps distance ordering instead.

Example:

```text
GET /api/faskes?search=RSUD&kota_kabupaten=KAB.%20BOGOR&is_support_bpjs=1&per_page=20
```

### Nearby query parameters

Required:

- `latitude`: `-90` to `90`.
- `longitude`: `-180` to `180`.

Optional:

- `radius`: kilometers; default `10`, maximum `100`.
- `compact`: boolean (`0` or `1`); when enabled, omits heavy `fasilitas`, `images`, and rating aggregates while returning `spesialisasi` and `has_igd` (boolean) for fast map rendering.

Every faskes response carries `distance_km` in kilometers, rounded to two decimals. `GET /faskes`, `GET /faskes/{id_faskes}`, `GET /faskes/map`, and `GET /faskes/nearby` accept `latitude` and `longitude`; when both are absent the reference point defaults to the Bogor city center (`-6.5950`, `106.7990`). `GET /faskes/nearby` remains sorted ascending by `distance_km`.

### Faskes object

```json
{
  "id_faskes": 1,
  "kdppk": "0117R007",
  "nama_faskes": "RSUD R. MOH. NOH NUR",
  "jenis_faskes": "Rumah Sakit",
  "alamat_faskes": "JL. RAYA CIBEBER NO.1",
  "provinsi": "JAWA BARAT",
  "kecamatan": "CIJERUK",
  "kota_kabupaten": "KAB. BOGOR",
  "longitude": "106.62800000",
  "latitude": "-6.57451000", 
  "telp_faskes": "0251-8643290",
  "is_support_bpjs": true,
  "link_maps": "https://www.google.com/maps/search/RSUD%20R.%20MOH.%20NOH%20NUR%2C%20JL.%20RAYA%20CIBEBER%20NO.1%2C%20KAB.%20BOGOR/@-6.57451,106.628,17z",
  "rating_avg": 4.35,
  "rating_count": 12,
  "spesialisasi": [],
  "fasilitas": [],
  "images": [
    {
      "id_faskes_image": 1,
      "path": "uploads/faskes/2f1c....png",
      "url": "http://localhost:8000/storage/uploads/faskes/2f1c....png",
      "is_banner": true,
      "is_thumbnail": true,
      "sort_order": 0
    }
  ],
  "banner_url": "http://localhost:8000/storage/uploads/faskes/2f1c....png",
  "thumbnail_url": "http://localhost:8000/storage/uploads/faskes/2f1c....png"
}

`rating_avg` is the mean of `rating` across top-level comments that carry a rating; `rating_count` counts those comments. Replies never contribute. Both fields are `0` when a facility has no rated comment. They are returned by `GET /faskes`, `GET /faskes/{id_faskes}`, `GET /faskes/map`, and `GET /faskes/nearby`.

## Comments and reviews

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/faskes/{id_faskes}/komentar` | Public | Paginated top-level comments with replies |
| GET | `/me/komentar` | Token | Current user's comments with faskes navigation data |
| POST | `/faskes/{id_faskes}/komentar` | Token | Add review/comment |
| POST | `/komentar/{id_komentar}/replies` | Token | Reply to comment |
| DELETE | `/komentar/{id_komentar}` | Token | Delete own comment; admin may moderate |
| POST | `/komentar/{id_komentar}/report` | Token | Report comment |

Comment body:

```json
{
  "body": "Pelayanan baik",
  "rating": 5,
  "image_path": ["optional/path.jpg"]
}
```

`rating` is optional and must be `1` through `5`. Replies omit `rating`.

## Forum diskusi

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/diskusi` | Public | Paginated discussion list |
| GET | `/diskusi/{id_diskusi}` | Public | Discussion detail with replies |
| POST | `/diskusi` | Token | Create discussion |
| DELETE | `/diskusi/{id_diskusi}` | Token | Delete own discussion; admin may moderate |
| POST | `/diskusi/{id_diskusi}/tanggapan` | Token | Add discussion reply |
| POST | `/diskusi/{id_diskusi}/suka` | Token | Like a discussion; idempotent per user |
| DELETE | `/diskusi/{id_diskusi}/suka` | Token | Remove own like from a discussion |
| POST | `/diskusi/{id_diskusi}/dilihat` | Token | Record a unique view; the author's own views are ignored |
| POST | `/diskusi/{id_diskusi}/report` | Token | Report discussion |
| POST | `/tanggapan-diskusi/{id_tanggapan}/replies` | Token | Reply to discussion reply |
| POST | `/tanggapan-diskusi/{id_tanggapan}/suka` | Token | Like a discussion reply; idempotent per user |
| DELETE | `/tanggapan-diskusi/{id_tanggapan}/suka` | Token | Remove own like from a discussion reply |
| POST | `/tanggapan-diskusi/{id_tanggapan}/report` | Token | Report discussion reply |
| PUT | `/tanggapan-diskusi/{id_tanggapan}` | Token | Edit own reply; admin may moderate |
| DELETE | `/tanggapan-diskusi/{id_tanggapan}` | Token | Delete own reply; admin may moderate |
| GET | `/me/diskusi` | Token | Current user's discussions |

### Discussion body

```json
{
  "judul_diskusi": "Tanya faskes",
  "kategori_diskusi": "lainnya",
  "body": "Ada rekomendasi?",
  "image_path": ["optional/path.jpg"],
  "id_faskes": 5
}

`kategori_diskusi` defaults to `lainnya`. `id_faskes` is optional and links the discussion to a facility.

### Discussion engagement object

Every discussion response carries these counters, including `GET /diskusi`, `GET /diskusi/{id_diskusi}`, and `GET /me/diskusi`:

```json
{
  "jumlah_suka": 8,
  "jumlah_dilihat": 6,
  "jumlah_tanggapan": 2,
  "sublokasi_penulis": "KAB. BOGOR",
  "faskes_terkait": {
    "id_faskes": 5,
    "nama_faskes": "RS ASSALAM",
    "alamat": "JL. RAYA JAKARTA - BOGOR KM 46,7",
    "kecamatan": null,
    "kota_kabupaten": "KAB. BOGOR",
    "link_maps": "https://www.google.com/maps/dir/?api=1&destination=RS%20ASSALAM"
  }
}
```

`faskes_terkait` and `sublokasi_penulis` are `null` when the discussion has no linked facility. Every discussion reply carries `jumlah_suka`.

Like and view responses:

```json
{
  "id_diskusi": 1,
  "disukai": true,
  "jumlah_suka": 4
}
```

```json
{
  "id_diskusi": 1,
  "jumlah_dilihat": 5
}
```

Reply like responses use `id_tanggapan_diskusi` instead of `id_diskusi`. Likes are keyed by `(discussion, user)` and views by `(discussion, user)`, so repeating the call never inflates the counter.

## Faskes feedback and reports

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/faskes/{id_faskes}/feedback` | Token | Report incorrect faskes information |
| GET | `/admin/laporan` | Admin | List comment, discussion, and reply reports |
| PATCH | `/admin/laporan/{type}/{id}/status` | Admin | Set report status |
| DELETE | `/admin/laporan/{type}/{id}` | Admin | Permanently delete report |
| GET | `/admin/feedback-faskes` | Admin | List faskes feedback |
| PATCH | `/admin/feedback-faskes/{id_feedback}` | Admin | Set feedback status/admin note |
| DELETE | `/admin/feedback-faskes/{id_feedback}` | Admin | Permanently delete feedback |

Report `{type}` values: `komentar`, `diskusi`, `tanggapan`.

Report body:

```json
{
  "alasan": "Tidak relevan",
  "catatan": "Optional explanation"
}
```

Faskes feedback body:

```json
{
  "alasan": "Alamat berubah",
  "saran_perbaikan": "Perbarui alamat"
}
```

Allowed statuses: `pending`, `resolved`, `rejected`.

## Admin dashboard and management

All endpoints in this section require a valid token with `role_user=admin`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/dashboard` | Counts for faskes, users, discussions, pending feedback/reports |
| GET | `/admin/faskes` | Paginated faskes list |
| POST | `/admin/faskes` | Create faskes |
| PUT | `/admin/faskes/{id_faskes}` | Update faskes and optional relations |
| DELETE | `/admin/faskes/{id_faskes}` | Delete faskes |
| GET | `/admin/users` | Paginated user list |
| GET | `/admin/users/{id_user}` | User detail |
| PUT | `/admin/users/{id_user}` | Update user/account role |
| DELETE | `/admin/users/{id_user}` | Delete user; current admin cannot delete itself |
| GET | `/admin/spesialisasi` | Paginated specialization master data with `faskes_count` |
| GET | `/admin/spesialisasi/{id_spesialisasi}` | Specialization detail |
| POST | `/admin/spesialisasi` | Create specialization |
| PUT | `/admin/spesialisasi/{id_spesialisasi}` | Rename specialization |
| DELETE | `/admin/spesialisasi/{id_spesialisasi}` | Delete specialization; add `?force=1` when still used |
| GET | `/admin/fasilitas` | Paginated supporting-facility master data with `faskes_count` |
| GET | `/admin/fasilitas/{id_fasilitas}` | Supporting facility detail |
| POST | `/admin/fasilitas` | Create supporting facility |
| PUT | `/admin/fasilitas/{id_fasilitas}` | Rename supporting facility |
| DELETE | `/admin/fasilitas/{id_fasilitas}` | Delete supporting facility; add `?force=1` when still used |

### Master data bodies

`GET /admin/spesialisasi` and `GET /admin/fasilitas` accept `search`, `page`, and `per_page` (max `100`, default `25`) and return `data` plus `meta`:

```json
{
  "data": [
    { "id_spesialisasi": "ANA", "nama_spesialisasi": "ANAK", "faskes_count": 52 }
  ],
  "meta": { "current_page": 1, "last_page": 4, "per_page": 25, "total": 51 }
}
```

Specialization create body:

```json
{ "id_spesialisasi": "ANA", "nama_spesialisasi": "ANAK" }
```

`id_spesialisasi` is required, max 10 characters, must be unique, and cannot be changed afterwards. Update only accepts `nama_spesialisasi`.

Supporting facility create body:

```json
{ "id_fasilitas": 900, "nama_fasilitas": "Ruang Laktasi" }
```

`id_fasilitas` is optional; when omitted the backend assigns `max(id_fasilitas) + 1`. Update only accepts `nama_fasilitas`.

Deleting a specialization or facility that is still referenced returns `409` with the usage count. Repeating the request with `?force=1` deletes the row and cascades its relation rows.

### Admin faskes body

Create requires:

- `nama_faskes`
- `alamat_faskes`
- `kota_kabupaten`
- `longitude`
- `latitude`

Optional fields:

- `kdppk` (unique)
- `jenis_faskes`
- `kelas_faskes`
- `telp_faskes`
- `is_support_bpjs`
- `link_maps`
- `id_spesialisasi`: array of valid specialization IDs
- `id_fasilitas`: array of valid facility IDs
- `images`: array (max `5`) of `{ path, url, is_banner?, is_thumbnail?, sort_order? }`

`link_maps` targets the place by name, address, and city, anchored on the facility coordinates with a 17z zoom. Format: `https://www.google.com/maps/search/<url-encoded query>/@<latitude>,<longitude>,17z`. Without coordinates it falls back to `https://www.google.com/maps/search/?api=1&query=<url-encoded query>`. The backend regenerates the link whenever `nama_faskes`, `alamat_faskes`, `kota_kabupaten`, `latitude`, or `longitude` change and `link_maps` is omitted.

## File uploads

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/uploads` | Token | Upload one image or PDF and get a public URL |

Multipart body:

- `file`: required; max `5120` KB; `image/jpeg`, `image/png`, `image/webp`, or `application/pdf` (`faskes` context allows images only).
- `context`: optional; `diskusi`, `tanggapan`, `komentar`, or `faskes` (admin only). Defaults to `diskusi` and selects the storage folder.

Response:

```json
{
  "data": {
    "path": "uploads/diskusi/2f1c....png",
    "url": "http://localhost:8000/storage/uploads/diskusi/2f1c....png",
    "name": "bukti.png",
    "mime": "image/png",
    "size": 20480
  }
}
```

Pass `url` back in the `image_path` array when creating a discussion, discussion reply, or comment. Files are served from `public/storage`, so run `php artisan storage:link` once per environment.

## Review rating

`GET /faskes/{id_faskes}/komentar` returns a `rating` block next to the paginated comments, and `POST /faskes/{id_faskes}/komentar` returns the same block in the create response:

```json
{
  "data": [],
  "rating": {
    "rating_avg": 4.35,
    "rating_count": 12
  }
}
```

`rating_avg` is the mean of `rating` across top-level comments that carry a rating; replies are excluded. A client can refresh the displayed score right after submitting a review instead of re-fetching the facility.

## Seed and verification

`CommunityInteractionSeeder` fills the community tables after the faskes dataset: 10 regular users (`password` for every seeded account), 60 top-level comments, 40 comment replies, 20 discussions, 45 discussion replies (25 nested), 15 comment reports, 10 discussion reports, 8 reply reports, 12 faskes feedback rows, 103 discussion likes, 108 reply likes, and 128 unique views. Every report references the reported row's own author and, for comment reports, the reported comment's faskes. Statuses use `pending`, `resolved`, and `rejected`. Each seeded discussion links to a facility so `faskes_terkait` and `sublokasi_penulis` are populated. Seeding is idempotent and can be repeated.

From `backend/`:

```bash
php artisan migrate:fresh --seed
php artisan test
vendor/bin/pint --dirty --format agent
```

## DPPL functional requirement coverage

| FR | REST API coverage |
|---|---|
| FR01 | `GET /user` |
| FR02 | `GET /home` |
| FR03 | `GET /faskes/nearby` |
| FR04 | `GET /faskes/{id_faskes}` |
| FR05 | `link_maps` in faskes response |
| FR06 | `GET /faskes/map` |
| FR07 | Detail endpoint used by map pin: `GET /faskes/{id_faskes}` |
| FR08-FR09 | Admin login/logout through `/auth/login` and `/auth/logout`; admin middleware protects admin routes |
| FR10 | `GET /admin/dashboard` |
| FR11-FR14 | Admin faskes list/create/update/delete endpoints |
| FR15-FR17 | `/faskes` search and filters: `search`, `provinsi`, `kecamatan`, `kota_kabupaten`, `jenis_faskes`, `kelas_faskes`, `is_support_bpjs` |
| FR18-FR20 | Register/login/logout endpoints |
| FR21-FR24 | Faskes comments, replies, and owner/admin deletion |
| FR25-FR30 | Forum list/detail, discussion replies, nested replies, edit/delete |
| FR31-FR34 | `/me/diskusi`, discussion create/delete, profile endpoints |
| FR35-FR36 | `GET /me/komentar`, including linked faskes data |
| FR37-FR38 | `/me/diskusi` with discussion detail endpoint |
| FR39 | `POST /faskes/{id_faskes}/feedback` |
| FR40-FR42 | Admin report list/status/delete endpoints |
| FR43 | Admin user list/detail/update/delete endpoints |

CSV files remain the seeder source of truth. Frontend files are not modified by the API implementation.

## Catatan Implementasi Backend

Seluruh penyesuaian yang dibutuhkan frontend sudah diterapkan di backend:

1. **Galeri gambar faskes** — tabel `faskes_images` (`id_faskes_image`, `id_faskes`, `path`, `url`, `is_banner`, `is_thumbnail`, `sort_order`). `POST` dan `PUT /api/admin/faskes` menerima `images` (maks. `5`). Flag dinormalisasi menjadi tepat satu banner dan satu thumbnail; bila tidak ada yang ditandai, gambar indeks `0` menjadi keduanya. `PUT` tanpa key `images` mempertahankan gambar lama, sedangkan `images: []` menghapus semua gambar beserta file di disk. File juga dihapus saat faskes dihapus. `images`, `banner_url`, dan `thumbnail_url` dikembalikan pada `GET /faskes`, `GET /faskes/{id_faskes}`, `GET /faskes/nearby` (non-compact), serta response admin faskes.
2. **Upload gambar faskes** — `context=faskes` diterima pada `POST /api/uploads`, khusus admin (`403` untuk non-admin), hanya berkas gambar (`422` untuk PDF). Semua gambar yang diunggah dikonversi ke WEBP (kualitas `82`) sebelum disimpan, termasuk pada context diskusi/tanggapan/komentar; PDF disimpan apa adanya.
3. **Detail master data admin** — `GET /api/admin/spesialisasi/{id_spesialisasi}` dan `GET /api/admin/fasilitas/{id_fasilitas}` mengembalikan `{ data: { …, faskes_count } }`, `404` bila tidak ditemukan.
4. **Mode ringkas peta** — `GET /api/faskes/nearby?compact=1` melewati `fasilitas`, `images`, dan agregat rating, tetap menyertakan `spesialisasi`, serta menambahkan `has_igd` (boolean, berdasarkan fasilitas yang namanya mengandung `igd`).

Peringatan operasional: jalankan `php artisan storage:link` sekali per environment agar `/storage/uploads/...` dapat diakses.
