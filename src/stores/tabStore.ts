// Tab 管理 Store - 每個訂單 tab 都有獨立的 state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, Product, SalesItem, OrderInfo } from '@/types';

export type TabType = 'order-new' | 'order-edit' | 'sale-new' | 'sale-edit' | 'products' | 'orders' | 'sales-records' | 'purchase' | 'payments';

export interface OrderTabData {
  selectedCustomer: Customer | null;
  salesItems: SalesItem[];
  orderInfo: OrderInfo;
}

export interface TabInfo {
  id: string;
  type: TabType;
  label: string;
  orderData?: OrderTabData;
  orderSerialNumber?: string;
  formType?: 'order' | 'sale';
}

interface TabStoreState {
  tabs: TabInfo[];
  activeTabId: string | null;
  orderCounter: number;
  saleCounter: number;

  // Tab 管理
  addNewOrderTab: () => string;
  addNewSaleTab: () => string;
  addEditOrderTab: (order: any) => string;
  addOrSwitchToTab: (type: TabType, label: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;

  // 訂單數據管理
  getOrderData: (tabId: string) => OrderTabData | null;
  updateOrderData: (tabId: string, data: Partial<OrderTabData>) => void;
  clearOrderData: (tabId: string) => void;
}

const getInitialOrderData = (): OrderTabData => ({
  selectedCustomer: null,
  salesItems: [],
  orderInfo: {
    date: new Date().toISOString().split("T")[0],
    serialNumber: "",
    paperSerialNumber: "",
    customer: undefined,
    status: "待處理",
  },
});

const getInitialSaleData = (): OrderTabData => ({
  selectedCustomer: null,
  salesItems: [],
  orderInfo: {
    date: new Date().toISOString().split("T")[0],
    serialNumber: "",
    paperSerialNumber: "",
    customer: undefined,
    status: "已完成",
  },
});

export const useTabStore = create<TabStoreState>()(
  persist(
    (set, get) => ({
      tabs: [{ id: 'order-1', type: 'order-new', label: '新增訂單 #1', orderData: getInitialOrderData(), formType: 'order' }],
      activeTabId: 'order-1',
      orderCounter: 1,
      saleCounter: 0,

      addNewOrderTab: () => {
        const { tabs, orderCounter } = get();
        const newCounter = orderCounter + 1;
        const newTabId = `order-${newCounter}`;
        const newTab: TabInfo = {
          id: newTabId,
          type: 'order-new',
          label: `新增訂單 #${newCounter}`,
          orderData: getInitialOrderData(),
          formType: 'order',
        };

        set({
          tabs: [...tabs, newTab],
          activeTabId: newTabId,
          orderCounter: newCounter,
        });

        return newTabId;
      },

      addNewSaleTab: () => {
        const { tabs, saleCounter } = get();
        const newCounter = saleCounter + 1;
        const newTabId = `sale-${newCounter}`;
        const newTab: TabInfo = {
          id: newTabId,
          type: 'sale-new',
          label: `新增銷售 #${newCounter}`,
          orderData: getInitialSaleData(),
          formType: 'sale',
        };

        set({
          tabs: [...tabs, newTab],
          activeTabId: newTabId,
          saleCounter: newCounter,
        });

        return newTabId;
      },

      addEditOrderTab: (order) => {
        const { tabs } = get();
        const serialNumber = order.orderInfo.serialNumber;
        // 檢查是否已存在相同單號的 tab
        const existingTab = tabs.find(
          t => (t.type === 'order-edit' || t.type === 'sale-edit') && t.orderSerialNumber === serialNumber
        );

        if (existingTab) {
          // 切換到已存在的 tab
          set({ activeTabId: existingTab.id });
          return existingTab.id;
        }
        console.log("原始",order)
        // 創建新的編輯 tab，使用 serialNumber 作為 ID
        const newTabId = `edit-${serialNumber}`;
        const orderData: OrderTabData = {
          selectedCustomer: order.selectedCustomer,
          salesItems: order.salesItems.map((item: any, idx: number) => ({
            id: item.id || `${item.code}-${idx}`,
            code: item.code,
            name: item.name,
            model: item.model,
            series:item.series,
            vender: item.vender,
            quantity: item.quantity,
            priceDistribution: item.priceDistribution,
            totalPrice: item.totalPrice,
            remark: item.remark,
            rowNumber: item.rowNumber,
            time: item.time || Date.now(),
          })),
          orderInfo: order.orderInfo,
        };

        console.log("訂單編輯資料",orderData)
        const isOrderType = serialNumber.startsWith('OD');
        const newTab: TabInfo = {
          id: newTabId,
          type: isOrderType ? 'order-edit' : 'sale-edit',
          label: `編輯 ${serialNumber}`,
          orderData,
          orderSerialNumber: serialNumber,
          formType: isOrderType ? 'order' : 'sale',
        };

        set({
          tabs: [...tabs, newTab],
          activeTabId: newTabId,
        });

        return newTabId;
      },

      addOrSwitchToTab: (type, label) => {
        const { tabs } = get();
        
        // 對於非訂單類型的 tab，檢查是否已存在
        if (!['order-new', 'order-edit', 'sale-new', 'sale-edit'].includes(type)) {
          const existingTab = tabs.find(t => t.type === type);
          if (existingTab) {
            set({ activeTabId: existingTab.id });
            return;
          }
        }

        // 創建新 tab
        const newTabId = `${type}-${Date.now()}`;
        const newTab: TabInfo = {
          id: newTabId,
          type,
          label,
        };

        set({
          tabs: [...tabs, newTab],
          activeTabId: newTabId,
        });
      },

      closeTab: (tabId) => {
        const { tabs, activeTabId } = get();
        const newTabs = tabs.filter(t => t.id !== tabId);

        // 至少保留一個 tab
        if (newTabs.length === 0) {
          const defaultTab: TabInfo = {
            id: 'order-1',
            type: 'order-new',
            label: '新增訂單 #1',
            orderData: getInitialOrderData(),
            formType: 'order',
          };
          set({ tabs: [defaultTab], activeTabId: defaultTab.id, orderCounter: 1 });
          return;
        }

        // 如果關閉的是當前 tab，切換到最後一個 tab
        const newActiveId = activeTabId === tabId ? newTabs[newTabs.length - 1].id : activeTabId;

        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      setActiveTab: (tabId) => {
        set({ activeTabId: tabId });
      },

      getOrderData: (tabId) => {
        const { tabs } = get();
        const tab = tabs.find(t => t.id === tabId);
        return tab?.orderData || null;
      },

      updateOrderData: (tabId, updates) => set((state) => {
        const tab = state.tabs.find(t => t.id === tabId);
        if (!tab) return state;

        return {
          tabs: state.tabs.map(t =>
            t.id === tabId
              ? { ...t, orderData: { ...t.orderData, ...updates } }
              : t
          ),
        };
      }),

      clearOrderData: (tabId) => {
        const { tabs } = get();
        const tab = tabs.find(t => t.id === tabId);
        const initialData = tab?.formType === 'sale' ? getInitialSaleData() : getInitialOrderData();
        
        const updatedTabs = tabs.map(t => {
          if (t.id === tabId) {
            return {
              ...t,
              orderData: initialData,
            };
          }
          return t;
        });
        set({ tabs: updatedTabs });
      },
    }),
    {
      name: 'tab-storage',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        orderCounter: state.orderCounter,
        saleCounter: state.saleCounter,
      }),
    }
  )
);
