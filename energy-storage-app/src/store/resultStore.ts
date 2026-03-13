/**
 * 计算结果状态管理
 */
import { create } from 'zustand';
import type { CalculationResults, YearlyResult } from '../types/financial';
import { runEngine } from '../engine';

interface ResultState {
  results: CalculationResults | null;
  yearly: YearlyResult[];
  isCalculated: boolean;
  calculate: (params: Parameters<typeof runEngine>[0]) => void;
  clearResults: () => void;
}

export const useResultStore = create<ResultState>((set) => ({
  results: null,
  yearly: [],
  isCalculated: false,
  calculate: (params) => {
    const output = runEngine(params);
    set({
      results: output.results,
      yearly: output.yearly,
      isCalculated: true,
    });
  },
  clearResults: () =>
    set({
      results: null,
      yearly: [],
      isCalculated: false,
    }),
}));