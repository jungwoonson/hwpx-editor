import { unzipSync } from 'fflate';

/** HWPX ZIP 파일을 해제하여 파일명 → Uint8Array 맵을 반환 */
export function extractHwpx(buffer: ArrayBuffer): Record<string, Uint8Array> {
  const files = unzipSync(new Uint8Array(buffer));
  return files;
}

/** ZIP 내 특정 파일을 UTF-8 문자열로 읽기 */
export function readFileAsText(
  files: Record<string, Uint8Array>,
  path: string
): string {
  const data = files[path];
  if (!data) {
    throw new Error(`HWPX 파일 내 '${path}'를 찾을 수 없습니다.`);
  }
  return new TextDecoder('utf-8').decode(data);
}

/** ZIP 내 파일 존재 여부 확인 */
export function hasFile(
  files: Record<string, Uint8Array>,
  path: string
): boolean {
  return path in files;
}
