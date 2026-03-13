/**
 * C04: 运营成本构成图
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useResultStore } from '../../store/resultStore';
import { ChartCard } from './ChartCard';

export function CostBreakdownChart() {
  const { yearly, isCalculated } = useResultStore();

  if (!isCalculated || yearly.length === 0) return null;

  // 使用第3年数据（典型运营年）
  const year3 = yearly[3];
  const data = [
    { name: '折旧费', value: year3.depreciation },
    { name: '运维费', value: year3.omCost },
    { name: '人工成本', value: year3.laborCost },
    { name: '保险费', value: year3.insurance },
    { name: '利息支出', value: year3.interest },
    { name: '购电电费', value: year3.purchasedElec },
  ];

  return (
    <ChartCard title="运营成本构成（第3年）">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" fontSize={12} />
          <YAxis dataKey="name" type="category" fontSize={12} width={80} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}万元`} />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}