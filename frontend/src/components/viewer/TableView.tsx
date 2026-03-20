import type { Table, TableCell } from '../../lib/model';
import { ParagraphView } from './ParagraphView';
import { useStyleStore } from './StyleContext';
import { hwpunitToPx, borderLineToCss } from '../../utils/unit-converter';

export function TableView({ table }: { table: Table }) {
  const tableWidth = hwpunitToPx(table.width);

  // 첫 행의 셀들에서 colgroup 너비 추출 (colSpan=1인 셀들만)
  const colWidths: number[] = [];
  if (table.rows.length > 0) {
    for (const cell of table.rows[0].cells) {
      if (cell.colSpan === 1 && cell.width) {
        colWidths.push(hwpunitToPx(cell.width));
      }
    }
  }

  return (
    <table
      style={{
        width: tableWidth,
        maxWidth: '100%',
        borderCollapse: 'collapse',
        tableLayout: colWidths.length > 0 ? 'fixed' : 'auto',
        margin: '0',
      }}
    >
      {colWidths.length > 0 && (
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
        lineHeight: 1.3,
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
