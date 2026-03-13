/**
 * 方案管理面板
 */
import { useState, useEffect } from 'react';
import { useInputStore } from '../../store/inputStore';
import { useResultStore } from '../../store/resultStore';
import {
  getScenarios,
  saveScenario,
  loadScenario,
  deleteScenario,
  exportScenarioJSON,
  importScenarioJSON,
  type SavedScenario,
} from '../../utils/scenarioManager';

export function ScenarioPanel() {
  const { params, setParams } = useInputStore();
  const { calculate } = useResultStore();
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    setScenarios(getScenarios());
  }, []);

  const handleSave = () => {
    if (!scenarioName.trim()) return;
    saveScenario(scenarioName.trim(), params);
    setScenarios(getScenarios());
    setShowSaveDialog(false);
    setScenarioName('');
  };

  const handleLoad = (scenario: SavedScenario) => {
    setParams(scenario.params);
    calculate(scenario.params);
    setShowList(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此方案吗？')) {
      deleteScenario(id);
      setScenarios(getScenarios());
    }
  };

  const handleExport = (scenario: SavedScenario) => {
    exportScenarioJSON(scenario);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const scenario = await importScenarioJSON(file);
      saveScenario(scenario.name, scenario.params);
      setScenarios(getScenarios());
    } catch (error) {
      alert('导入失败: ' + (error as Error).message);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">方案管理</h3>
        <button
          onClick={() => setShowList(!showList)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showList ? '收起' : '查看已保存方案'}
        </button>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          保存方案
        </button>
        <label className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer text-center">
          导入方案
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {/* 保存对话框 */}
      {showSaveDialog && (
        <div className="p-3 bg-gray-50 rounded-md space-y-2">
          <input
            type="text"
            placeholder="输入方案名称"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!scenarioName.trim()}
              className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
            >
              保存
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 方案列表 */}
      {showList && scenarios.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {scenarios.map((s) => (
            <div
              key={s.id}
              className="p-2 bg-gray-50 rounded-md flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{s.name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(s.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => handleLoad(s)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  加载
                </button>
                <button
                  onClick={() => handleExport(s)}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  导出
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showList && scenarios.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          暂无保存的方案
        </div>
      )}
    </div>
  );
}