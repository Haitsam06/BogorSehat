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
     * Build a Google Maps directions link that resolves by name/address instead of bare coordinates.
     * Coordinates alone can snap to a neighbouring place (e.g. a convenience store next door).
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

        if ($query === '') {
            $query = ($attributes['latitude'] ?? '').','.($attributes['longitude'] ?? '');
        }

        return 'https://www.google.com/maps/dir/?api=1&destination='.rawurlencode($query);
    }
}
