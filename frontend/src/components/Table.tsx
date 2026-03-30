import React from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  className?: string;
  emptyState?: React.ReactNode;
}

export function Table<T extends { id?: string | number }>({
  data,
  columns,
  onRowClick,
  className = '',
  emptyState,
}: TableProps<T>): React.ReactElement {
  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`
                transition-colors duration-150
                ${onRowClick ? 'hover:bg-neutral-50 cursor-pointer' : ''}
              `}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 text-sm text-neutral-700"
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
