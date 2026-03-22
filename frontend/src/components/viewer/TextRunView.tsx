import type { TextRun, RunContent } from '../../lib/model';
import { useStyleStore } from './StyleContext';
import { charHeightToPt, hwpunitToPx } from '../../utils/unit-converter';
import { TableView } from './TableView';
import { useImageUrl } from './ImageContext';

// 1단계: 명시적 매핑 (주요 폰트)
// 우선순위: 로컬 한컴폰트 → 함초롬(제한없음) → Noto CDN → 시스템 기본
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

// 2단계: 자동 분류 fallback (매핑에 없는 폰트)
const SERIF_KEYWORDS = /바탕|명조|궁서|Batang|Myeongjo|Serif|Gungsuh/i;
const SANS_KEYWORDS = /돋움|고딕|굴림|Gothic|Dotum|Gulim|Sans/i;

function getFontFamily(fontFace: string): string {
  // 1단계: 명시적 매핑 확인
  const mapped = FONT_FALLBACKS[fontFace];
  if (mapped) return mapped;

  // 2단계: 폰트 이름에서 종류 자동 감지
  if (SERIF_KEYWORDS.test(fontFace)) {
    return `"${fontFace}", ${SERIF_CHAIN}`;
  }
  // 고딕 계열 또는 판별 불가 → sans-serif 기본
  return `"${fontFace}", ${SANS_CHAIN}`;
}

// HWP 기본 탭 간격: 8000 hwpunit (~106.7px)
const DEFAULT_TAB_WIDTH_HWPUNIT = 8000;

export function TextRunView({ run, paraPrIDRef }: { run: TextRun; paraPrIDRef?: number }) {
  const styles = useStyleStore();
  const charShape = styles.charShapes.get(run.charPrIDRef);

  const hangulFontId = charShape?.fontRef.hangul ?? 0;
  const hangulFonts = styles.fonts.get('HANGUL');
  const fontInfo = hangulFonts?.get(hangulFontId);
  const fontFamily = fontInfo ? getFontFamily(fontInfo.face) : 'sans-serif';

  // 규칙 1: 탭 너비를 tabPr에서 가져옴
  const paraShape = paraPrIDRef !== undefined ? styles.paraShapes.get(paraPrIDRef) : undefined;
  const tabPr = paraShape ? styles.tabProperties.get(paraShape.tabPrIDRef) : undefined;
  const tabWidthPx = tabPr?.items.length
    ? hwpunitToPx(tabPr.items[0].pos)
    : hwpunitToPx(DEFAULT_TAB_WIDTH_HWPUNIT);

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
        <RunContentView key={i} content={content} tabWidthPx={tabWidthPx} />
      ))}
    </span>
  );
}

function RunContentView({ content, tabWidthPx }: { content: RunContent; tabWidthPx: number }) {
  switch (content.type) {
    case 'text':
      return <>{content.value}</>;
    case 'lineBreak':
      return <br />;
    case 'tab':
      return <span style={{ display: 'inline-block', width: tabWidthPx }} />;
    case 'table':
      return <TableView table={content.table} />;
    case 'image':
      return <ImageView image={content.image} />;
    case 'nbSpace':
      return <>&nbsp;</>;
    case 'fwSpace':
      return <span style={{ display: 'inline-block', width: '1em' }}>&nbsp;</span>;
    case 'secDef':
    case 'columnDef':
      return null; // 레이아웃 제어 요소 — 시각적 출력 없음
    case 'unknown':
      // 규칙 8: 미지원 요소는 placeholder로 표시 (레이아웃 보존)
      return (
        <span
          style={{
            display: 'inline-block',
            backgroundColor: '#f3f4f6',
            border: '1px dashed #d1d5db',
            padding: '2px 6px',
            fontSize: '10px',
            color: '#9ca3af',
            verticalAlign: 'middle',
          }}
          title={`미지원 요소: ${content.tagName}`}
        >
          [{content.tagName}]
        </span>
      );
    default:
      return null;
  }
}

function ImageView({ image }: { image: import('../../lib/model').ImageObject }) {
  const { binaryItemIDRef, width, height, pos } = image;
  const url = useImageUrl(binaryItemIDRef);
  const widthPx = hwpunitToPx(width);
  const heightPx = hwpunitToPx(height);

  // 규칙 9: treatAsChar=false → 절대 위치
  const isAbsolute = pos && !pos.treatAsChar;

  const positionStyle: React.CSSProperties = isAbsolute
    ? {
        position: 'absolute',
        top: pos.vertOffset ? hwpunitToPx(pos.vertOffset) : undefined,
        left: pos.horzOffset ? hwpunitToPx(pos.horzOffset) : undefined,
        zIndex: 1,
      }
    : { verticalAlign: 'bottom' };

  // 규칙 10: 미지원 포맷 또는 미로드 이미지 → placeholder (크기 보존)
  if (!url || url.startsWith('unsupported:')) {
    const format = url?.replace('unsupported:', '').toUpperCase() ?? '';
    return (
      <span
        style={{
          display: 'inline-block',
          width: widthPx,
          height: heightPx,
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          ...positionStyle,
        }}
        title={format ? `미지원 이미지 형식: ${format}` : '이미지 로드 실패'}
      />
    );
  }

  return (
    <img
      src={url}
      alt=""
      style={{
        width: widthPx,
        height: heightPx,
        objectFit: 'contain',
        ...positionStyle,
      }}
    />
  );
}
