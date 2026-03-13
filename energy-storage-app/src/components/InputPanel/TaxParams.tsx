/**
 * 参数输入面板 - 税务参数组
 */
import { useInputStore } from '../../store/inputStore';

export function TaxParams() {
  const { params, setParams } = useInputStore();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 border-b pb-2">税务参数</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">增值税率 (%)</label>
          <input
            type="number"
            step="0.1"
            value={params.vatRateSell * 100}
            onChange={(e) => setParams({ vatRateSell: Number(e.target.value) / 100 })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">销售税金附加率 (%)</label>
          <input
            type="number"
            step="0.1"
            value={params.salesSurchargeRate * 100}
            onChange={(e) => setParams({ salesSurchargeRate: Number(e.target.value) / 100 })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">所得税率 (%)</label>
          <input
            type="number"
            step="0.1"
            value={params.incomeTaxRate * 100}
            onChange={(e) => setParams({ incomeTaxRate: Number(e.target.value) / 100 })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div className="flex items-center pt-5">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={params.vatRefund}
              onChange={(e) => setParams({ vatRefund: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">增值税即征即退(50%)</span>
          </label>
        </div>
      </div>
    </div>
  );
}