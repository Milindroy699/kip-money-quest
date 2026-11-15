/** Loads a list of bundled images as Skia images (for sprite animations). */
import { Skia, type SkImage } from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';

export function useSkiaImages(sources: number[]): SkImage[] | null {
  const [images, setImages] = useState<SkImage[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      sources.map(async (src) => {
        const uri = Image.resolveAssetSource(src)?.uri;
        if (!uri) return null;
        const data = await Skia.Data.fromURI(uri);
        return Skia.Image.MakeImageFromEncoded(data);
      }),
    )
      .then((imgs) => {
        if (!cancelled && imgs.every(Boolean)) setImages(imgs as SkImage[]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sources]);
  return images;
}
