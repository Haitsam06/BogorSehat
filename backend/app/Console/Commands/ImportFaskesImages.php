<?php

namespace App\Console\Commands;

use App\Models\Faskes;
use App\Models\FaskesImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportFaskesImages extends Command
{
    protected $signature = 'faskes:google-images
        {--file=../dataset_crawler-google-places_2026-11-20_20-42-38-888.json : Path to the Places crawler export}
        {--dry-run : Match only, do not download or write}
        {--limit=0 : Stop after N downloads}
        {--only-missing : Hanya faskes yang belum punya gambar}
        {--only-non-partner : Hanya faskes yang belum/tengah kerjasama BPJS}
        {--max-distance=300 : Max metres between facility and place coordinates}
        {--anchor-only : Hanya cocokkan lewat searchString, tanpa skor kemiripan}
        {--quality=82 : WebP quality}';

    protected $description = 'Match crawled Google Places photos to facilities and store them as WebP gallery images';

    private const SKIP_TOKENS = [
        'rs', 'rsud', 'rsu', 'rsia', 'rumah', 'sakit', 'klinik', 'apotek', 'puskesmas',
        'dokter', 'optik', 'umum', 'medis', 'kesehatan', 'indonesia', 'jawa', 'barat',
        'kabupaten', 'kota', 'bogor', 'the', 'and', 'dan', 'no', 'jl', 'jalan',
        'pratama', 'utama', 'dr', 'drg', 'if', 'farmasi', 'pkm', 'kec', 'kel',
    ];

    private const MIN_MATCH_SCORE = 25;

    private const MIN_LETTER_SCORE = 5;

    /** Batas galeri, sama dengan validasi admin (`images` max:5). */
    private const MAX_IMAGES_PER_FASKES = 5;

    /**
     * Host foto yang terbukti membalas 200 + image/jpeg.
     * `streetviewpixels` ikut karena masih dipakai sebagian place.
     */
    private const DOWNLOADABLE_HOSTS = [
        'googleusercontent.com',
        'streetviewpixels-pa.googleapis.com',
    ];

    private const MEDICAL_CATEGORY_HINTS = [
        'rumah sakit', 'klinik', 'puskesmas', 'pusat kesehatan', 'apotek',
        'dokter', 'optik', 'kesehatan', 'dermatolog', 'persalinan', 'bersalin',
    ];

    public function handle(): int
    {
        $path = $this->option('file');
        if (! str_starts_with($path, '/')) {
            $path = base_path($path);
        }

        if (! is_file($path)) {
            $this->error('Dataset not found: '.$path);

            return self::FAILURE;
        }

        $places = $this->readDataset($path);
        if ($places === null) {
            $this->error('Dataset tidak bisa dibaca (JSON array atau CSV crawler).');

            return self::FAILURE;
        }

        $candidates = $this->candidates($places);
        $this->info(sprintf('Dataset places: %d, usable with photo + coordinates: %d', count($places), count($candidates)));

        $maxDistance = (float) $this->option('max-distance');
        $dryRun = (bool) $this->option('dry-run');
        $limit = (int) $this->option('limit');

        $matched = 0;
        $downloaded = 0;
        $skipped = 0;
        $galleryImages = 0;
        $quality = (int) $this->option('quality');

        Faskes::query()->orderBy('id_faskes')->chunk(100, function ($faskes) use (
            $candidates, $maxDistance, $dryRun, $limit, $quality,
            &$matched, &$downloaded, &$skipped, &$galleryImages
        ): bool {
            foreach ($faskes as $item) {
                if ($limit > 0 && $downloaded >= $limit) {
                    return false;
                }

                $best = $this->bestCandidate($item, $candidates, $maxDistance);
                if ($best === null) {
                    $skipped++;

                    continue;
                }

                $matched++;
                if ($dryRun) {
                    $this->line(sprintf('%5d  %-42s < %4dm  %d foto  %s',
                        $item->id_faskes, Str::limit($item->nama_faskes, 40),
                        (int) $best['distance'], count($best['images']), Str::limit($best['title'], 40)));

                    continue;
                }

                $saved = $this->storeImages($item, $best, $quality);
                if ($saved > 0) {
                    $downloaded++;
                    $galleryImages += $saved;
                }
            }

            return true;
        });

        if ($dryRun) {
            $this->info(sprintf('Would match %d facilities, skip %d.', $matched, $skipped));

            return self::SUCCESS;
        }

        $this->info(sprintf('Matched %d, downloaded %d facilities (%d images), skipped %d facilities.',
            $matched, $downloaded, $galleryImages, $skipped));

        return self::SUCCESS;
    }

    /**
     * Baca dataset crawler, JSON array maupun CSV.
     *
     * Ekspor terbaru berbentuk CSV dengan kolom bersarang
     * (`imageUrls/0`, `location/lat`), jadi header perlu dipetakan balik ke
     * bentuk bersarang agar pemroses di bawah tidak perlu dua jalur.
     *
     * @return list<array<string, mixed>>|null
     */
    private function readDataset(string $path): ?array
    {
        $raw = (string) file_get_contents($path);

        if (str_ends_with(strtolower($path), '.csv')) {
            return $this->readCsvDataset($raw);
        }

        $decoded = json_decode($raw, true);

        return is_array($decoded) ? $decoded : null;
    }

    /** @return list<array<string, mixed>> */
    private function readCsvDataset(string $raw): array
    {
        $handle = fopen('php://temp', 'r+');
        fwrite($handle, $raw);
        rewind($handle);

        $header = fgetcsv($handle);
        if ($header === false) {
            fclose($handle);

            return [];
        }
        // Buang BOM pada kolom pertama.
        $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $header[0]);

        $places = [];
        while (($values = fgetcsv($handle)) !== false) {
            if ($values === [null] || $values === []) {
                continue;
            }
            $values = array_pad($values, count($header), null);
            $row = [];
            foreach ($header as $index => $column) {
                $value = $values[$index];
                $row[$column] = ($value === '' || $value === null) ? null : $value;
            }
            $places[] = $this->expandCsvRow($row);
        }
        fclose($handle);

        return $places;
    }

    /**
     * Ubah kolom bersarang (`imageUrls/0`) kembali jadi struktur bersarang
     * yang dipakai `candidates()`.
     *
     * @param  array<string, string|null>  $row
     * @return array<string, mixed>
     */
    private function expandCsvRow(array $row): array
    {
        $images = [];
        foreach (['imageUrl', 'imageUrls/0', 'imageUrls/1', 'imageUrls/2'] as $key) {
            if (filled($row[$key] ?? null)) {
                $images[] = (string) $row[$key];
            }
        }

        return [
            'title' => (string) ($row['title'] ?? ''),
            'categoryName' => (string) ($row['categoryName'] ?? ''),
            'searchString' => (string) ($row['searchString'] ?? ''),
            'imageUrl' => (string) ($row['imageUrl'] ?? ''),
            'imageUrls' => $images,
            'location' => [
                'lat' => (float) ($row['location/lat'] ?? 0),
                'lng' => (float) ($row['location/lng'] ?? 0),
            ],
        ];
    }

    /**
     * Bangun kandidat dari place yang punya koordinat dan minimal satu foto
     * yang benar-benar bisa diunduh.
     *
     * Dataset memuat foto dari beberapa host, bukan hanya `gz0`:
     * `lh3`/`lh4`/`lh5`/`lh6.googleusercontent.com` (foto tempat) dan
     * `streetviewpixels-pa.googleapis.com` (street view). Semuanya membalas
     * 200 dengan `image/jpeg`, jadi tidak ada alasan membuang tiga perempat
     * pasokan seperti versi sebelumnya.
     *
     * @param  list<array<string, mixed>>  $places
     * @return list<array<string, mixed>>
     */
    private function candidates(array $places): array
    {
        $candidates = [];
        foreach ($places as $place) {
            $location = $place['location'] ?? null;
            if (! is_array($location) || ! isset($location['lat'], $location['lng'])) {
                continue;
            }

            $images = $this->downloadableImages($place);
            if ($images === []) {
                continue;
            }

            $candidates[] = [
                'title' => (string) ($place['title'] ?? ''),
                'tokens' => $this->tokens((string) ($place['title'] ?? '')),
                'compact' => $this->compact((string) ($place['title'] ?? '')),
                // CSV crawler menyimpan string pencarian yang dipakai saat
                // scrape; isinya persis `nama, alamat, kota` milik faskes
                // kita. Kunci ini deterministik, tidak perlu skor kemiripan.
                'anchor' => (string) ($place['searchString'] ?? ''),
                'lat' => (float) $location['lat'],
                'lng' => (float) $location['lng'],
                'images' => $images,
                'category' => (string) ($place['categoryName'] ?? ''),
            ];
        }

        return $candidates;
    }

    /**
     * Kumpulkan URL foto yang bisa diunduh dari satu place, tanpa duplikat.
     *
     * @param  array<string, mixed>  $place
     * @return list<string>
     */
    private function downloadableImages(array $place): array
    {
        $raw = [];
        if (filled($place['imageUrl'] ?? null)) {
            $raw[] = (string) $place['imageUrl'];
        }
        foreach ((array) ($place['imageUrls'] ?? []) as $entry) {
            if (is_string($entry)) {
                $raw[] = $entry;
            } elseif (is_array($entry) && is_string($entry['url'] ?? null)) {
                $raw[] = $entry['url'];
            }
        }

        $kept = [];
        foreach ($raw as $url) {
            $host = (string) parse_url($url, PHP_URL_HOST);
            if ($host === '' || ! $this->isDownloadableHost($host)) {
                continue;
            }
            $url = $this->upgradeResolution($url);
            $kept[$url] = true;
        }

        return array_slice(array_keys($kept), 0, self::MAX_IMAGES_PER_FASKES);
    }

    private function isDownloadableHost(string $host): bool
    {
        foreach (self::DOWNLOADABLE_HOSTS as $suffix) {
            if ($host === $suffix || str_ends_with($host, '.'.$suffix)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Naikkan resolusi foto ke 1200x900.
     *
     * Dua format URL yang dipakai dataset:
     *   - foto tempat : `...=w1920-h1080-k-no`   -> ganti sufiks
     *   - street view : `...?w=1111&h=1920&...`  -> ganti query
     */
    private function upgradeResolution(string $url): string
    {
        if (str_contains($url, '/v1/thumbnail')) {
            $url = (string) preg_replace('/([?&])w=\d+/', '${1}w=1200', $url);

            return (string) preg_replace('/([?&])h=\d+/', '${1}h=900', $url);
        }

        // `=w1200-h900-k-no` memasang batas pada dua sisi, sehingga foto
        // portrait tetap kecil (675x900). `=w1200` tanpa batas tinggi
        // menghasilkan 1200x1600 untuk sumber yang sama.
        if (preg_match('/=w\d+-h\d+-[^\/]+$/', $url) === 1) {
            return (string) preg_replace('/=w\d+-h\d+-[^\/]+$/', '=w1200', $url);
        }

        return $url;
    }

    /**
     * @param  list<array<string, mixed>>  $candidates
     * @return array<string, mixed>|null
     */
    private function bestCandidate(Faskes $faskes, array $candidates, float $maxDistance): ?array
    {
        $tokens = $this->tokens($faskes->nama_faskes);
        $compact = $this->compact($faskes->nama_faskes);
        if ($tokens === [] && $compact === '') {
            return null;
        }

        $anchor = $this->anchorFor($faskes);
        $anchorOnly = (bool) $this->option('anchor-only');
        $best = null;
        $bestScore = 0;

        foreach ($candidates as $candidate) {
            $distance = $this->distance((float) $faskes->latitude, (float) $faskes->longitude, $candidate['lat'], $candidate['lng']);

            // Jalur deterministik: crawler menyimpan string pencarian yang
            // dipakai saat scrape. Bila sama persis DAN koordinatnya dekat,
            // tidak perlu skor kemiripan. Jarak tetap diperiksa: crawler
            // kadang mengembalikan tempat lain untuk pencarian yang sama.
            if ($anchor !== '' && hash_equals($anchor, $candidate['anchor']) && $distance <= $maxDistance) {
                return [...$candidate, 'distance' => $distance];
            }

            if ($anchorOnly) {
                continue;
            }

            if (! $this->isMedical($candidate['category'])) {
                continue;
            }

            if ($distance > $maxDistance) {
                continue;
            }

            $score = $this->matchScore($tokens, $compact, $candidate);
            if ($score === 0) {
                continue;
            }

            $isBetter = $score > $bestScore
                || ($score === $bestScore && $best !== null && $distance < $best['distance']);
            if ($isBetter) {
                $best = [...$candidate, 'distance' => $distance];
                $bestScore = $score;
            }
        }

        return $bestScore >= self::MIN_MATCH_SCORE ? $best : null;
    }

    /**
     * String pencarian yang dulu dipakai untuk membuat URL Google Maps —
     * bentuknya identik dengan `searchString` di ekspor crawler.
     */
    private function anchorFor(Faskes $faskes): string
    {
        return implode(', ', array_filter([
            $faskes->nama_faskes,
            $faskes->alamat_faskes,
            $faskes->kota_kabupaten,
        ], static fn ($value): bool => filled($value)));
    }

    /**
     * @param  list<string>  $tokens
     * @param  array<string, mixed>  $candidate
     */
    private function matchScore(array $tokens, string $compact, array $candidate): int
    {
        $candidateCompact = $candidate['compact'];
        if ($compact === '' || $candidateCompact === '') {
            return 0;
        }

        if ($compact === $candidateCompact) {
            return 100;
        }

        $faskesNumbers = array_values(array_filter($tokens, static fn (string $token): bool => ctype_digit($token)));
        $placeNumbers = array_values(array_filter($candidate['tokens'], static fn (string $token): bool => ctype_digit($token)));
        if ($faskesNumbers !== [] && $placeNumbers !== [] && array_intersect($faskesNumbers, $placeNumbers) === []) {
            return 0;
        }

        $shared = array_intersect($tokens, $candidate['tokens']);
        $letterScore = array_sum(array_map(static fn (string $token): int => strlen($token), $shared));

        $contains = str_contains($candidateCompact, $compact) || str_contains($compact, $candidateCompact);
        if ($contains && min(strlen($compact), strlen($candidateCompact)) >= 4) {
            return max($letterScore, 50);
        }

        if ($letterScore >= self::MIN_LETTER_SCORE) {
            return max($letterScore, 25);
        }

        $distance = levenshtein($compact, $candidateCompact);
        $longest = max(strlen($compact), strlen($candidateCompact));
        if ($longest >= 6 && $distance <= max(1, (int) floor($longest / 5))) {
            return 20;
        }

        return 0;
    }

    private function isMedical(string $category): bool
    {
        $normalized = Str::lower($category);
        foreach (self::MEDICAL_CATEGORY_HINTS as $hint) {
            if (str_contains($normalized, $hint)) {
                return true;
            }
        }

        return false;
    }

    /** @return list<string> */
    private function tokens(string $name): array
    {
        $normalized = Str::lower(Str::ascii($name));
        $normalized = (string) preg_replace('/[^a-z0-9 ]+/', ' ', $normalized);
        $tokens = array_filter(explode(' ', $normalized), static fn (string $token): bool => $token !== '');

        return array_values(array_diff(array_unique($tokens), self::SKIP_TOKENS));
    }

    private function compact(string $name): string
    {
        $normalized = Str::lower(Str::ascii($name));
        $normalized = (string) preg_replace('/[^a-z0-9 ]+/', ' ', $normalized);
        $tokens = array_filter(explode(' ', $normalized), static fn (string $token): bool => $token !== '');

        return implode('', array_diff($tokens, self::SKIP_TOKENS));
    }

    private function distance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);
        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lngDelta / 2) ** 2;

        return round(6371000 * 2 * asin(sqrt(min($a, 1.0))), 2);
    }

    /**
     * Unduh seluruh foto kandidat lalu simpan sebagai galeri.
     *
     * Foto pertama jadi banner + thumbnail; sisanya pelengkap dengan
     * `sort_order` menaik. Nama file memakai sufiks indeks supaya satu
     * faskes bisa punya beberapa gambar tanpa saling menimpa.
     *
     * @param  array<string, mixed>  $candidate
     * @return int jumlah gambar yang berhasil disimpan
     */
    private function storeImages(Faskes $faskes, array $candidate, int $quality): int
    {
        $slug = Str::slug($faskes->nama_faskes);
        $stored = [];

        foreach ($candidate['images'] as $index => $url) {
            try {
                $binary = Http::withHeaders(['User-Agent' => 'Mozilla/5.0'])
                    ->timeout(20)
                    ->get($url)
                    ->body();
            } catch (\Throwable $exception) {
                $this->warn(sprintf('Download failed for faskes %d (%d): %s',
                    $faskes->id_faskes, $index, $exception->getMessage()));

                continue;
            }

            $source = @imagecreatefromstring($binary);
            if ($source === false) {
                $this->warn(sprintf('Unreadable image for faskes %d (%d).', $faskes->id_faskes, $index));

                continue;
            }

            imagepalettetotruecolor($source);
            imagealphablending($source, false);
            imagesavealpha($source, true);

            $path = sprintf('uploads/faskes/%s-%d-%d.webp', $slug, $faskes->id_faskes, $index);
            Storage::disk('public')->makeDirectory('uploads/faskes');

            ob_start();
            imagewebp($source, null, $quality);
            $encoded = (string) ob_get_clean();
            imagedestroy($source);

            file_put_contents(Storage::disk('public')->path($path), $encoded);
            $stored[] = $path;
        }

        if ($stored === []) {
            return 0;
        }

        $this->replaceGallery($faskes, $stored);

        return count($stored);
    }

    /**
     * Ganti galeri faskes dan hapus file lama yang tidak dipakai lagi.
     *
     * @param  list<string>  $paths
     */
    private function replaceGallery(Faskes $faskes, array $paths): void
    {
        $previous = $faskes->images()->pluck('path')->all();
        $faskes->images()->delete();

        foreach (array_values($paths) as $order => $path) {
            FaskesImage::query()->create([
                'id_faskes' => $faskes->id_faskes,
                'path' => $path,
                'is_banner' => $order === 0,
                'is_thumbnail' => $order === 0,
                'sort_order' => $order,
            ]);
        }

        $orphans = array_diff($previous, $paths);
        if ($orphans !== []) {
            Storage::disk('public')->delete(array_values($orphans));
        }
    }
}
