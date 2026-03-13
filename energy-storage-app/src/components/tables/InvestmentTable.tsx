/**
 * 表1: 投资计划与资金筹措表
 */
import { useResultStore } from '../../store/resultStore';
import { DataTable } from './DataTable';

export function InvestmentTable() {
  const { results, isCalculated } = useResultStore();

  if (!isCalculated || !results) return null;

  const columns = [
    { key: 'label', label: '项目' },
    { key: 'total', label: '合计' },
    { key: 'year0', label: '建设期' },
  ];

  const data = [
    { label: '一、动态总投资', total: results.dynamicInvestment, year0: results.dynamicInvestment, highlight: true },
    { label: '  静态总投资', total: results.staticInvestment, year0: results.staticInvestment },
    { label: '  建设期利息', total: results.capitalizedInterest, year0: results.capitalizedInterest },
    { label: '二、资金筹措', total: results.dynamicInvestment, year0: results.dynamicInvestment, highlight: true },
    { label: '  资本金', total: results.equityAmount, year0: results.equityAmount },
    { label: '  长期借款', total: results.loanAmount, year0: results.loanAmount },
  ];

  return <DataTable title="表1：投资计划与资金筹措表（万元）" columns={columns} data={data} />;
}