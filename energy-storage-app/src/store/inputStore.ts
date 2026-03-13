/**
 * 输入参数状态管理
 */
import { create } from 'zustand';
import type { InputParams } from '../types/financial';
import { DEFAULT_INPUT_PARAMS } from '../types/financial';

interface InputState {
  params: InputParams;
  setParams: (params: Partial<InputParams>) => void;
  resetParams: () => void;
}

export const useInputStore = create<InputState>((set) => ({
  params: { ...DEFAULT_INPUT_PARAMS },
  setParams: (newParams) =>
    set((state) => ({
      params: { ...state.params, ...newParams },
    })),
  resetParams: () => set({ params: { ...DEFAULT_INPUT_PARAMS } }),
}));