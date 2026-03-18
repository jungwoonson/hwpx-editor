import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractHwpx, readFileAsText } from '../../../src/lib/hwpx/extractor';
import { parseManifest } from '../../../src/lib/hwpx/manifest-parser';

const SAMPLE_PATH = join(__dirname, '../../../../docs/sample/중소기업 취업자 소득세 감면신청서.hwpx');

describe('extractor + manifest-parser 통합 테스트', () => {
  it('실제 HWPX 파일에서 ZIP 해제 후 파일 목록을 추출한다', () => {
    const buffer = readFileSync(SAMPLE_PATH);
    const files = extractHwpx(buffer.buffer as ArrayBuffer);
    const keys = Object.keys(files);

    expect(keys).toContain('Contents/content.hpf');
    expect(keys).toContain('Contents/header.xml');
    expect(keys).toContain('Contents/section0.xml');
    expect(keys).toContain('mimetype');
  });

  it('content.hpf에서 섹션 경로를 정확히 추출한다', () => {
    const buffer = readFileSync(SAMPLE_PATH);
    const files = extractHwpx(buffer.buffer as ArrayBuffer);
    const hpfXml = readFileAsText(files, 'Contents/content.hpf');
    const result = parseManifest(hpfXml);

    expect(result.sectionPaths).toEqual(['Contents/section0.xml']);
    expect(result.headerPath).toBe('Contents/header.xml');
    expect(result.meta.title).toBe('서식 11');
  });
});
