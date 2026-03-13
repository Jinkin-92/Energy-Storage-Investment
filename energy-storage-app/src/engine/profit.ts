/**
 * 利润与利润分配计算模块
 * 对应表2：利润与利润分配表
 */

import type { InputParams, YearlyResult } from '../types/financial';
import type { CostResult } from './cost';

/**
 * 计算容量保持率
 * @param capacityRetentionY1 首年容量保持率
 * @param annualDegradation 年衰减率
 * @param year 运营年数
 */
export function calcCapacityRetention(
  capacityRetentionY1: number,
  annualDegradation: number,
  year: number
): number {
  // 公式：retentionRate[t] = retentionY1 * (1 - annualDegradation)^(t-1)
  return capacityRetentionY1 * Math.pow(1 - annualDegradation, year - 1);
}

/**
 * 计算年放电量
 * Excel计算逻辑：
 * 1. 充电量 = 额定容量 × 容量保持率 × 年调度次数
 * 2. 放电量 = 充电量 × 放电深度 × 转换效率
 *
 * @param params 输入参数
 * @param year 运营年数
 * @returns { dischargeKWh, chargeKWh, capacityRetention } 放电量、充电量（万kWh）、容量保持率
 */
export function calcYearlyEnergy(
  params: InputParams,
  year: number
): { dischargeKWh: number; chargeKWh: number; capacityRetention: number } {
  const { capacityMW, durationH, capacityRetentionY1, annualDegradation, dod, roundTripEff, annualCycles } = params;

  // 额定容量 MWh = MW × h，转换为万kWh
  const capacityMWh = capacityMW * durationH;

  // 当年容量保持率
  const capacityRetention = calcCapacityRetention(capacityRetentionY1, annualDegradation, year);

  // 可用容量（万kWh）
  const availableEnergy = capacityMWh * capacityRetention;

  // 充电量（万kWh）= 可用容量 × 年调度次数
  // Excel逻辑：充电时按额定容量充电
  const chargeKWh = availableEnergy * annualCycles;

  // 放电量（万kWh）= 充电量 × 放电深度 × 转换效率
  const dischargeKWh = chargeKWh * dod * roundTripEff;

  return { dischargeKWh, chargeKWh, capacityRetention };
}

/**
 * 计算增值税
 * Excel逻辑：
 * - 销项税 = 含税营业收入 × 增值税率 / (1 + 增值税率)
 * - 不含税营业收入 = 含税营业收入 / (1 + 增值税率)，所有收入都参与计算
 * - 可抵扣进项 = min(销项税, 剩余建设期进项税)
 * - 购电进项税不单独抵扣，已含在经营成本中
 *
 * @param revenueVAT 含税营业收入 万元
 * @param vatRate 增值税率
 * @param inputVATRemaining 剩余可抵扣进项税（建设期）
 */
export function calcVAT(
  revenueVAT: number,
  vatRate: number,
  inputVATRemaining: number
): { vatSales: number; vatInput: number; vatPaid: number; vatInputRemaining: number } {
  // 销项税 = 含税营业收入 × 增值税率 / (1 + 增值税率)
  // Excel公式：销项税 = 含税收入 - 不含税收入，其中不含税收入 = 含税收入 / 1.13
  const vatSales = revenueVAT * vatRate / (1 + vatRate);

  // Excel逻辑：可抵扣进项 = min(销项税, 剩余建设期进项税)
  const vatInput = Math.min(vatSales, inputVATRemaining);

  // 当期缴纳增值税 = 销项税 - 可抵扣进项税
  const vatPaid = Math.max(0, vatSales - vatInput);

  // 更新剩余进项税
  const vatInputRemainingAfter = inputVATRemaining - vatInput;

  return {
    vatSales,
    vatInput,
    vatPaid,
    vatInputRemaining: vatInputRemainingAfter,
  };
}

/**
 * 计算利润与利润分配
 * @param params 输入参数
 * @param year 运营年数
 * @param cost 成本数据
 * @param inputVATRemaining 剩余可抵扣进项税
 * @param carryForwardLoss 前期累计亏损（用于弥补）
 * @param legalReserveAccum 累计法定公积金
 * @param equityAmount 资本金额（用于判断公积金上限）
 */
export function calcYearlyProfit(
  params: InputParams,
  year: number,
  cost: CostResult,
  inputVATRemaining: number,
  carryForwardLoss: number,
  legalReserveAccum: number,
  equityAmount: number
): Omit<YearlyResult, keyof CostResult | 'year' | 'dischargeKWh' | 'chargeKWh' | 'capacityRetention' | 'loanBalance' | 'principalRepaid' | 'interestRepaid' | 'inflow' | 'outflow' | 'fcfPreTax' | 'fcfPostTax' | 'cumFCFPreTax' | 'cumFCFPostTax' | 'adjTax' | 'equityCF' | 'cumEquityCF'> & {
  dischargeKWh: number;
  chargeKWh: number;
  capacityRetention: number;
  vatInputRemaining: number;
  newCarryForwardLoss: number;
  newLegalReserveAccum: number;
} {
  const {
    dischargePriceVAT,
    chargePriceVAT,
    frequencyRevenue,
    govSubsidy,
    subsidyPriceTotal,
    vatRefund,
    vatRateSell,
    salesSurchargeRate,
    incomeTaxRate,
  } = params;

  // 1. 电量计算
  const { dischargeKWh, chargeKWh, capacityRetention } = calcYearlyEnergy(params, year);

  // 2. 收入计算
  // 放电收入（含税）
  const dischargeRevenue = dischargeKWh * dischargePriceVAT;
  // 调峰调频收入
  const frequencyRevenueAmount = frequencyRevenue;
  // 政府补贴
  const govSubsidyAmount = govSubsidy[year] || 0;
  // 补贴电价收入（含税）
  const subsidyPriceRevenue = subsidyPriceTotal || 0;
  // 含税营业收入
  const revenueVAT = dischargeRevenue + frequencyRevenueAmount + govSubsidyAmount + subsidyPriceRevenue;

  // 3. 增值税计算（基于全部含税营业收入）
  const vatResult = calcVAT(
    revenueVAT,
    vatRateSell,
    inputVATRemaining
  );

  // 增值税即征即退（50%）
  const vatRefundAmount = vatRefund ? vatResult.vatPaid * 0.5 : 0;

  // 4. 不含税营业收入
  // 不含税放电收入 = 放电收入 / (1 + 增值税率)
  const dischargeRevenueNoVAT = dischargeRevenue / (1 + vatRateSell);
  // 调峰调频收入通常不含税
  // 政府补贴不含税
  // 补贴电价收入不含税
  const subsidyPriceRevenueNoVAT = subsidyPriceRevenue / (1 + vatRateSell);
  const revenueNoVAT = dischargeRevenueNoVAT + frequencyRevenueAmount + govSubsidyAmount / (1 + vatRateSell) + subsidyPriceRevenueNoVAT + vatRefundAmount;

  // 5. 销售税金及附加 = 缴纳增值税 × 附加税率
  const salesSurcharge = vatResult.vatPaid * salesSurchargeRate;

  // 6. 利润总额 = 不含税营业收入 - 总成本费用 - 销售税金及附加
  const profitTotal = revenueNoVAT - cost.totalCost - salesSurcharge;

  // 7. 所得税计算（含亏损弥补）
  // 应纳税所得额 = 利润总额 + 可弥补亏损
  let taxableProfit = profitTotal;
  let newCarryForwardLoss = carryForwardLoss;

  if (profitTotal < 0) {
    // 当年亏损，累积到以后年度弥补
    newCarryForwardLoss = carryForwardLoss + Math.abs(profitTotal);
    taxableProfit = 0;
  } else if (carryForwardLoss > 0) {
    // 有盈利时，先弥补以前年度亏损
    if (profitTotal >= carryForwardLoss) {
      // 足以弥补全部亏损
      taxableProfit = profitTotal - carryForwardLoss;
      newCarryForwardLoss = 0;
    } else {
      // 只能部分弥补
      taxableProfit = 0;
      newCarryForwardLoss = carryForwardLoss - profitTotal;
    }
  }

  // 所得税 = 应纳税所得额 × 所得税率
  const incomeTax = taxableProfit > 0 ? taxableProfit * incomeTaxRate : 0;

  // 8. 净利润 = 利润总额 - 所得税
  const netProfit = profitTotal - incomeTax;

  // 9. 利润分配
  // 法定公积金 = 净利润 × 10%，累计不超过注册资本的50%
  let legalReserve = 0;
  let newLegalReserveAccum = legalReserveAccum;
  const maxLegalReserve = equityAmount * 0.5;

  if (netProfit > 0 && legalReserveAccum < maxLegalReserve) {
    legalReserve = Math.min(netProfit * 0.1, maxLegalReserve - legalReserveAccum);
    newLegalReserveAccum = legalReserveAccum + legalReserve;
  }

  // 可供分配利润 = 净利润 - 法定公积金 ± 弥补亏损
  const distributableProfit = netProfit - legalReserve;

  return {
    // 收入
    revenueVAT,
    revenueNoVAT,
    dischargeRevenue,
    frequencyRevenue: frequencyRevenueAmount,
    govSubsidyAmount,
    subsidyPriceRevenue,

    // 电量
    dischargeKWh,
    chargeKWh,
    capacityRetention,

    // 增值税
    vatSales: vatResult.vatSales,
    vatInput: vatResult.vatInput,
    vatPaid: vatResult.vatPaid,
    vatRefundAmount,
    vatInputRemaining: vatResult.vatInputRemaining,

    // 税金
    salesSurcharge,

    // 利润
    profitTotal,
    carryForwardLoss,
    taxableProfit,
    incomeTax,
    netProfit,

    // 利润分配
    legalReserve,
    legalReserveAccum: newLegalReserveAccum,
    distributableProfit,
    retainedEarnings: 0, // 累计未分配利润需要在外部计算

    // 状态传递
    newCarryForwardLoss,
    newLegalReserveAccum,
  };
}

/**
 * 批量计算所有年份的利润
 */
export function calcAllYearlyProfits(
  params: InputParams,
  costs: CostResult[],
  equityAmount: number
): YearlyResult[] {
  const results: YearlyResult[] = [];
  let inputVATRemaining = params.inputVAT;
  let carryForwardLoss = 0;
  let legalReserveAccum = 0;
  let retainedEarningsAccum = 0;

  // 建设期（year 0）
  results.push({
    year: 0,
    dischargeKWh: 0,
    chargeKWh: 0,
    capacityRetention: 0,
    revenueVAT: 0,
    revenueNoVAT: 0,
    dischargeRevenue: 0,
    frequencyRevenue: 0,
    govSubsidyAmount: 0,
    subsidyPriceRevenue: 0,
    vatSales: 0,
    vatInput: 0,
    vatPaid: 0,
    vatRefundAmount: 0,
    vatInputRemaining: params.inputVAT,
    salesSurcharge: 0,
    depreciation: 0,
    omCost: 0,
    laborCost: 0,
    insurance: 0,
    interest: 0,
    landFee: 0,
    purchasedElec: 0,
    otherCost: 0,
    totalCost: 0,
    operatingCost: 0,
    profitTotal: 0,
    carryForwardLoss: 0,
    taxableProfit: 0,
    incomeTax: 0,
    netProfit: 0,
    legalReserve: 0,
    legalReserveAccum: 0,
    distributableProfit: 0,
    retainedEarnings: 0,
    loanBalance: 0,
    principalRepaid: 0,
    interestRepaid: 0,
    inflow: 0,
    outflow: 0,
    fcfPreTax: 0,
    fcfPostTax: 0,
    cumFCFPreTax: 0,
    cumFCFPostTax: 0,
    adjTax: 0,
    equityCF: 0,
    cumEquityCF: 0,
  });

  // 运营期（year 1 ~ designLifeYear）
  for (let t = 1; t <= params.designLifeYear; t++) {
    const profit = calcYearlyProfit(
      params,
      t,
      costs[t],
      inputVATRemaining,
      carryForwardLoss,
      legalReserveAccum,
      equityAmount
    );

    // 更新状态
    inputVATRemaining = profit.vatInputRemaining;
    carryForwardLoss = profit.newCarryForwardLoss;
    legalReserveAccum = profit.newLegalReserveAccum;
    retainedEarningsAccum += profit.distributableProfit;

    results.push({
      year: t,
      dischargeKWh: profit.dischargeKWh,
      chargeKWh: profit.chargeKWh,
      capacityRetention: profit.capacityRetention,
      revenueVAT: profit.revenueVAT,
      revenueNoVAT: profit.revenueNoVAT,
      dischargeRevenue: profit.dischargeRevenue,
      frequencyRevenue: profit.frequencyRevenue,
      govSubsidyAmount: profit.govSubsidyAmount,
      subsidyPriceRevenue: profit.subsidyPriceRevenue,
      vatSales: profit.vatSales,
      vatInput: profit.vatInput,
      vatPaid: profit.vatPaid,
      vatRefundAmount: profit.vatRefundAmount,
      vatInputRemaining: profit.vatInputRemaining,
      salesSurcharge: profit.salesSurcharge,
      depreciation: costs[t].depreciation,
      omCost: costs[t].omCost,
      laborCost: costs[t].laborCost,
      insurance: costs[t].insurance,
      interest: costs[t].interest,
      landFee: costs[t].landFee,
      purchasedElec: costs[t].purchasedElec,
      otherCost: costs[t].otherCost,
      totalCost: costs[t].totalCost,
      operatingCost: costs[t].operatingCost,
      profitTotal: profit.profitTotal,
      carryForwardLoss: profit.carryForwardLoss,
      taxableProfit: profit.taxableProfit,
      incomeTax: profit.incomeTax,
      netProfit: profit.netProfit,
      legalReserve: profit.legalReserve,
      legalReserveAccum: profit.legalReserveAccum,
      distributableProfit: profit.distributableProfit,
      retainedEarnings: retainedEarningsAccum,
      loanBalance: 0, // 后续填充
      principalRepaid: 0, // 后续填充
      interestRepaid: 0, // 后续填充
      inflow: 0, // 后续填充
      outflow: 0, // 后续填充
      fcfPreTax: 0, // 后续填充
      fcfPostTax: 0, // 后续填充
      cumFCFPreTax: 0, // 后续填充
      cumFCFPostTax: 0, // 后续填充
      adjTax: 0, // 后续填充
      equityCF: 0, // 后续填充
      cumEquityCF: 0, // 后续填充
    });
  }

  return results;
}

/**
 * 获取利润汇总数据
 */
export function getProfitSummary(yearlyResults: YearlyResult[]) {
  const operatingYears = yearlyResults.slice(1); // 排除建设期

  return {
    totalRevenue: operatingYears.reduce((sum, y) => sum + y.revenueVAT, 0),
    totalRevenueNoVAT: operatingYears.reduce((sum, y) => sum + y.revenueNoVAT, 0),
    totalVatPaid: operatingYears.reduce((sum, y) => sum + y.vatPaid, 0),
    totalSalesSurcharge: operatingYears.reduce((sum, y) => sum + y.salesSurcharge, 0),
    totalProfit: operatingYears.reduce((sum, y) => sum + y.profitTotal, 0),
    totalIncomeTax: operatingYears.reduce((sum, y) => sum + y.incomeTax, 0),
    totalNetProfit: operatingYears.reduce((sum, y) => sum + y.netProfit, 0),
    avgRevenue: operatingYears.reduce((sum, y) => sum + y.revenueVAT, 0) / operatingYears.length,
    avgProfit: operatingYears.reduce((sum, y) => sum + y.profitTotal, 0) / operatingYears.length,
    avgNetProfit: operatingYears.reduce((sum, y) => sum + y.netProfit, 0) / operatingYears.length,
  };
}