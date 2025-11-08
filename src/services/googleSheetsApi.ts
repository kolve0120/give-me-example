/* src/services/googleSheetsApi.ts */
const API_URL = "https://script.google.com/macros/s/AKfycbwLQQsVwT68tc1EuoxVCIGmfFab_r1TBNAR79VzbKxgyVy4WuvUIZm7h74mQz889tAS/exec";

export interface GoogleSheetsProduct {
  productId: string;
  status: string;
  code: string;
  name: string;
  brand: string;
  seriesList: string;
  model: string;
  colors: string;
  rowNumber: number;
  tableTitle: string;
  tableRowTitle: string;
  tableColTitle: string;
  priceRetail: number;
  priceDistribution: number;
}

export interface GoogleSheetsSale {
  salesId: string;
  salesDate: string;
  customer: string;
  customerOrderNo: string;
  itemNo: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  orderRef: string;
  year: number;
  month: number;
  cost: number;
  profit: number;
  rowNumber: number;
}

// 新的訂單格式（與 Google Sheets 返回格式一致）
export interface GoogleSheetsOrderResponse {
  selectedCustomer: {
    name: string;
    code: string;
    storeName: string;
    chainStoreName: string;
  };
  salesItems: Array<{
    code: string;
    priceDistribution: number;
    quantity: number;
    rowNumber: number;
  }>;
  orderInfo: {
    date: string;
    serialNumber: string;
    status: string;
    remark?: string;
  };
}
export interface CreateOrderResponse {
  serialNumber: string;
  items: Array<{
    code: string;
    rowNumber: number;
  }>;
}
interface ApiResponse<T = any> {
  ok: boolean;
  data?: T[];           // 關鍵：data 一定是陣列
  error?: string;
}
// 創建訂單回傳格式
export interface CreateOrderResponse {
  serialNumber: string;
  items: Array<{
    code: string;
    rowNumber: number;
  }>;
}

// 更新/出貨 回傳格式（可依需求調整）
export interface UpdateOrderResponse {
  serialNumber: string;
  updatedRows: number[];
}

export interface ShipmentResponse {
  shipmentId: string;
  shippedItems: Array<{
    orderRowNumber: number;
    quantity: number;
  }>;
}
// API 操作類型
export type OrderActionType = 'create' | 'update' | 'shipment';
// 送出訂單 API（新增）
export const submitOrder = async (
  orderData: any,
  action: 'create' | 'update' | 'shipment' = 'create'
): Promise<ApiResponse<CreateOrderResponse | UpdateOrderResponse | ShipmentResponse>> => {
  const params = new URLSearchParams({
    action,
  });

  if (action === 'create' || action === 'update') {
    params.append('orderData', JSON.stringify(orderData));
  } else if (action === 'shipment') {
    params.append('shipmentData', JSON.stringify(orderData));
  }

  const res = await fetch(`${API_URL}?${params.toString()}`, { method: "GET" });
  return res.json(); // 回傳 { ok, data: [...], error? }
};

// 專用：建立訂單
export const createOrder = async (orderData: any): Promise<CreateOrderResponse[]> => {
  const response = await submitOrder(orderData, 'create');
  if (!response.ok) throw new Error(response.error || '建立訂單失敗');
  return response.data as CreateOrderResponse[];
};

// 專用：更新訂單
export const updateOrder = async (serialNumber: string, orderData: any): Promise<UpdateOrderResponse[]> => {
  const response = await submitOrder({ serialNumber, orderData }, 'update');
  if (!response.ok) throw new Error(response.error || '更新失敗');
  return response.data as UpdateOrderResponse[];
};

// 專用：出貨
export const submitShipment = async (shipmentData: any): Promise<ShipmentResponse[]> => {
  const response = await submitOrder(shipmentData, 'shipment');
  if (!response.ok) throw new Error(response.error || '出貨失敗');
  return response.data as ShipmentResponse[];
};

// fetch 系列保持不變，但加強型別
export const fetchGoogleSheetsData = async <T extends keyof DataMap>(
  type: T = 'all' as T
): Promise<ApiResponse<DataMap[T]>> => {
  try {
    const qs = new URLSearchParams({ action: "fetch", type });
    const response = await fetch(`${API_URL}?${qs.toString()}`, { method: "GET" });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// 輔助型別映射
type DataMap = {
  products: GoogleSheetsProduct;
  sales: GoogleSheetsSale;
  orders: GoogleSheetsOrderResponse;
  customers: GoogleSheetsCustomer;
  all: never; // all 不回傳特定型別
};

// 專用 fetch 函數
export const fetchProducts = async (): Promise<GoogleSheetsProduct[]> => {
  const res = await fetchGoogleSheetsData('products');
  return res.ok ? (res.data || []) : [];
};

export const fetchSales = async (): Promise<GoogleSheetsSale[]> => {
  const res = await fetchGoogleSheetsData('sales');
  return res.ok ? (res.data || []) : [];
};

export const fetchOrders = async (): Promise<GoogleSheetsOrderResponse[]> => {
  const res = await fetchGoogleSheetsData('orders');
  return res.ok ? (res.data || []) : [];
};

export const fetchCustomers = async (): Promise<GoogleSheetsCustomer[]> => {
  const res = await fetchGoogleSheetsData('customers');
  return res.ok ? (res.data || []) : [];
};
// 客戶資料介面
export interface GoogleSheetsCustomer {
  state: string;
  customerCode: string;
  customerName: string;
  storeName: string;
  chainStoreName: string;
  arCutoffDate: string | number;
  rowNumber: number;
}
