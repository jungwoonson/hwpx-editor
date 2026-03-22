import type { Paragraph, StyleStore } from '../model';
import { hwpunitToPx, charHeightToPx, borderLineToCss } from '../../utils/unit-converter';

const ALIGN_MAP: Record<string, React.CSSProperties['textAlign']> = {
  JUSTIFY: 'justify',
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',
};

/** 문단 스타일 계산 (ParagraphView와 EditableParagraph에서 공용) */
export function computeParagraphStyle(
  paragraph: Paragraph,
  styles: StyleStore,
): React.CSSProperties {
  const paraShape = styles.paraShapes.get(paragraph.paraPrIDRef);

  const textAlign = ALIGN_MAP[paraShape?.align.horizontal ?? 'JUSTIFY'] ?? 'justify';

  const lineHeight = (() => {
    if (!paraShape) return undefined;
    const { type, value } = paraShape.lineSpacing;
    switch (type) {
      case 'PERCENT':
        return `${(value || 160) / 100}`;
      case 'FIXED':
        return `${hwpunitToPx(value)}px`;
      case 'BETWEEN_LINES': {
        const firstCharPrId = paragraph.runs[0]?.charPrIDRef ?? 0;
        const cs = styles.charShapes.get(firstCharPrId);
        const fontPx = cs ? charHeightToPx(cs.height) : 10;
        return `${fontPx + hwpunitToPx(value)}px`;
      }
      case 'AT_LEAST':
        return `${hwpunitToPx(value)}px`;
      default:
        return undefined;
    }
  })();

  const style: React.CSSProperties = {
    textAlign,
    lineHeight,
    marginLeft: paraShape?.margin.left ? hwpunitToPx(paraShape.margin.left) : 0,
    marginRight: paraShape?.margin.right ? hwpunitToPx(paraShape.margin.right) : 0,
    marginTop: paraShape?.margin.prev ? hwpunitToPx(paraShape.margin.prev) : 0,
    marginBottom: paraShape?.margin.next ? hwpunitToPx(paraShape.margin.next) : 0,
    textIndent: paraShape?.margin.indent ? hwpunitToPx(paraShape.margin.indent) : undefined,
    padding: 0,
    wordBreak: 'keep-all',
  };

  // 문단 테두리/배경 적용
  if (paraShape?.border.borderFillIDRef) {
    const borderFill = styles.borderFills.get(paraShape.border.borderFillIDRef);
    if (borderFill) {
      if (borderFill.faceColor && borderFill.faceColor !== 'none') {
        style.backgroundColor = borderFill.faceColor;
      }
      if (borderFill.topBorder.type !== 'NONE') {
        style.borderTop = borderLineToCss(borderFill.topBorder);
      }
      if (borderFill.bottomBorder.type !== 'NONE') {
        style.borderBottom = borderLineToCss(borderFill.bottomBorder);
      }
      if (borderFill.leftBorder.type !== 'NONE') {
        style.borderLeft = borderLineToCss(borderFill.leftBorder);
      }
      if (borderFill.rightBorder.type !== 'NONE') {
        style.borderRight = borderLineToCss(borderFill.rightBorder);
      }
      if (paraShape.border.offsetTop || paraShape.border.offsetBottom ||
          paraShape.border.offsetLeft || paraShape.border.offsetRight) {
        style.paddingTop = hwpunitToPx(paraShape.border.offsetTop);
        style.paddingBottom = hwpunitToPx(paraShape.border.offsetBottom);
        style.paddingLeft = hwpunitToPx(paraShape.border.offsetLeft);
        style.paddingRight = hwpunitToPx(paraShape.border.offsetRight);
      }
    }
  }

  return style;
}

/** 빈 문단의 최소 높이 계산 */
export function computeEmptyParagraphMinHeight(
  paragraph: Paragraph,
  styles: StyleStore,
  lineHeight: string | undefined,
): number {
  const firstCharPrId = paragraph.runs[0]?.charPrIDRef ?? 0;
  const charShape = styles.charShapes.get(firstCharPrId);
  const fontPx = charShape ? charHeightToPx(charShape.height) : 13;
  const lhValue = lineHeight
    ? (typeof lineHeight === 'string' && lineHeight.endsWith('px')
      ? parseFloat(lineHeight)
      : parseFloat(lineHeight as string) * fontPx)
    : fontPx * 1.6;
  return lhValue;
}
