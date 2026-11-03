<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diskusi;
use App\Models\Fasilitas;
use App\Models\Faskes;
use App\Models\FeedbackFaskes;
use App\Models\LaporanDiskusi;
use App\Models\LaporanKomentar;
use App\Models\LaporanTanggapan;
use App\Models\Spesialisasi;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function home(): JsonResponse
    {
        return response()->json([
            'data' => [
                'faskes_count' => Faskes::query()->count(),
                'kota_kabupaten' => Faskes::query()->select('kota_kabupaten')->distinct()->orderBy('kota_kabupaten')->pluck('kota_kabupaten'),
                'spesialisasi_count' => Spesialisasi::query()->count(),
                'fasilitas_count' => Fasilitas::query()->count(),
            ],
        ]);
    }

    public function admin(): JsonResponse
    {
        return response()->json([
            'data' => [
                'faskes_count' => Faskes::query()->count(),
                'user_count' => User::query()->count(),
                'diskusi_count' => Diskusi::query()->count(),
                'pending_feedback_count' => FeedbackFaskes::query()->where('status', 'pending')->count(),
                'pending_report_count' => LaporanKomentar::query()->where('status', 'pending')->count()
                    + LaporanDiskusi::query()->where('status', 'pending')->count()
                    + LaporanTanggapan::query()->where('status', 'pending')->count(),
            ],
        ]);
    }
}
