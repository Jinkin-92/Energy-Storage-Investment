/**
 * 参数输入面板 - 投资参数组
 */
import { useInputStore } from '../../store/inputStore';

export function InvestmentParams() {
  const { params, setParams } = useInputStore();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 border-b pb-2">投资与融资参数</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">静态总投资 (万元)</label>
          <input
            type="number"
            value={params.staticInvestment}
            onChange={(e) => setParams({ staticInvestment: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">资本金比例 (%)</label>
          <input
            type="number"
            step="0.1"
            value={params.equityRatio * 100}
            onChange={(e) => setParams({ equityRatio: Number(e.target.value) / 100 })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">建设期贷款利率 (%)</label>
          <input
            type="number"
            step="0.01"
            value={params.loanRateConst * 100}
            onChange={(e) => setParams({ loanRateConst: Number(e.target.value) / 100 })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">运营期贷款利率 (%)</label>
          <input
            type="number"
            step="0.01"
            value={params.loanRateOp * 100}
            onChange={(e) => setParams({ loanRateOp: Number(e.target.value) / 100 })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">贷款年限 (年)</label>
          <input
            type="number"
            value={params.loanYears}
            onChange={(e) => setParams({ loanYears: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">可抵扣进项税 (万元)</label>
          <input
            type="number"
            value={params.inputVAT}
            onChange={(e) => setParams({ inputVAT: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">建设期 (月)</label>
          <input
            type="number"
            value={params.constructionMonths}
            onChange={(e) => setParams({ constructionMonths: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>
    </div>
  );
}