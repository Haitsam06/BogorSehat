<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diskusi;
use App\Models\Faskes;
use App\Models\FeedbackFaskes;
use App\Models\Komentar;
use App\Models\LaporanDiskusi;
use App\Models\LaporanKomentar;
use App\Models\LaporanTanggapan;
use App\Models\TanggapanDiskusi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    public function reportKomentar(Request $request, Komentar $komentar): JsonResponse
    {
        $data = $request->validate(['alasan' => ['required', 'string', 'max:255'], 'catatan' => ['sometimes', 'nullable', 'string']]);
        $report = LaporanKomentar::query()->create([
            ...$data,
            'id_komentar' => $komentar->id_komentar,
            'id_faskes' => $komentar->id_faskes,
            'id_reported_user' => $komentar->id_user,
        ]);

        return response()->json(['data' => $report], 201);
    }

    public function reportDiskusi(Request $request, Diskusi $diskusi): JsonResponse
    {
        $data = $request->validate(['alasan' => ['required', 'string', 'max:255'], 'catatan' => ['sometimes', 'nullable', 'string']]);
        $report = LaporanDiskusi::query()->create([
            ...$data,
            'id_diskusi' => $diskusi->id_diskusi,
            'id_reported_user' => $diskusi->id_user,
        ]);

        return response()->json(['data' => $report], 201);
    }

    public function reportTanggapan(Request $request, TanggapanDiskusi $tanggapan): JsonResponse
    {
        $data = $request->validate(['alasan' => ['required', 'string', 'max:255'], 'catatan' => ['sometimes', 'nullable', 'string']]);
        $report = LaporanTanggapan::query()->create([
            ...$data,
            'id_tanggapan' => $tanggapan->id_tanggapan_diskusi,
            'id_reported_user' => $tanggapan->id_user,
        ]);

        return response()->json(['data' => $report], 201);
    }

    public function feedback(Request $request, Faskes $faskes): JsonResponse
    {
        $data = $request->validate([
            'alasan' => ['required', 'string', 'max:255'],
            'saran_perbaikan' => ['required', 'string'],
        ]);
        $feedback = $faskes->feedback()->create([...$data, 'id_user' => $request->user()->id_user]);

        return response()->json(['data' => $feedback], 201);
    }

    public function reports(Request $request): JsonResponse
    {
        $status = $request->string('status')->toString();
        $reports = collect([
            ...LaporanKomentar::query()->with(['komentar', 'reportedUser'])->when($status !== '', fn ($q) => $q->where('status', $status))->get()->map(fn ($item) => $this->reportRow('komentar', $item)),
            ...LaporanDiskusi::query()->with(['diskusi', 'reportedUser'])->when($status !== '', fn ($q) => $q->where('status', $status))->get()->map(fn ($item) => $this->reportRow('diskusi', $item)),
            ...LaporanTanggapan::query()->with(['tanggapan', 'reportedUser'])->when($status !== '', fn ($q) => $q->where('status', $status))->get()->map(fn ($item) => $this->reportRow('tanggapan', $item)),
        ])->sortByDesc('created_at')->values();

        return response()->json(['data' => $reports]);
    }

    public function updateReport(Request $request, string $type, int $id): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:pending,resolved,rejected']]);
        $model = $this->reportModel($type, $id);
        $model->update($data);

        return response()->json(['data' => $this->reportRow($type, $model->fresh())]);
    }

    public function deleteReport(string $type, int $id): JsonResponse
    {
        $this->reportModel($type, $id)->delete();

        return response()->json(['message' => 'Report deleted.']);
    }

    public function feedbacks(Request $request): JsonResponse
    {
        $feedbacks = FeedbackFaskes::query()->with(['faskes', 'user'])->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))->latest()->get();

        return response()->json(['data' => $feedbacks]);
    }

    public function updateFeedback(Request $request, FeedbackFaskes $feedback): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:pending,resolved,rejected'], 'catatan_admin' => ['sometimes', 'nullable', 'string']]);
        $feedback->update($data);

        return response()->json(['data' => $feedback->fresh()->load(['faskes', 'user'])]);
    }

    public function deleteFeedback(FeedbackFaskes $feedback): JsonResponse
    {
        $feedback->delete();

        return response()->json(['message' => 'Feedback deleted.']);
    }

    private function reportModel(string $type, int $id): LaporanKomentar|LaporanDiskusi|LaporanTanggapan
    {
        $class = match ($type) {
            'komentar' => LaporanKomentar::class,
            'diskusi' => LaporanDiskusi::class,
            'tanggapan' => LaporanTanggapan::class,
            default => abort(404, 'Unknown report type.'),
        };

        return $class::query()->findOrFail($id);
    }

    /** @return array<string, mixed> */
    private function reportRow(string $type, LaporanKomentar|LaporanDiskusi|LaporanTanggapan $report): array
    {
        return [
            'type' => $type,
            'id' => $report->getKey(),
            'status' => $report->status,
            'alasan' => $report->alasan,
            'catatan' => $report->catatan,
            'reported_user' => $report->relationLoaded('reportedUser') ? $report->reportedUser : null,
            'content' => match ($type) {
                'komentar' => $report->relationLoaded('komentar') ? $report->komentar : null,
                'diskusi' => $report->relationLoaded('diskusi') ? $report->diskusi : null,
                'tanggapan' => $report->relationLoaded('tanggapan') ? $report->tanggapan : null,
            },
            'created_at' => $report->created_at,
            'updated_at' => $report->updated_at,
        ];
    }
}
