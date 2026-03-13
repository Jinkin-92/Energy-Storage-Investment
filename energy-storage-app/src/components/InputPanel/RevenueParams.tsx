/**
 * 参数输入面板 - 收益参数组
 */
import { useInputStore } from '../../store/inputStore';

export function RevenueParams() {
  const { params, setParams } = useInputStore();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 border-b pb-2">收益参数</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">充电电价 (含税, 元/kWh)</label>
          <input
            type="number"
            step="0.0001"
            value={params.chargePriceVAT}
            onChange={(e) => setParams({ chargePriceVAT: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">放电电价 (含税, 元/kWh)</label>
          <input
            type="number"
            step="0.0001"
            value={params.dischargePriceVAT}
            onChange={(e) => setParams({ dischargePriceVAT: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">年调度次数</label>
          <input
            type="number"
            value={params.annualCycles}
            onChange={(e) => setParams({ annualCycles: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">系统转换效率 (%)</label>
          <input
            type="number"
            step="0.01"
            value={params.roundTripEff * 100}
            onChange={(e) => setParams({ roundTripEff: Number(e.target.value) / 100 })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">放电深度 (%)</label>
          <input
            type="number"
            step="0.01"
            value={params.dod * 100}
            onChange={(e) => setParams({ dod: Number(e.target.value) / 100 })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">首年容量保持率 (%)</label>
          <input
            type="number"
            step="0.01"
            value={params.capacityRetentionY1 * 100}
            onChange={(e) => setParams({ capacityRetentionY1: Number(e.target.value) / 100 })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">年容量衰减率 (%)</label>
          <input
            type="number"
            step="0.01"
            value={params.annualDegradation * 100}
            onChange={(e) => setParams({ annualDegradation: Number(e.target.value) / 100 })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">调峰调频收入 (万元/年)</label>
          <input
            type="number"
            value={params.frequencyRevenue}
            onChange={(e) => setParams({ frequencyRevenue: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">补贴电价合计 (万元/年)</label>
          <input
            type="number"
            value={params.subsidyPriceTotal}
            onChange={(e) => setParams({ subsidyPriceTotal: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>
    </div>
  );
}