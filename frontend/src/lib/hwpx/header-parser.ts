import { parseXml } from '../../utils/xml-helpers';

/**
 * header.xml XML 문자열을 JS 객체로 파싱
 *
 * 구조:
 * <hh:head>
 *   <hh:refList>
 *     <hh:fontfaces> ... </hh:fontfaces>
 *     <hh:charProperties> ... </hh:charProperties>
 *     <hh:paraProperties> ... </hh:paraProperties>
 *     <hh:borderFills> ... </hh:borderFills>
 *     <hh:styles> ... </hh:styles>
 *   </hh:refList>
 * </hh:head>
 *
 * removeNSPrefix: true 이므로 hh:, hp:, hc: 접두사는 제거됨
 */
export function parseHeader(xml: string): Record<string, unknown> {
  return parseXml(xml) as Record<string, unknown>;
}
