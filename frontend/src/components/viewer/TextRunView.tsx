import type { TextRun, RunContent } from '../../lib/model';
import { useStyleStore } from './StyleContext';
import { charHeightToPt } from '../../utils/unit-converter';
import { TableView } from './TableView';

const FONT_FALLBACKS: Record<string, string> = {
  '바탕': '"Noto Serif KR", "Batang", serif',
  '한컴바탕': '"Noto Serif KR", "Batang", serif',
  '굴림': '"Noto Sans KR", "Gulim", sans-serif',
  '돋움': '"Noto Sans KR", "Dotum", sans-serif',
  '돋움체': '"Noto Sans Mono KR", "DotumChe", monospace',
  '궁서': '"Noto Serif KR", "Gungsuh", serif',
  '한컴돋움': '"Noto Sans KR", "Dotum", sans-serif',
};

function getFontFamily(fontFace: string): string {
  return FONT_FALLBACKS[fontFace] ?? `"${fontFace}", sans-serif`;
}

export function TextRunView({ run }: { run: TextRun }) {
  const styles = useStyleStore();
  const charShape = styles.charShapes.get(run.charPrIDRef);

  const hangulFontId = charShape?.fontRef.hangul ?? 0;
  const hangulFonts = styles.fonts.get('HANGUL');
  const fontInfo = hangulFonts?.get(hangulFontId);
  const fontFamily = fontInfo ? getFontFamily(fontInfo.face) : 'sans-serif';

  const style: React.CSSProperties = {
    fontFamily,
    fontSize: charShape ? `${charHeightToPt(charShape.height)}pt` : undefined,
    fontWeight: charShape?.bold ? 'bold' : 'normal',
    fontStyle: charShape?.italic ? 'italic' : 'normal',
    color: charShape?.textColor !== '#000000' ? charShape?.textColor : undefined,
    textDecoration: charShape?.underline.type !== 'NONE' ? 'underline' : undefined,
    letterSpacing: charShape?.spacing.hangul ? `${charShape.spacing.hangul / 100}em` : undefined,
  };

  return (
    <span style={style}>
      {run.contents.map((content, i) => (
        <RunContentView key={i} content={content} />
      ))}
    </span>
  );
}

function RunContentView({ content }: { content: RunContent }) {
  switch (content.type) {
    case 'text':
      return <>{content.value}</>;
    case 'lineBreak':
      return <br />;
    case 'tab':
      return <span style={{ display: 'inline-block', width: '2em' }} />;
    case 'table':
      return <TableView table={content.table} />;
    case 'nbSpace':
      return <>&nbsp;</>;
    case 'fwSpace':
      return <span style={{ display: 'inline-block', width: '1em' }}>&nbsp;</span>;
    case 'secDef':
    case 'columnDef':
    case 'unknown':
      return null;
    default:
      return null;
  }
}
