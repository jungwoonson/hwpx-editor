import { createContext, useContext, useEffect, useState } from 'react';

const ImageContext = createContext<Map<string, string>>(new Map());

/**
 * BinData의 Uint8Array → Blob URL 매핑을 제공
 * unmount 시 모든 Blob URL revoke
 */
export function ImageProvider({
  images,
  children,
}: {
  images: Record<string, Uint8Array>;
  children: React.ReactNode;
}) {
  const [urlMap, setUrlMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const map = new Map<string, string>();
    for (const [id, data] of Object.entries(images)) {
      // 확장자로 MIME 타입 결정
      const mime = id.endsWith('.bmp') ? 'image/bmp'
        : id.endsWith('.png') ? 'image/png'
        : id.endsWith('.jpg') || id.endsWith('.jpeg') ? 'image/jpeg'
        : id.endsWith('.gif') ? 'image/gif'
        : 'image/png';
      const blob = new Blob([data.buffer as ArrayBuffer], { type: mime });
      map.set(id, URL.createObjectURL(blob));
      // binaryItemIDRef는 확장자 없이 참조하는 경우도 있음 (예: "image1" → "image1.png")
      const baseName = id.replace(/\.\w+$/, '');
      if (baseName !== id) {
        map.set(baseName, URL.createObjectURL(blob));
      }
    }
    setUrlMap(map);

    return () => {
      for (const url of map.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, [images]);

  return <ImageContext.Provider value={urlMap}>{children}</ImageContext.Provider>;
}

export function useImageUrl(binaryItemIDRef: string): string | undefined {
  const map = useContext(ImageContext);
  return map.get(binaryItemIDRef);
}
