<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    private const MAX_KILOBYTES = 5120;

    private const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:'.self::MAX_KILOBYTES, 'mimetypes:'.implode(',', self::ALLOWED_MIMES)],
            'context' => ['sometimes', 'string', 'in:diskusi,tanggapan,komentar'],
        ]);

        $file = $request->file('file');
        $context = $request->string('context', 'diskusi')->toString();
        $directory = 'uploads/'.$context;
        $name = Str::uuid()->toString().'.'.($file->extension() ?: $file->getClientOriginalExtension());
        $path = $file->storeAs($directory, $name, 'public');

        return response()->json([
            'data' => [
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
                'name' => $file->getClientOriginalName(),
                'mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ],
        ], 201);
    }
}
