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
