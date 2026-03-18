import type { Paragraph } from '../../lib/model';
import { useStyleStore } from './StyleContext';
import { TextRunView } from './TextRunView';
import { hwpunitToPx } from '../../utils/unit-converter';

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
