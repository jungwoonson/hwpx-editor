import type { Section } from './section';
import type { StyleStore } from './styles';

/** HWPX 문서 최상위 모델 */
export interface HwpxDocument {
  meta: DocumentMeta;
  styles: StyleStore;
  sections: Section[];
  images: Record<string, Uint8Array>; // binItemId → raw bytes
}

/** 문서 메타 정보 (opf:metadata) */
export interface DocumentMeta {
  title: string;
  language: string;
  creator: string;
  subject: string;
  description: string;
  createdDate: string;
  modifiedDate: string;
}
