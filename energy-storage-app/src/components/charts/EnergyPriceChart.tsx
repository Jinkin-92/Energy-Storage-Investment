/**
 * C10: 电价电量双轴图
 */
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useResultStore } from '../../store/resultStore';
import { useInputStore } from '../../store/inputStore';
import { ChartCard } from './ChartCard';

export function EnergyPriceChart() {
  const { yearly, isCalculated } = useResultStore();
  const { params } = useInputStore();

  if (!isCalculated || yearly.length === 0) return null;

  const data = yearly.slice(1, 7).map(y => ({
    year: `${y.year}年`,
    放电量: y.dischargeKWh,
    充电量: y.chargeKWh,
    容量保持率: y.capacityRetention * 100,
  }));

  return (
    <ChartCard title="电量与容量衰减趋势">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" fontSize={12} />
          <YAxis yAxisId="left" fontSize={12} label={{ value: '万kWh', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" fontSize={12} unit="%" domain={[80, 100]} />
          <Tooltip formatter={(value: number, name: string) =>
            name === '容量保持率' ? `${value.toFixed(1)}%` : `${value.toFixed(2)}万kWh`
          } />
          <Legend />
          <Bar yAxisId="left" dataKey="放电量" fill="#3B82F6" opacity={0.8} />
          <Bar yAxisId="left" dataKey="充电量" fill="#10B981" opacity={0.8} />
          <Line yAxisId="right" type="monotone" dataKey="容量保持率" stroke="#EF4444" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}