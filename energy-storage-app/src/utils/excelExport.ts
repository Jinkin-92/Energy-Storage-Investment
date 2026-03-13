/**
 * Excel导出工具
 */
import * as XLSX from 'xlsx';
import type { CalculationResults, YearlyResult, InputParams } from '../types/financial';

/**
 * 格式化数字为万元
 */
const formatNumber = (value: number): string => {
  return value.toFixed(2);
};

/**
 * 导出财务分析报告到Excel
 */
export function exportToExcel(
  params: InputParams,
  results: CalculationResults,
  yearly: YearlyResult[]
): void {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: 核心指标
  const metricsData = [
    ['储能投资分析报告'],
    ['项目名称', params.projectName],
    ['生成时间', new Date().toLocaleString()],
    [],
    ['核心财务指标'],
    ['指标名称', '数值', '单位'],
    ['全投资IRR(税前)', formatNumber(results.irrPreTax * 100), '%'],
    ['全投资IRR(税后)', formatNumber(results.irrPostTax * 100), '%'],
    ['资本金IRR', formatNumber(results.equityIRR * 100), '%'],
    ['投资回收期(税前)', formatNumber(results.paybackPreTax), '年'],
    ['投资回收期(税后)', formatNumber(results.paybackPostTax), '年'],
    ['静态总投资', formatNumber(results.staticInvestment), '万元'],
    ['动态总投资', formatNumber(results.dynamicInvestment), '万元'],
    ['资本金', formatNumber(results.equityAmount), '万元'],
    ['长期借款', formatNumber(results.loanAmount), '万元'],
    ['年均营业收入', formatNumber(results.avgRevenue), '万元'],
    ['年均净利润', formatNumber(results.avgNetProfit), '万元'],
  ];
  const wsMetrics = XLSX.utils.aoa_to_sheet(metricsData);
  XLSX.utils.book_append_sheet(workbook, wsMetrics, '核心指标');

  // Sheet 2: 投资计划表
  const investmentData = [
    ['表1：投资计划与资金筹措表', '', ''],
    ['项目', '合计', '建设期'],
    ['一、动态总投资', formatNumber(results.dynamicInvestment), formatNumber(results.dynamicInvestment)],
    ['  静态总投资', formatNumber(results.staticInvestment), formatNumber(results.staticInvestment)],
    ['  建设期利息', formatNumber(results.capitalizedInterest), formatNumber(results.capitalizedInterest)],
    ['二、资金筹措', formatNumber(results.dynamicInvestment), formatNumber(results.dynamicInvestment)],
    ['  资本金', formatNumber(results.equityAmount), formatNumber(results.equityAmount)],
    ['  长期借款', formatNumber(results.loanAmount), formatNumber(results.loanAmount)],
  ];
  const wsInvestment = XLSX.utils.aoa_to_sheet(investmentData);
  XLSX.utils.book_append_sheet(workbook, wsInvestment, '投资计划');

  // Sheet 3: 利润表
  const profitHeaders = ['项目', ...yearly.map(y => y.year === 0 ? '建设期' : `第${y.year}年`)];
  const profitRows = [
    ['一、营业收入'],
    ['  放电收入'],
    ['  调峰调频收入'],
    ['  政府补贴'],
    ['二、增值税'],
    ['  销项税'],
    ['  应缴增值税'],
    ['三、总成本费用'],
    ['  经营成本'],
    ['  折旧费'],
    ['四、利润总额'],
    ['  所得税'],
    ['五、净利润'],
  ];

  const profitData = [
    profitHeaders,
    ...profitRows.map((row, i) => {
      const keys: (keyof YearlyResult)[] = [
        'revenueVAT', 'dischargeRevenue', 'frequencyRevenue', 'govSubsidyAmount',
        'vatSales', 'vatSales', 'vatPaid',
        'totalCost', 'operatingCost', 'depreciation',
        'profitTotal', 'incomeTax', 'netProfit'
      ];
      return [
        row[0],
        ...yearly.map(y => formatNumber(Number(y[keys[i]] || 0)))
      ];
    })
  ];
  const wsProfit = XLSX.utils.aoa_to_sheet(profitData);
  XLSX.utils.book_append_sheet(workbook, wsProfit, '利润分配');

  // Sheet 4: 现金流量表
  const cfHeaders = ['项目', ...yearly.map(y => y.year === 0 ? '建设期' : `第${y.year}年`)];
  const cfData = [
    cfHeaders,
    ['一、现金流入', ...yearly.map(y => formatNumber(y.inflow))],
    ['二、现金流出', ...yearly.map(y => formatNumber(y.outflow))],
    ['三、税前净现金流', ...yearly.map(y => formatNumber(y.fcfPreTax))],
    ['  累计税前净现金流', ...yearly.map(y => formatNumber(y.cumFCFPreTax))],
    ['四、资本金净现金流', ...yearly.map(y => formatNumber(y.equityCF))],
  ];
  const wsCF = XLSX.utils.aoa_to_sheet(cfData);
  XLSX.utils.book_append_sheet(workbook, wsCF, '现金流量');

  // Sheet 5: 还本付息表
  const loanHeaders = ['项目', ...yearly.map(y => y.year === 0 ? '建设期' : `第${y.year}年`)];
  const loanData = [
    loanHeaders,
    ['年初贷款余额', ...yearly.map(y => formatNumber(y.loanBalance))],
    ['本年还本', ...yearly.map(y => formatNumber(y.principalRepaid))],
    ['本年付息', ...yearly.map(y => formatNumber(y.interestRepaid))],
  ];
  const wsLoan = XLSX.utils.aoa_to_sheet(loanData);
  XLSX.utils.book_append_sheet(workbook, wsLoan, '还本付息');

  // Sheet 6: 运营成本表
  const costHeaders = ['项目', ...yearly.map(y => y.year === 0 ? '建设期' : `第${y.year}年`)];
  const costData = [
    costHeaders,
    ['经营成本', ...yearly.map(y => formatNumber(y.operatingCost))],
    ['  运维费', ...yearly.map(y => formatNumber(y.omCost))],
    ['  人工成本', ...yearly.map(y => formatNumber(y.laborCost))],
    ['  保险费', ...yearly.map(y => formatNumber(y.insurance))],
    ['  购电电费', ...yearly.map(y => formatNumber(y.purchasedElec))],
    ['折旧费', ...yearly.map(y => formatNumber(y.depreciation))],
    ['利息支出', ...yearly.map(y => formatNumber(y.interest))],
    ['总成本费用', ...yearly.map(y => formatNumber(y.totalCost))],
  ];
  const wsCost = XLSX.utils.aoa_to_sheet(costData);
  XLSX.utils.book_append_sheet(workbook, wsCost, '运营成本');

  // 导出文件
  const fileName = `${params.projectName}_财务分析报告_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}