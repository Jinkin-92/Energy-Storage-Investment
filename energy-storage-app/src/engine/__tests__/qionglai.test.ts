/**
 * 邛崃项目验证测试
 * 使用基准案例验证计算引擎精度
 */

import { describe, it, expect } from 'vitest';
import { runEngine } from '../index';
import { DEFAULT_INPUT_PARAMS, QIONGLAI_EXPECTED } from '../../types/financial';
import type { InputParams } from '../../types/financial';

describe('邛崃项目基准验证', () => {
  // 使用默认参数（邛崃项目）
  const params: InputParams = { ...DEFAULT_INPUT_PARAMS };
  const output = runEngine(params);
  const { results, investment } = output;

  describe('投资计算验证', () => {
    it('静态总投资应等于基准值', () => {
      expect(investment.staticInvestment).toBeCloseTo(QIONGLAI_EXPECTED.staticInvestment, 2);
    });

    it('动态总投资误差应小于0.01万元', () => {
      expect(investment.dynamicInvestment).toBeCloseTo(QIONGLAI_EXPECTED.dynamicInvestment, 2);
    });

    it('资本金误差应小于0.01万元', () => {
      expect(investment.equityAmount).toBeCloseTo(QIONGLAI_EXPECTED.equityAmount, 2);
    });

    it('长期借款误差应小于0.01万元', () => {
      expect(investment.loanAmount).toBeCloseTo(QIONGLAI_EXPECTED.loanAmount, 2);
    });

    it('建设期利息误差应小于0.01万元', () => {
      expect(investment.capitalizedInterest).toBeCloseTo(QIONGLAI_EXPECTED.capitalizedInterest, 2);
    });
  });

  describe('IRR计算验证', () => {
    it('全投资IRR(税前)误差应小于0.01%', () => {
      const expectedIRR = QIONGLAI_EXPECTED.irrPreTax;
      const actualIRR = results.irrPreTax;
      const error = Math.abs(actualIRR - expectedIRR);
      console.log(`全投资IRR(税前): 期望=${(expectedIRR * 100).toFixed(2)}%, 实际=${(actualIRR * 100).toFixed(2)}%, 误差=${(error * 100).toFixed(4)}%`);
      expect(error).toBeLessThan(0.0001); // 0.01%
    });

    it('资本金IRR误差应小于0.01%', () => {
      const expectedIRR = QIONGLAI_EXPECTED.equityIRR;
      const actualIRR = results.equityIRR;
      const error = Math.abs(actualIRR - expectedIRR);
      console.log(`资本金IRR: 期望=${(expectedIRR * 100).toFixed(2)}%, 实际=${(actualIRR * 100).toFixed(2)}%, 误差=${(error * 100).toFixed(4)}%`);
      expect(error).toBeLessThan(0.0001); // 0.01%
    });
  });

  describe('投资回收期验证', () => {
    it('静态投资回收期(税前)误差应小于0.1年', () => {
      const expected = QIONGLAI_EXPECTED.paybackPreTax;
      const actual = results.paybackPreTax;
      const error = Math.abs(actual - expected);
      console.log(`投资回收期(税前): 期望=${expected.toFixed(2)}年, 实际=${actual.toFixed(2)}年, 误差=${error.toFixed(2)}年`);
      expect(error).toBeLessThan(0.1);
    });
  });

  describe('年均值验证', () => {
    it('年均营业收入误差应小于1万元', () => {
      const expected = QIONGLAI_EXPECTED.avgRevenue;
      const actual = results.avgRevenue;
      const error = Math.abs(actual - expected);
      console.log(`年均营业收入: 期望=${expected.toFixed(2)}万元, 实际=${actual.toFixed(2)}万元, 误差=${error.toFixed(2)}万元`);
      expect(error).toBeLessThan(1);
    });

    it('年均利润总额误差应小于1万元', () => {
      const expected = QIONGLAI_EXPECTED.avgProfit;
      const actual = results.avgProfit;
      const error = Math.abs(actual - expected);
      console.log(`年均利润总额: 期望=${expected.toFixed(2)}万元, 实际=${actual.toFixed(2)}万元, 误差=${error.toFixed(2)}万元`);
      expect(error).toBeLessThan(1);
    });

    it('年均净利润误差应小于1万元', () => {
      const expected = QIONGLAI_EXPECTED.avgNetProfit;
      const actual = results.avgNetProfit;
      const error = Math.abs(actual - expected);
      console.log(`年均净利润: 期望=${expected.toFixed(2)}万元, 实际=${actual.toFixed(2)}万元, 误差=${error.toFixed(2)}万元`);
      expect(error).toBeLessThan(1);
    });
  });

  describe('逐年数据验证', () => {
    it('运营期年数应正确', () => {
      expect(results.yearly.length).toBe(params.designLifeYear + 1); // 包含建设期
    });

    it('建设期现金流应为负的静态总投资', () => {
      expect(results.yearly[0].fcfPreTax).toBeCloseTo(-investment.staticInvestment, 2);
    });

    it('末年贷款余额应为0', () => {
      const lastYear = results.yearly[results.yearly.length - 1];
      expect(lastYear.loanBalance).toBeCloseTo(0, 2);
    });
  });
});

import { calcIRR } from '../irr';

describe('IRR算法验证', () => {
  it('简单现金流IRR计算', () => {
    // 投资-100，第一年收回50，第二年收回60，第三年收回70
    const cashflows = [-100, 50, 60, 70];
    const irr = calcIRR(cashflows);
    // 手算IRR约为 32.97%
    expect(irr).toBeGreaterThan(0.30);
    expect(irr).toBeLessThan(0.35);
  });

  it('负IRR处理', () => {
    // 投资无法收回
    const cashflows = [-100, 20, 20, 20];
    const irr = calcIRR(cashflows);
    expect(irr).toBeLessThan(0);
  });
});