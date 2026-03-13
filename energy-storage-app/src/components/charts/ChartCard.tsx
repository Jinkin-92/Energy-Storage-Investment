/**
 * 图表容器组件
 */
import { cn } from '../../utils/cn';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <div className={cn('bg-white rounded-lg border shadow-sm p-4', className)}>
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-[300px]">{children}</div>
    </div>
  );
}