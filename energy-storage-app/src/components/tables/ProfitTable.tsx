/**
 * 表2: 利润与利润分配表
 */
import { useResultStore } from '../../store/resultStore';
import { DataTable } from './DataTable';

export function ProfitTable() {
  const { yearly, isCalculated } = useResultStore();

  if (!isCalculated || yearly.length === 0) return null;

  // 只显示前5年 + 最后一年
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
    createRow('一、营业收入', 'revenueVAT', true),
    createRow('  放电收入', 'dischargeRevenue'),
    createRow('  调峰调频收入', 'frequencyRevenue'),
    createRow('  政府补贴', 'govSubsidyAmount'),
    createRow('  补贴电价收入', 'subsidyPriceRevenue'),
    createRow('二、增值税', 'vatSales', true),
    createRow('  销项税', 'vatSales'),
    createRow('  可抵扣进项', 'vatInput'),
    createRow('  应缴增值税', 'vatPaid'),
    createRow('  即征即退', 'vatRefundAmount'),
    createRow('三、销售税金及附加', 'salesSurcharge'),
    createRow('四、总成本费用', 'totalCost', true),
    createRow('  经营成本', 'operatingCost'),
    createRow('  折旧费', 'depreciation'),
    createRow('  利息支出', 'interest'),
    createRow('五、利润总额', 'profitTotal', true),
    createRow('  应纳税所得额', 'taxableProfit'),
    createRow('  所得税', 'incomeTax'),
    createRow('六、净利润', 'netProfit', true),
    createRow('  法定公积金', 'legalReserve'),
    createRow('  可供分配利润', 'distributableProfit'),
  ];

  return <DataTable title="表2：利润与利润分配表（万元）" columns={columns} data={data} />;
}