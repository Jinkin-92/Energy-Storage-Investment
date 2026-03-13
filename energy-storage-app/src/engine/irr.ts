/**
 * IRR / NPV / 投资回收期计算模块
 * 核心财务指标计算算法
 */

/**
 * 计算NPV（净现值）
 * @param cashflows 现金流序列（第0期为初始投资）
 * @param rate 折现率
 * @returns 净现值
 */
export function calcNPV(cashflows: number[], rate: number): number {
  return cashflows.reduce((npv, cf, t) => {
    return npv + cf / Math.pow(1 + rate, t);
  }, 0);
}

/**
 * 计算IRR（内部收益率）- 二分法迭代
 * @param cashflows 现金流序列（第0期通常为负，代表初始投资）
 * @param tolerance 容差（默认0.000001，即0.0001%）
 * @param maxIterations 最大迭代次数
 * @returns IRR（小数形式，如0.0638表示6.38%），若无法计算返回NaN
 */
export function calcIRR(
  cashflows: number[],
  tolerance: number = 0.000001,
  maxIterations: number = 500
): number {
  // 验证输入有效性
  if (cashflows.length < 2) {
    return NaN;
  }

  // 检查是否存在正负现金流（IRR存在的必要条件）
  const hasNegative = cashflows.some(cf => cf < 0);
  const hasPositive = cashflows.some(cf => cf > 0);

  if (!hasNegative || !hasPositive) {
    // 全正或全负，IRR无意义
    return cashflows.every(cf => cf >= 0) ? Infinity : -Infinity;
  }

  // 二分法搜索区间
  // 下界：-99%（接近-100%时NPV会趋近无穷大）
  // 上界：10000%（足够大的正收益率）
  let low = -0.99;
  let high = 100.0;

  // 验证区间有效性
  const npvLow = calcNPV(cashflows, low);
  const npvHigh = calcNPV(cashflows, high);

  // NPV函数是单调递减的，所以需要 npv(low) > 0 且 npv(high) < 0
  if (npvLow < 0 || npvHigh > 0) {
    // 无法找到有效区间
    return NaN;
  }

  // 二分迭代
  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npvMid = calcNPV(cashflows, mid);

    // 检查是否达到精度
    if (Math.abs(npvMid) < tolerance) {
      return mid;
    }

    // 更新搜索区间
    if (npvMid > 0) {
      low = mid;
    } else {
      high = mid;
    }

    // 检查区间是否足够小
    if (high - low < tolerance) {
      return mid;
    }
  }

  // 达到最大迭代次数，返回当前估计值
  return (low + high) / 2;
}

/**
 * 计算静态投资回收期
 * @param cashflows 现金流序列
 * @returns 回收期（年），若无法回收返回Infinity
 */
export function calcPaybackPeriod(cashflows: number[]): number {
  let cumulative = 0;

  for (let t = 0; t < cashflows.length; t++) {
    const prevCumulative = cumulative;
    cumulative += cashflows[t];

    // 检查是否在当前年份回正
    if (prevCumulative < 0 && cumulative >= 0) {
      // 线性插值计算精确回收时点
      // 回收期 = t - 1 + |prevCumulative| / cashflows[t]
      return t - 1 + Math.abs(prevCumulative) / cashflows[t];
    }
  }

  // 累计现金流从未回正
  return Infinity;
}

/**
 * 计算动态投资回收期（考虑货币时间价值）
 * @param cashflows 现金流序列
 * @param discountRate 折现率
 * @returns 动态回收期（年）
 */
export function calcDynamicPaybackPeriod(
  cashflows: number[],
  discountRate: number
): number {
  let cumulative = 0;

  for (let t = 0; t < cashflows.length; t++) {
    const prevCumulative = cumulative;
    // 折现后的现金流
    const discountedCF = cashflows[t] / Math.pow(1 + discountRate, t);
    cumulative += discountedCF;

    if (prevCumulative < 0 && cumulative >= 0) {
      return t - 1 + Math.abs(prevCumulative) / discountedCF;
    }
  }

  return Infinity;
}

/**
 * 生成IRR灵敏度分析数据
 * @param baseParams 基准输入参数
 * @param baseIRR 基准IRR
 * @param runEngine 计算引擎函数
 * @param sensitivityParams 要分析的参数列表
 * @param variationRate 变化率（默认10%）
 */
export function calcIRRSensitivity(
  baseParams: Record<string, unknown>,
  baseIRR: number,
  runEngine: (params: Record<string, unknown>) => { yearly: { fcfPostTax: number }[] },
  sensitivityParams: string[],
  variationRate: number = 0.1
): { param: string; up: number; down: number }[] {
  const results: { param: string; up: number; down: number }[] = [];

  for (const param of sensitivityParams) {
    const baseValue = baseParams[param] as number;
    if (typeof baseValue !== 'number' || baseValue === 0) {
      continue;
    }

    // +10% 变化
    const upParams = { ...baseParams, [param]: baseValue * (1 + variationRate) };
    const upResult = runEngine(upParams);
    const upIRR = calcIRR(upResult.yearly.map((y: { fcfPostTax: number }) => y.fcfPostTax));

    // -10% 变化
    const downParams = { ...baseParams, [param]: baseValue * (1 - variationRate) };
    const downResult = runEngine(downParams);
    const downIRR = calcIRR(downResult.yearly.map((y: { fcfPostTax: number }) => y.fcfPostTax));

    results.push({
      param,
      up: upIRR - baseIRR,
      down: downIRR - baseIRR,
    });
  }

  // 按影响绝对值排序
  return results.sort((a, b) => {
    const impactA = Math.abs(a.up) + Math.abs(a.down);
    const impactB = Math.abs(b.up) + Math.abs(b.down);
    return impactB - impactA;
  });
}

/**
 * 根据IRR值判断评级
 * @param irr IRR值（小数）
 * @param type 类型：'project'（全投资）或 'equity'（资本金）
 */
export function getIRRRating(
  irr: number,
  type: 'project' | 'equity' = 'project'
): 'excellent' | 'good' | 'fair' | 'poor' {
  const thresholds = type === 'project'
    ? { excellent: 0.10, good: 0.08, fair: 0.06 }
    : { excellent: 0.15, good: 0.12, fair: 0.08 };

  if (irr >= thresholds.excellent) return 'excellent';
  if (irr >= thresholds.good) return 'good';
  if (irr >= thresholds.fair) return 'fair';
  return 'poor';
}

/**
 * 生成评价结论文字
 * @param params 输入参数
 * @param results 计算结果
 */
export function generateConclusion(
  params: { projectName: string; designLifeYear: number },
  results: {
    irrPreTax: number;
    equityIRR: number;
    paybackPreTax: number;
    avgRevenue: number;
    avgProfit: number;
    avgNetProfit: number;
  }
): string {
  const irrPct = (results.irrPreTax * 100).toFixed(2);
  const equityIrrPct = (results.equityIRR * 100).toFixed(2);
  const payback = results.paybackPreTax.toFixed(1);
  const revenue = results.avgRevenue.toFixed(0);
  const profit = results.avgProfit.toFixed(0);
  const netProfit = results.avgNetProfit.toFixed(0);

  let quality: string;
  let standard: string;

  if (results.irrPreTax >= 0.08) {
    quality = '较好';
    standard = '满足优先投资收益率标准';
  } else if (results.irrPreTax >= 0.06) {
    quality = '一般';
    standard = '满足一般投资收益率标准';
  } else {
    quality = '较差';
    standard = '不满足优先投资收益率标准';
  }

  return (
    `项目运营期${params.designLifeYear}年年均营业收入${revenue}万元，` +
    `年均利润总额${profit}万元，` +
    `年均净利润${netProfit}万元，` +
    `全投资财务内部收益率${irrPct}%，` +
    `资本金财务内部收益率${equityIrrPct}%，` +
    `投资回收期${payback}年。` +
    `综上，项目收益情况${quality}，${standard}。`
  );
}