/**
 * C05: 累计现金流趋势图
 */
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useResultStore } from '../../store/resultStore';
import { ChartCard } from './ChartCard';

export function CashflowTrendChart() {
  const { yearly, results, isCalculated } = useResultStore();

  if (!isCalculated || yearly.length === 0) return null;

  const data = yearly.map(y => ({
    year: y.year === 0 ? '建设期' : `${y.year}年`,
    累计净现金流: y.cumFCFPreTax,
    当年净现金流: y.fcfPreTax,
  }));

  return (
    <ChartCard title={`累计现金流趋势（回收期: ${results?.paybackPreTax.toFixed(2)}年）`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}万元`} />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="累计净现金流" stroke="#3B82F6" fill="#93C5FD" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}