import { XMLParser } from 'fast-xml-parser';

/** 복수 자식이 가능한 엘리먼트 이름 (네임스페이스 제거 후) */
const ARRAY_ELEMENTS = new Set([
  'p', 'run', 'tr', 'tc', 't',
  'fontface', 'font',
  'charPr', 'paraPr', 'style', 'borderFill', 'tabPr',
  'numbering', 'bullet',
  'item', 'itemref',
  'case', 'default',
  'pageBorderFill',
  'paraHead',
  'memo',
  'binItem',
]);

/** HWPX XML 파싱용 기본 XMLParser 인스턴스 */
export function createXmlParser(): XMLParser {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    isArray: (_name: string, _jpath: unknown, isLeafNode: boolean) => {
      if (isLeafNode) return false;
      const localName = _name.split(':').pop() ?? _name;
      return ARRAY_ELEMENTS.has(localName);
    },
    trimValues: true,
    parseTagValue: false,
    textNodeName: '#text',
    // mixed content (텍스트 + 자식 엘리먼트 혼합) 순서 보존
    preserveOrder: false,
  });
}

/** XML 문자열을 JS 객체로 파싱 */
export function parseXml(xml: string): unknown {
  const parser = createXmlParser();
  return parser.parse(xml);
}

/** Uint8Array → string 변환 */
export function decodeUtf8(data: Uint8Array): string {
  return new TextDecoder('utf-8').decode(data);
}

/**
 * 속성 값을 안전하게 가져오기
 * fast-xml-parser는 @_ 접두사를 붙이므로 이를 처리
 */
export function getAttr(node: Record<string, unknown>, name: string): string {
  return String(node[`@_${name}`] ?? '');
}

/** 속성 값을 숫자로 가져오기 */
export function getAttrNum(node: Record<string, unknown>, name: string): number {
  const val = node[`@_${name}`];
  if (val === undefined || val === '') return 0;
  return Number(val) || 0;
}

/** 속성 값을 불린으로 가져오기 (0/1, true/false, "0"/"1") */
export function getAttrBool(node: Record<string, unknown>, name: string): boolean {
  const val = node[`@_${name}`];
  if (val === undefined) return false;
  if (val === true || val === 'true' || val === '1' || val === 1) return true;
  return false;
}

/** 노드를 항상 배열로 반환 */
export function ensureArray<T>(val: T | T[] | undefined | null): T[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
}
