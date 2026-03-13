/**
 * 参数输入面板 - 整合组件
 */
import { useInputStore } from '../../store/inputStore';
import { useResultStore } from '../../store/resultStore';
import { BasicParams } from './BasicParams';
import { RevenueParams } from './RevenueParams';
import { InvestmentParams } from './InvestmentParams';
import { TaxParams } from './TaxParams';
import { ExportButtons } from './ExportButtons';
import { ScenarioPanel } from './ScenarioPanel';

export function InputPanel() {
  const { params, resetParams } = useInputStore();
  const { calculate } = useResultStore();

  const handleCalculate = () => {
    calculate(params);
  };

  const handleReset = () => {
    resetParams();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-semibold">参数输入</h2>
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          重置参数
        </button>
      </div>

      <BasicParams />
      <RevenueParams />
      <InvestmentParams />
      <TaxParams />

      <button
        onClick={handleCalculate}
        className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        开始计算
      </button>

      {/* 导出按钮 */}
      <ExportButtons />

      {/* 方案管理 */}
      <ScenarioPanel />
    </div>
  );
}