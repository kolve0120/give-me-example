// @/hooks/customerStore.ts
import { StateCreator } from 'zustand';
import { fetchCustomers } from '@/services/googleSheetsApi';
import { Customer } from '@/types';

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
      console.log("API 客戶資料:", apiCustomers);
      
      const formattedCustomers: Customer[] = apiCustomers.map((c, index) => ({
        id: `c${index + 1}`,
        name: c.customerName,
        code: c.customerCode,
        storeName: c.storeName,
        chainStoreName: c.chainStoreName,
      }));
      
      set({ customers: formattedCustomers, isLoadingCustomers: false });
    } catch (error) {
      console.error('Failed to load customers from API:', error);
      set({ isLoadingCustomers: false });
    }
  },
});