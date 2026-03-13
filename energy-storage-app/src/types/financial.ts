/**
 * 储能投资分析系统 - 核心类型定义
 * 基于技术文档第四章 4.1节
 */

// ===== 还款方式 =====
export type RepaymentMethod = 'equal_payment' | 'equal_principal';

// ===== 税务政策类型 =====
export type TaxPolicy = 'western_development' | 'high_tech' | 'standard';

// ===== 充放电模式 =====
export type ChargeMode = 'one_charge_one_discharge' | 'two_charge_two_discharge';

// ===== 分段运维费率 =====
export interface OmRatePeriod {
  years: number;   // 截止年份
  rate: number;    // 费率（小数，如 0.0054 表示 0.54%）
}

// ===== 输入参数 =====
export interface InputParams {
  // 基本项目参数
  projectName: string;
  capacityMW: number;           // 装机容量 万kW
  durationH: number;            // 储能时长 h
  designLifeYear: number;       // 运营期 年
  constructionMonths: number;   // 项目建设周期 月

  // 收益类参数
  chargeMode: ChargeMode;
  chargePriceVAT: number;       // 充电电价（含税）元/kWh
  dischargePriceVAT: number;    // 放电电价（含税）元/kWh
  annualCycles: number;         // 年调度次数
  roundTripEff: number;         // 系统转换效率（小数）
  dod: number;                  // 放电深度（小数）
  capacityRetentionY1: number;  // 容量保持率（首年运营）
  annualDegradation: number;    // 年容量衰减率（小数）
  frequencyRevenue: number;     // 调峰调频补贴收入 万元/年
  govSubsidy: number[];         // 政府补贴逐年 [0,Y1,Y2,...] 万元
  subsidyPriceTotal: number;    // 补贴电价合计（含税）万元/年
  vatRefund: boolean;           // 增值税即征即退

  // 投资与融资参数
  staticInvestment: number;     // 静态总投资 万元
  equityRatio: number;          // 资本金比例（小数）
  loanRateConst: number;        // 建设期贷款利率（小数）
  loanRateOp: number;           // 运营期贷款利率（小数）
  loanYears: number;            // 贷款年限
  repaymentMethod: RepaymentMethod;
  inputVAT: number;             // 可抵扣增值税进项税 万元

  // 成本类参数
  depreciationYears: number;    // 折旧年限
  salvageRate: number;          // 折旧残值率（小数）
  annualDepreciation?: number;  // 指定年折旧额（可选，用于分类折旧匹配Excel）万元/年
  omRateByPeriod: OmRatePeriod[]; // 分段运维费率
  insuranceRate: number;        // 年保险费率（小数）
  staffCount: number;           // 人员定员
  salaryPerPerson: number;      // 人均年薪 万元
  salaryGrowth: number;         // 薪酬年增长率（小数）
  landFee: number;              // 土地费用 万元/年
  otherCost: number;            // 其他费用 万元/年

  // 税务参数
  vatRateSell: number;          // 增值税税率（小数）
  salesSurchargeRate: number;   // 销售税金及附加税率（小数）
  incomeTaxRate: number;        // 所得税税率（小数）
  taxPolicy: TaxPolicy;
  province: string;
}

// ===== 逐年还款计划 =====
export interface LoanSchedule {
  year: number;
  pmt: number;              // 本年还本付息合计 万元
  interest: number;         // 本年偿还利息 万元
  repayPrincipal: number;   // 本年偿还本金 万元
  balance: number;          // 期末借款余额 万元
}

// ===== 逐年计算结果 =====
export interface YearlyResult {
  year: number;
  // 电量
  dischargeKWh: number;     // 年放电量 万kWh
  chargeKWh: number;        // 年充电量 万kWh
  capacityRetention: number; // 当年容量保持率

  // 收入
  revenueVAT: number;       // 含税营业收入 万元
  revenueNoVAT: number;     // 不含税营业收入 万元
  dischargeRevenue: number; // 放电收入 万元
  frequencyRevenue: number; // 调峰调频收入 万元
  govSubsidyAmount: number; // 政府补贴 万元
  subsidyPriceRevenue: number; // 补贴电价收入 万元

  // 增值税
  vatSales: number;         // 销项税 万元
  vatInput: number;         // 可抵扣进项税 万元
  vatPaid: number;          // 当期缴纳增值税 万元
  vatRefundAmount: number;  // 即征即退退还金额 万元
  vatInputRemaining: number; // 剩余可抵扣进项税 万元

  // 税金
  salesSurcharge: number;   // 销售税金及附加 万元

  // 成本
  depreciation: number;     // 折旧费 万元
  omCost: number;           // 运维费 万元
  laborCost: number;        // 人工成本 万元
  insurance: number;        // 保险费 万元
  interest: number;         // 利息支出（财务费用）万元
  landFee: number;          // 土地费用 万元
  purchasedElec: number;    // 购电电费 万元
  otherCost: number;        // 其他费用 万元
  totalCost: number;        // 总成本费用 万元
  operatingCost: number;    // 经营成本 万元

  // 利润
  profitTotal: number;      // 利润总额 万元
  carryForwardLoss: number; // 可弥补亏损 万元
  taxableProfit: number;    // 应纳税所得额 万元
  incomeTax: number;        // 所得税 万元
  netProfit: number;        // 净利润 万元

  // 利润分配
  legalReserve: number;        // 法定公积金 万元
  legalReserveAccum: number;   // 累计法定公积金 万元
  distributableProfit: number; // 可供分配利润 万元
  retainedEarnings: number;    // 累计未分配利润 万元

  // 借款还款
  loanBalance: number;      // 贷款余额 万元
  principalRepaid: number;  // 本年偿还本金 万元
  interestRepaid: number;   // 本年偿还利息 万元

  // 全投资现金流
  inflow: number;           // 现金流入 万元
  outflow: number;          // 现金流出 万元
  fcfPreTax: number;        // 全投资税前净现金流 万元
  fcfPostTax: number;       // 全投资税后净现金流 万元
  cumFCFPreTax: number;     // 累计税前净现金流 万元
  cumFCFPostTax: number;    // 累计税后净现金流 万元
  adjTax: number;           // 调整所得税 万元

  // 资本金现金流
  equityCF: number;         // 资本金净现金流 万元
  cumEquityCF: number;      // 累计资本金净现金流 万元
}

// ===== 汇总计算结果 =====
export interface CalculationResults {
  // 逐年数据
  yearly: YearlyResult[];

  // 投资相关
  staticInvestment: number;      // 静态总投资 万元
  dynamicInvestment: number;     // 动态总投资 万元
  equityAmount: number;          // 资本金 万元
  loanAmount: number;            // 长期借款 万元
  capitalizedInterest: number;   // 建设期利息 万元
  fixedAssetValue: number;       // 固定资产原值 万元
  salvageValue: number;          // 固定资产残值 万元
  annualDepreciation: number;    // 年折旧额 万元

  // 财务指标
  irrPreTax: number;            // 全投资IRR（税前）
  irrPostTax: number;           // 全投资IRR（税后）
  equityIRR: number;            // 资本金IRR（税后）
  npvPreTax: number;            // NPV（税前）万元
  npvPostTax: number;           // NPV（税后）万元
  paybackPreTax: number;        // 静态投资回收期（税前）年
  paybackPostTax: number;       // 静态投资回收期（税后）年

  // 年均值
  avgRevenue: number;           // 年均营业收入 万元
  avgProfit: number;            // 年均利润总额 万元
  avgNetProfit: number;         // 年均净利润 万元
  totalRevenue: number;         // 总营业收入 万元
  totalNetProfit: number;       // 总净利润 万元

  // 还款汇总
  totalPrincipalRepaid: number; // 偿还本金总额 万元
  totalInterestRepaid: number;  // 偿还利息总额 万元
  totalLoanPayment: number;     // 还本付息总额 万元

  // 评价结论
  conclusion: string;
  irrRating: 'excellent' | 'good' | 'fair' | 'poor';
}

// ===== 默认输入参数（邛崃项目基准值）=====
export const DEFAULT_INPUT_PARAMS: InputParams = {
  // 基本参数
  projectName: '邛崃储能项目',
  capacityMW: 10,              // 10万kW = 100MW
  durationH: 2,                // 2小时
  designLifeYear: 12,          // 12年运营期
  constructionMonths: 12,      // 12个月建设期

  // 收益参数
  chargeMode: 'one_charge_one_discharge',
  chargePriceVAT: 0.2815,      // 元/kWh
  dischargePriceVAT: 0.5868,   // 元/kWh
  annualCycles: 255,           // 次/年
  roundTripEff: 0.86,          // 86%
  dod: 0.95,                   // 95%
  capacityRetentionY1: 0.9639, // 96.39%
  annualDegradation: 0.012,    // ~1.2%/年
  frequencyRevenue: 240,       // 万元/年
  govSubsidy: [0, 2000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 首年2000万
  subsidyPriceTotal: 1000,    // 补贴电价合计 万元/年
  vatRefund: true,

  // 投资参数
  staticInvestment: 15846.26,  // 万元
  equityRatio: 0.20,           // 20%
  loanRateConst: 0.03,         // 3%
  loanRateOp: 0.03,            // 3%
  loanYears: 10,               // 10年
  repaymentMethod: 'equal_payment',
  inputVAT: 1443.28,           // 万元

  // 成本参数
  depreciationYears: 12,
  salvageRate: 0.05,           // 5%
  annualDepreciation: 1149.29, // Excel分类折旧结果 万元/年
  omRateByPeriod: [
    // Excel实际值：第1年78.35万, 第2-4年84.19万, 第5-8年90.02万, 第9-12年98.78万
    // 使用乘数模式：基准费率 × 年份乘数
    { years: 1, rate: 0.00494 },   // Year 1: 0.8x
    { years: 4, rate: 0.00531 },   // Years 2-4: 1.0x
    { years: 8, rate: 0.00568 },   // Years 5-8: 1.2x
    { years: 12, rate: 0.00623 },  // Years 9-12: 1.5x
  ],
  insuranceRate: 0.0015,       // 0.15%
  staffCount: 4,
  salaryPerPerson: 33,         // 万元
  salaryGrowth: 0.03,          // 3%
  landFee: 35.20,              // 万元/年
  otherCost: 0,

  // 税务参数
  vatRateSell: 0.13,           // 13%
  salesSurchargeRate: 0.12,    // 12%（城建税7%+附加5%）
  incomeTaxRate: 0.15,         // 15%（西部大开发优惠）
  taxPolicy: 'western_development',
  province: '四川',
};

// ===== 验证基准（邛崃项目预期结果）=====
export const QIONGLAI_EXPECTED = {
  staticInvestment: 15846.26,
  dynamicInvestment: 16036.41,
  equityAmount: 3207.28,
  loanAmount: 12829.13,
  capitalizedInterest: 190.16,
  irrPreTax: 0.0638,           // 6.38%
  equityIRR: 0.1797,           // 17.97%
  paybackPreTax: 9.20,         // 年
  avgRevenue: 3175.15,         // 万元
  avgProfit: 230.06,           // 万元
  avgNetProfit: 211.07,        // 万元
};