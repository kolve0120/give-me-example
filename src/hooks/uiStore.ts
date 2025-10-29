// @/hooks/uiStore.ts
import { StateCreator } from 'zustand';

export interface UISlice {
  // State
  expandedComponent: string | null;
  showSuccessModal: boolean;
  productSidebarOpen: boolean;

  // Actions
  setExpandedComponent: (component: string | null) => void;
  setShowSuccessModal: (show: boolean) => void;
  setProductSidebarOpen: (open: boolean) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  // Initial state
  expandedComponent: null,
  showSuccessModal: false,
  productSidebarOpen: false,

  // Actions
  setExpandedComponent: (component) => set({ expandedComponent: component }),
  setShowSuccessModal: (show) => set({ showSuccessModal: show }),
  setProductSidebarOpen: (open) => set({ productSidebarOpen: open }),
});