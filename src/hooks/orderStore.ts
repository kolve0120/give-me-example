// src/hooks/orderStore.ts
import { StateCreator } from "zustand";
import { fetchOrders, GoogleSheetsOrder } from "@/services/googleSheetsApi";
import { Customer, Order, OrderInfo } from "@/types";
import { useStore } from "@/hooks/useStore";
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
      const customers = useStore.getState().customers; // 直接取最新的 customers

      const formattedOrders: Order[] = sheetOrders.map((o) => {
        // 依客戶名稱找完整資料
        const fullCustomer = customers.find(c => 
          c.code === (o.orderInfo?.customer || o.customer)
        );

        const customerObj: Customer = fullCustomer || {
          id: `unknown-${o.orderId}`,
          code: "",
          name: o.orderInfo?.customer || o.customer || "未知客戶",
          storeName: "",
          chainStoreName: "",
        };

        return {
          id: String(o.orderInfo.serialNumber),
          orderInfo: {
            date: o.orderDate,
            serialNumber: String(o.orderInfo.serialNumber),
            status: "待處理",
            customer: customerObj,
          },
          customer: customerObj,
          items: [
            {
              name: o.productName,
              model: o.productModel,
              code: o.productId,
              quantity: o.unshippedQty,
              priceDistribution: o.priceDistribution || 0,
              totalPrice: o.unshippedQty * (o.priceDistribution || 0),
            },
          ],
        };
      });

      set({ orders: formattedOrders, isLoadingOrders: false });
    } catch (error) {
      console.error("Failed to load orders:", error);
      set({ isLoadingOrders: false });
    }
  },
});
