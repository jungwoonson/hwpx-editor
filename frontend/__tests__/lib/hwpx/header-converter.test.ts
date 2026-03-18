import { describe, it, expect } from 'vitest';
import { convertHeader } from '../../../src/lib/converter/header-converter';

const MINIMAL_CHAR_PR_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hh:head xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head">
  <hh:refList>
    <hh:charProperties itemCnt="2">
      <hh:charPr id="0" height="1000" textColor="#000000" shadeColor="#FFFFFF"
                 useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="0">
        <hh:fontRef hangul="0" latin="1" hanja="0" japanese="0" other="1" symbol="2" user="3"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#000000" offsetX="0" offsetY="0"/>
      </hh:charPr>
      <hh:charPr id="1" height="2000" textColor="#FF0000" shadeColor="#FFFFFF"
                 useFontSpace="1" useKerning="0" symMark="NONE" borderFillIDRef="0">
        <hh:bold/>
        <hh:italic/>
        <hh:fontRef hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:underline type="BOTTOM" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="DROP" color="#808080" offsetX="3" offsetY="3"/>
        <hh:supscript/>
      </hh:charPr>
    </hh:charProperties>
  </hh:refList>
</hh:head>`;

describe('convertHeader', () => {
  it('charShapes 맵을 정상적으로 파싱한다', () => {
    const store = convertHeader(MINIMAL_CHAR_PR_XML);
    expect(store.charShapes.size).toBe(2);
  });

  it('charPr id=0 기본 속성을 파싱한다', () => {
    const store = convertHeader(MINIMAL_CHAR_PR_XML);
    const shape = store.charShapes.get(0);
    expect(shape).toBeDefined();
    expect(shape!.id).toBe(0);
    expect(shape!.height).toBe(1000);
    expect(shape!.textColor).toBe('#000000');
    expect(shape!.shadeColor).toBe('#FFFFFF');
    expect(shape!.bold).toBe(false);
    expect(shape!.italic).toBe(false);
    expect(shape!.superscript).toBe(false);
  });

  it('charPr id=0 fontRef를 파싱한다', () => {
    const store = convertHeader(MINIMAL_CHAR_PR_XML);
    const shape = store.charShapes.get(0);
    expect(shape!.fontRef.latin).toBe(1);
    expect(shape!.fontRef.hangul).toBe(0);
    expect(shape!.fontRef.symbol).toBe(2);
  });

  it('charPr id=1 bold/italic/superscript 빈 엘리먼트를 파싱한다', () => {
    const store = convertHeader(MINIMAL_CHAR_PR_XML);
    const shape = store.charShapes.get(1);
    expect(shape).toBeDefined();
    expect(shape!.bold).toBe(true);
    expect(shape!.italic).toBe(true);
    expect(shape!.superscript).toBe(true);
  });

  it('charPr id=1 높이와 색상을 파싱한다', () => {
    const store = convertHeader(MINIMAL_CHAR_PR_XML);
    const shape = store.charShapes.get(1);
    expect(shape!.height).toBe(2000);
    expect(shape!.textColor).toBe('#FF0000');
  });

  it('charPr id=1 underline 스타일을 파싱한다', () => {
    const store = convertHeader(MINIMAL_CHAR_PR_XML);
    const shape = store.charShapes.get(1);
    expect(shape!.underline.type).toBe('BOTTOM');
    expect(shape!.underline.shape).toBe('SOLID');
  });

  it('charPr id=1 shadow 스타일을 파싱한다', () => {
    const store = convertHeader(MINIMAL_CHAR_PR_XML);
    const shape = store.charShapes.get(1);
    expect(shape!.shadow.type).toBe('DROP');
    expect(shape!.shadow.color).toBe('#808080');
    expect(shape!.shadow.offsetX).toBe(3);
    expect(shape!.shadow.offsetY).toBe(3);
  });

  it('빈 XML에서 빈 StyleStore를 반환한다', () => {
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<hh:head xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head">
  <hh:refList/>
</hh:head>`;
    const store = convertHeader(emptyXml);
    expect(store.charShapes.size).toBe(0);
    expect(store.paraShapes.size).toBe(0);
    expect(store.fonts.size).toBe(0);
    expect(store.styles.size).toBe(0);
    expect(store.borderFills.size).toBe(0);
  });
});
