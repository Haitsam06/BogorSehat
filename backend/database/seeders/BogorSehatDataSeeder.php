<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BogorSehatDataSeeder extends Seeder
{
    public function run(): void
    {
        $specializations = $this->readCsv(base_path('../master_spesialisasi_final.csv'));
        $facilities = $this->readCsv(base_path('../master_sarana_penunjang_final.csv'));
        $faskesData = $this->readCsv(base_path('../faskes_final.csv'));

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
                'kota_kabupaten' => trim($row['kota_kabupaten']),
                'longitude' => $longitude,
                'latitude' => $latitude,
                'telp_faskes' => trim($row['telp_faskes']) ?: null,
                'is_support_bpjs' => trim($row['is_support_bpjs']) === '1',
                'link_maps' => "https://www.google.com/maps/dir/?api=1&destination={$latitude},{$longitude}",
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
                'kdppk', 'nama_faskes', 'jenis_faskes', 'kelas_faskes', 'alamat_faskes',
                'kota_kabupaten', 'longitude', 'latitude', 'telp_faskes', 'is_support_bpjs', 'link_maps', 'updated_at',
            ]);
        }
        foreach (array_chunk($specializationLinks, 500) as $chunk) {
            DB::table('spesialisasi_faskes')->upsert($chunk, ['id_faskes', 'id_spesialisasi'], ['updated_at']);
        }
        foreach (array_chunk($facilityLinks, 500) as $chunk) {
            DB::table('fasilitas_faskes')->upsert($chunk, ['id_faskes', 'id_fasilitas'], ['updated_at']);
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
}
