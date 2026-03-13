/**
 * 参数输入面板 - 基本参数组
 */
import { useInputStore } from '../../store/inputStore';

export function BasicParams() {
  const { params, setParams } = useInputStore();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 border-b pb-2">基本参数</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">项目名称</label>
          <input
            type="text"
            value={params.projectName}
            onChange={(e) => setParams({ projectName: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">装机容量 (万kW)</label>
          <input
            type="number"
            value={params.capacityMW}
            onChange={(e) => setParams({ capacityMW: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">储能时长 (h)</label>
          <input
            type="number"
            value={params.durationH}
            onChange={(e) => setParams({ durationH: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">运营期 (年)</label>
          <input
            type="number"
            value={params.designLifeYear}
            onChange={(e) => setParams({ designLifeYear: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>
    </div>
  );
}