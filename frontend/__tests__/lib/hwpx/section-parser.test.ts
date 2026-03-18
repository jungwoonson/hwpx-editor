import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractHwpx, readFileAsText } from '../../../src/lib/hwpx/extractor';
import { parseSection } from '../../../src/lib/hwpx/section-parser';

const SAMPLE_PATH = join(__dirname, '../../../../docs/sample/중소기업 취업자 소득세 감면신청서.hwpx');

describe('parseSection', () => {
  const getSection = () => {
    const buffer = readFileSync(SAMPLE_PATH);
    const files = extractHwpx(buffer.buffer as ArrayBuffer);
    const xml = readFileAsText(files, 'Contents/section0.xml');
    return parseSection(xml);
  };

  it('페이지 레이아웃을 추출한다 (A4 가로)', () => {
    const section = getSection();
    expect(section.pageLayout.width).toBe(59528);
    expect(section.pageLayout.height).toBe(84188);
    expect(section.pageLayout.landscape).toBe('WIDELY');
  });

  it('문단을 추출한다', () => {
    const section = getSection();
    expect(section.paragraphs.length).toBeGreaterThan(0);
    expect(section.paragraphs[0].paraPrIDRef).toBeTypeOf('number');
  });

  it('첫 번째 문단에 텍스트 런이 있다', () => {
    const section = getSection();
    const firstPara = section.paragraphs[0];
    expect(firstPara.runs.length).toBeGreaterThan(0);
  });

  it('표를 포함하는 런이 있다', () => {
    const section = getSection();
    let foundTable = false;
    for (const p of section.paragraphs) {
      for (const run of p.runs) {
        for (const content of run.contents) {
          if (content.type === 'table') {
            foundTable = true;
            expect(content.table.rowCnt).toBeGreaterThan(0);
            expect(content.table.colCnt).toBeGreaterThan(0);
            expect(content.table.rows.length).toBeGreaterThan(0);
          }
        }
      }
    }
    expect(foundTable).toBe(true);
  });

  it('표 셀 내부에 텍스트가 있다', () => {
    const section = getSection();
    let foundCellText = false;
    for (const p of section.paragraphs) {
      for (const run of p.runs) {
        for (const content of run.contents) {
          if (content.type === 'table') {
            for (const row of content.table.rows) {
              for (const cell of row.cells) {
                for (const cp of cell.paragraphs) {
                  for (const cr of cp.runs) {
                    for (const cc of cr.contents) {
                      if (cc.type === 'text' && cc.value.length > 0) {
                        foundCellText = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    expect(foundCellText).toBe(true);
  });
});
