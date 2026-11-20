<?php

namespace Database\Seeders;

use App\Models\Faskes;
use App\Support\KecamatanNormalizer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BogorSehatDataSeeder extends Seeder
{
    public function run(): void
    {
        $specializations = $this->readCsv(base_path('../master_spesialisasi_final.csv'));
        $facilities = $this->readCsv(base_path('../master_sarana_penunjang_final.csv'));
        $faskesData = $this->readCsv(base_path('../faskes_final.csv'));
        $districtSources = $this->readDistrictSources();

        $specializationRows = array_map(static fn (array $row): array => [
            'id_spesialisasi' => trim($row['id']),
            'nama_spesialisasi' => trim($row['name']),
            'created_at' => now(),
            'updated_at' => now(),
        ], $specializations);
        $facilityRows = array_map(static fn (array $row): array => [
            'id_fasilitas' => (int) $row['id'],
            'nama_fasilitas' => trim($row['name']),
            'created_at' => now(),
            'updated_at' => now(),
        ], $facilities);

        DB::table('spesialisasi')->upsert($specializationRows, ['id_spesialisasi'], ['nama_spesialisasi', 'updated_at']);
        DB::table('fasilitas')->upsert($facilityRows, ['id_fasilitas'], ['nama_fasilitas', 'updated_at']);

        $faskesRows = [];
        $specializationLinks = [];
        $facilityLinks = [];
        foreach ($faskesData as $index => $row) {
            $idFaskes = $index + 1;
            $latitude = (float) $row['latitude'];
            $longitude = (float) $row['longitude'];
            $faskesRows[] = [
                'id_faskes' => $idFaskes,
                'kdppk' => trim($row['kdppk']),
                'nama_faskes' => trim($row['nama_faskes']),
                'jenis_faskes' => trim($row['jenis_faskes']) ?: null,
                'kelas_faskes' => trim($row['kelas_faskes']) ?: null,
                'alamat_faskes' => preg_replace('/\s+/', ' ', trim($row['alamat_faskes'])),
                'provinsi' => 'JAWA BARAT',
                'kecamatan' => $this->resolveKecamatan($latitude, $longitude, $districtSources, $row['alamat_faskes']),
                'kota_kabupaten' => trim($row['kota_kabupaten']),
                'longitude' => $longitude,
                'latitude' => $latitude,
                'telp_faskes' => trim($row['telp_faskes']) ?: null,
                'is_support_bpjs' => trim($row['is_support_bpjs']) === '1',
                'link_maps' => Faskes::mapsLink([
                    'nama_faskes' => trim($row['nama_faskes']),
                    'alamat_faskes' => trim($row['alamat_faskes']),
                    'kota_kabupaten' => trim($row['kota_kabupaten']),
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            foreach ($this->csvList($row['spesialisasi']) as $idSpesialisasi) {
                $specializationLinks[] = [
                    'id_faskes' => $idFaskes,
                    'id_spesialisasi' => $idSpesialisasi,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            foreach ($this->csvList($row['fasilitas_penunjang']) as $idFasilitas) {
                $facilityLinks[] = [
                    'id_faskes' => $idFaskes,
                    'id_fasilitas' => (int) $idFasilitas,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        foreach (array_chunk($faskesRows, 250) as $chunk) {
            DB::table('faskes')->upsert($chunk, ['id_faskes'], [
                'kdppk', 'nama_faskes', 'jenis_faskes', 'kelas_faskes', 'alamat_faskes', 'provinsi', 'kecamatan',
                'kota_kabupaten', 'longitude', 'latitude', 'telp_faskes', 'is_support_bpjs', 'link_maps', 'updated_at',
            ]);
        }
        foreach (array_chunk($specializationLinks, 500) as $chunk) {
            DB::table('spesialisasi_faskes')->upsert($chunk, ['id_faskes', 'id_spesialisasi'], ['updated_at']);
        }
        foreach (array_chunk($facilityLinks, 500) as $chunk) {
            DB::table('fasilitas_faskes')->upsert($chunk, ['id_faskes', 'id_fasilitas'], ['updated_at']);
        }

        $restored = $this->restoreGalleryImages();
        if ($restored > 0) {
            $this->command?->info(sprintf('Restored %d gallery images from disk.', $restored));
        }

        $this->command?->info(sprintf(
            'Seeded %d faskes, %d spesialisasi, %d fasilitas, %d specialization links, %d facility links.',
            count($faskesRows), count($specializationRows), count($facilityRows),
            count($specializationLinks), count($facilityLinks),
        ));
    }

    /** @return list<array<string, string>> */
    private function readCsv(string $path): array
    {
        if (! is_file($path)) {
            throw new \RuntimeException("Required seed CSV not found: {$path}");
        }

        $file = new \SplFileObject($path);
        $file->setFlags(\SplFileObject::READ_CSV | \SplFileObject::SKIP_EMPTY | \SplFileObject::DROP_NEW_LINE);
        $headers = array_map(static fn (mixed $header): string => trim((string) $header), $file->fgetcsv());
        $file->next();
        $rows = [];
        foreach ($file as $values) {
            if (! is_array($values) || $values === [null] || ($values[0] ?? null) === $headers[0]) {
                continue;
            }
            $values = array_pad($values, count($headers), null);
            $rows[] = array_combine($headers, array_slice($values, 0, count($headers)));
        }

        return $rows;
    }

    /** @return list<string> */
    private function csvList(?string $value): array
    {
        return array_values(array_filter(array_map('trim', explode(',', (string) $value)), static fn (string $item): bool => $item !== ''));
    }

    /** @return list<array{lat: float, lng: float, kecamatan: string}> */
    private function readDistrictSources(): array
    {
        $path = database_path('seeders/data/kecamatan_sources.json');
        if (! is_file($path)) {
            return [];
        }

        $rows = json_decode((string) file_get_contents($path), true);

        return is_array($rows) ? $rows : [];
    }

    /**
     * @param  list<array{lat: float, lng: float, kecamatan: string}>  $sources
     */
    private function resolveKecamatan(float $latitude, float $longitude, array $sources, string $address): ?string
    {
        $fromAddress = $this->extractKecamatan($address);
        if ($fromAddress !== null) {
            return $fromAddress;
        }

        $best = null;
        $bestDistance = 300.0;

        foreach ($sources as $source) {
            $latDelta = deg2rad($source['lat'] - $latitude);
            $lngDelta = deg2rad($source['lng'] - $longitude);
            $a = sin($latDelta / 2) ** 2
                + cos(deg2rad($latitude)) * cos(deg2rad($source['lat'])) * sin($lngDelta / 2) ** 2;
            $distance = 6371000 * 2 * asin(sqrt(min($a, 1.0)));

            if ($distance <= $bestDistance) {
                $bestDistance = $distance;
                $best = $source['kecamatan'];
            }
        }

        return KecamatanNormalizer::normalize($best);
    }

    private function extractKecamatan(string $address): ?string
    {
        $normalized = preg_replace('/\s+/', ' ', trim($address));
        if (preg_match('/\bKEC(?:AMATAN)?\.?\s+([A-Z][A-Z ]{2,}?)(?=,|\bKAB(?:UPATEN)?\.?\b|\bKOTA\b|$)/i', $normalized, $matches) === 1) {
            $name = KecamatanNormalizer::normalize($matches[1]);
            if ($name !== null) {
                return $name;
            }
        }

        $haystack = Str::lower($normalized);
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
     * Gallery files live outside the database, so a fresh seed would drop the
     * rows while the WebP files stay on disk. Rebuild the rows from filenames.
     */
    private function restoreGalleryImages(): int
    {
        $files = glob(storage_path('app/public/uploads/faskes/*.webp')) ?: [];
        if ($files === []) {
            return 0;
        }

        $rows = [];
        foreach ($files as $file) {
            if (preg_match('/-(\d+)\.webp$/', basename($file), $matches) !== 1) {
                continue;
            }

            $idFaskes = (int) $matches[1];
            $rows[$idFaskes] = [
                'id_faskes' => $idFaskes,
                'path' => 'uploads/faskes/'.basename($file),
                'is_banner' => true,
                'is_thumbnail' => true,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if ($rows === []) {
            return 0;
        }

        $existing = DB::table('faskes')->whereIn('id_faskes', array_keys($rows))->pluck('id_faskes')->all();
        $rows = array_values(array_intersect_key($rows, array_flip($existing)));

        if ($rows !== []) {
            DB::table('faskes_images')->insert($rows);
        }

        return count($rows);
    }
}
