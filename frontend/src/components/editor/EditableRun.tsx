import type { TextRun } from '../../lib/model';
import { useStyleStore } from '../viewer/StyleContext';
import { charHeightToPt, hwpunitToPx } from '../../utils/unit-converter';
import type { CursorPosition } from '../../lib/editor/document';

// 1단계: 명시적 매핑 (주요 폰트)
const SERIF_CHAIN = '"한컴바탕", "함초롬바탕", "HCR Batang", "Noto Serif KR", "Batang", serif';
const SANS_CHAIN = '"한컴돋움", "함초롬돋움", "HCR Dotum", "Noto Sans KR", "Dotum", sans-serif';

const FONT_FALLBACKS: Record<string, string> = {
  '바탕': SERIF_CHAIN,
  '한컴바탕': SERIF_CHAIN,
  '함초롬바탕': `"함초롬바탕", "HCR Batang", "Noto Serif KR", "Batang", serif`,
  '굴림': `"Gulim", ${SANS_CHAIN}`,
  '돋움': SANS_CHAIN,
  '한컴돋움': SANS_CHAIN,
  '함초롬돋움': `"함초롬돋움", "HCR Dotum", "Noto Sans KR", "Dotum", sans-serif`,
  '돋움체': `"DotumChe", "Noto Sans Mono KR", monospace`,
  '궁서': `"Gungsuh", ${SERIF_CHAIN}`,
  '맑은 고딕': `"Malgun Gothic", ${SANS_CHAIN}`,
  '나눔고딕': `"Nanum Gothic", ${SANS_CHAIN}`,
  '나눔명조': `"Nanum Myeongjo", ${SERIF_CHAIN}`,
  '나눔바른고딕': `"NanumBarunGothic", ${SANS_CHAIN}`,
  '한양신명조': SERIF_CHAIN,
  '한양중고딕': SANS_CHAIN,
};

// 2단계: 자동 분류 fallback
const SERIF_KEYWORDS = /바탕|명조|궁서|Batang|Myeongjo|Serif|Gungsuh/i;

function getFontFamily(fontFace: string): string {
  const mapped = FONT_FALLBACKS[fontFace];
  if (mapped) return mapped;
  if (SERIF_KEYWORDS.test(fontFace)) {
    return `"${fontFace}", ${SERIF_CHAIN}`;
  }
  return `"${fontFace}", ${SANS_CHAIN}`;
}

interface EditableRunProps {
  run: TextRun;
  paraIndex: number;
  runIndex: number;
  cursor: CursorPosition | null;
  composingText?: string;
  paraPrIDRef?: number;
}

export function EditableRun({ run, paraIndex, runIndex, cursor, composingText, paraPrIDRef }: EditableRunProps) {
  const styles = useStyleStore();
  const charShape = styles.charShapes.get(run.charPrIDRef);

  const hangulFontId = charShape?.fontRef.hangul ?? 0;
  const hangulFonts = styles.fonts.get('HANGUL');
  const fontInfo = hangulFonts?.get(hangulFontId);
  const fontFamily = fontInfo ? getFontFamily(fontInfo.face) : 'sans-serif';

  const tabPr = (() => {
    if (paraPrIDRef === undefined) return undefined;
    const paraShape = styles.paraShapes.get(paraPrIDRef);
    return paraShape ? styles.tabProperties.get(paraShape.tabPrIDRef) : undefined;
  })();
  const tabWidthPx = tabPr?.items.length
    ? hwpunitToPx(tabPr.items[0].pos)
    : hwpunitToPx(8000);

  const style: React.CSSProperties = {
    fontFamily,
    fontSize: charShape ? `${charHeightToPt(charShape.height)}pt` : undefined,
    fontWeight: charShape?.bold ? 'bold' : 'normal',
    fontStyle: charShape?.italic ? 'italic' : 'normal',
    color: charShape?.textColor !== '#000000' ? charShape?.textColor : undefined,
    textDecoration: charShape?.underline.type !== 'NONE' ? 'underline' : undefined,
    letterSpacing: charShape?.spacing.hangul ? `${charShape.spacing.hangul / 100}em` : undefined,
  };

  // 런 내 텍스트의 글로벌 오프셋 추적
  let globalOffset = 0;

  return (
    <span style={style} data-para-index={paraIndex} data-run-index={runIndex}>
      {run.contents.map((content, ci) => {
        switch (content.type) {
          case 'text': {
            const startOffset = globalOffset;
            globalOffset += content.value.length;

            // 커서가 이 텍스트 content 안에 있는지 확인
            if (cursor && cursor.offset >= startOffset && cursor.offset <= startOffset + content.value.length) {
              const innerOffset = cursor.offset - startOffset;
              const before = content.value.slice(0, innerOffset);
              const after = content.value.slice(innerOffset);
              return (
                <span key={ci}>
                  {before}
                  {composingText ? (
                    <span style={{ textDecoration: 'underline' }}>{composingText}</span>
                  ) : (
                    <Cursor />
                  )}
                  {after}
                </span>
              );
            }
            return <span key={ci}>{content.value}</span>;
          }
          case 'lineBreak':
            return <br key={ci} />;
          case 'tab':
            return <span key={ci} style={{ display: 'inline-block', width: tabWidthPx }} />;
          case 'nbSpace':
            return <span key={ci}>&nbsp;</span>;
          case 'fwSpace':
            return <span key={ci} style={{ display: 'inline-block', width: '1em' }}>&nbsp;</span>;
          case 'secDef':
          case 'columnDef':
            return null;
          default:
            return null;
        }
      })}
      {/* 빈 런에 커서가 있는 경우는 위의 contents.map에서 이미 처리됨 */}
    </span>
  );
}

function Cursor() {
  return (
    <span
      className="editor-cursor"
      style={{
        display: 'inline-block',
        width: 1,
        height: '1.1em',
        backgroundColor: '#000',
        verticalAlign: 'text-bottom',
        pointerEvents: 'none',
      }}
    />
  );
}
