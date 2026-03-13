/**
 * 核心指标展示卡片
 */
import { useResultStore } from '../../store/resultStore';

const getIRRRating = (irr: number): { label: string; color: string } => {
  if (irr >= 0.10) return { label: '优秀', color: 'text-green-600' };
  if (irr >= 0.08) return { label: '良好', color: 'text-blue-600' };
  if (irr >= 0.06) return { label: '一般', color: 'text-yellow-600' };
  return { label: '较差', color: 'text-red-600' };
};

export function MetricCards() {
  const { results, isCalculated } = useResultStore();

  if (!isCalculated || !results) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
        请输入参数后点击"开始计算"
      </div>
    );
  }

  const irrRating = getIRRRating(results.irrPreTax);

  const metrics = [
    {
      label: '全投资IRR(税前)',
      value: `${(results.irrPreTax * 100).toFixed(2)}%`,
      rating: irrRating.label,
      color: irrRating.color,
    },
    {
      label: '资本金IRR',
      value: `${(results.equityIRR * 100).toFixed(2)}%`,
    },
    {
      label: '投资回收期(税前)',
      value: `${results.paybackPreTax.toFixed(2)}年`,
    },
    {
      label: '静态总投资',
      value: `${results.staticInvestment.toFixed(2)}万元`,
    },
    {
      label: '动态总投资',
      value: `${results.dynamicInvestment.toFixed(2)}万元`,
    },
    {
      label: '年均净利润',
      value: `${results.avgNetProfit.toFixed(2)}万元`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">{m.label}</div>
          <div className={`text-xl font-bold ${m.color || 'text-gray-900'}`}>
            {m.value}
          </div>
          {m.rating && (
            <div className={`text-xs mt-1 ${m.color}`}>{m.rating}</div>
          )}
        </div>
      ))}
    </div>
  );
}