/**
 * 方案管理工具
 * 使用localStorage存储方案
 */
import type { InputParams } from '../types/financial';

const STORAGE_KEY = 'energy-storage-scenarios';

export interface SavedScenario {
  id: string;
  name: string;
  params: InputParams;
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取所有保存的方案
 */
export function getScenarios(): SavedScenario[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * 保存方案
 */
export function saveScenario(name: string, params: InputParams): SavedScenario {
  const scenarios = getScenarios();
  const id = `scenario_${Date.now()}`;
  const now = new Date().toISOString();

  const scenario: SavedScenario = {
    id,
    name,
    params,
    createdAt: now,
    updatedAt: now,
  };

  scenarios.push(scenario);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));

  return scenario;
}

/**
 * 更新方案
 */
export function updateScenario(id: string, params: InputParams): SavedScenario | null {
  const scenarios = getScenarios();
  const index = scenarios.findIndex(s => s.id === id);

  if (index === -1) return null;

  scenarios[index] = {
    ...scenarios[index],
    params,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  return scenarios[index];
}

/**
 * 删除方案
 */
export function deleteScenario(id: string): boolean {
  const scenarios = getScenarios();
  const filtered = scenarios.filter(s => s.id !== id);

  if (filtered.length === scenarios.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * 加载方案
 */
export function loadScenario(id: string): SavedScenario | null {
  const scenarios = getScenarios();
  return scenarios.find(s => s.id === id) || null;
}

/**
 * 导出方案为JSON文件
 */
export function exportScenarioJSON(scenario: SavedScenario): void {
  const blob = new Blob([JSON.stringify(scenario, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${scenario.name}_方案配置.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 从JSON文件导入方案
 */
export function importScenarioJSON(file: File): Promise<SavedScenario> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.name && data.params) {
          resolve(data as SavedScenario);
        } else {
          reject(new Error('无效的方案文件'));
        }
      } catch {
        reject(new Error('解析JSON失败'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}