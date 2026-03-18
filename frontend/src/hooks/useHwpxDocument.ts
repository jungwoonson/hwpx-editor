import { useState, useCallback } from 'react';
import type { HwpxDocument } from '../lib/model';
import { extractHwpx, readFileAsText } from '../lib/hwpx/extractor';
import { parseManifest } from '../lib/hwpx/manifest-parser';
import { convertHeader } from '../lib/converter/header-converter';
import { parseSection } from '../lib/hwpx/section-parser';

interface HwpxDocumentState {
  loading: boolean;
  error: string | null;
  document: HwpxDocument | null;
}

export function useHwpxDocument() {
  const [state, setState] = useState<HwpxDocumentState>({
    loading: false,
    error: null,
    document: null,
  });

  const loadFile = useCallback(async (file: File) => {
    setState({ loading: true, error: null, document: null });

    try {
      const buffer = await file.arrayBuffer();

      // 1. ZIP 해제
      const files = extractHwpx(buffer);

      // 2. 매니페스트 파싱
      const hpfXml = readFileAsText(files, 'Contents/content.hpf');
      const manifest = parseManifest(hpfXml);

      // 3. 헤더 파싱 → StyleStore
      const headerXml = readFileAsText(files, manifest.headerPath);
      const styles = convertHeader(headerXml);

      // 4. 섹션 파싱
      const sections = manifest.sectionPaths.map((path) => {
        const sectionXml = readFileAsText(files, path);
        return parseSection(sectionXml);
      });

      // 5. 이미지 추출 (BinData/ 디렉토리)
      const images: Record<string, Uint8Array> = {};
      for (const [key, data] of Object.entries(files)) {
        if (key.startsWith('BinData/')) {
          const id = key.replace('BinData/', '');
          images[id] = data;
        }
      }

      const doc: HwpxDocument = {
        meta: manifest.meta,
        styles,
        sections,
        images,
      };

      setState({ loading: false, error: null, document: doc });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'HWPX 파일 파싱 중 오류가 발생했습니다.';
      console.error('HWPX parse error:', err);
      setState({ loading: false, error: message, document: null });
    }
  }, []);

  return { ...state, loadFile };
}
