/**
 * 表6: 运营成本费用表
 */
import { useResultStore } from '../../store/resultStore';
import { DataTable } from './DataTable';

export function CostTable() {
  const { yearly, isCalculated } = useResultStore();

  if (!isCalculated || yearly.length === 0) return null;

  const displayYears = yearly.filter((_, i) => i <= 5 || i === yearly.length - 1);

  const columns = [
    { key: 'label', label: '项目' },
    ...displayYears.map(y => ({
      key: `y${y.year}`,
      label: y.year === 0 ? '建设期' : `第${y.year}年`,
    })),
  ];

  const createRow = (label: string, key: string, highlight = false) => ({
    label,
    ...displayYears.reduce((acc, y) => {
      acc[`y${y.year}`] = y[key as keyof typeof y] || 0;
      return acc;
    }, {} as Record<string, number>),
    highlight,
  });

  const data = [
    createRow('一、经营成本', 'operatingCost', true),
    createRow('  运维费', 'omCost'),
    createRow('  人工成本', 'laborCost'),
    createRow('  保险费', 'insurance'),
    createRow('  土地费用', 'landFee'),
    createRow('  购电电费', 'purchasedElec'),
    createRow('  其他费用', 'otherCost'),
    createRow('二、折旧费', 'depreciation'),
    createRow('三、利息支出', 'interest'),
    createRow('四、总成本费用', 'totalCost', true),
  ];

  return <DataTable title="表6：运营成本费用表（万元）" columns={columns} data={data} />;
}