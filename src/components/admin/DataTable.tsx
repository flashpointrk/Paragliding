/**
 * Generic admin table.
 *
 * Server-component friendly: it holds no state and only renders.
 * Column definitions (header plus a cell render function) arrive as props, and
 * `actions` renders an action node (edit/delete and so on) for each row.
 *
 * Styling:
 *  - Glass container with a hover highlight (glass-light)
 *  - A subtle header row (sand)
 *  - Empty state: EmptyState
 */

import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';

export interface DataTableColumn<T> {
  /** Header text. */
  header: string;
  /** Function that renders the cell contents. */
  cell: (row: T) => React.ReactNode;
  /** Extra classes (e.g. hide on mobile). */
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Action area for each row (appended on the right). */
  actions?: (row: T) => React.ReactNode;
  /** Heading for the empty list. */
  emptyHeading?: string;
  /** Description for the empty list. */
  emptyDescription?: string;
  /** Produces the key for a row. */
  rowKey: (row: T) => string;
}

export function DataTable<T>({
  columns,
  rows,
  actions,
  emptyHeading = 'Record not found',
  emptyDescription = 'No records match your search.',
  rowKey,
}: DataTableProps<T>): JSX.Element {
  const allColumns = actions
    ? [...columns, { header: 'Actions', cell: (row: T) => actions(row) }]
    : columns;

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-sand-100/60 text-left">
              {allColumns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={cn(
                    'px-4 py-3 font-display text-xs font-semibold uppercase tracking-wide text-navy-600',
                    (col as DataTableColumn<T>).className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className="px-4 py-2">
                  <EmptyState
                    icon="Search"
                    title={emptyHeading}
                    description={emptyDescription}
                    className="border-0 bg-transparent shadow-none"
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="group border-b border-navy-50 transition-colors last:border-0 hover:bg-sky-50/50"
                >
                  {allColumns.map((col, i) => (
                    <td
                      key={i}
                      className={cn(
                        'px-4 py-3 text-navy-800 transition-colors',
                        (col as DataTableColumn<T>).className
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
