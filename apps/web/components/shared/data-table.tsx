'use client';

import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No records found',
  isLoading,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                {columns.map((col) => (
                  <td key={String(col.key)} className="py-3 px-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={(row as any).id ?? idx}
                className={cn(
                  'border-b border-gray-100 last:border-0',
                  onRowClick && 'hover:bg-gray-50 cursor-pointer',
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => {
                  const value = (row as any)[col.key];
                  return (
                    <td key={String(col.key)} className={cn('py-3 px-4', col.className)}>
                      {col.render ? col.render(value, row) : String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
