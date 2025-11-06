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
    console.log("api 原始資料", sheetOrders);

    // 依 serialNumber 分組
    const orderMap: Record<string, Order> = {};
    console.log("✅ 開始合併訂單資料...",sheetOrders);
    sheetOrders.forEach((o) => {
      const serialNumber = String(o.orderId);

      // 整理 item（依你的正式格式）
      const item = {
        id: o.itemId ?? Date.now(), // 若沒有 id 就給時間戳
        code: o.productCode,
        name: o.brand+" "+o.series+"_"+o.vendor+"_"+o.remark,
        series: o.series ?? "",
        vendor: o.vendor ?? "",
        remark: o.remark ?? "",
        model: o.productModel,
        tableTitle: o.tableTitle ?? "",
        tableRowTitle: o.tableRowTitle ?? "",
        tableColTitle: o.tableColTitle ?? "",
        priceRetail: o.priceRetail ?? 0,
        priceDistribution: o.priceDistribution ?? 0,
        state: o.state ?? "啟用",
        quantity: o.unshippedQty ?? 1,
        totalPrice: (o.unshippedQty ?? 1) * (o.priceDistribution ?? 0),
        time: Date.now(),
      };

      // ✅ 已存在 → push item
      if (orderMap[serialNumber]) {
        orderMap[serialNumber].items.push(item);
        return;
      }

      // ✅ 不存在 → 建立完整訂單格式
      orderMap[serialNumber] = {
        id: String(o.rowNumber) + "_" + serialNumber,
        customer: {
          id: o.customerId ?? "",
          name: o.customer ?? "",
          code: o.customerCode ?? "",
          storeName: o.storeName ?? "",
          chainStoreName: o.chainStoreName ?? "",
        },
        items: [item],
        orderInfo: {
          date: o.orderDate,
          serialNumber,
          paperSerialNumber: o.paperSerialNumber ?? "",
          status: "待處理",
        }
      };
    });

    const formattedOrders = Object.values(orderMap);
    console.log("✅ 合併後訂單資料：", formattedOrders);

    set({ orders: formattedOrders, isLoadingOrders: false });

  } catch (error) {
    console.error("❌ 取得訂單失敗:", error);
    set({ isLoadingOrders: false });
  }
},


});
