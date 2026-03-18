/** 문단 (hp:p) */
export interface Paragraph {
  id: number;
  paraPrIDRef: number;
  styleIDRef: number;
  pageBreak: boolean;
  columnBreak: boolean;
  runs: TextRun[];
}

/** 텍스트 런 (hp:run) */
export interface TextRun {
  charPrIDRef: number;
  contents: RunContent[];
}

/** 런 내부 콘텐츠 */
export type RunContent =
  | { type: 'text'; value: string }
  | { type: 'table'; table: Table }
  | { type: 'image'; image: ImageObject }
  | { type: 'lineBreak' }
  | { type: 'tab' }
  | { type: 'nbSpace' }
  | { type: 'fwSpace' }
  | { type: 'columnDef'; colPr: unknown }
  | { type: 'secDef'; secPr: unknown }
  | { type: 'unknown'; tagName: string };

/** 그림 (hp:pic) */
export interface ImageObject {
  binaryItemIDRef: string; // BinData/ 내 파일명 (예: "image1")
  width: number; // 표시 크기 hwpunit
  height: number;
  treatAsChar: boolean;
}

/** 표 (hp:tbl) */
export interface Table {
  id: number;
  rowCnt: number;
  colCnt: number;
  cellSpacing: number;
  borderFillIDRef: number;
  pageBreak: string;
  repeatHeader: boolean;
  width: number; // hwpunit
  height: number;
  treatAsChar: boolean;
  rows: TableRow[];
}

/** 표 행 (hp:tr) */
export interface TableRow {
  cells: TableCell[];
}

/** 표 셀 (hp:tc) */
export interface TableCell {
  colAddr: number;
  rowAddr: number;
  colSpan: number;
  rowSpan: number;
  width: number; // hwpunit
  height: number;
  borderFillIDRef: number;
  vertAlign: string; // TOP, CENTER, BOTTOM
  cellMargin: CellMargin;
  paragraphs: Paragraph[];
}

export interface CellMargin {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
