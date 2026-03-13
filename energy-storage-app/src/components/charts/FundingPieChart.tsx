/**
 * C02: 资金筹措结构图
 */
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useResultStore } from '../../store/resultStore';
import { ChartCard } from './ChartCard';

const COLORS = ['#3B82F6', '#10B981'];

export function FundingPieChart() {
  const { results, isCalculated } = useResultStore();

  if (!isCalculated || !results) return null;

  const data = [
    { name: '资本金', value: results.equityAmount },
    { name: '长期借款', value: results.loanAmount },
  ];

  return (
    <ChartCard title="资金筹措结构">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}万元`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}