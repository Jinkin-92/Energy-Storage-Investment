/**
 * 表3: 项目投资现金流量表
 */
import { useResultStore } from '../../store/resultStore';
import { DataTable } from './DataTable';

export function ProjectCFTable() {
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
    createRow('一、现金流入', 'inflow', true),
    createRow('  营业收入', 'revenueVAT'),
    createRow('  增值税即征即退', 'vatRefundAmount'),
    createRow('  回收固定资产余值', 'salvageValue'),
    createRow('二、现金流出', 'outflow', true),
    createRow('  建设投资', 'staticInvestment'),
    createRow('  经营成本', 'operatingCost'),
    createRow('  增值税', 'vatPaid'),
    createRow('  销售税金附加', 'salesSurcharge'),
    createRow('三、税前净现金流', 'fcfPreTax', true),
    createRow('  累计税前净现金流', 'cumFCFPreTax'),
    createRow('四、税后净现金流', 'fcfPostTax'),
    createRow('  累计税后净现金流', 'cumFCFPostTax'),
  ];

  return <DataTable title="表3：项目投资现金流量表（万元）" columns={columns} data={data} />;
}