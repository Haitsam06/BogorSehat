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
- `id_fasilitas`: facility ID.
- `per_page`: maximum `100`; default `15`.
- `page`: pagination page.

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

Each item includes `distance_km`.

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
  "link_maps": "https://www.google.com/maps/dir/?api=1&destination=RSUD%20R.%20MOH.%20NOH%20NUR%2C%20JL.%20RAYA%20CIBEBER%20NO.1%2C%20KAB.%20BOGOR",
  "spesialisasi": [],
  "fasilitas": []
}
```

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
| POST | `/diskusi/{id_diskusi}/report` | Token | Report discussion |
| POST | `/tanggapan-diskusi/{id_tanggapan}/replies` | Token | Reply to discussion reply |
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
  "image_path": ["optional/path.jpg"]
}
```

`kategori_diskusi` defaults to `lainnya`.

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

`link_maps` points at the place name, address, and city so Google Maps resolves the actual facility. Bare coordinates are only used when the name and address are unavailable. The backend regenerates the link whenever `nama_faskes`, `alamat_faskes`, `kota_kabupaten`, `latitude`, or `longitude` change and `link_maps` is omitted.

## Seed and verification

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
