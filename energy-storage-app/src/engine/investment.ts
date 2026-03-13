/**
 * 投资计划与资金筹措计算模块
 * 对应表1：投资计划与资金筹措表
 */

import type { InputParams } from '../types/financial';

export interface InvestmentResult {
  staticInvestment: number;      // 静态总投资 万元
  capitalizedInterest: number;   // 建设期利息（资本化）万元
  dynamicInvestment: number;     // 动态总投资 万元
  equityAmount: number;          // 资本金 万元
  loanAmount: number;            // 长期借款 万元
  loanPrincipal: number;         // 长期借款本金（不含建设期利息）万元
  fixedAssetValue: number;       // 固定资产原值 万元
  salvageValue: number;          // 固定资产残值 万元
  annualDepreciation: number;    // 年折旧额 万元
}

/**
 * 计算投资计划与资金筹措
 * @param params 输入参数
 * @returns 投资计算结果
 */
export function calcInvestment(params: InputParams): InvestmentResult {
  const {
    staticInvestment,
    equityRatio,
    loanRateConst,
    constructionMonths,
    depreciationYears,
    salvageRate,
    annualDepreciation: specifiedDepreciation,
  } = params;

  // 建设期借款本金（静态总投资中借款部分）
  const loanPrincipal = staticInvestment * (1 - equityRatio);

  // 建设期利息（资本化）
  // 假设建设期贷款均匀投入（平均在期中时点），利息资本化
  // 公式：借款本金 × 年利率 × (建设期月数/12) × 0.5
  // 0.5 是因为假设资金均匀投入，平均占用时间为建设期的一半
  const constructionYears = constructionMonths / 12;
  const capitalizedInterest = loanPrincipal * loanRateConst * constructionYears * 0.5;

  // 动态总投资 = 静态总投资 + 建设期利息
  const dynamicInvestment = staticInvestment + capitalizedInterest;

  // 资金筹措
  const equityAmount = dynamicInvestment * equityRatio;
  const loanAmount = dynamicInvestment - equityAmount;
  // 注：loanAmount = loanPrincipal + capitalizedInterest

  // 固定资产原值（折旧计算基础）
  // 通常固定资产原值 = 静态总投资 + 建设期利息 - 可抵扣进项税
  // 可抵扣进项税在运营期抵扣，不进入固定资产原值
  const fixedAssetValue = staticInvestment + capitalizedInterest - params.inputVAT;

  // 固定资产残值
  const salvageValue = fixedAssetValue * salvageRate;

  // 年折旧额
  // 如果指定了年折旧额（用于匹配Excel分类折旧），使用指定值
  // 否则使用直线法计算
  const annualDepreciation = specifiedDepreciation ?? (fixedAssetValue - salvageValue) / depreciationYears;

  return {
    staticInvestment,
    capitalizedInterest,
    dynamicInvestment,
    equityAmount,
    loanAmount,
    loanPrincipal,
    fixedAssetValue,
    salvageValue,
    annualDepreciation,
  };
}

/**
 * 获取投资计划表数据（用于表1展示）
 */
export function getInvestmentTableData(result: InvestmentResult) {
  return {
    // 合计列
    total: {
      dynamicInvestment: result.dynamicInvestment,
      staticInvestment: result.staticInvestment,
      capitalizedInterest: result.capitalizedInterest,
      funding: result.dynamicInvestment,
      equity: result.equityAmount,
      loan: result.loanAmount,
    },
    // 建设期（第1年）
    construction: {
      dynamicInvestment: result.dynamicInvestment,
      staticInvestment: result.staticInvestment,
      capitalizedInterest: result.capitalizedInterest,
      funding: result.dynamicInvestment,
      equity: result.equityAmount,
      loan: result.loanAmount,
    },
  };
}