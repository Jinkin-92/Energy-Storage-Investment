/**
 * 借款还本付息计算模块
 * 对应表5：借款还本付息表
 */

import type { InputParams, LoanSchedule } from '../types/financial';

/**
 * 等额本息还款计算（PMT公式）
 * 每年还款金额相同，前期利息多、本金少，后期利息少、本金多
 */
export function calcEqualPayment(
  principal: number,
  annualRate: number,
  years: number
): LoanSchedule[] {
  if (principal <= 0 || years <= 0) {
    return [];
  }

  // PMT公式：PMT = P * r * (1+r)^n / ((1+r)^n - 1)
  // 其中 P=本金, r=年利率, n=还款年数
  const r = annualRate;
  const n = years;

  let pmt: number;
  if (r === 0) {
    // 零利率时，直接平分本金
    pmt = principal / n;
  } else {
    const factor = Math.pow(1 + r, n);
    pmt = principal * r * factor / (factor - 1);
  }

  let balance = principal;
  const schedule: LoanSchedule[] = [];

  for (let i = 1; i <= years; i++) {
    const interest = balance * r;
    const repayPrincipal = pmt - interest;
    balance = Math.max(0, balance - repayPrincipal);

    schedule.push({
      year: i,
      pmt: pmt,
      interest: interest,
      repayPrincipal: repayPrincipal,
      balance: balance,
    });
  }

  return schedule;
}

/**
 * 等额本金还款计算
 * 每年偿还本金相同，利息逐年递减，还款总额逐年递减
 */
export function calcEqualPrincipal(
  principal: number,
  annualRate: number,
  years: number
): LoanSchedule[] {
  if (principal <= 0 || years <= 0) {
    return [];
  }

  const annualPrincipal = principal / years;
  let balance = principal;
  const schedule: LoanSchedule[] = [];

  for (let i = 1; i <= years; i++) {
    const interest = balance * annualRate;
    balance = Math.max(0, balance - annualPrincipal);
    const pmt = annualPrincipal + interest;

    schedule.push({
      year: i,
      pmt: pmt,
      interest: interest,
      repayPrincipal: annualPrincipal,
      balance: balance,
    });
  }

  return schedule;
}

/**
 * 计算借款还本付息计划
 * @param params 输入参数
 * @param loanAmount 贷款总额（含建设期利息）
 * @returns 逐年还款计划（从运营期第1年开始）
 */
export function calcLoanSchedule(
  params: InputParams,
  loanAmount: number
): LoanSchedule[] {
  const { loanRateOp, loanYears, repaymentMethod } = params;

  switch (repaymentMethod) {
    case 'equal_payment':
      return calcEqualPayment(loanAmount, loanRateOp, loanYears);
    case 'equal_principal':
      return calcEqualPrincipal(loanAmount, loanRateOp, loanYears);
    default:
      return calcEqualPayment(loanAmount, loanRateOp, loanYears);
  }
}

/**
 * 扩展还款计划到整个计算期
 * 运营期前 loanYears 年有还款，之后为空
 * @param schedule 还款计划（仅还款年份）
 * @param totalYears 总运营年数
 * @returns 扩展后的年度还款数据（索引0为建设期，1-总年数为运营期）
 */
export function extendLoanSchedule(
  schedule: LoanSchedule[],
  totalYears: number
): { principalRepaid: number; interestRepaid: number; loanBalance: number }[] {
  const result: { principalRepaid: number; interestRepaid: number; loanBalance: number }[] = [];

  // 建设期（year 0）
  result.push({
    principalRepaid: 0,
    interestRepaid: 0,
    loanBalance: 0, // 建设期末贷款余额在投资模块计算
  });

  // 运营期（year 1 ~ totalYears）
  for (let t = 1; t <= totalYears; t++) {
    const scheduleItem = schedule.find(s => s.year === t);
    if (scheduleItem) {
      result.push({
        principalRepaid: scheduleItem.repayPrincipal,
        interestRepaid: scheduleItem.interest,
        loanBalance: scheduleItem.balance,
      });
    } else {
      // 还款期结束后，贷款余额为0
      result.push({
        principalRepaid: 0,
        interestRepaid: 0,
        loanBalance: 0,
      });
    }
  }

  return result;
}

/**
 * 获取借款还本付息汇总数据
 */
export function getLoanSummary(schedule: LoanSchedule[]) {
  const totalPrincipalRepaid = schedule.reduce((sum, s) => sum + s.repayPrincipal, 0);
  const totalInterestRepaid = schedule.reduce((sum, s) => sum + s.interest, 0);
  const totalPayment = schedule.reduce((sum, s) => sum + s.pmt, 0);

  return {
    totalPrincipalRepaid,
    totalInterestRepaid,
    totalPayment,
    loanYears: schedule.length,
  };
}