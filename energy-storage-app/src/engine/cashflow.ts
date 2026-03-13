/**
 * 现金流量计算模块
 * 对应表3：项目投资现金流量表
 * 对应表4：资本金现金流量表
 */

import type { InputParams, YearlyResult } from '../types/financial';
import type { InvestmentResult } from './investment';

/**
 * 计算全投资现金流量（表3）
 * @param params 输入参数
 * @param yearlyResults 逐年利润结果（含成本数据）
 * @param investmentResult 投资计算结果
 * @param loanExtended 扩展后的还款计划
 */
export function calcProjectCashFlow(
  params: InputParams,
  yearlyResults: YearlyResult[],
  investmentResult: InvestmentResult,
  loanExtended: { principalRepaid: number; interestRepaid: number; loanBalance: number }[]
): YearlyResult[] {
  const { designLifeYear } = params;
  const { staticInvestment, salvageValue } = investmentResult;

  let cumFCFPreTax = 0;
  let cumFCFPostTax = 0;

  // 更新现金流数据
  for (let t = 0; t <= designLifeYear; t++) {
    const year = yearlyResults[t];

    // 填充还款数据
    year.principalRepaid = loanExtended[t].principalRepaid;
    year.interestRepaid = loanExtended[t].interestRepaid;
    year.loanBalance = loanExtended[t].loanBalance;

    if (t === 0) {
      // 建设期（year 0）
      year.inflow = 0;
      year.outflow = staticInvestment;
      year.fcfPreTax = -staticInvestment;
      year.fcfPostTax = -staticInvestment;
      cumFCFPreTax = -staticInvestment;
      cumFCFPostTax = -staticInvestment;
    } else {
      // 运营期（year 1 ~ designLifeYear）

      // 现金流入 = 含税销售收入 + 末年固定资产残值
      // 注意：增值税即征即退在现金流出中冲减，不计入流入
      let inflow = year.revenueVAT;
      if (t === designLifeYear) {
        inflow += salvageValue;
      }
      year.inflow = inflow;

      // 现金流出 = 经营成本 + 缴纳增值税 - 即征即退 + 销售税金附加
      // 增值税即征即退冲减应交税费，减少现金流出
      const actualVatPaid = Math.max(0, year.vatPaid - year.vatRefundAmount);
      const outflow = year.operatingCost + actualVatPaid + year.salesSurcharge;
      year.outflow = outflow;

      // 税前净现金流
      const ncfPreTax = inflow - outflow;
      year.fcfPreTax = ncfPreTax;

      // 调整所得税（简化计算）
      // 调整所得税 = (税前净现金流 - 折旧 - 利息) × 所得税率
      // 注意：这里的利息是指财务费用中的利息，不是偿还利息
      const adjTax = Math.max(0, (ncfPreTax - year.depreciation - year.interest) * params.incomeTaxRate);
      year.adjTax = adjTax;

      // 税后净现金流
      const ncfPostTax = ncfPreTax - adjTax;
      year.fcfPostTax = ncfPostTax;

      // 累计净现金流
      cumFCFPreTax += ncfPreTax;
      cumFCFPostTax += ncfPostTax;
    }

    year.cumFCFPreTax = cumFCFPreTax;
    year.cumFCFPostTax = cumFCFPostTax;
  }

  return yearlyResults;
}

/**
 * 计算资本金现金流量（表4）
 * @param params 输入参数
 * @param yearlyResults 逐年结果（已填充全投资现金流）
 * @param investmentResult 投资计算结果
 */
export function calcEquityCashFlow(
  params: InputParams,
  yearlyResults: YearlyResult[],
  investmentResult: InvestmentResult
): YearlyResult[] {
  const { designLifeYear } = params;
  const { equityAmount, salvageValue } = investmentResult;

  let cumEquityCF = 0;

  for (let t = 0; t <= designLifeYear; t++) {
    const year = yearlyResults[t];

    if (t === 0) {
      // 建设期：资本金投入
      year.equityCF = -equityAmount;
      cumEquityCF = -equityAmount;
    } else {
      // 运营期
      // 现金流入 = 含税销售收入 + 末年固定资产残值
      // 注意：增值税即征即退在现金流出中冲减，不计入流入
      let inflow = year.revenueVAT;
      if (t === designLifeYear) {
        inflow += salvageValue;
      }

      // 现金流出 = 经营成本 + 实际缴纳增值税(扣除即征即退) + 销售税金附加 + 偿还本金 + 偿还利息 + 所得税
      const actualVatPaid = Math.max(0, year.vatPaid - year.vatRefundAmount);
      const outflow =
        year.operatingCost +
        actualVatPaid +
        year.salesSurcharge +
        year.principalRepaid +
        year.interestRepaid +
        year.incomeTax;

      // 资本金净现金流
      const equityCF = inflow - outflow;
      year.equityCF = equityCF;

      cumEquityCF += equityCF;
    }

    year.cumEquityCF = cumEquityCF;
  }

  return yearlyResults;
}

/**
 * 从全投资现金流提取IRR计算用的现金流序列
 * @param yearlyResults 逐年结果
 * @param usePostTax 是否使用税后现金流
 */
export function extractProjectCashFlows(
  yearlyResults: YearlyResult[],
  usePostTax: boolean = false
): number[] {
  return yearlyResults.map(y => usePostTax ? y.fcfPostTax : y.fcfPreTax);
}

/**
 * 从资本金现金流提取IRR计算用的现金流序列
 * @param yearlyResults 逐年结果
 */
export function extractEquityCashFlows(yearlyResults: YearlyResult[]): number[] {
  return yearlyResults.map(y => y.equityCF);
}

/**
 * 获取现金流量汇总数据
 */
export function getCashFlowSummary(yearlyResults: YearlyResult[]) {
  const operatingYears = yearlyResults.slice(1);

  return {
    totalInflow: operatingYears.reduce((sum, y) => sum + y.inflow, 0),
    totalOutflow: operatingYears.reduce((sum, y) => sum + y.outflow, 0),
    totalFCFPreTax: operatingYears.reduce((sum, y) => sum + y.fcfPreTax, 0),
    totalFCFPostTax: operatingYears.reduce((sum, y) => sum + y.fcfPostTax, 0),
    totalEquityCF: operatingYears.reduce((sum, y) => sum + y.equityCF, 0),
  };
}