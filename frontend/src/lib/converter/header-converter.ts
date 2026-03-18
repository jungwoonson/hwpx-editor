import { parseHeader } from '../hwpx/header-parser';
import {
  ensureArray,
  getAttr,
  getAttrNum,
  getAttrBool,
} from '../../utils/xml-helpers';
import type {
  StyleStore,
  CharacterShape,
  ParagraphShape,
  FontInfo,
  StyleDefinition,
  BorderFill,
  BorderLine,
  LanguageFontRef,
  LanguageValues,
  UnderlineStyle,
  StrikeoutStyle,
  ShadowStyle,
  AlignInfo,
  HeadingInfo,
  BreakSetting,
  AutoSpacing,
  ParagraphMargin,
  LineSpacingInfo,
  ParagraphBorder,
} from '../model/styles';

type Rec = Record<string, unknown>;

/** 언어별 숫자 속성을 LanguageValues 형태로 추출 */
function extractLanguageValues(node: Rec): LanguageValues {
  return {
    hangul: getAttrNum(node, 'hangul'),
    latin: getAttrNum(node, 'latin'),
    hanja: getAttrNum(node, 'hanja'),
    japanese: getAttrNum(node, 'japanese'),
    other: getAttrNum(node, 'other'),
    symbol: getAttrNum(node, 'symbol'),
    user: getAttrNum(node, 'user'),
  };
}

/** 언어별 폰트 참조 추출 */
function extractLanguageFontRef(node: Rec): LanguageFontRef {
  return {
    hangul: getAttrNum(node, 'hangul'),
    latin: getAttrNum(node, 'latin'),
    hanja: getAttrNum(node, 'hanja'),
    japanese: getAttrNum(node, 'japanese'),
    other: getAttrNum(node, 'other'),
    symbol: getAttrNum(node, 'symbol'),
    user: getAttrNum(node, 'user'),
  };
}

/** borderLine 추출 */
function extractBorderLine(node: Rec | undefined): BorderLine {
  if (!node) {
    return { type: 'NONE', width: '0', color: '#000000' };
  }
  return {
    type: getAttr(node, 'type') || 'NONE',
    width: getAttr(node, 'width') || '0',
    color: getAttr(node, 'color') || '#000000',
  };
}

/**
 * hp:switch/hp:case/hp:default 래퍼에서 default 자식 노드를 꺼냄.
 * removeNSPrefix 이후 switch/case/default 태그명으로 접근.
 */
function unwrapSwitch(node: Rec): Rec {
  const sw = node['switch'] as Rec | undefined;
  if (!sw) return node;

  // default 배열 또는 단일 노드
  const defaults = ensureArray(sw['default'] as Rec | Rec[] | undefined);
  if (defaults.length > 0) return defaults[0];

  // case 배열에서 첫번째
  const cases = ensureArray(sw['case'] as Rec | Rec[] | undefined);
  if (cases.length > 0) return cases[0];

  return node;
}

/** hh:charPr 노드 하나를 CharacterShape 로 변환 */
function convertCharPr(node: Rec): CharacterShape {
  const id = getAttrNum(node, 'id');
  const height = getAttrNum(node, 'height');
  const textColor = getAttr(node, 'textColor') || '#000000';
  const shadeColor = getAttr(node, 'shadeColor') || '#FFFFFF';
  const useFontSpace = getAttrBool(node, 'useFontSpace');
  const useKerning = getAttrBool(node, 'useKerning');
  const symMark = getAttr(node, 'symMark');
  const borderFillIDRef = getAttrNum(node, 'borderFillIDRef');

  const fontRefNode = node['fontRef'] as Rec | undefined;
  const fontRef: LanguageFontRef = fontRefNode
    ? extractLanguageFontRef(fontRefNode)
    : { hangul: 0, latin: 0, hanja: 0, japanese: 0, other: 0, symbol: 0, user: 0 };

  const ratioNode = node['ratio'] as Rec | undefined;
  const ratio: LanguageValues = ratioNode
    ? extractLanguageValues(ratioNode)
    : { hangul: 100, latin: 100, hanja: 100, japanese: 100, other: 100, symbol: 100, user: 100 };

  const spacingNode = node['spacing'] as Rec | undefined;
  const spacing: LanguageValues = spacingNode
    ? extractLanguageValues(spacingNode)
    : { hangul: 0, latin: 0, hanja: 0, japanese: 0, other: 0, symbol: 0, user: 0 };

  const relSzNode = node['relSz'] as Rec | undefined;
  const relSz: LanguageValues = relSzNode
    ? extractLanguageValues(relSzNode)
    : { hangul: 100, latin: 100, hanja: 100, japanese: 100, other: 100, symbol: 100, user: 100 };

  const offsetNode = node['offset'] as Rec | undefined;
  const offset: LanguageValues = offsetNode
    ? extractLanguageValues(offsetNode)
    : { hangul: 0, latin: 0, hanja: 0, japanese: 0, other: 0, symbol: 0, user: 0 };

  // bold/italic/supscript: 빈 엘리먼트 존재 여부 (fast-xml-parser는 빈 엘리먼트를 빈 문자열 ''로 파싱)
  const bold = node['bold'] !== undefined;
  const italic = node['italic'] !== undefined;
  const superscript = node['supscript'] !== undefined;
  const subscript = node['subscript'] !== undefined;

  const underlineNode = node['underline'] as Rec | undefined;
  const underline: UnderlineStyle = underlineNode
    ? {
        type: getAttr(underlineNode, 'type') || 'NONE',
        shape: getAttr(underlineNode, 'shape') || 'SOLID',
        color: getAttr(underlineNode, 'color') || '#000000',
      }
    : { type: 'NONE', shape: 'SOLID', color: '#000000' };

  const strikeoutNode = node['strikeout'] as Rec | undefined;
  const strikeout: StrikeoutStyle = strikeoutNode
    ? {
        shape: getAttr(strikeoutNode, 'shape') || 'NONE',
        color: getAttr(strikeoutNode, 'color') || '#000000',
      }
    : { shape: 'NONE', color: '#000000' };

  const outlineNode = node['outline'] as Rec | undefined;
  const outline: string = outlineNode ? getAttr(outlineNode, 'type') || '' : '';

  const shadowNode = node['shadow'] as Rec | undefined;
  const shadow: ShadowStyle = shadowNode
    ? {
        type: getAttr(shadowNode, 'type') || 'NONE',
        color: getAttr(shadowNode, 'color') || '#000000',
        offsetX: getAttrNum(shadowNode, 'offsetX'),
        offsetY: getAttrNum(shadowNode, 'offsetY'),
      }
    : { type: 'NONE', color: '#000000', offsetX: 0, offsetY: 0 };

  return {
    id,
    height,
    textColor,
    shadeColor,
    useFontSpace,
    useKerning,
    symMark,
    borderFillIDRef,
    fontRef,
    ratio,
    spacing,
    relSz,
    offset,
    bold,
    italic,
    underline,
    strikeout,
    outline,
    shadow,
    superscript,
    subscript,
  };
}

/** hh:paraPr 노드 하나를 ParagraphShape 로 변환 */
function convertParaPr(node: Rec): ParagraphShape {
  const id = getAttrNum(node, 'id');
  const tabPrIDRef = getAttrNum(node, 'tabPrIDRef');
  const condense = getAttrNum(node, 'condense');
  const fontLineHeight = getAttrBool(node, 'fontLineHeight');
  const snapToGrid = getAttrBool(node, 'snapToGrid');

  const alignNode = node['align'] as Rec | undefined;
  const align: AlignInfo = alignNode
    ? {
        horizontal: getAttr(alignNode, 'horizontal') || 'JUSTIFY',
        vertical: getAttr(alignNode, 'vertical') || 'BASELINE',
      }
    : { horizontal: 'JUSTIFY', vertical: 'BASELINE' };

  const headingNode = node['heading'] as Rec | undefined;
  const heading: HeadingInfo = headingNode
    ? {
        type: getAttr(headingNode, 'type') || 'NONE',
        idRef: getAttrNum(headingNode, 'idRef'),
        level: getAttrNum(headingNode, 'level'),
      }
    : { type: 'NONE', idRef: 0, level: 0 };

  const breakNode = node['breakSetting'] as Rec | undefined;
  const breakSetting: BreakSetting = breakNode
    ? {
        breakLatinWord: getAttr(breakNode, 'breakLatinWord'),
        breakNonLatinWord: getAttr(breakNode, 'breakNonLatinWord'),
        widowOrphan: getAttrBool(breakNode, 'widowOrphan'),
        keepWithNext: getAttrBool(breakNode, 'keepWithNext'),
        keepLines: getAttrBool(breakNode, 'keepLines'),
        pageBreakBefore: getAttrBool(breakNode, 'pageBreakBefore'),
        lineWrap: getAttr(breakNode, 'lineWrap'),
      }
    : {
        breakLatinWord: 'KEEP_WORD',
        breakNonLatinWord: 'BREAK_WORD',
        widowOrphan: false,
        keepWithNext: false,
        keepLines: false,
        pageBreakBefore: false,
        lineWrap: 'BREAK',
      };

  const autoSpacingNode = node['autoSpacing'] as Rec | undefined;
  const autoSpacing: AutoSpacing = autoSpacingNode
    ? {
        eAsianEng: getAttrBool(autoSpacingNode, 'eAsianEng'),
        eAsianNum: getAttrBool(autoSpacingNode, 'eAsianNum'),
      }
    : { eAsianEng: false, eAsianNum: false };

  // margin/lineSpacing은 hp:switch 래퍼 안에 있을 수 있음
  const switchUnwrapped = unwrapSwitch(node);
  const marginNode = switchUnwrapped['margin'] as Rec | undefined;

  let margin: ParagraphMargin = { indent: 0, left: 0, right: 0, prev: 0, next: 0 };
  if (marginNode) {
    const indentNode = marginNode['indent'] as Rec | undefined;
    const leftNode = marginNode['left'] as Rec | undefined;
    const rightNode = marginNode['right'] as Rec | undefined;
    const prevNode = marginNode['prev'] as Rec | undefined;
    const nextNode = marginNode['next'] as Rec | undefined;
    margin = {
      indent: indentNode ? getAttrNum(indentNode, 'value') : 0,
      left: leftNode ? getAttrNum(leftNode, 'value') : 0,
      right: rightNode ? getAttrNum(rightNode, 'value') : 0,
      prev: prevNode ? getAttrNum(prevNode, 'value') : 0,
      next: nextNode ? getAttrNum(nextNode, 'value') : 0,
    };
  }

  const lineSpacingNode = switchUnwrapped['lineSpacing'] as Rec | undefined;
  const lineSpacing: LineSpacingInfo = lineSpacingNode
    ? {
        type: getAttr(lineSpacingNode, 'type') || 'PERCENT',
        value: getAttrNum(lineSpacingNode, 'value'),
        unit: getAttr(lineSpacingNode, 'unit') || 'HWPUNIT',
      }
    : { type: 'PERCENT', value: 160, unit: 'HWPUNIT' };

  const borderNode = node['border'] as Rec | undefined;
  const border: ParagraphBorder = borderNode
    ? {
        borderFillIDRef: getAttrNum(borderNode, 'borderFillIDRef'),
        offsetLeft: getAttrNum(borderNode, 'offsetLeft'),
        offsetRight: getAttrNum(borderNode, 'offsetRight'),
        offsetTop: getAttrNum(borderNode, 'offsetTop'),
        offsetBottom: getAttrNum(borderNode, 'offsetBottom'),
        connect: getAttrBool(borderNode, 'connect'),
        ignoreMargin: getAttrBool(borderNode, 'ignoreMargin'),
      }
    : {
        borderFillIDRef: 0,
        offsetLeft: 0,
        offsetRight: 0,
        offsetTop: 0,
        offsetBottom: 0,
        connect: false,
        ignoreMargin: false,
      };

  return {
    id,
    tabPrIDRef,
    condense,
    fontLineHeight,
    snapToGrid,
    align,
    heading,
    breakSetting,
    autoSpacing,
    margin,
    lineSpacing,
    border,
  };
}

/**
 * header.xml XML 문자열을 파싱하여 StyleStore 로 변환
 */
export function convertHeader(xml: string): StyleStore {
  const parsed = parseHeader(xml) as Rec;
  const head = parsed['head'] as Rec | undefined ?? {};
  const refList = head['refList'] as Rec | undefined ?? {};

  // ---- fonts ----
  const fonts = new Map<string, Map<number, FontInfo>>();
  const fontfaces = refList['fontfaces'] as Rec | undefined ?? {};
  const fontfaceList = ensureArray(fontfaces['fontface'] as Rec | Rec[] | undefined);

  for (const fontface of fontfaceList) {
    const lang = getAttr(fontface, 'lang').toLowerCase();
    const fontMap = new Map<number, FontInfo>();
    const fontList = ensureArray(fontface['font'] as Rec | Rec[] | undefined);
    for (const font of fontList) {
      const fontInfo: FontInfo = {
        id: getAttrNum(font, 'id'),
        face: getAttr(font, 'face'),
        type: getAttr(font, 'type'),
        isEmbedded: getAttrBool(font, 'isEmbedded'),
      };
      fontMap.set(fontInfo.id, fontInfo);
    }
    fonts.set(lang, fontMap);
  }

  // ---- charShapes ----
  const charShapes = new Map<number, CharacterShape>();
  const charProperties = refList['charProperties'] as Rec | undefined ?? {};
  const charPrList = ensureArray(charProperties['charPr'] as Rec | Rec[] | undefined);

  for (const charPr of charPrList) {
    const shape = convertCharPr(charPr);
    charShapes.set(shape.id, shape);
  }

  // ---- paraShapes ----
  const paraShapes = new Map<number, ParagraphShape>();
  const paraProperties = refList['paraProperties'] as Rec | undefined ?? {};
  const paraPrList = ensureArray(paraProperties['paraPr'] as Rec | Rec[] | undefined);

  for (const paraPr of paraPrList) {
    const shape = convertParaPr(paraPr);
    paraShapes.set(shape.id, shape);
  }

  // ---- borderFills ----
  const borderFills = new Map<number, BorderFill>();
  const borderFillsNode = refList['borderFills'] as Rec | undefined ?? {};
  const borderFillList = ensureArray(borderFillsNode['borderFill'] as Rec | Rec[] | undefined);

  for (const bf of borderFillList) {
    const borderFill: BorderFill = {
      id: getAttrNum(bf, 'id'),
      threeD: getAttrBool(bf, 'threeD'),
      shadow: getAttrBool(bf, 'shadow'),
      leftBorder: extractBorderLine(bf['leftBorder'] as Rec | undefined),
      rightBorder: extractBorderLine(bf['rightBorder'] as Rec | undefined),
      topBorder: extractBorderLine(bf['topBorder'] as Rec | undefined),
      bottomBorder: extractBorderLine(bf['bottomBorder'] as Rec | undefined),
    };
    borderFills.set(borderFill.id, borderFill);
  }

  // ---- styles ----
  const styles = new Map<number, StyleDefinition>();
  const stylesNode = refList['styles'] as Rec | undefined ?? {};
  const styleList = ensureArray(stylesNode['style'] as Rec | Rec[] | undefined);

  for (const style of styleList) {
    const styleDef: StyleDefinition = {
      id: getAttrNum(style, 'id'),
      type: getAttr(style, 'type'),
      name: getAttr(style, 'name'),
      engName: getAttr(style, 'engName'),
      paraPrIDRef: getAttrNum(style, 'paraPrIDRef'),
      charPrIDRef: getAttrNum(style, 'charPrIDRef'),
      nextStyleIDRef: getAttrNum(style, 'nextStyleIDRef'),
      langID: getAttrNum(style, 'langID'),
    };
    styles.set(styleDef.id, styleDef);
  }

  return { charShapes, paraShapes, fonts, styles, borderFills };
}
