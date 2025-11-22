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

      const formattedCustomers: Customer[] = apiCustomers.map((c, index) => ({
        id: c.customerCode || `c${index + 1}`, // 優先用 code
        code: c.customerCode,
        name: c.customerName,
        storeName: c.storeName,
        chainStoreName: c.chainStoreName,
      }));

      set({ customers: formattedCustomers, isLoadingCustomers: false });
    } catch (error) {
      console.error('Failed to load customers from API:', error);
      toast.error("載入客戶失敗");
      set({ isLoadingCustomers: false });
    }
  },
});