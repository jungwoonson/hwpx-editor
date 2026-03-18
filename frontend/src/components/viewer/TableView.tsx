import type { Table, TableCell } from '../../lib/model';
import { ParagraphView } from './ParagraphView';
import { hwpunitToPx } from '../../utils/unit-converter';

export function TableView({ table }: { table: Table }) {
  const tableWidth = hwpunitToPx(table.width);

  return (
    <table
      style={{
        width: tableWidth,
        maxWidth: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        margin: '4px 0',
      }}
    >
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
  return (
    <td
      colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
      rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
      style={{
        width: cell.width ? hwpunitToPx(cell.width) : undefined,
        border: '1px solid #000',
        padding: `${hwpunitToPx(cell.cellMargin.top)}px ${hwpunitToPx(cell.cellMargin.right)}px ${hwpunitToPx(cell.cellMargin.bottom)}px ${hwpunitToPx(cell.cellMargin.left)}px`,
        verticalAlign: 'middle',
        fontSize: '9pt',
      }}
    >
      {cell.paragraphs.map((p, i) => (
        <ParagraphView key={i} paragraph={p} />
      ))}
    </td>
  );
}
