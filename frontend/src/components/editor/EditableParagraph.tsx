import type { Paragraph } from '../../lib/model';
import { useStyleStore } from '../viewer/StyleContext';
import { computeParagraphStyle, computeEmptyParagraphMinHeight } from '../../lib/editor/paragraph-style';
import { EditableRun } from './EditableRun';
import type { CursorPosition } from '../../lib/editor/document';

interface EditableParagraphProps {
  paragraph: Paragraph;
  paraIndex: number;
  cursor: CursorPosition | null;
  composingText?: string;
}

export function EditableParagraph({ paragraph, paraIndex, cursor, composingText }: EditableParagraphProps) {
  const styles = useStyleStore();
  const style = computeParagraphStyle(paragraph, styles);

  // 빈 문단 최소 높이 처리
  const hasContent = paragraph.runs.some(r =>
    r.contents.some(c => c.type === 'text' ? c.value.length > 0 : c.type === 'table' || c.type === 'image')
  );

  if (!hasContent) {
    const minH = computeEmptyParagraphMinHeight(paragraph, styles, style.lineHeight as string | undefined);
    style.minHeight = `${minH}px`;
  }

  return (
    <div style={style} data-para-index={paraIndex}>
      {paragraph.runs.map((run, ri) => (
        <EditableRun
          key={ri}
          run={run}
          paraIndex={paraIndex}
          runIndex={ri}
          cursor={cursor?.runIndex === ri ? cursor : null}
          composingText={cursor?.runIndex === ri ? composingText : ''}
          paraPrIDRef={paragraph.paraPrIDRef}
        />
      ))}
    </div>
  );
}
