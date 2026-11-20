<?php

namespace App\Support;

use Illuminate\Support\Str;

class KecamatanNormalizer
{
    /**
     * Spelling variants that refer to the same district.
     *
     * @var array<string, string>
     */
    private const ALIASES = [
        'bojong gede' => 'Bojonggede',
        'ranca bungur' => 'Rancabungur',
        'tajur halang' => 'Tajurhalang',
        'kota bogor barat' => 'Bogor Barat',
        'kota bogor tengah' => 'Bogor Tengah',
        'kota bogor timur' => 'Bogor Timur',
        'kota bogor selatan' => 'Bogor Selatan',
        'kota bogor utara' => 'Bogor Utara',
    ];

    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $name = trim((string) preg_replace('/\s+/', ' ', $value));
        if ($name === '') {
            return null;
        }

        $name = Str::title(Str::lower($name));
        $key = Str::lower($name);

        return self::ALIASES[$key] ?? $name;
    }
}
