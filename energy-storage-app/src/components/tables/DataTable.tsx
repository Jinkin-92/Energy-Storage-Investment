/**
 * 通用财务表格组件
 */
import { cn } from '../../utils/cn';

interface Column {
  key: string;
  label: string;
  className?: string;
  format?: (value: number) => string;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: Record<string, number | string>[];
  className?: string;
}

const defaultFormat = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return value.toFixed(2);
};

export function DataTable({ title, columns, data, className }: DataTableProps) {
  return (
    <div className={cn('bg-white rounded-lg border shadow-sm overflow-hidden', className)}>
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-3 py-2 text-right font-medium text-gray-600 whitespace-nowrap',
                    col.key === 'label' && 'text-left',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  'border-b hover:bg-gray-50',
                  row.highlight && 'bg-blue-50'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-3 py-2 text-right',
                      col.key === 'label' && 'text-left font-medium text-gray-700',
                      row.highlight && 'font-medium'
                    )}
                  >
                    {col.key === 'label'
                      ? row[col.key]
                      : col.format
                        ? col.format(Number(row[col.key]))
                        : defaultFormat(Number(row[col.key]))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}