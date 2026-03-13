/**
 * C07: 还本付息计划图
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { useResultStore } from '../../store/resultStore';
import { ChartCard } from './ChartCard';

export function LoanRepaymentChart() {
  const { yearly, isCalculated } = useResultStore();

  if (!isCalculated || yearly.length === 0) return null;

  const data = yearly.slice(1, 11).map(y => ({
    year: `${y.year}年`,
    偿还本金: y.principalRepaid,
    偿还利息: y.interestRepaid,
    贷款余额: y.loanBalance,
  }));

  return (
    <ChartCard title="还本付息计划">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" fontSize={12} />
          <YAxis yAxisId="left" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" fontSize={12} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}万元`} />
          <Legend />
          <Bar yAxisId="left" dataKey="偿还本金" fill="#3B82F6" />
          <Bar yAxisId="left" dataKey="偿还利息" fill="#F59E0B" />
          <Line yAxisId="right" type="monotone" dataKey="贷款余额" stroke="#EF4444" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}