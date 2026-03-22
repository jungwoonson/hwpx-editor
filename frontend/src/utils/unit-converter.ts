/**
 * HWPUNIT (1/7200 inch) 변환 유틸리티
 *
 * 1 HWPUNIT = 1/7200 inch
 * 1 inch = 96px (CSS standard)
 * 1 HWPUNIT = 96/7200 px = 0.01333... px
 *
 * A4: 59528 hwpunit = 210mm (가로), 84188 hwpunit = 297mm (세로)
 */

const HWPUNIT_PER_INCH = 7200;
const PX_PER_INCH = 96;
const PT_PER_INCH = 72;
const MM_PER_INCH = 25.4;

/** HWPUNIT → px */
export function hwpunitToPx(hwpunit: number): number {
  return (hwpunit / HWPUNIT_PER_INCH) * PX_PER_INCH;
}

/** HWPUNIT → pt */
export function hwpunitToPt(hwpunit: number): number {
  return (hwpunit / HWPUNIT_PER_INCH) * PT_PER_INCH;
}

/** HWPUNIT → mm */
export function hwpunitToMm(hwpunit: number): number {
  return (hwpunit / HWPUNIT_PER_INCH) * MM_PER_INCH;
}

/**
 * charPr height → pt
 * height 1000 = 10pt (charPr의 height는 1/100 pt 단위)
 */
export function charHeightToPt(height: number): number {
  return height / 100;
}

/** charPr height → px */
export function charHeightToPx(height: number): number {
  return (height / 100) * (PX_PER_INCH / PT_PER_INCH);
}

/**
 * HWPX border width 문자열 → CSS px
 * "0.1 mm" → ~0.38px, "0.4 mm" → ~1.5px, "0.7 mm" → ~2.6px
 */
export function borderWidthToPx(width: string): number {
  const match = width.match(/([\d.]+)\s*mm/);
  if (!match) return 1;
  const mm = parseFloat(match[1]);
  return (mm / MM_PER_INCH) * PX_PER_INCH;
}

/**
 * 규칙 13: HWP border type → CSS border-style 완전 매핑 (중앙 관리)
 */
const BORDER_TYPE_MAP: Record<string, string> = {
  NONE: 'none',
  SOLID: 'solid',
  DASH: 'dashed',
  DOT: 'dotted',
  DASH_DOT: 'dashed',
  DASH_DOT_DOT: 'dotted',
  DOUBLE_SLIM: 'double',
  DOUBLE_THICK: 'double',
  THICK_THIN: 'double',
  THIN_THICK: 'double',
  THICK_THIN_THICK: 'double',
  WAVE: 'solid',           // CSS에 wave 없음 → solid 대체
  DOUBLE_WAVE: 'double',
  THICK: 'solid',
  THIN: 'solid',
};

export function borderTypeToCss(type: string): string {
  return BORDER_TYPE_MAP[type] ?? 'solid';
}

/**
 * BorderLine → CSS border shorthand
 */
// 규칙 7: 서브픽셀 허용, 정수 반올림 금지. 최소 0.5px
export function borderLineToCss(border: { type: string; width: string; color: string }): string {
  if (border.type === 'NONE') return 'none';
  const px = Math.max(0.5, borderWidthToPx(border.width));
  const style = borderTypeToCss(border.type);
  return `${px}px ${style} ${border.color}`;
}
