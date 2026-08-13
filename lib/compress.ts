/**
 * Extremely robust client-side image compression using Canvas API.
 * Converts heavy images to compressed JPEG/PNG format, keeping size minimal.
 * Passes non-image files through unchanged.
 */
export async function compressImage(file: File, quality = 0.8, maxWidth = 1920): Promise<File> {
  // Return early if not an image or if canvas isn't supported
  if (!file.type.startsWith('image/') || typeof window === 'undefined') {
    return file;
  }

  // SVG images are vector graphics and shouldn't be raster-compressed
  if (file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Calculate dynamic dimensions keeping ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // fallback
          return;
        }

        // Draw image into canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Determine target mime type
        const targetType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Construct compressed File object
            const compressedFile = new File([blob], file.name, {
              type: targetType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          targetType,
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
