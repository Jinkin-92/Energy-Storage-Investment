/**
 * C09: 投资回收期标注图
 */
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter } from 'recharts';
import { useResultStore } from '../../store/resultStore';
import { ChartCard } from './ChartCard';

export function PaybackPeriodChart() {
  const { yearly, results, isCalculated } = useResultStore();

  if (!isCalculated || yearly.length === 0 || !results) return null;

  const paybackYear = results.paybackPreTax;

  const data = yearly.map(y => ({
    year: y.year,
    累计净现金流: y.cumFCFPreTax,
  }));

  return (
    <ChartCard title={`投资回收期分析`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" fontSize={12} label={{ value: '年份', position: 'bottom' }} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}万元`} />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <ReferenceLine x={paybackYear} stroke="#EF4444" strokeDasharray="5 5" label={`回收期: ${paybackYear.toFixed(2)}年`} />
          <Area type="monotone" dataKey="累计净现金流" stroke="#3B82F6" fill="#93C5FD" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}