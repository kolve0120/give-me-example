// 訂單表單專用 Store（用於新增訂單頁面）
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, Product, SalesItem, OrderInfo } from '@/types';

interface OrderFormState {
  // 客戶相關
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  
  // 銷售項目
  salesItems: SalesItem[];
  addSalesItem: (product: Product, quantity?: number) => void;
  updateSalesItem: (index: number, updates: Partial<SalesItem>) => void;
  removeSalesItem: (index: number) => void;
  setSalesItems: (items: SalesItem[]) => void;
  reorderSalesItems: (items: SalesItem[]) => void;
  
  // 訂單資訊
  orderInfo: OrderInfo;
  updateOrderInfo: (info: Partial<OrderInfo>) => void;
  
  // 計算方法
  getTotalQuantity: () => number;
  getTotalAmount: () => number;
  
  // 清除方法
  clearAll: () => void;
}

const getInitialOrderInfo = (): OrderInfo => ({
  date: new Date().toISOString().split("T")[0],
  serialNumber: "",
  paperSerialNumber: "",
  customer: undefined,
  status: "待處理",
});

export const useOrderFormStore = create<OrderFormState>()(
  persist(
    (set, get) => ({
      selectedCustomer: null,
      salesItems: [],
      orderInfo: getInitialOrderInfo(),

      setSelectedCustomer: (customer) => {
        set({ selectedCustomer: customer });
        
        if (customer) {
          const { salesItems } = get();
          const updatedItems = salesItems.map(item => {
            const price = item.priceDistribution || item.priceRetail;
            return {
              ...item,
              priceDistribution: price,
              totalPrice: item.quantity * price,
            };
          });
          set({ salesItems: updatedItems });
        }
      },

      addSalesItem: (product, quantity = 1) => {
        const { salesItems } = get();
        const price = product.priceDistribution || product.priceRetail;
        const newItem: SalesItem = {
          ...product,
          quantity,
          priceDistribution: price,
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
        set({ salesItems: salesItems.filter((_, i) => i !== index) });
      },

      setSalesItems: (items) => set({ salesItems: items }),

      reorderSalesItems: (items) => set({ salesItems: items }),

      updateOrderInfo: (info) => {
        const { orderInfo } = get();
        set({ orderInfo: { ...orderInfo, ...info } });
      },

      getTotalQuantity: () => {
        const { salesItems } = get();
        return salesItems.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalAmount: () => {
        const { salesItems } = get();
        return salesItems.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      clearAll: () => {
        set({
          selectedCustomer: null,
          salesItems: [],
          orderInfo: getInitialOrderInfo(),
        });
      },
    }),
    {
      name: 'order-form-storage',
      partialize: (state) => ({
        selectedCustomer: state.selectedCustomer,
        salesItems: state.salesItems,
        orderInfo: state.orderInfo,
      }),
    }
  )
);
