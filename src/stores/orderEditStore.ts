// 訂單編輯專用 Store（用於編輯現有訂單）
import { create } from 'zustand';
import { Customer, SalesItem, OrderInfo, Order } from '@/types';

interface OrderEditState {
  // 編輯中的訂單
  editingOrder: Order | null;
  
  // 客戶相關
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  
  // 銷售項目
  salesItems: SalesItem[];
  updateSalesItem: (index: number, updates: Partial<SalesItem>) => void;
  removeSalesItem: (index: number) => void;
  addSalesItem: (item: SalesItem) => void;
  
  // 訂單資訊
  orderInfo: OrderInfo;
  updateOrderInfo: (info: Partial<OrderInfo>) => void;
  
  // 載入訂單進行編輯
  loadOrder: (order: Order) => void;
  
  // 計算方法
  getTotalQuantity: () => number;
  getTotalAmount: () => number;
  
  // 清除方法
  clearEdit: () => void;
}

const getInitialOrderInfo = (): OrderInfo => ({
  date: new Date().toISOString().split("T")[0],
  serialNumber: "",
  paperSerialNumber: "",
  customer: undefined,
  status: "待處理",
});

export const useOrderEditStore = create<OrderEditState>((set, get) => ({
  editingOrder: null,
  selectedCustomer: null,
  salesItems: [],
  orderInfo: getInitialOrderInfo(),

  setSelectedCustomer: (customer) => {
    set({ selectedCustomer: customer });
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

  addSalesItem: (item) => {
    const { salesItems } = get();
    set({ salesItems: [...salesItems, item] });
  },

  updateOrderInfo: (info) => {
    const { orderInfo } = get();
    set({ orderInfo: { ...orderInfo, ...info } });
  },

  loadOrder: (order) => {
    set({
      editingOrder: order,
      selectedCustomer: order.orderInfo?.customer || null,
      salesItems: order.items || [],
      orderInfo: order.orderInfo || getInitialOrderInfo(),
    });
  },

  getTotalQuantity: () => {
    const { salesItems } = get();
    return salesItems.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalAmount: () => {
    const { salesItems } = get();
    return salesItems.reduce((sum, item) => sum + item.totalPrice, 0);
  },

  clearEdit: () => {
    set({
      editingOrder: null,
      selectedCustomer: null,
      salesItems: [],
      orderInfo: getInitialOrderInfo(),
    });
  },
}));
