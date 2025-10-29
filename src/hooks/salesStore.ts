// @/hooks/salesStore.ts
import { StateCreator } from 'zustand';
import { Product, SalesItem } from '@/types';

export interface SalesSlice {
  // State
  salesItems: SalesItem[];

  // Actions
  setSalesItems: (items: SalesItem[]) => void;
  addSalesItem: (product: Product, quantity?: number) => void;
  updateSalesItem: (index: number, updates: Partial<SalesItem>) => void;
  removeSalesItem: (index: number) => void;
  clearSalesItems: () => void;
  reorderSalesItems: (items: SalesItem[]) => void;
  
  // Computed
  getTotalQuantity: () => number;
  getTotalAmount: () => number;
}

export const createSalesSlice: StateCreator<
  SalesSlice,
  [],
  [],
  SalesSlice
> = (set, get) => ({
  // Initial state
  salesItems: [],

  // Actions
  setSalesItems: (items) => set({ salesItems: items }),

  addSalesItem: (product, quantity = 1) => {
    const { salesItems } = get();
    const price = product.priceDistribution || product.priceRetail;
    const newItem: SalesItem = {
      ...product,
      quantity,
      totalPrice: quantity * price,
      time: Date.now(),
    };
    set({ salesItems: [...salesItems, newItem] });
  },

  updateSalesItem: (index, updates) => {
    const { salesItems } = get();
    const updatedItems = [...salesItems];
    const item = { ...updatedItems[index], ...updates };
    
    if ('quantity' in updates || 'priceDistribution' in updates) {
      item.totalPrice = item.quantity * item.priceDistribution;
    }
    
    updatedItems[index] = item;
    set({ salesItems: updatedItems });
  },

  removeSalesItem: (index) => {
    const { salesItems } = get();
    const updatedItems = salesItems.filter((_, i) => i !== index);
    set({ salesItems: updatedItems });
  },

  clearSalesItems: () => set({ salesItems: [] }),

  reorderSalesItems: (items) => set({ salesItems: items }),

  // Computed
  getTotalQuantity: () => {
    const { salesItems } = get();
    return salesItems.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalAmount: () => {
    const { salesItems } = get();
    return salesItems.reduce((sum, item) => sum + item.totalPrice, 0);
  },
});