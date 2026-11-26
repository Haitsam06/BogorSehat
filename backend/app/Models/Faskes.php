<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faskes extends Model
{
    use HasFactory;

    protected $table = 'faskes';

    protected $primaryKey = 'id_faskes';

    /** Keadaan kerjasama BPJS, mengikuti tiga status di Aplicares. */
    public const BPJS_MENDUKUNG = 'mendukung';

    public const BPJS_DALAM_PROSES = 'dalam_proses';

    public const BPJS_TIDAK_MENDUKUNG = 'tidak_mendukung';

    /** @var list<string> */
    public const BPJS_STATUSES = [
        self::BPJS_MENDUKUNG,
        self::BPJS_DALAM_PROSES,
        self::BPJS_TIDAK_MENDUKUNG,
    ];

    protected $fillable = [
        'kdppk', 'nama_faskes', 'jenis_faskes', 'kelas_faskes', 'alamat_faskes',
        'provinsi', 'kecamatan', 'kota_kabupaten', 'longitude', 'latitude', 'telp_faskes',
        'bpjs_status', 'link_maps',
    ];

    protected function casts(): array
    {
        return [
            'longitude' => 'decimal:8',
            'latitude' => 'decimal:8',
        ];
    }

    public function scopeWithRating(Builder $query): Builder
    {
        return $query->withAvg(['komentar as rating_avg' => fn (Builder $sub) => $sub->whereNull('id_parent')->whereNotNull('rating')], 'rating')
            ->withCount(['komentar as rating_count' => fn (Builder $sub) => $sub->whereNull('id_parent')->whereNotNull('rating')]);
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

    public function images(): HasMany
    {
        return $this->hasMany(FaskesImage::class, 'id_faskes', 'id_faskes')->orderBy('sort_order');
    }

    /**
     * Build a Google Maps place link anchored on the facility coordinates.
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
        $coordinates = array_values(array_filter([
            $attributes['latitude'] ?? null,
            $attributes['longitude'] ?? null,
        ], static fn ($value): bool => filled($value)));

        if ($query === '') {
            return 'https://www.google.com/maps/search/?api=1&query='.rawurlencode(implode(',', $coordinates));
        }

        if (count($coordinates) === 2) {
            return 'https://www.google.com/maps/search/'.rawurlencode($query).'/@'.implode(',', $coordinates).',17z';
        }

        return 'https://www.google.com/maps/search/?api=1&query='.rawurlencode($query);
    }
}
