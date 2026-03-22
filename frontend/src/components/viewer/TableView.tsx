import type { Table, TableCell } from '../../lib/model';
import { ParagraphView } from './ParagraphView';
import { useStyleStore } from './StyleContext';
import { hwpunitToPx, borderLineToCss } from '../../utils/unit-converter';

export function TableView({ table }: { table: Table }) {
  const tableWidth = hwpunitToPx(table.width);

  // 규칙 4: 전체 행 순회, colAddr 기반으로 컬럼 너비 매핑
  const colWidths: number[] = new Array(table.colCnt).fill(0);
  for (const row of table.rows) {
    for (const cell of row.cells) {
      if (cell.colSpan === 1 && cell.width && colWidths[cell.colAddr] === 0) {
        colWidths[cell.colAddr] = hwpunitToPx(cell.width);
      }
    }
  }

  return (
    <table
      style={{
        width: tableWidth,
        height: table.height ? hwpunitToPx(table.height) : undefined,
        maxWidth: '100%',
        borderCollapse: 'collapse',
        tableLayout: colWidths.some(w => w > 0) ? 'fixed' : 'auto',
        margin: '0',
      }}
    >
      {colWidths.some(w => w > 0) && (
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
      )}
      <tbody>
        {table.rows.map((row, ri) => (
          <tr key={ri}>
            {row.cells.map((cell, ci) => (
              <CellView key={ci} cell={cell} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CellView({ cell }: { cell: TableCell }) {
  const styles = useStyleStore();
  const borderFill = styles.borderFills.get(cell.borderFillIDRef);

  const bgColor = borderFill?.faceColor && borderFill.faceColor !== 'none'
    ? borderFill.faceColor
    : undefined;

  const borderTop = borderFill ? borderLineToCss(borderFill.topBorder) : '1px solid #000';
  const borderBottom = borderFill ? borderLineToCss(borderFill.bottomBorder) : '1px solid #000';
  const borderLeft = borderFill ? borderLineToCss(borderFill.leftBorder) : '1px solid #000';
  const borderRight = borderFill ? borderLineToCss(borderFill.rightBorder) : '1px solid #000';

  return (
    <td
      colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
      rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
      style={{
        borderTop,
        borderBottom,
        borderLeft,
        borderRight,
        backgroundColor: bgColor,
        padding: `${hwpunitToPx(cell.cellMargin.top)}px ${hwpunitToPx(cell.cellMargin.right)}px ${hwpunitToPx(cell.cellMargin.bottom)}px ${hwpunitToPx(cell.cellMargin.left)}px`,
        height: cell.height ? hwpunitToPx(cell.height) : undefined,
        verticalAlign: cell.vertAlign === 'CENTER' ? 'middle'
          : cell.vertAlign === 'BOTTOM' ? 'bottom' : 'top',
        overflow: 'hidden',
        wordBreak: 'keep-all',
      }}
    >
      {cell.paragraphs.map((p, i) => (
        <ParagraphView key={i} paragraph={p} />
      ))}
    </td>
  );
}
