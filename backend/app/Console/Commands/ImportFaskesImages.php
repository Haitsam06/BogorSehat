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
        {--max-distance=300 : Max metres between facility and place coordinates}
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

        $places = json_decode((string) file_get_contents($path), true);
        if (! is_array($places)) {
            $this->error('Dataset is not valid JSON array.');

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

        Faskes::query()->orderBy('id_faskes')->chunk(100, function ($faskes) use (
            $candidates, $maxDistance, $dryRun, $limit, &$matched, &$downloaded, &$skipped
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
                    $this->line(sprintf('%5d  %-42s < %4dm  %s', $item->id_faskes, Str::limit($item->nama_faskes, 40), (int) $best['distance'], Str::limit($best['title'], 44)));

                    continue;
                }

                if ($this->storeImage($item, $best, (int) $this->option('quality'))) {
                    $downloaded++;
                }
            }

            return true;
        });

        if ($dryRun) {
            $this->info(sprintf('Would match %d facilities, skip %d.', $matched, $skipped));

            return self::SUCCESS;
        }

        $this->info(sprintf('Matched %d, downloaded %d images, skipped %d facilities.', $matched, $downloaded, $skipped));

        return self::SUCCESS;
    }

    /**
     * @param  list<array<string, mixed>>  $places
     * @return list<array<string, mixed>>
     */
    private function candidates(array $places): array
    {
        $candidates = [];
        foreach ($places as $place) {
            $image = (string) ($place['imageUrl'] ?? '');
            $location = $place['location'] ?? null;
            if (! str_starts_with($image, 'https://gz0.googleusercontent.com') || ! is_array($location)) {
                continue;
            }
            if (! isset($location['lat'], $location['lng'])) {
                continue;
            }

            $candidates[] = [
                'title' => (string) ($place['title'] ?? ''),
                'tokens' => $this->tokens((string) ($place['title'] ?? '')),
                'compact' => $this->compact((string) ($place['title'] ?? '')),
                'lat' => (float) $location['lat'],
                'lng' => (float) $location['lng'],
                'image' => $image,
                'category' => (string) ($place['categoryName'] ?? ''),
            ];
        }

        return $candidates;
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

        $best = null;
        $bestScore = 0;

        foreach ($candidates as $candidate) {
            if (! $this->isMedical($candidate['category'])) {
                continue;
            }

            $distance = $this->distance((float) $faskes->latitude, (float) $faskes->longitude, $candidate['lat'], $candidate['lng']);
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

    /** @param  array<string, mixed>  $candidate */
    private function storeImage(Faskes $faskes, array $candidate, int $quality): bool
    {
        try {
            $binary = Http::withHeaders(['User-Agent' => 'Mozilla/5.0'])->timeout(20)->get($candidate['image'])->body();
        } catch (\Throwable $exception) {
            $this->warn(sprintf('Download failed for faskes %d: %s', $faskes->id_faskes, $exception->getMessage()));

            return false;
        }

        $source = @imagecreatefromstring($binary);
        if ($source === false) {
            $this->warn(sprintf('Unreadable image for faskes %d.', $faskes->id_faskes));

            return false;
        }
        imagepalettetotruecolor($source);
        imagealphablending($source, false);
        imagesavealpha($source, true);

        $path = 'uploads/faskes/'.Str::slug($faskes->nama_faskes).'-'.$faskes->id_faskes.'.webp';
        $absolute = Storage::disk('public')->path($path);
        Storage::disk('public')->makeDirectory(dirname($path));

        ob_start();
        imagewebp($source, null, $quality);
        $encoded = (string) ob_get_clean();
        imagedestroy($source);

        file_put_contents($absolute, $encoded);

        $faskes->images()->delete();
        FaskesImage::query()->create([
            'id_faskes' => $faskes->id_faskes,
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'is_banner' => true,
            'is_thumbnail' => true,
            'sort_order' => 0,
        ]);

        return true;
    }
}
