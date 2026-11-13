<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faskes extends Model
{
    use HasFactory;

    protected $table = 'faskes';

    protected $primaryKey = 'id_faskes';

    protected $fillable = [
        'kdppk', 'nama_faskes', 'jenis_faskes', 'kelas_faskes', 'alamat_faskes',
        'provinsi', 'kecamatan', 'kota_kabupaten', 'longitude', 'latitude', 'telp_faskes',
        'is_support_bpjs', 'link_maps',
    ];

    protected function casts(): array
    {
        return [
            'longitude' => 'decimal:8',
            'latitude' => 'decimal:8',
            'is_support_bpjs' => 'boolean',
        ];
    }

    public function distanceKmTo(float $latitude, float $longitude): float
    {
        $latitudeDelta = deg2rad((float) $this->latitude - $latitude);
        $longitudeDelta = deg2rad((float) $this->longitude - $longitude);
        $haversine = sin($latitudeDelta / 2) ** 2
            + cos(deg2rad($latitude)) * cos(deg2rad((float) $this->latitude)) * sin($longitudeDelta / 2) ** 2;

        return round(6371 * 2 * asin(sqrt(min($haversine, 1.0))), 2);
    }

    public function spesialisasi(): BelongsToMany
    {
        return $this->belongsToMany(Spesialisasi::class, 'spesialisasi_faskes', 'id_faskes', 'id_spesialisasi', 'id_faskes', 'id_spesialisasi');
    }

    public function fasilitas(): BelongsToMany
    {
        return $this->belongsToMany(Fasilitas::class, 'fasilitas_faskes', 'id_faskes', 'id_fasilitas', 'id_faskes', 'id_fasilitas');
    }

    public function komentar(): HasMany
    {
        return $this->hasMany(Komentar::class, 'id_faskes', 'id_faskes');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(FeedbackFaskes::class, 'id_faskes', 'id_faskes');
    }

    /**
     * Build a Google Maps directions link using facility identity plus coordinates.
     * Name/address helps resolve the facility; coordinates disambiguate nearby places.
     *
     * @param  array<string, mixed>  $attributes
     */
    public static function mapsLink(array $attributes): string
    {
        $query = implode(', ', array_filter([
            $attributes['nama_faskes'] ?? null,
            $attributes['alamat_faskes'] ?? null,
            $attributes['kota_kabupaten'] ?? null,
        ], static fn ($value): bool => filled($value)));
        $coordinates = array_filter([
            $attributes['latitude'] ?? null,
            $attributes['longitude'] ?? null,
        ], static fn ($value): bool => filled($value));

        if ($coordinates !== []) {
            $query .= ($query === '' ? '' : ' ').'('.implode(',', $coordinates).')';
        }

        return 'https://www.google.com/maps/dir/?api=1&destination='.rawurlencode($query);
    }
}
