import { useRef, useState, useEffect, useCallback } from 'react';
import type { Section, Paragraph } from '../../lib/model';
import { ParagraphView } from './ParagraphView';
import { hwpunitToPx } from '../../utils/unit-converter';

interface PageContent {
  paragraphs: Paragraph[];
}

export function PageView({ section }: { section: Section }) {
  const { pageLayout } = section;
  const pageWidth = hwpunitToPx(pageLayout.width);
  const pageHeight = hwpunitToPx(pageLayout.height);
  const paddingTop = hwpunitToPx(pageLayout.margin.top);
  const paddingBottom = hwpunitToPx(pageLayout.margin.bottom);
  const paddingLeft = hwpunitToPx(pageLayout.margin.left);
  const paddingRight = hwpunitToPx(pageLayout.margin.right);
  const contentHeight = pageHeight - paddingTop - paddingBottom;

  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [measured, setMeasured] = useState(false);

  const splitIntoPages = useCallback(() => {
    const container = measureRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    const result: PageContent[] = [];
    let currentPage: Paragraph[] = [];
    let usedHeight = 0;

    children.forEach((child, idx) => {
      const childHeight = child.getBoundingClientRect().height;
      const paragraph = section.paragraphs[idx];
      if (!paragraph) return;

      // 현재 페이지에 남은 공간이 부족하면 새 페이지로
      if (usedHeight > 0 && usedHeight + childHeight > contentHeight) {
        result.push({ paragraphs: currentPage });
        currentPage = [];
        usedHeight = 0;
      }

      currentPage.push(paragraph);
      usedHeight += childHeight;
    });

    // 마지막 페이지
    if (currentPage.length > 0) {
      result.push({ paragraphs: currentPage });
    }

    // 최소 1페이지
    if (result.length === 0) {
      result.push({ paragraphs: section.paragraphs });
    }

    setPages(result);
    setMeasured(true);
  }, [section.paragraphs, contentHeight]);

  useEffect(() => {
    setMeasured(false);
    // 측정용 렌더 후 다음 프레임에서 분할
    requestAnimationFrame(() => {
      splitIntoPages();
    });
  }, [splitIntoPages]);

  const pageStyle: React.CSSProperties = {
    width: pageWidth,
    maxWidth: '100%',
    height: pageHeight,
    backgroundColor: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    margin: '24px auto',
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 2,
  };

  return (
    <div style={{ width: pageWidth, maxWidth: '100%', margin: '0 auto' }}>
      {/* 1패스: 숨겨진 측정 컨테이너 */}
      <div
        ref={measureRef}
        style={{
          width: pageWidth - paddingLeft - paddingRight,
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          left: -9999,
        }}
      >
        {section.paragraphs.map((p, i) => (
          <ParagraphView key={i} paragraph={p} />
        ))}
      </div>

      {/* 2패스: 실제 페이지 렌더 */}
      {measured && pages.map((page, pageIdx) => (
        <div key={pageIdx} style={pageStyle}>
          {page.paragraphs.map((p, i) => (
            <ParagraphView key={i} paragraph={p} />
          ))}
        </div>
      ))}

      {/* 측정 전 로딩 표시 */}
      {!measured && (
        <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#999' }}>페이지 분할 중...</span>
        </div>
      )}
    </div>
  );
}
