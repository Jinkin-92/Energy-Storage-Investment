/**
 * C03: 年度收益趋势线
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useResultStore } from '../../store/resultStore';
import { ChartCard } from './ChartCard';

export function RevenueTrendChart() {
  const { yearly, isCalculated } = useResultStore();

  if (!isCalculated || yearly.length === 0) return null;

  const data = yearly.slice(1).map(y => ({
    year: `${y.year}年`,
    营业收入: y.revenueVAT,
    净利润: y.netProfit,
    总成本: y.totalCost,
  }));

  return (
    <ChartCard title="年度收益趋势">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}万元`} />
          <Legend />
          <Line type="monotone" dataKey="营业收入" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="净利润" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="总成本" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}