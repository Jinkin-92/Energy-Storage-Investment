/**
 * 计算引擎统一入口
 * 整合所有计算模块，提供一站式计算接口
 */

import type { InputParams, CalculationResults, YearlyResult } from '../types/financial';
import { calcInvestment, type InvestmentResult } from './investment';
import { calcLoanSchedule, extendLoanSchedule, getLoanSummary } from './loan';
import { calcAllYearlyCosts } from './cost';
import { calcAllYearlyProfits, getProfitSummary } from './profit';
import { calcProjectCashFlow, calcEquityCashFlow, extractProjectCashFlows, extractEquityCashFlows } from './cashflow';
import { calcIRR, calcNPV, calcPaybackPeriod, getIRRRating, generateConclusion } from './irr';

export interface EngineOutput {
  investment: InvestmentResult;
  yearly: YearlyResult[];
  results: CalculationResults;
}

/**
 * 运行完整计算引擎
 * @param params 输入参数
 * @returns 完整计算结果
 */
export function runEngine(params: InputParams): EngineOutput {
  // Step 1: 投资计算
  const investment = calcInvestment(params);

  // Step 2: 借款还款计划
  const loanSchedule = calcLoanSchedule(params, investment.loanAmount);
  const loanExtended = extendLoanSchedule(loanSchedule, params.designLifeYear);

  // Step 3: 预计算充电量（用于成本计算）
  // Excel逻辑：充电量 = 可用容量 × 年调度次数，放电量 = 充电量 × DOD × 效率
  const chargeKWhByYear: number[] = [0];
  for (let t = 1; t <= params.designLifeYear; t++) {
    const capacityRetention = params.capacityRetentionY1 * Math.pow(1 - params.annualDegradation, t - 1);
    const capacityMWh = params.capacityMW * params.durationH;
    const availableEnergy = capacityMWh * capacityRetention;
    // 充电量 = 可用容量 × 年调度次数
    const chargeKWh = availableEnergy * params.annualCycles;
    chargeKWhByYear.push(chargeKWh);
  }

  // 充电含税价格（Excel用含税电价计算购电电费）
  const chargePriceVAT = params.chargePriceVAT;

  // 提取利息还款序列
  const interestRepaidByYear = loanExtended.map(l => l.interestRepaid);

  // Step 4: 成本计算
  const costs = calcAllYearlyCosts(
    params,
    investment.fixedAssetValue,
    investment.annualDepreciation,
    chargeKWhByYear,
    chargePriceVAT,
    interestRepaidByYear
  );

  // Step 5: 利润计算
  let yearly = calcAllYearlyProfits(params, costs, investment.equityAmount);

  // Step 6: 现金流计算
  yearly = calcProjectCashFlow(params, yearly, investment, loanExtended);
  yearly = calcEquityCashFlow(params, yearly, investment);

  // Step 7: 更新贷款余额
  for (let t = 0; t <= params.designLifeYear; t++) {
    if (t === 0) {
      yearly[t].loanBalance = investment.loanAmount;
    } else {
      yearly[t].loanBalance = loanExtended[t].loanBalance;
    }
  }

  // Step 8: 计算IRR和回收期
  const projectCashFlowsPreTax = extractProjectCashFlows(yearly, false);
  const projectCashFlowsPostTax = extractProjectCashFlows(yearly, true);
  const equityCashFlows = extractEquityCashFlows(yearly);

  const irrPreTax = calcIRR(projectCashFlowsPreTax);
  const irrPostTax = calcIRR(projectCashFlowsPostTax);
  const equityIRR = calcIRR(equityCashFlows);

  const paybackPreTax = calcPaybackPeriod(projectCashFlowsPreTax);
  const paybackPostTax = calcPaybackPeriod(projectCashFlowsPostTax);

  // NPV（使用8%作为基准折现率）
  const npvPreTax = calcNPV(projectCashFlowsPreTax, 0.08);
  const npvPostTax = calcNPV(projectCashFlowsPostTax, 0.08);

  // Step 9: 汇总数据
  const profitSummary = getProfitSummary(yearly);
  const loanSummary = getLoanSummary(loanSchedule);

  // 评价结论
  const conclusion = generateConclusion(params, {
    irrPreTax,
    equityIRR,
    paybackPreTax,
    avgRevenue: profitSummary.avgRevenue,
    avgProfit: profitSummary.avgProfit,
    avgNetProfit: profitSummary.avgNetProfit,
  });

  // IRR评级
  const irrRating = getIRRRating(irrPreTax, 'project');

  // 组装最终结果
  const results: CalculationResults = {
    yearly,
    staticInvestment: investment.staticInvestment,
    dynamicInvestment: investment.dynamicInvestment,
    equityAmount: investment.equityAmount,
    loanAmount: investment.loanAmount,
    capitalizedInterest: investment.capitalizedInterest,
    fixedAssetValue: investment.fixedAssetValue,
    salvageValue: investment.salvageValue,
    annualDepreciation: investment.annualDepreciation,
    irrPreTax,
    irrPostTax,
    equityIRR,
    npvPreTax,
    npvPostTax,
    paybackPreTax,
    paybackPostTax,
    avgRevenue: profitSummary.avgRevenue,
    avgProfit: profitSummary.avgProfit,
    avgNetProfit: profitSummary.avgNetProfit,
    totalRevenue: profitSummary.totalRevenue,
    totalNetProfit: profitSummary.totalNetProfit,
    totalPrincipalRepaid: loanSummary.totalPrincipalRepaid,
    totalInterestRepaid: loanSummary.totalInterestRepaid,
    totalLoanPayment: loanSummary.totalPayment,
    conclusion,
    irrRating,
  };

  return {
    investment,
    yearly,
    results,
  };
}

// 导出各模块
export { calcInvestment } from './investment';
export { calcLoanSchedule, calcEqualPayment, calcEqualPrincipal } from './loan';
export { calcYearlyCost, calcAllYearlyCosts } from './cost';
export { calcYearlyProfit, calcAllYearlyProfits, calcYearlyEnergy } from './profit';
export { calcProjectCashFlow, calcEquityCashFlow } from './cashflow';
export { calcIRR, calcNPV, calcPaybackPeriod, getIRRRating, generateConclusion } from './irr';