/**
 * C06: 净利润分配图
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useResultStore } from '../../store/resultStore';
import { ChartCard } from './ChartCard';

export function ProfitDistributionChart() {
  const { yearly, isCalculated } = useResultStore();

  if (!isCalculated || yearly.length === 0) return null;

  const data = yearly.slice(1, 7).map(y => ({
    year: `${y.year}年`,
    净利润: y.netProfit > 0 ? y.netProfit : 0,
    法定公积金: y.legalReserve,
    可分配利润: y.distributableProfit > 0 ? y.distributableProfit : 0,
  }));

  return (
    <ChartCard title="净利润分配">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}万元`} />
          <Legend />
          <Bar dataKey="净利润" fill="#3B82F6" />
          <Bar dataKey="法定公积金" fill="#10B981" />
          <Bar dataKey="可分配利润" fill="#F59E0B" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}