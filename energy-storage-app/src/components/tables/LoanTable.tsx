/**
 * 表5: 借款还本付息表
 */
import { useResultStore } from '../../store/resultStore';
import { DataTable } from './DataTable';

export function LoanTable() {
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
    createRow('年初贷款余额', 'loanBalance', true),
    createRow('本年还本', 'principalRepaid'),
    createRow('本年付息', 'interestRepaid'),
    createRow('本年还本付息合计', 'totalPayment'),
    createRow('年末贷款余额', 'loanBalance'),
  ];

  // 计算还本付息合计
  const dataWithTotal = data.map(row => {
    if (row.label === '本年还本付息合计') {
      const newRow = { ...row };
      displayYears.forEach(y => {
        const yearData = yearly.find(yr => yr.year === y.year);
        if (yearData) {
          newRow[`y${y.year}`] = yearData.principalRepaid + yearData.interestRepaid;
        }
      });
      return newRow;
    }
    return row;
  });

  return <DataTable title="表5：借款还本付息表（万元）" columns={columns} data={dataWithTotal} />;
}