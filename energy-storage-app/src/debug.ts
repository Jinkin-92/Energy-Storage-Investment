/**
 * 调试脚本：分析计算过程中的数据
 */

import { runEngine } from './engine/index';
import { DEFAULT_INPUT_PARAMS } from './types/financial';
import { calcIRR, calcNPV } from './engine/irr';

const params = { ...DEFAULT_INPUT_PARAMS };
const output = runEngine(params);
const { results, investment, yearly } = output;

console.log('=== 投资计算结果 ===');
console.log('静态总投资:', investment.staticInvestment.toFixed(2), '万元');
console.log('建设期利息:', investment.capitalizedInterest.toFixed(2), '万元');
console.log('动态总投资:', investment.dynamicInvestment.toFixed(2), '万元');
console.log('资本金:', investment.equityAmount.toFixed(2), '万元');
console.log('长期借款:', investment.loanAmount.toFixed(2), '万元');

console.log('\n=== 财务指标 ===');
console.log('全投资IRR(税前):', (results.irrPreTax * 100).toFixed(2), '%');
console.log('资本金IRR:', (results.equityIRR * 100).toFixed(2), '%');
console.log('投资回收期(税前):', results.paybackPreTax.toFixed(2), '年');
console.log('年均营业收入:', results.avgRevenue.toFixed(2), '万元');

console.log('\n=== 现金流序列 ===');
const cashflowsPreTax = yearly.map(y => y.fcfPreTax);
console.log('全投资税前现金流序列:', cashflowsPreTax.map(c => c.toFixed(0)).join(', '));

const calculatedIRR = calcIRR(cashflowsPreTax);
console.log('手动计算的IRR:', (calculatedIRR * 100).toFixed(2), '%');

const npv8 = calcNPV(cashflowsPreTax, 0.08);
console.log('NPV(8%):', npv8.toFixed(2), '万元');

console.log('\n=== 逐年详细数据 ===');
yearly.forEach((y) => {
  if (y.year <= 5) {
    console.log(`\n--- Year ${y.year} ---`);
    console.log('放电量:', y.dischargeKWh.toFixed(2), '万kWh');
    console.log('含税收入:', y.revenueVAT.toFixed(2), '万元');
    console.log('销项税:', y.vatSales.toFixed(2), '万元');
    console.log('可抵扣进项:', y.vatInput.toFixed(2), '万元');
    console.log('缴纳增值税:', y.vatPaid.toFixed(2), '万元');
    console.log('增值税即征即退:', y.vatRefundAmount.toFixed(2), '万元');
    console.log('销售税金附加:', y.salesSurcharge.toFixed(2), '万元');
    console.log('---成本明细---');
    console.log('折旧费:', y.depreciation.toFixed(2), '万元');
    console.log('运维费:', y.omCost.toFixed(2), '万元');
    console.log('人工成本:', y.laborCost.toFixed(2), '万元');
    console.log('保险费:', y.insurance.toFixed(2), '万元');
    console.log('利息支出:', y.interest.toFixed(2), '万元');
    console.log('土地费用:', y.landFee.toFixed(2), '万元');
    console.log('购电电费:', y.purchasedElec.toFixed(2), '万元');
    console.log('总成本:', y.totalCost.toFixed(2), '万元');
    console.log('经营成本:', y.operatingCost.toFixed(2), '万元');
    console.log('---现金流---');
    console.log('现金流入:', y.inflow.toFixed(2), '万元');
    console.log('现金流出:', y.outflow.toFixed(2), '万元');
    console.log('FCF(税前):', y.fcfPreTax.toFixed(2), '万元');
    console.log('利润总额:', y.profitTotal.toFixed(2), '万元');
  }
});

console.log('\n=== 电量计算验证 ===');
// 邛崃项目参数
const capacityMW = 10; // 10万kW = 100MW
const durationH = 2;
const capacityMWh = capacityMW * durationH; // 20万kWh
const retentionY1 = 0.9639;
// const degradation = 0.012; // 未使用
const dod = 0.95;
const eff = 0.86;
const cycles = 255;

console.log('额定容量:', capacityMWh, '万kWh');
console.log('首年容量保持率:', retentionY1);

// 首年放电量计算
const retention1 = retentionY1;
const availableEnergy1 = capacityMWh * retention1; // 可用容量
const discharge1 = availableEnergy1 * dod * eff * cycles;
console.log('首年可用容量:', availableEnergy1.toFixed(2), '万kWh');
console.log('计算的首年放电量:', discharge1.toFixed(2), '万kWh');
console.log('实际首年放电量:', yearly[1].dischargeKWh.toFixed(2), '万kWh');

// 首年收入计算
const dischargePrice = 0.5868; // 含税放电电价 元/kWh
const expectedRevenue1 = discharge1 * dischargePrice;
console.log('计算的首年放电收入:', expectedRevenue1.toFixed(2), '万元');
console.log('实际首年放电收入:', yearly[1].dischargeRevenue.toFixed(2), '万元');
console.log('实际首年含税收入:', yearly[1].revenueVAT.toFixed(2), '万元');