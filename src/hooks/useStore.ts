// @/hooks/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomerSlice, createCustomerSlice } from './customerStore';
import { ProductSlice, createProductSlice } from './productStore';
import { SalesSlice, createSalesSlice } from './salesStore';
import { OrderSlice, createOrderSlice } from './orderStore';
import { UISlice, createUISlice } from './uiStore';
import { AuthSlice, createAuthSlice } from './authStore';

// 重新導出類型,讓其他檔案可以直接從 useStore 導入
export type { Customer, Product, SalesItem, Order, OrderInfo } from '@/types';

// 組合所有 slice
type StoreState = CustomerSlice & 
  ProductSlice & 
  SalesSlice & 
  OrderSlice & 
  UISlice &
  AuthSlice & {
    // 額外的全域方法
    clearAll: () => void;
    getProductPrice: (productCode: string) => number;
    isInitialized: boolean;
    initializeApp: () => Promise<void>;
  };

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // 組合所有 slice
      ...createCustomerSlice(set, get, {} as any),
      ...createProductSlice(set, get, {} as any),
      ...createSalesSlice(set, get, {} as any),
      ...createOrderSlice(set, get, {} as any),
      ...createUISlice(set, get, {} as any),
      ...createAuthSlice(set, get, {} as any),

      // 覆寫 setSelectedCustomer 以處理價格重算
      setSelectedCustomer: (customer) => {
        set({ selectedCustomer: customer });
        
        if (customer) {
          const { salesItems } = get();
          console.log(salesItems);
          const updatedItems = salesItems.map(item => {
            const price = get().getProductPrice(item.code);
            return {
              ...item,
              priceDistribution: price,
              totalPrice: item.quantity * price,
            };
          });
          set({ salesItems: updatedItems });
        }
      },

      // 全域清除方法
      clearAll: () => {
        get().clearCustomer();
        get().clearProducts();
        get().clearSalesItems();
        get().resetOrderInfo();
      },

      // 價格計算邏輯
      getProductPrice: (productCode) => {
        const { products, selectedCustomer } = get();
        const product = products.find(p => p.code === productCode);
        if (!product) return 0;
        
        // 可以在這裡實現客戶專屬價格邏輯
        // 目前先返回經銷價,如果沒有則返回零售價
        return product.priceDistribution || product.priceRetail;
      },

      // 初始化狀態
      isInitialized: false,

      // 統一初始化入口，避免重複載入
      initializeApp: async () => {
        const state = get();
        if (state.isInitialized) {
          console.log('App already initialized, skipping...');
          return;
        }
        
        console.log('Initializing app data...');
        set({ isInitialized: true });
        
        try {
          // 並行載入產品和客戶資料
          await Promise.all([
            state.loadProductsFromApi(),
            state.loadCustomersFromApi(),
          ]);
          
          // 產品和客戶載入後，再載入訂單（需要補齊資料）
          await state.loadOrdersFromApi();
          
          console.log('App initialization complete');
        } catch (error) {
          console.error('Failed to initialize app:', error);
          set({ isInitialized: false });
        }
      },
    }),
    {
      name: 'store-management',
      partialize: (state) => ({
        customers: state.customers,
        products: state.products,
        selectedCustomer: state.selectedCustomer,
        salesItems: state.salesItems,
        orderInfo: state.orderInfo,
      }),
    }
  )
);

// 暴露給 orderStore 使用
if (typeof window !== 'undefined') {
  (window as any).__globalStore = useStore;
}
