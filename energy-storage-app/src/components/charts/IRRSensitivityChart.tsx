/**
 * C08: IRR灵敏度龙卷风图
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { useInputStore } from '../../store/inputStore';
import { runEngine } from '../../engine';
import { ChartCard } from './ChartCard';

export function IRRSensitivityChart() {
  const { params } = useInputStore();

  // 计算基准IRR
  const baseResult = runEngine(params);
  const baseIRR = baseResult.results.irrPreTax * 100;

  // 计算各参数变化±10%对IRR的影响
  const factors = [
    { name: '放电电价', key: 'dischargePriceVAT', base: params.dischargePriceVAT },
    { name: '充电电价', key: 'chargePriceVAT', base: params.chargePriceVAT },
    { name: '静态投资', key: 'staticInvestment', base: params.staticInvestment },
    { name: '年调度次数', key: 'annualCycles', base: params.annualCycles },
    { name: '贷款利率', key: 'loanRateOp', base: params.loanRateOp },
  ];

  const data = factors.map(f => {
    const highParams = { ...params, [f.key]: f.base * 1.1 };
    const lowParams = { ...params, [f.key]: f.base * 0.9 };
    const highIRR = runEngine(highParams).results.irrPreTax * 100;
    const lowIRR = runEngine(lowParams).results.irrPreTax * 100;

    return {
      name: f.name,
      低值: lowIRR - baseIRR,
      高值: highIRR - baseIRR,
      range: [lowIRR - baseIRR, highIRR - baseIRR],
    };
  }).sort((a, b) => Math.abs(b.range[1] - b.range[0]) - Math.abs(a.range[1] - a.range[0]));

  return (
    <ChartCard title={`IRR敏感性分析（基准: ${baseIRR.toFixed(2)}%）`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" fontSize={12} unit="%" />
          <YAxis dataKey="name" type="category" fontSize={12} width={80} />
          <Tooltip formatter={(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`} />
          <ReferenceLine x={0} stroke="#666" />
          <Bar dataKey="低值" fill="#EF4444" />
          <Bar dataKey="高值" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}