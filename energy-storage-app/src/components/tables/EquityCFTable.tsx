/**
 * 表4: 资本金现金流量表
 */
import { useResultStore } from '../../store/resultStore';
import { DataTable } from './DataTable';

export function EquityCFTable() {
  const { yearly, results, isCalculated } = useResultStore();

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
    createRow('一、现金流入', 'inflow', true),
    createRow('  营业收入', 'revenueVAT'),
    createRow('二、现金流出', 'outflow', true),
    { label: '  资本金', y0: results?.equityAmount || 0, ...displayYears.slice(1).reduce((acc, y) => { acc[`y${y.year}`] = 0; return acc; }, {} as Record<string, number>) },
    createRow('  经营成本', 'operatingCost'),
    createRow('  增值税', 'vatPaid'),
    createRow('  销售税金附加', 'salesSurcharge'),
    createRow('  偿还本金', 'principalRepaid'),
    createRow('  偿还利息', 'interestRepaid'),
    createRow('  所得税', 'incomeTax'),
    createRow('三、资本金净现金流', 'equityCF', true),
    createRow('  累计资本金净现金流', 'cumEquityCF'),
  ];

  return <DataTable title="表4：资本金现金流量表（万元）" columns={columns} data={data} />;
}