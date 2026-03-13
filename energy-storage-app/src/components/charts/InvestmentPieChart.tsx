/**
 * C01: 总投资构成饼图
 */
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useResultStore } from '../../store/resultStore';
import { ChartCard } from './ChartCard';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function InvestmentPieChart() {
  const { results, isCalculated } = useResultStore();

  if (!isCalculated || !results) return null;

  const data = [
    { name: '设备购置费', value: results.staticInvestment * 0.65 },
    { name: '建筑工程费', value: results.staticInvestment * 0.15 },
    { name: '安装工程费', value: results.staticInvestment * 0.10 },
    { name: '其他费用', value: results.staticInvestment * 0.10 },
  ];

  return (
    <ChartCard title="总投资构成">
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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}万元`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}