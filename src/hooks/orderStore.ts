// src/hooks/orderStore.ts
import { StateCreator } from "zustand";
import { fetchOrders, GoogleSheetsOrderResponse } from "@/services/googleSheetsApi";
import { Customer, Order, OrderInfo, OrderItem } from "@/types";
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
      console.log("apisheetOrders:",sheetOrders)
      // 動態獲取最新的 products 和 customers
      const getProducts = () => (window as any).__globalStore?.getState().products || [];
      const getCustomers = () => (window as any).__globalStore?.getState().customers || [];
      
      const products = getProducts();
      const customers = getCustomers();

      const formattedOrders: Order[] = sheetOrders.map((apiOrder) => {
        // 用 code 找客戶完整資料
        const fullCustomer = customers.find((c: Customer) => 
          c.code === apiOrder.selectedCustomer.code
        );

        const customer: Customer = fullCustomer || {
          id: `c-${apiOrder.selectedCustomer.code}`,
          code: apiOrder.selectedCustomer.code,
          name: apiOrder.selectedCustomer.name,
          storeName: apiOrder.selectedCustomer.storeName,
          chainStoreName: apiOrder.selectedCustomer.chainStoreName,
        };

        // 用 code 補齊每個商品的完整資料
        const items: OrderItem[] = apiOrder.salesItems.map((saleItem) => {
          // 優先用 product.code，沒有就用 productId
          const product = products.find((p: any) => {
            const pCode = p.code || p.productId;
            return pCode === saleItem.code;
          });

          const priceDistribution = saleItem.priceDistribution || product?.priceDistribution || 0;
          const quantity = saleItem.quantity || 0;

          return {
            code: saleItem.code,
            name: product?.name || saleItem.code,
            model: product?.model || '',
            quantity,
            priceDistribution,
            totalPrice: quantity * priceDistribution,
            remark: product?.remark || '',
            status: '待處理', // 品項預設狀態
            shippedQuantity: 0,
          };
        });

        return {
          id: apiOrder.orderInfo.serialNumber,
          orderInfo: {
            date: apiOrder.orderInfo.date,
            serialNumber: apiOrder.orderInfo.serialNumber,
            status: apiOrder.orderInfo.status || '待處理',
            customer,
            paperSerialNumber: apiOrder.orderInfo.remark || '',
          },
          customer,
          items,
        };
      });
      console.log("取得訂單",formattedOrders)
set(state => ({
  orders: [
    ...state.orders.filter(o => !formattedOrders.some(n => n.orderInfo.serialNumber === o.orderInfo.serialNumber)),
    ...formattedOrders
  ],
  isLoadingOrders: false
}));


      /*set({ orders: formattedOrders, isLoadingOrders: false });*/
    } catch (error) {
      console.error("Failed to load orders:", error);
      set({ isLoadingOrders: false });
    }
  },
});
