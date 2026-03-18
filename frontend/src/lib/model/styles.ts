/** 글자 모양 (hh:charPr) */
export interface CharacterShape {
  id: number;
  height: number; // hwpunit (1000 = 10pt)
  textColor: string; // #RRGGBB
  shadeColor: string;
  useFontSpace: boolean;
  useKerning: boolean;
  symMark: string;
  borderFillIDRef: number;
  fontRef: LanguageFontRef;
  ratio: LanguageValues;
  spacing: LanguageValues;
  relSz: LanguageValues;
  offset: LanguageValues;
  bold: boolean;
  italic: boolean;
  underline: UnderlineStyle;
  strikeout: StrikeoutStyle;
  outline: string;
  shadow: ShadowStyle;
  superscript: boolean;
  subscript: boolean;
}

/** 언어별 폰트 참조 (hh:fontRef) */
export interface LanguageFontRef {
  hangul: number;
  latin: number;
  hanja: number;
  japanese: number;
  other: number;
  symbol: number;
  user: number;
}

/** 언어별 수치 (ratio, spacing, relSz, offset) */
export interface LanguageValues {
  hangul: number;
  latin: number;
  hanja: number;
  japanese: number;
  other: number;
  symbol: number;
  user: number;
}

export interface UnderlineStyle {
  type: string; // NONE, BOTTOM, CENTER, TOP
  shape: string; // SOLID, etc.
  color: string; // #RRGGBB
}

export interface StrikeoutStyle {
  shape: string; // NONE, etc.
  color: string; // #RRGGBB
}

export interface ShadowStyle {
  type: string; // NONE, DROP, CONT
  color: string;
  offsetX: number;
  offsetY: number;
}

/** 문단 모양 (hh:paraPr) */
export interface ParagraphShape {
  id: number;
  tabPrIDRef: number;
  condense: number;
  fontLineHeight: boolean;
  snapToGrid: boolean;
  align: AlignInfo;
  heading: HeadingInfo;
  breakSetting: BreakSetting;
  autoSpacing: AutoSpacing;
  margin: ParagraphMargin;
  lineSpacing: LineSpacingInfo;
  border: ParagraphBorder;
}

export interface AlignInfo {
  horizontal: string; // JUSTIFY, CENTER, LEFT, RIGHT
  vertical: string; // BASELINE, TOP, CENTER, BOTTOM
}

export interface HeadingInfo {
  type: string; // NONE, OUTLINE, NUMBER, BULLET
  idRef: number;
  level: number;
}

export interface BreakSetting {
  breakLatinWord: string;
  breakNonLatinWord: string;
  widowOrphan: boolean;
  keepWithNext: boolean;
  keepLines: boolean;
  pageBreakBefore: boolean;
  lineWrap: string;
}

export interface AutoSpacing {
  eAsianEng: boolean;
  eAsianNum: boolean;
}

export interface ParagraphMargin {
  indent: number; // hwpunit
  left: number;
  right: number;
  prev: number; // 문단 간격 위
  next: number; // 문단 간격 아래
}

export interface LineSpacingInfo {
  type: string; // PERCENT, FIXED, BETWEEN_LINES, AT_LEAST
  value: number;
  unit: string; // HWPUNIT
}

export interface ParagraphBorder {
  borderFillIDRef: number;
  offsetLeft: number;
  offsetRight: number;
  offsetTop: number;
  offsetBottom: number;
  connect: boolean;
  ignoreMargin: boolean;
}

/** 폰트 정보 (hh:font) */
export interface FontInfo {
  id: number;
  face: string; // 폰트 이름
  type: string; // TTF, etc.
  isEmbedded: boolean;
}

/** 스타일 (hh:style) */
export interface StyleDefinition {
  id: number;
  type: string; // PARA, CHAR
  name: string;
  engName: string;
  paraPrIDRef: number;
  charPrIDRef: number;
  nextStyleIDRef: number;
  langID: number;
}

/** 테두리/배경 (hh:borderFill) */
export interface BorderFill {
  id: number;
  threeD: boolean;
  shadow: boolean;
  leftBorder: BorderLine;
  rightBorder: BorderLine;
  topBorder: BorderLine;
  bottomBorder: BorderLine;
}

export interface BorderLine {
  type: string; // NONE, SOLID, etc.
  width: string; // "0.1 mm" etc.
  color: string; // #RRGGBB
}

/** 모든 스타일을 모아놓은 저장소 */
export interface StyleStore {
  charShapes: Map<number, CharacterShape>;
  paraShapes: Map<number, ParagraphShape>;
  fonts: Map<string, Map<number, FontInfo>>; // lang → (id → FontInfo)
  styles: Map<number, StyleDefinition>;
  borderFills: Map<number, BorderFill>;
}
