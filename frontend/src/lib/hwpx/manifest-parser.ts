import { parseXml, ensureArray, getAttr } from '../../utils/xml-helpers';
import type { DocumentMeta } from '../model';

export interface ManifestResult {
  meta: DocumentMeta;
  sectionPaths: string[];
  headerPath: string;
}

/**
 * content.hpf (OPF 매니페스트) 파싱
 *
 * 구조:
 * <opf:package>
 *   <opf:metadata> ... </opf:metadata>
 *   <opf:manifest>
 *     <opf:item id="header" href="Contents/header.xml" />
 *     <opf:item id="section0" href="Contents/section0.xml" />
 *   </opf:manifest>
 *   <opf:spine>
 *     <opf:itemref idref="section0" />
 *   </opf:spine>
 * </opf:package>
 */
export function parseManifest(xml: string): ManifestResult {
  const parsed = parseXml(xml) as Record<string, unknown>;
  const pkg = parsed['package'] as Record<string, unknown>;

  // 메타데이터 추출
  const metadata = pkg?.['metadata'] as Record<string, unknown> ?? {};
  const metaItems = ensureArray(metadata['meta'] as Record<string, unknown>[]);

  const meta: DocumentMeta = {
    title: String(metadata['title'] ?? ''),
    language: String(metadata['language'] ?? 'ko'),
    creator: findMetaContent(metaItems, 'creator'),
    subject: findMetaContent(metaItems, 'subject'),
    description: findMetaContent(metaItems, 'description'),
    createdDate: findMetaContent(metaItems, 'CreatedDate'),
    modifiedDate: findMetaContent(metaItems, 'ModifiedDate'),
  };

  // manifest에서 파일 목록 추출
  const manifest = pkg?.['manifest'] as Record<string, unknown> ?? {};
  const items = ensureArray(manifest['item'] as Record<string, unknown>[]);

  let headerPath = 'Contents/header.xml';
  const sectionPaths: string[] = [];

  for (const item of items) {
    const id = getAttr(item, 'id');
    const href = getAttr(item, 'href');
    const mediaType = getAttr(item, 'media-type');

    if (id === 'header') {
      headerPath = href;
    } else if (mediaType === 'application/xml' && id.startsWith('section')) {
      sectionPaths.push(href);
    }
  }

  // spine 순서가 있으면 그 순서를 따름
  const spine = pkg?.['spine'] as Record<string, unknown> ?? {};
  const spineItems = ensureArray(spine['itemref'] as Record<string, unknown>[]);

  if (spineItems.length > 0) {
    const sectionOrder: string[] = [];
    const itemMap = new Map<string, string>();
    for (const item of items) {
      itemMap.set(getAttr(item, 'id'), getAttr(item, 'href'));
    }
    for (const ref of spineItems) {
      const idref = getAttr(ref, 'idref');
      const href = itemMap.get(idref);
      if (href && idref.startsWith('section')) {
        sectionOrder.push(href);
      }
    }
    if (sectionOrder.length > 0) {
      return { meta, sectionPaths: sectionOrder, headerPath };
    }
  }

  return { meta, sectionPaths, headerPath };
}

function findMetaContent(
  metaItems: Record<string, unknown>[],
  name: string
): string {
  for (const item of metaItems) {
    if (getAttr(item, 'name') === name) {
      return String(item['#text'] ?? getAttr(item, 'content') ?? '');
    }
  }
  return '';
}
