<?php

namespace App\Console\Commands;

use App\Models\Faskes;
use App\Support\KecamatanNormalizer;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class DeriveFaskesKecamatan extends Command
{
    protected $signature = 'faskes:derive-kecamatan
        {--file=../dataset_crawler-google-places_2026-11-20_20-42-38-888.json : Path to the Places crawler export}
        {--dry-run : Match only, do not write}
        {--max-distance=300 : Max metres between facility and place coordinates}
        {--keep-existing : Keep districts that are already filled}';

    protected $description = 'Fill facility districts from crawled Google Places neighbourhood data';

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

        $sources = $this->sources($places);
        $this->info(sprintf('Places with district and coordinates: %d', count($sources)));

        $maxDistance = (float) $this->option('max-distance');
        $dryRun = (bool) $this->option('dry-run');
        $keepExisting = (bool) $this->option('keep-existing');

        $updated = 0;
        $unchanged = 0;
        $skipped = 0;
        $report = [];

        Faskes::query()->orderBy('id_faskes')->chunk(100, function ($faskes) use (
            $sources, $maxDistance, $dryRun, $keepExisting, &$updated, &$unchanged, &$skipped, &$report
        ): void {
            foreach ($faskes as $item) {
                $current = trim((string) $item->kecamatan);
                if ($keepExisting && $current !== '') {
                    continue;
                }

                $best = $this->nearest($item, $sources, $maxDistance);
                if ($best === null) {
                    $skipped++;

                    continue;
                }

                $district = $best['district'];
                if (Str::upper($current) === Str::upper($district)) {
                    $unchanged++;

                    continue;
                }

                $report[] = [$item->id_faskes, Str::limit($item->nama_faskes, 34), $current === '' ? '-' : $current, $district, (int) $best['distance']];
                $updated++;

                if (! $dryRun) {
                    $item->forceFill(['kecamatan' => $district])->save();
                }
            }
        });

        $this->table(['id', 'nama_faskes', 'lama', 'baru', 'jarak'], array_slice($report, 0, 40));
        if (count($report) > 40) {
            $this->line(sprintf('... dan %d lainnya', count($report) - 40));
        }

        $verb = $dryRun ? 'Would update' : 'Updated';
        $this->info(sprintf('%s %d facilities, %d already correct, %d without a nearby district.', $verb, $updated, $unchanged, $skipped));

        return self::SUCCESS;
    }

    /**
     * @param  list<array<string, mixed>>  $places
     * @return list<array<string, mixed>>
     */
    private function sources(array $places): array
    {
        $sources = [];
        foreach ($places as $place) {
            $location = $place['location'] ?? null;
            if (! is_array($location) || ! isset($location['lat'], $location['lng'])) {
                continue;
            }

            $district = $this->districtFrom($place['neighborhood'] ?? null)
                ?? $this->districtFrom($place['address'] ?? null);
            if ($district === null) {
                continue;
            }

            $sources[] = [
                'district' => $district,
                'lat' => (float) $location['lat'],
                'lng' => (float) $location['lng'],
            ];
        }

        return $sources;
    }

    private function districtFrom(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        if (preg_match('/\bKec(?:amatan)?\.?\s+([A-Za-z][A-Za-z .]*)/i', $value, $matches) === 1) {
            $name = KecamatanNormalizer::normalize($matches[1]);
            if ($name !== null && strlen($name) >= 3 && preg_match('/^[A-Za-z ]+$/', $name) === 1) {
                return $name;
            }
        }

        return $this->knownDistrictIn($value);
    }

    /**
     * Most addresses list the district as a plain comma-separated part
     * ("Mekarwangi, Tanah Sareal, Kota Bogor") without a "Kec." prefix.
     */
    private function knownDistrictIn(string $value): ?string
    {
        $haystack = Str::lower($value);
        $districts = KecamatanNormalizer::known();
        usort($districts, static fn (string $a, string $b): int => strlen($b) <=> strlen($a));

        foreach ($districts as $district) {
            if (preg_match('/\b'.preg_quote(Str::lower($district), '/').'\b/', $haystack) === 1) {
                return $district;
            }
        }

        return null;
    }

    /**
     * @param  list<array<string, mixed>>  $sources
     * @return array<string, mixed>|null
     */
    private function nearest(Faskes $faskes, array $sources, float $maxDistance): ?array
    {
        $best = null;
        $bestDistance = $maxDistance;

        foreach ($sources as $source) {
            $distance = $this->distance((float) $faskes->latitude, (float) $faskes->longitude, $source['lat'], $source['lng']);
            if ($distance <= $bestDistance) {
                $best = [...$source, 'distance' => $distance];
                $bestDistance = $distance;
            }
        }

        return $best;
    }

    private function distance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);
        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lngDelta / 2) ** 2;

        return round(6371000 * 2 * asin(sqrt(min($a, 1.0))), 2);
    }
}
