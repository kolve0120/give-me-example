// @/hooks/customerStore.ts
import { StateCreator } from 'zustand';
import { fetchCustomers } from '@/services/googleSheetsApi';
import { Customer } from '@/types';
import { toast } from 'sonner';
export interface CustomerSlice {
  // State
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoadingCustomers: boolean;

  // Actions
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  clearCustomer: () => void;
  loadCustomersFromApi: () => Promise<void>;
}

export const createCustomerSlice: StateCreator<CustomerSlice> = (set) => ({
  // Initial state
  customers: [],
  selectedCustomer: null,
  isLoadingCustomers: false,

  // Actions
  setCustomers: (customers) => set({ customers }),

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  clearCustomer: () => set({ selectedCustomer: null }),

  loadCustomersFromApi: async () => {
    set({ isLoadingCustomers: true });
    try {
      const apiCustomers = await fetchCustomers();

      // 使用 Map 根據 customerCode 去重，保留第一筆資料
      const customerMap = new Map<string, Customer>();
      
      apiCustomers.forEach((c, index) => {
        // 跳過沒有 code 的資料
        if (!c.customerCode) return;
        
        // 如果這個 code 還沒有被記錄，才加入
        if (!customerMap.has(c.customerCode)) {
          customerMap.set(c.customerCode, {
            id: c.customerCode,
            code: c.customerCode,
            name: c.customerName,
            storeName: c.storeName || '',
            chainStoreName: c.chainStoreName || '',
          });
        }
      });

      const formattedCustomers = Array.from(customerMap.values());
      
      console.log(`載入客戶: 原始 ${apiCustomers.length} 筆，去重後 ${formattedCustomers.length} 筆`);

      set({ customers: formattedCustomers, isLoadingCustomers: false });
    } catch (error) {
      console.error('Failed to load customers from API:', error);
      toast.error("載入客戶失敗");
      set({ isLoadingCustomers: false });
    }
  },
});