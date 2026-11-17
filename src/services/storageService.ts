import { supabase } from '../lib/supabase';

const SUPABASE_BUCKET = 'burbuja-media';
const MAX_VIDEO_SIZE_MB = 12; // Límite estricto para videos cortos

export interface UploadResult {
  url: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  savedPercent: number;
}

/**
 * Comprime una imagen en el navegador usando Canvas + WebP
 * - Avatares: máx 512px (~25-45 KB)
 * - Historias/Comunidades: máx 1080px (~60-95 KB)
 */
async function compressImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export const storageService = {
  /**
   * Elimina el archivo anterior de Supabase Storage cuando el usuario cambia su foto
   * para no acumular basura ni gastar espacio.
   */
  async deleteOldMedia(oldUrl?: string) {
    if (!oldUrl || !oldUrl.includes(`/storage/v1/object/public/${SUPABASE_BUCKET}/`)) {
      return;
    }
    try {
      const pathPart = oldUrl.split(`/storage/v1/object/public/${SUPABASE_BUCKET}/`)[1];
      if (pathPart) {
        await supabase.storage.from(SUPABASE_BUCKET).remove([pathPart]);
      }
    } catch (err) {
      console.warn('No se pudo limpiar archivo antiguo:', err);
    }
  },

  /**
   * Comprime y sube imágenes, audios o videos ligeros a Supabase Storage ('burbuja-media')
   */
  async uploadMedia(
    file: File,
    folder: 'avatars' | 'stories' | 'communities' | 'audio' | 'videos' = 'avatars',
    previousUrlToClean?: string
  ): Promise<UploadResult> {
    const originalSizeKB = Math.max(1, Math.round(file.size / 1024));
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (isVideo && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      throw new Error(
        `El video es muy pesado (${(file.size / (1024 * 1024)).toFixed(1)} MB). El máximo permitido es ${MAX_VIDEO_SIZE_MB} MB (videos cortos de hasta 15 seg).`
      );
    }

    // Configuración de compresión según el tipo de uso
    const maxWidth = folder === 'avatars' ? 512 : 1080;
    const quality = folder === 'avatars' ? 0.78 : 0.80;

    const processedBlob = isImage
      ? await compressImage(file, maxWidth, quality)
      : file;

    const compressedSizeKB = Math.max(1, Math.round(processedBlob.size / 1024));
    const savedPercent =
      originalSizeKB > compressedSizeKB
        ? Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100)
        : 0;

    const ext = isImage ? 'webp' : file.name.split('.').pop() || 'bin';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(fileName, processedBlob, {
        contentType: isImage ? 'image/webp' : file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Error al subir archivo a la nube: ${uploadError.message}`);
    }

    // Si reemplazó una foto anterior, borramos la vieja para ahorrar espacio
    if (previousUrlToClean) {
      await this.deleteOldMedia(previousUrlToClean);
    }

    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(fileName);

    return {
      url: publicUrlData.publicUrl,
      originalSizeKB,
      compressedSizeKB,
      savedPercent
    };
  }
};
