# HWPX 실측 분석 결과

> 샘플: docs/sample/중소기업 취업자 소득세 감면신청서.hwpx
> 분석일: 2026-03-18

## ZIP 내부 구조

```
mimetype                    "application/hwp+zip"
version.xml                 버전 정보 (major=5, minor=1, xmlVersion=1.5)
settings.xml                앱 설정 (캐럿 위치 등)
META-INF/container.xml      루트파일 목록 (content.hpf 경로)
META-INF/container.rdf      RDF 메타데이터
META-INF/manifest.xml       매니페스트 (빈 파일일 수 있음)
Contents/content.hpf        OPF 매니페스트 (섹션 목록, 메타 정보)
Contents/header.xml         스타일/폰트/문단모양 정의
Contents/section0.xml       본문 콘텐츠
Preview/PrvText.txt         미리보기 텍스트
Preview/PrvImage.png        미리보기 이미지
Scripts/headerScripts       스크립트
Scripts/sourceScripts       스크립트
BinData/                    (이미지 포함 문서에만 존재)
```

## 네임스페이스

| 접두사 | URI | 용도 |
|--------|-----|------|
| `hh:` | http://www.hancom.co.kr/hwpml/2011/head | header.xml 루트, 스타일/폰트/문단모양 정의 |
| `hp:` | http://www.hancom.co.kr/hwpml/2011/paragraph | section*.xml 본문 (문단, 런, 텍스트, 표) |
| `hp10:` | http://www.hancom.co.kr/hwpml/2016/paragraph | 2016 확장 |
| `hs:` | http://www.hancom.co.kr/hwpml/2011/section | section*.xml 루트 |
| `hc:` | http://www.hancom.co.kr/hwpml/2011/core | 공통 요소 (margin 값 등) |
| `ha:` | http://www.hancom.co.kr/hwpml/2011/app | 앱 설정 |
| `hm:` | http://www.hancom.co.kr/hwpml/2011/master-page | 바탕쪽 |
| `opf:` | http://www.idpf.org/2007/opf/ | content.hpf OPF 패키지 |
| `hwpunitchar:` | http://www.hancom.co.kr/hwpml/2016/HwpUnitChar | 단위 확장 |

## HWPML ↔ HWPX 엘리먼트 매핑 테이블

### header.xml (hh: 네임스페이스)

| HWPML 문서 | HWPX 실제 태그 | 속성 |
|-----------|---------------|------|
| HEAD | `hh:head` | version, secCnt |
| FACENAMELIST | `hh:fontfaces` | itemCnt |
| FONTFACE | `hh:fontface` | lang (HANGUL/LATIN/HANJA/JAPANESE/OTHER/SYMBOL/USER), fontCnt |
| FONT | `hh:font` | id, face (=이름), type (TTF 등), isEmbedded |
| SUBSTFONT | `hh:substFont` | face, type, isEmbedded, binaryItemIDRef |
| TYPEINFO | `hh:typeInfo` | familyType, weight, proportion, contrast, ... |
| CHARSHAPELIST | `hh:charProperties` | itemCnt |
| CHARSHAPE | `hh:charPr` | id, height, textColor (#RGB), shadeColor, useFontSpace, useKerning, symMark, borderFillIDRef |
| FONTID | `hh:fontRef` | hangul, latin, hanja, japanese, other, symbol, user (숫자=font id 참조) |
| RATIO | `hh:ratio` | hangul, latin, hanja, japanese, other, symbol, user (%) |
| CHARSPACING | `hh:spacing` | hangul, latin, hanja, japanese, other, symbol, user |
| RELSIZE | `hh:relSz` | hangul, latin, hanja, japanese, other, symbol, user (%) |
| CHAROFFSET | `hh:offset` | hangul, latin, hanja, japanese, other, symbol, user |
| UNDERLINE | `hh:underline` | type (NONE/BOTTOM/CENTER/TOP), shape (SOLID 등), color (#RGB) |
| STRIKEOUT | `hh:strikeout` | shape (NONE/...), color (#RGB) |
| OUTLINE | `hh:outline` | type |
| SHADOW | `hh:shadow` | type (NONE/DROP/CONT), color, offsetX, offsetY |
| ITALIC | `hh:italic` | 빈 엘리먼트 `<hh:italic/>`. 존재하면 기울임, 없으면 일반 |
| BOLD | `hh:bold` | 빈 엘리먼트 `<hh:bold/>`. 존재하면 굵게, 없으면 일반 |
| SUPERSCRIPT | `hh:supscript` | (존재 확인됨) |
| PARASHAPELIST | `hh:paraProperties` | itemCnt |
| PARASHAPE | `hh:paraPr` | id, tabPrIDRef, condense, fontLineHeight, snapToGrid |
| (alignment) | `hh:align` | horizontal (JUSTIFY/CENTER/LEFT/RIGHT), vertical (BASELINE/TOP/CENTER/BOTTOM) |
| (heading) | `hh:heading` | type (NONE/OUTLINE/NUMBER/BULLET), idRef, level |
| (break) | `hh:breakSetting` | breakLatinWord, breakNonLatinWord, widowOrphan, keepWithNext, keepLines, pageBreakBefore, lineWrap |
| (autoSpacing) | `hh:autoSpacing` | eAsianEng, eAsianNum |
| PARAMARGIN | `hh:margin` → `hc:intent`, `hc:left`, `hc:right`, `hc:prev`, `hc:next` | value, unit (HWPUNIT) |
| (lineSpacing) | `hh:lineSpacing` | type (PERCENT/FIXED/...), value, unit (HWPUNIT) |
| PARABORDER | `hh:border` | borderFillIDRef, offsetLeft/Right/Top/Bottom, connect, ignoreMargin |
| BORDERFILLLIST | `hh:borderFills` | itemCnt |
| BORDERFILL | `hh:borderFill` | id, threeD, shadow, centerLine, breakCellSeparateLine |
| LEFTBORDER | `hh:leftBorder` | type, width, color |
| RIGHTBORDER | `hh:rightBorder` | type, width, color |
| TOPBORDER | `hh:topBorder` | type, width, color |
| BOTTOMBORDER | `hh:bottomBorder` | type, width, color |
| DIAGONAL | `hh:diagonal` | type, width, color |
| FILLBRUSH | `hc:fillBrush` | |
| WINDOWBRUSH | `hc:winBrush` | |
| STYLELIST | `hh:styles` | itemCnt |
| STYLE | `hh:style` | id, type (PARA/CHAR), name, engName, paraPrIDRef, charPrIDRef, nextStyleIDRef, langID, lockForm |

### section0.xml (hp:/hs: 네임스페이스)

| HWPML 문서 | HWPX 실제 태그 | 속성 |
|-----------|---------------|------|
| SECTION | `hs:sec` | (루트) |
| P | `hp:p` | id, paraPrIDRef, styleIDRef, pageBreak, columnBreak, merged |
| TEXT | `hp:run` | charPrIDRef |
| CHAR (텍스트) | `hp:t` | (텍스트 내용) |
| TABLE | `hp:tbl` | id, zOrder, numberingType, textWrap, textFlow, lock, pageBreak, repeatHeader, rowCnt, colCnt, cellSpacing, borderFillIDRef |
| ROW | `hp:tr` | |
| CELL | `hp:tc` | name, header, hasMargin, protect, editable, dirty, borderFillIDRef |
| (cellAddr) | `hp:cellAddr` | colAddr, rowAddr |
| (cellSpan) | `hp:cellSpan` | colSpan, rowSpan |
| (cellSz) | `hp:cellSz` | width, height |
| CELLMARGIN | `hp:cellMargin` | left, right, top, bottom |
| PARALIST (셀 내부) | `hp:subList` | id, textDirection, lineWrap, vertAlign, ... |
| SIZE | `hp:sz` | width, widthRelTo, height, heightRelTo, protect |
| POSITION | `hp:pos` | treatAsChar, affectLSpacing, flowWithText, allowOverlap, vertRelTo, horzRelTo, vertAlign, horzAlign, vertOffset, horzOffset |
| OUTSIDEMARGIN | `hp:outMargin` | left, right, top, bottom |
| INSIDEMARGIN | `hp:inMargin` | left, right, top, bottom |
| SECDEF | `hp:secPr` | id, textDirection, spaceColumns, tabStop, outlineShapeIDRef, ... |
| PAGEDEF | `hp:pagePr` | landscape (WIDELY/NARROWLY), width, height, gutterType |
| PAGEMARGIN | `hp:margin` | header, footer, gutter, left, right, top, bottom |
| COLDEF | `hp:colPr` (hp:ctrl 내부) | id, type, layout, colCount, sameSz, sameGap |
| FOOTNOTESHAPE | `hp:footNotePr` | |
| ENDNOTESHAPE | `hp:endNotePr` | |

### content.hpf (opf: 네임스페이스)

```xml
<opf:package>
  <opf:metadata>
    <opf:title>문서 제목</opf:title>
    <opf:language>ko</opf:language>
    <opf:meta name="creator" content="text">작성자</opf:meta>
    <opf:meta name="CreatedDate" content="text">ISO날짜</opf:meta>
    <opf:meta name="ModifiedDate" content="text">ISO날짜</opf:meta>
    ...
  </opf:metadata>
  <opf:manifest>
    <opf:item id="header" href="Contents/header.xml" media-type="application/xml"/>
    <opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/>
    ...
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="header" linear="yes"/>
    <opf:itemref idref="section0" linear="yes"/>
    ...
  </opf:spine>
</opf:package>
```

## 주요 차이점 (HWPML 문서 vs 실제 HWPX)

1. **태그명 케이스**: HWPML은 대문자(CHARSHAPE, PARASHAPE), HWPX는 camelCase(charPr, paraPr)
2. **리스트 래퍼**: HWPML의 CHARSHAPELIST → HWPX의 `hh:charProperties`, PARASHAPELIST → `hh:paraProperties`
3. **색상 형식**: HWPML은 COLORREF(0x00bbggrr 정수), HWPX는 **#RRGGBB 문자열** (CSS 호환!)
4. **단위**: HWPX에서 단위를 `unit="HWPUNIT"` 속성으로 명시. 1/7200 인치 확인됨.
5. **BOLD/ITALIC**: HWPML과 동일하게 빈 자식 엘리먼트 `<hh:bold/>`, `<hh:italic/>`. 해당 서식이 있는 charPr에만 존재하고, 없으면 일반체. (과제신청서 샘플에서 확인)
6. **hp:switch/hp:case/hp:default**: HWPX 고유. 버전 호환성을 위한 조건부 렌더링. paraPr의 margin/lineSpacing에서 사용됨. `hp:required-namespace`로 분기.
7. **FONT 속성명**: HWPML의 `Name` → HWPX의 `face`, HWPML의 `Type` → HWPX의 `type`
8. **landscape 값**: HWPML은 0/1 정수, HWPX는 "WIDELY"/"NARROWLY" 문자열
9. **STYLE 참조**: HWPML의 `ParaShape`/`CharShape` → HWPX의 `paraPrIDRef`/`charPrIDRef`
