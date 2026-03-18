import { describe, it, expect } from 'vitest';
import { parseManifest } from '../../../src/lib/hwpx/manifest-parser';

const SAMPLE_CONTENT_HPF = `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<opf:package xmlns:opf="http://www.idpf.org/2007/opf/" version="" unique-identifier="" id="">
  <opf:metadata>
    <opf:title>서식 11</opf:title>
    <opf:language>ko</opf:language>
    <opf:meta name="creator" content="text">법제처 국가법령정보센터</opf:meta>
    <opf:meta name="subject" content="text"/>
    <opf:meta name="description" content="text">국가법령정보센터에서 제공하는 문서입니다.</opf:meta>
    <opf:meta name="CreatedDate" content="text">2006-01-16T00:07:41Z</opf:meta>
    <opf:meta name="ModifiedDate" content="text">2026-03-18T14:36:17Z</opf:meta>
  </opf:metadata>
  <opf:manifest>
    <opf:item id="header" href="Contents/header.xml" media-type="application/xml"/>
    <opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/>
    <opf:item id="headersc" href="Scripts/headerScripts" media-type="application/x-javascript"/>
    <opf:item id="sourcesc" href="Scripts/sourceScripts" media-type="application/x-javascript"/>
    <opf:item id="settings" href="settings.xml" media-type="application/xml"/>
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="header" linear="yes"/>
    <opf:itemref idref="section0" linear="yes"/>
  </opf:spine>
</opf:package>`;

describe('parseManifest', () => {
  it('섹션 파일 경로를 정확히 추출한다', () => {
    const result = parseManifest(SAMPLE_CONTENT_HPF);
    expect(result.sectionPaths).toEqual(['Contents/section0.xml']);
  });

  it('header 경로를 추출한다', () => {
    const result = parseManifest(SAMPLE_CONTENT_HPF);
    expect(result.headerPath).toBe('Contents/header.xml');
  });

  it('문서 메타 정보를 추출한다', () => {
    const result = parseManifest(SAMPLE_CONTENT_HPF);
    expect(result.meta.title).toBe('서식 11');
    expect(result.meta.language).toBe('ko');
    expect(result.meta.creator).toBe('법제처 국가법령정보센터');
    expect(result.meta.createdDate).toBe('2006-01-16T00:07:41Z');
  });

  it('여러 섹션이 있는 경우 모두 추출한다', () => {
    const multiSection = SAMPLE_CONTENT_HPF
      .replace('</opf:manifest>', '<opf:item id="section1" href="Contents/section1.xml" media-type="application/xml"/></opf:manifest>')
      .replace('</opf:spine>', '<opf:itemref idref="section1" linear="yes"/></opf:spine>');
    const result = parseManifest(multiSection);
    expect(result.sectionPaths).toEqual([
      'Contents/section0.xml',
      'Contents/section1.xml',
    ]);
  });
});
