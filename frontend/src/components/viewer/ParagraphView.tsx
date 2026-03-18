import type { Paragraph } from '../../lib/model';
import { useStyleStore } from './StyleContext';
import { TextRunView } from './TextRunView';
import { hwpunitToPx, borderLineToCss } from '../../utils/unit-converter';

const ALIGN_MAP: Record<string, React.CSSProperties['textAlign']> = {
  JUSTIFY: 'justify',
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',
};

export function ParagraphView({ paragraph }: { paragraph: Paragraph }) {
  const styles = useStyleStore();
  const paraShape = styles.paraShapes.get(paragraph.paraPrIDRef);

  const textAlign = ALIGN_MAP[paraShape?.align.horizontal ?? 'JUSTIFY'] ?? 'justify';

  const lineHeight = paraShape?.lineSpacing.type === 'PERCENT'
    ? `${(paraShape.lineSpacing.value || 160) / 100}`
    : paraShape?.lineSpacing.type === 'FIXED'
      ? `${hwpunitToPx(paraShape.lineSpacing.value)}px`
      : undefined;

  const style: React.CSSProperties = {
    textAlign,
    lineHeight,
    marginLeft: paraShape?.margin.left ? hwpunitToPx(paraShape.margin.left) : undefined,
    marginRight: paraShape?.margin.right ? hwpunitToPx(paraShape.margin.right) : undefined,
    marginTop: paraShape?.margin.prev ? hwpunitToPx(paraShape.margin.prev) : undefined,
    marginBottom: paraShape?.margin.next ? hwpunitToPx(paraShape.margin.next) : undefined,
    textIndent: paraShape?.margin.indent ? hwpunitToPx(paraShape.margin.indent) : undefined,
    minHeight: '1em',
  };

  // 문단 테두리/배경 적용 (paraPr > border > borderFillIDRef)
  if (paraShape?.border.borderFillIDRef) {
    const borderFill = styles.borderFills.get(paraShape.border.borderFillIDRef);
    if (borderFill) {
      // 배경색
      if (borderFill.faceColor && borderFill.faceColor !== 'none') {
        style.backgroundColor = borderFill.faceColor;
      }
      // 테두리
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
      // 테두리 오프셋 → padding
      if (paraShape.border.offsetTop || paraShape.border.offsetBottom ||
          paraShape.border.offsetLeft || paraShape.border.offsetRight) {
        style.paddingTop = hwpunitToPx(paraShape.border.offsetTop);
        style.paddingBottom = hwpunitToPx(paraShape.border.offsetBottom);
        style.paddingLeft = hwpunitToPx(paraShape.border.offsetLeft);
        style.paddingRight = hwpunitToPx(paraShape.border.offsetRight);
      }
    }
  }

  // 빈 문단 처리
  const hasContent = paragraph.runs.some(r =>
    r.contents.some(c => c.type === 'text' || c.type === 'table')
  );

  return (
    <div style={style}>
      {paragraph.runs.map((run, i) => (
        <TextRunView key={i} run={run} />
      ))}
      {!hasContent && <br />}
    </div>
  );
}
