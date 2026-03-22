import { useMemo } from 'react';
import type { PageLayout } from '../../lib/model';
import { hwpunitToMm, hwpunitToPx } from '../../utils/unit-converter';

const RULER_HEIGHT = 14;
const TICK_COLOR = '#555';
const LABEL_COLOR = '#333';
const BG_COLOR = '#e0e0e0';
const MARGIN_BG_COLOR = '#c8c8c8';
const MARKER_COLOR = '#333';

export function Ruler({ pageLayout, scale = 1 }: { pageLayout: PageLayout; scale?: number }) {
  const totalWidthMm = hwpunitToMm(pageLayout.width);
  const leftMarginMm = hwpunitToMm(pageLayout.margin.left);
  const rightMarginMm = hwpunitToMm(pageLayout.margin.right);
  const rightMarginX = totalWidthMm - rightMarginMm;
  const svgWidth = hwpunitToPx(pageLayout.width) * scale;
  const pxPerMm = svgWidth / totalWidthMm;

  const ticks = useMemo(() => {
    const elements: React.ReactElement[] = [];
    const totalMm = Math.round(totalWidthMm);

    for (let mm = 0; mm <= totalMm; mm++) {
      const x = mm * pxPerMm;
      let tickHeight: number;

      if (mm % 10 === 0) {
        tickHeight = RULER_HEIGHT * 0.5;
      } else if (mm % 5 === 0) {
        tickHeight = RULER_HEIGHT * 0.3;
      } else {
        tickHeight = RULER_HEIGHT * 0.18;
      }

      elements.push(
        <line
          key={`t${mm}`}
          x1={x}
          y1={RULER_HEIGHT}
          x2={x}
          y2={RULER_HEIGHT - tickHeight}
          stroke={TICK_COLOR}
          strokeWidth={0.5}
        />
      );

      if (mm % 10 === 0 && mm !== 0 && mm !== totalMm) {
        let label: number;
        if (mm < leftMarginMm) {
          label = Math.round((leftMarginMm - mm) / 10);
        } else if (mm > rightMarginX) {
          label = Math.round((mm - rightMarginX) / 10);
        } else {
          label = Math.round((mm - leftMarginMm) / 10);
        }

        if (label > 0) {
          elements.push(
            <text
              key={`l${mm}`}
              x={x}
              y={RULER_HEIGHT * 0.42}
              textAnchor="middle"
              fontSize={9}
              fill={LABEL_COLOR}
              fontFamily="sans-serif"
            >
              {label}
            </text>
          );
        }
      }
    }

    return elements;
  }, [totalWidthMm, leftMarginMm, rightMarginX, pxPerMm]);

  const markerW = 6;
  const markerH = 5;
  const leftX = leftMarginMm * pxPerMm;
  const rightX = rightMarginX * pxPerMm;

  return (
    <div style={{ width: svgWidth, margin: '0 auto' }}>
      <svg
        width={svgWidth}
        height={RULER_HEIGHT}
        style={{ display: 'block' }}
      >
        {/* 전체 배경 */}
        <rect x={0} y={0} width={svgWidth} height={RULER_HEIGHT} fill={BG_COLOR} />

        {/* 왼쪽 여백 영역 */}
        <rect x={0} y={0} width={leftX} height={RULER_HEIGHT} fill={MARGIN_BG_COLOR} />

        {/* 오른쪽 여백 영역 */}
        <rect x={rightX} y={0} width={svgWidth - rightX} height={RULER_HEIGHT} fill={MARGIN_BG_COLOR} />

        {/* 눈금 + 라벨 */}
        {ticks}

        {/* 왼쪽 여백 마커 */}
        <polygon
          points={`${leftX - markerW / 2},0 ${leftX + markerW / 2},0 ${leftX},${markerH}`}
          fill={MARKER_COLOR}
        />

        {/* 오른쪽 여백 마커 */}
        <polygon
          points={`${rightX - markerW / 2},0 ${rightX + markerW / 2},0 ${rightX},${markerH}`}
          fill={MARKER_COLOR}
        />
      </svg>
    </div>
  );
}
