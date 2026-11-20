<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    private const MAX_KILOBYTES = 5120;

    private const DOCUMENT_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    private const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

    private const WEBP_QUALITY = 82;

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'context' => ['sometimes', 'string', 'in:diskusi,tanggapan,komentar,faskes'],
        ]);

        $context = $request->string('context', 'diskusi')->toString();
        $isFaskes = $context === 'faskes';

        if ($isFaskes && $request->user()?->role_user !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang dapat mengunggah gambar faskes.'], 403);
        }

        $allowedMimes = $isFaskes ? self::IMAGE_MIMES : self::DOCUMENT_MIMES;

        $request->validate([
            'file' => ['required', 'file', 'max:'.self::MAX_KILOBYTES, 'mimetypes:'.implode(',', $allowedMimes)],
        ]);

        $file = $request->file('file');
        $isImage = in_array($file->getMimeType(), self::IMAGE_MIMES, true);
        $path = $isImage
            ? $this->storeWebp($file, $context)
            : $file->storeAs('uploads/'.$context, Str::uuid()->toString().'.'.$file->getClientOriginalExtension(), 'public');

        $stored = Storage::disk('public');

        return response()->json([
            'data' => [
                'path' => $path,
                'url' => $stored->url($path),
                'name' => $file->getClientOriginalName(),
                'mime' => $isImage ? 'image/webp' : $file->getClientMimeType(),
                'size' => $stored->size($path),
            ],
        ], 201);
    }

    private function storeWebp(UploadedFile $file, string $context): string
    {
        $contents = (string) file_get_contents($file->getRealPath());
        $image = imagecreatefromstring($contents);

        if ($image === false) {
            abort(422, 'Gambar tidak dapat diproses.');
        }

        imagepalettetotruecolor($image);
        imagealphablending($image, false);
        imagesavealpha($image, true);

        $path = 'uploads/'.$context.'/'.Str::uuid()->toString().'.webp';
        $target = Storage::disk('public')->path($path);
        Storage::disk('public')->makeDirectory(dirname($path));

        ob_start();
        imagewebp($image, null, self::WEBP_QUALITY);
        $encoded = ob_get_clean();
        imagedestroy($image);

        file_put_contents($target, $encoded);

        return $path;
    }
}
