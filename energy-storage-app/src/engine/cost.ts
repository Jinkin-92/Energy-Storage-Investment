/**
 * 运营成本费用计算模块
 * 对应表6：运营成本费用表
 */

import type { InputParams, OmRatePeriod } from '../types/financial';

export interface CostResult {
  depreciation: number;     // 折旧费 万元
  omCost: number;           // 运维费 万元
  laborCost: number;        // 人工成本 万元
  insurance: number;        // 保险费 万元
  landFee: number;          // 土地费用 万元
  purchasedElec: number;    // 购电电费 万元
  otherCost: number;        // 其他费用 万元
  interest: number;         // 利息支出（财务费用）万元
  totalCost: number;        // 总成本费用 万元
  operatingCost: number;    // 经营成本 万元
}

/**
 * 获取指定年份的运维费率
 * @param omRateByPeriod 分段运维费率配置
 * @param year 运营年数
 */
export function getOmRate(omRateByPeriod: OmRatePeriod[], year: number): number {
  // 找到第一个截止年份 >= 当前年份的配置
  for (const period of omRateByPeriod) {
    if (year <= period.years) {
      return period.rate;
    }
  }
  // 如果超过配置范围，使用最后一个费率
  return omRateByPeriod[omRateByPeriod.length - 1]?.rate || 0.005;
}

/**
 * 计算单年运营成本
 * @param params 输入参数
 * @param year 运营年数（1-设计寿命）
 * @param _fixedAssetValue 固定资产原值（未使用，保留接口兼容）
 * @param annualDepreciation 年折旧额
 * @param chargeKWh 年充电量（万kWh）
 * @param chargePriceVAT 充电含税价格（元/kWh）- Excel用含税价格计算购电电费
 * @param interestRepaid 本年偿还利息
 */
export function calcYearlyCost(
  params: InputParams,
  year: number,
  _fixedAssetValue: number,
  annualDepreciation: number,
  chargeKWh: number,
  chargePriceVAT: number,
  interestRepaid: number
): CostResult {
  const {
    staticInvestment,
    omRateByPeriod,
    insuranceRate,
    staffCount,
    salaryPerPerson,
    salaryGrowth,
    landFee,
    otherCost,
  } = params;

  // 1. 折旧费（每年相同，直线法）
  const depreciation = annualDepreciation;

  // 2. 运维费（分段递增）
  const omRate = getOmRate(omRateByPeriod, year);
  const omCost = staticInvestment * omRate;

  // 3. 人工成本（含福利，按3%/年增长）
  const laborCost = staffCount * salaryPerPerson * Math.pow(1 + salaryGrowth, year - 1);

  // 4. 保险费（Excel逻辑：基于静态总投资，每年增长2%）
  // 公式：保险费 = 静态总投资 × 保险费率 × (1.02)^(year-1)
  const insurance = staticInvestment * insuranceRate * Math.pow(1.02, year - 1);

  // 5. 利息支出（来自借款还款计划）
  const interest = interestRepaid;

  // 6. 土地使用税（固定，每年相同）
  const landFeeAnnual = landFee;

  // 7. 购电电费（外购充电成本，含税）
  // Excel用含税电价计算购电电费
  const purchasedElec = chargeKWh * chargePriceVAT;

  // 8. 其他费用
  const otherCostAnnual = otherCost;

  // 总成本费用
  const totalCost =
    depreciation +
    omCost +
    laborCost +
    insurance +
    interest +
    landFeeAnnual +
    purchasedElec +
    otherCostAnnual;

  // 经营成本 = 总成本 - 折旧 - 利息
  const operatingCost = totalCost - depreciation - interest;

  return {
    depreciation,
    omCost,
    laborCost,
    insurance,
    landFee: landFeeAnnual,
    purchasedElec,
    otherCost: otherCostAnnual,
    interest,
    totalCost,
    operatingCost,
  };
}

/**
 * 批量计算所有年份的运营成本
 */
export function calcAllYearlyCosts(
  params: InputParams,
  fixedAssetValue: number,
  annualDepreciation: number,
  chargeKWhByYear: number[],
  chargePriceVAT: number,
  interestRepaidByYear: number[]
): CostResult[] {
  const costs: CostResult[] = [];

  // 建设期（year 0）
  costs.push({
    depreciation: 0,
    omCost: 0,
    laborCost: 0,
    insurance: 0,
    landFee: 0,
    purchasedElec: 0,
    otherCost: 0,
    interest: 0,
    totalCost: 0,
    operatingCost: 0,
  });

  // 运营期（year 1 ~ designLifeYear）
  for (let t = 1; t <= params.designLifeYear; t++) {
    const cost = calcYearlyCost(
      params,
      t,
      fixedAssetValue,
      annualDepreciation,
      chargeKWhByYear[t],
      chargePriceVAT,
      interestRepaidByYear[t]
    );
    costs.push(cost);
  }

  return costs;
}

/**
 * 获取成本费用汇总数据
 */
export function getCostSummary(costs: CostResult[]) {
  const operatingCosts = costs.slice(1); // 排除建设期

  return {
    totalDepreciation: operatingCosts.reduce((sum, c) => sum + c.depreciation, 0),
    totalOmCost: operatingCosts.reduce((sum, c) => sum + c.omCost, 0),
    totalLaborCost: operatingCosts.reduce((sum, c) => sum + c.laborCost, 0),
    totalInsurance: operatingCosts.reduce((sum, c) => sum + c.insurance, 0),
    totalInterest: operatingCosts.reduce((sum, c) => sum + c.interest, 0),
    totalLandFee: operatingCosts.reduce((sum, c) => sum + c.landFee, 0),
    totalPurchasedElec: operatingCosts.reduce((sum, c) => sum + c.purchasedElec, 0),
    totalOtherCost: operatingCosts.reduce((sum, c) => sum + c.otherCost, 0),
    totalCost: operatingCosts.reduce((sum, c) => sum + c.totalCost, 0),
    totalOperatingCost: operatingCosts.reduce((sum, c) => sum + c.operatingCost, 0),
    avgTotalCost: operatingCosts.reduce((sum, c) => sum + c.totalCost, 0) / operatingCosts.length,
  };
}