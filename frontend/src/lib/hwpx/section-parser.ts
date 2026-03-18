import { parseXml, ensureArray, getAttr, getAttrNum, getAttrBool } from '../../utils/xml-helpers';
import type { Section, PageLayout, PageMargin } from '../model/section';
import type {
  Paragraph, TextRun, RunContent, Table, TableRow, TableCell, CellMargin, ImageObject,
} from '../model/paragraph';

/**
 * section*.xml 파싱
 *
 * 실제 HWPX 구조 (네임스페이스 제거 후):
 * sec > p[paraPrIDRef, styleIDRef, pageBreak, columnBreak]
 *   > run[charPrIDRef]
 *     > t (텍스트)
 *     > tbl (표)
 *     > secPr (구역 정의, 첫 문단에만)
 *     > ctrl (단 정의 등)
 */
export function parseSection(xml: string): Section {
  const parsed = parseXml(xml) as Record<string, unknown>;
  const sec = parsed['sec'] as Record<string, unknown>;

  const paragraphs: Paragraph[] = [];
  let pageLayout = defaultPageLayout();

  const pNodes = ensureArray(sec?.['p'] as Record<string, unknown>[]);

  for (const pNode of pNodes) {
    const { paragraph, layout } = parseParagraph(pNode);
    paragraphs.push(paragraph);
    if (layout) {
      pageLayout = layout;
    }
  }

  return { pageLayout, paragraphs };
}

function parseParagraph(pNode: Record<string, unknown>): {
  paragraph: Paragraph;
  layout: PageLayout | null;
} {
  const id = getAttrNum(pNode, 'id');
  const paraPrIDRef = getAttrNum(pNode, 'paraPrIDRef');
  const styleIDRef = getAttrNum(pNode, 'styleIDRef');
  const pageBreak = getAttrBool(pNode, 'pageBreak');
  const columnBreak = getAttrBool(pNode, 'columnBreak');

  const runs: TextRun[] = [];
  let layout: PageLayout | null = null;

  const runNodes = ensureArray(pNode['run'] as Record<string, unknown>[]);

  for (const runNode of runNodes) {
    const { textRun, pageLayout: pl } = parseRun(runNode);
    runs.push(textRun);
    if (pl) layout = pl;
  }

  return {
    paragraph: { id, paraPrIDRef, styleIDRef, pageBreak, columnBreak, runs },
    layout,
  };
}

function parseRun(runNode: Record<string, unknown>): {
  textRun: TextRun;
  pageLayout: PageLayout | null;
} {
  const charPrIDRef = getAttrNum(runNode, 'charPrIDRef');
  const contents: RunContent[] = [];
  let pageLayout: PageLayout | null = null;

  // hp:secPr (구역 정의) — 페이지 레이아웃 추출
  if (runNode['secPr']) {
    pageLayout = parseSecPr(runNode['secPr'] as Record<string, unknown>);
    contents.push({ type: 'secDef', secPr: runNode['secPr'] });
  }

  // hp:t (텍스트)
  const tNodes = runNode['t'];
  if (tNodes !== undefined) {
    const tArray = ensureArray(tNodes as (string | Record<string, unknown>)[]);
    for (const t of tArray) {
      if (typeof t === 'string') {
        contents.push({ type: 'text', value: t });
      } else if (typeof t === 'object' && t !== null) {
        const text = String((t as Record<string, unknown>)['#text'] ?? '');
        if (text) contents.push({ type: 'text', value: text });
      }
    }
  }

  // hp:tbl (표)
  if (runNode['tbl']) {
    const tblNode = runNode['tbl'] as Record<string, unknown>;
    const table = parseTable(tblNode);
    contents.push({ type: 'table', table });
  }

  // hp:pic (그림)
  if (runNode['pic']) {
    const picNode = runNode['pic'] as Record<string, unknown>;
    const imgNode = picNode['img'] as Record<string, unknown> | undefined;
    const szNode = picNode['sz'] as Record<string, unknown> | undefined;
    const posNode = picNode['pos'] as Record<string, unknown> | undefined;
    // curSz가 있으면 현재 크기 사용, 없으면 sz
    const curSzNode = picNode['curSz'] as Record<string, unknown> | undefined;

    if (imgNode) {
      const image: ImageObject = {
        binaryItemIDRef: getAttr(imgNode, 'binaryItemIDRef'),
        width: getAttrNum(curSzNode ?? szNode ?? {}, 'width'),
        height: getAttrNum(curSzNode ?? szNode ?? {}, 'height'),
        treatAsChar: getAttrBool(posNode ?? {}, 'treatAsChar'),
      };
      contents.push({ type: 'image', image });
    }
  }

  // hp:ctrl (컨트롤 — 단 정의 등, 현재는 스킵)
  if (runNode['ctrl']) {
    contents.push({ type: 'columnDef', colPr: runNode['ctrl'] });
  }

  return { textRun: { charPrIDRef, contents }, pageLayout };
}

function parseSecPr(secPr: Record<string, unknown>): PageLayout {
  const pagePr = secPr['pagePr'] as Record<string, unknown> | undefined;
  const marginNode = pagePr?.['margin'] as Record<string, unknown> | undefined;

  const width = getAttrNum(pagePr ?? {}, 'width');
  const height = getAttrNum(pagePr ?? {}, 'height');
  const landscape = getAttr(pagePr ?? {}, 'landscape');
  const gutterType = getAttr(pagePr ?? {}, 'gutterType');

  const margin: PageMargin = {
    left: getAttrNum(marginNode ?? {}, 'left'),
    right: getAttrNum(marginNode ?? {}, 'right'),
    top: getAttrNum(marginNode ?? {}, 'top'),
    bottom: getAttrNum(marginNode ?? {}, 'bottom'),
    header: getAttrNum(marginNode ?? {}, 'header'),
    footer: getAttrNum(marginNode ?? {}, 'footer'),
    gutter: getAttrNum(marginNode ?? {}, 'gutter'),
  };

  return { width, height, landscape, gutterType, margin };
}

function parseTable(tblNode: Record<string, unknown>): Table {
  const szNode = tblNode['sz'] as Record<string, unknown> | undefined;
  const posNode = tblNode['pos'] as Record<string, unknown> | undefined;

  const table: Table = {
    id: getAttrNum(tblNode, 'id'),
    rowCnt: getAttrNum(tblNode, 'rowCnt'),
    colCnt: getAttrNum(tblNode, 'colCnt'),
    cellSpacing: getAttrNum(tblNode, 'cellSpacing'),
    borderFillIDRef: getAttrNum(tblNode, 'borderFillIDRef'),
    pageBreak: getAttr(tblNode, 'pageBreak'),
    repeatHeader: getAttrBool(tblNode, 'repeatHeader'),
    width: getAttrNum(szNode ?? {}, 'width'),
    height: getAttrNum(szNode ?? {}, 'height'),
    treatAsChar: getAttrBool(posNode ?? {}, 'treatAsChar'),
    rows: [],
  };

  const trNodes = ensureArray(tblNode['tr'] as Record<string, unknown>[]);
  for (const trNode of trNodes) {
    table.rows.push(parseTableRow(trNode));
  }

  return table;
}

function parseTableRow(trNode: Record<string, unknown>): TableRow {
  const tcNodes = ensureArray(trNode['tc'] as Record<string, unknown>[]);
  const cells: TableCell[] = [];

  for (const tcNode of tcNodes) {
    cells.push(parseTableCell(tcNode));
  }

  return { cells };
}

function parseTableCell(tcNode: Record<string, unknown>): TableCell {
  const cellAddr = tcNode['cellAddr'] as Record<string, unknown> | undefined;
  const cellSpan = tcNode['cellSpan'] as Record<string, unknown> | undefined;
  const cellSz = tcNode['cellSz'] as Record<string, unknown> | undefined;
  const cellMarginNode = tcNode['cellMargin'] as Record<string, unknown> | undefined;

  const cellMargin: CellMargin = {
    left: getAttrNum(cellMarginNode ?? {}, 'left'),
    right: getAttrNum(cellMarginNode ?? {}, 'right'),
    top: getAttrNum(cellMarginNode ?? {}, 'top'),
    bottom: getAttrNum(cellMarginNode ?? {}, 'bottom'),
  };

  // subList 내부의 문단들 파싱 + vertAlign
  const subList = tcNode['subList'] as Record<string, unknown> | undefined;
  const vertAlign = subList ? getAttr(subList, 'vertAlign') : 'TOP';
  const paragraphs: Paragraph[] = [];

  if (subList) {
    const pNodes = ensureArray(subList['p'] as Record<string, unknown>[]);
    for (const pNode of pNodes) {
      const { paragraph } = parseParagraph(pNode);
      paragraphs.push(paragraph);
    }
  }

  return {
    colAddr: getAttrNum(cellAddr ?? {}, 'colAddr'),
    rowAddr: getAttrNum(cellAddr ?? {}, 'rowAddr'),
    colSpan: getAttrNum(cellSpan ?? {}, 'colSpan') || 1,
    rowSpan: getAttrNum(cellSpan ?? {}, 'rowSpan') || 1,
    width: getAttrNum(cellSz ?? {}, 'width'),
    height: getAttrNum(cellSz ?? {}, 'height'),
    borderFillIDRef: getAttrNum(tcNode, 'borderFillIDRef'),
    vertAlign: vertAlign || 'TOP',
    cellMargin,
    paragraphs,
  };
}

function defaultPageLayout(): PageLayout {
  return {
    width: 59528,
    height: 84188,
    landscape: 'NARROWLY',
    gutterType: 'LEFT_ONLY',
    margin: {
      left: 8504, right: 8504,
      top: 5668, bottom: 4252,
      header: 4252, footer: 4252,
      gutter: 0,
    },
  };
}
