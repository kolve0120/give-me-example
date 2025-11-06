// src/hooks/orderStore.ts
import { StateCreator } from "zustand";
import { fetchOrders, GoogleSheetsOrder } from "@/services/googleSheetsApi";
import { Customer, Order, OrderInfo } from "@/types";

export interface OrderSlice {
  orders: Order[];
  isLoadingOrders: boolean;
  orderInfo: OrderInfo;

  // Actions
  setOrderInfo: (info: OrderInfo) => void;
  updateOrderInfo: (info: Partial<OrderInfo>) => void;
  resetOrderInfo: () => void;
  loadOrdersFromApi: () => Promise<void>;
  setOrders: (orders: Order[]) => void;
}

const getInitialOrderInfo = (): OrderInfo => ({
  date: new Date().toISOString().split("T")[0],
  serialNumber: "",
  paperSerialNumber: "",
  customer: undefined,
  status: "待處理",
  
});

export const createOrderSlice: StateCreator<OrderSlice> = (set, get) => ({
  orders: [],
  isLoadingOrders: false,
  orderInfo: getInitialOrderInfo(),

  setOrderInfo: (info) => set({ orderInfo: info }),

  updateOrderInfo: (info) => {
    const { orderInfo } = get();
    set({ orderInfo: { ...orderInfo, ...info } });
  },

  resetOrderInfo: () => set({ orderInfo: getInitialOrderInfo() }),

  setOrders: (orders) => set({ orders }),

  loadOrdersFromApi: async () => {
    set({ isLoadingOrders: true });
    try {
      const sheetOrders = await fetchOrders();
      console.log("api資料",sheetOrders)
      const formattedOrders: Order[] = sheetOrders.map((o) => ({
        id: String(o.orderId),
        orderInfo: {
          date: o.orderDate,
          serialNumber: o.orderId,
          status: "待處理",
          customer: { name: o.orderInfo.customer },
        },
        items: [
          {
            name: o.productName,
            model: o.productModel,
            quantity: o.unshippedQty,
            priceDistribution: o.priceDistribution || 0,
            totalPrice: o.unshippedQty * (o.priceDistribution || 0),
          },
        ],
      }));

      set({ orders: formattedOrders, isLoadingOrders: false });
    } catch (error) {
      console.error("❌ Failed to load orders:", error);
      set({ isLoadingOrders: false });
    }
  },
});
