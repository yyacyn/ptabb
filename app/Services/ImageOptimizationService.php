<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageOptimizationService
{
    /**
     * Auto-resize and convert uploaded image to .webp server-side.
     *
     * @param UploadedFile $file
     * @param string $folder Storage folder relative to public disk (e.g. 'fleets', 'news', 'notifications')
     * @param int $maxWidth Max width to resize if larger
     * @param int $maxHeight Max height to resize if larger
     * @param int $quality Quality setting (1-100)
     * @return string Relative path on public storage disk (e.g. 'fleets/vessel_12345678.webp')
     */
    public static function uploadAndOptimize(
        UploadedFile $file,
        string $folder = 'uploads',
        int $maxWidth = 1920,
        int $maxHeight = 1080,
        int $quality = 82
    ): string {
        // If file is SVG, store as-is since SVG is vector and doesn't convert to raster webp
        if ($file->getClientOriginalExtension() === 'svg' || $file->getMimeType() === 'image/svg+xml') {
            return $file->store($folder, 'public');
        }

        $imagePath = $file->getPathname();
        $mime = $file->getMimeType();

        // Create GD Image Resource from uploaded file
        $image = null;
        switch ($mime) {
            case 'image/jpeg':
            case 'image/jpg':
                $image = @imagecreatefromjpeg($imagePath);
                break;
            case 'image/png':
                $image = @imagecreatefrompng($imagePath);
                if ($image) {
                    imagealphablending($image, true);
                    imagesavealpha($image, true);
                }
                break;
            case 'image/webp':
                $image = @imagecreatefromwebp($imagePath);
                if ($image) {
                    imagealphablending($image, true);
                    imagesavealpha($image, true);
                }
                break;
            case 'image/gif':
                $image = @imagecreatefromgif($imagePath);
                break;
            default:
                // Fallback store directly if GD cannot parse
                return $file->store($folder, 'public');
        }

        if (!$image) {
            return $file->store($folder, 'public');
        }

        $origWidth = imagesx($image);
        $origHeight = imagesy($image);

        // Calculate aspect-ratio scaling if dimensions exceed maximum constraints
        $newWidth = $origWidth;
        $newHeight = $origHeight;

        if ($origWidth > $maxWidth || $origHeight > $maxHeight) {
            $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
            $newWidth = (int) round($origWidth * $ratio);
            $newHeight = (int) round($origHeight * $ratio);
        }

        // Create new truecolor image container for resized dimensions
        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve transparency for WebP output
        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);
        $transparentColor = imagecolorallocatealpha($resizedImage, 0, 0, 0, 127);
        imagefilledrectangle($resizedImage, 0, 0, $newWidth, $newHeight, $transparentColor);

        // High quality bicubic resampling
        imagecopyresampled(
            $resizedImage,
            $image,
            0,
            0,
            0,
            0,
            $newWidth,
            $newHeight,
            $origWidth,
            $origHeight
        );

        // Capture WebP buffer
        ob_start();
        imagewebp($resizedImage, null, $quality);
        $webpContent = ob_get_clean();

        // Free GD Memory
        imagedestroy($image);
        imagedestroy($resizedImage);

        // Generate unique webp filename
        $filename = Str::random(20) . '_' . time() . '.webp';
        $relativePath = trim($folder, '/') . '/' . $filename;

        // Save to public disk
        Storage::disk('public')->put($relativePath, $webpContent);

        return $relativePath;
    }
}
