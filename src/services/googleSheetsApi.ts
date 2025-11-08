/* src/services/googleSheetsApi.ts */
const API_URL = "https://script.google.com/macros/s/AKfycbwbt8_BP3Ipa6nf7SgJJbS2SAgtAI-pVTf5X8I2kkQr6okNwT9tYm46qQAv6EqgT893/exec";

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
interface ApiResponse {
  ok: boolean;
  data?: {
    products?: GoogleSheetsProduct[];
    sales?: GoogleSheetsSale[];
    orders?: GoogleSheetsOrderResponse[];
    customers?: GoogleSheetsCustomer[];
  };
  error?: string;
}

// API 操作類型
export type OrderActionType = 'create' | 'update' | 'shipment';

// 送出訂單 API（新增訂單）
export const submitOrder = async (orderData:any, action:'create'|'update'|'shipment'='create') => {
  const qs = new URLSearchParams({
    action,
    orderData: JSON.stringify(orderData)
  });

  const res = await fetch(`${API_URL}?${qs.toString()}`, { method: "GET" });
  return res.json();
};

// 預留：更新訂單 API
export const updateOrder = async (serialNumber:string, orderData:any) => {
  const qs = new URLSearchParams({
    action: "update",
    serialNumber,
    orderData: JSON.stringify(orderData)
  });

  const res = await fetch(`${API_URL}?${qs.toString()}`, { method:"GET" });
  return res.json();
};


// 預留：銷售出貨 API
export const submitShipment = async (shipmentData:any) => {
  const qs = new URLSearchParams({
    action: "shipment",
    shipmentData: JSON.stringify(shipmentData)
  });

  const res = await fetch(`${API_URL}?${qs.toString()}`, { method:"GET" });
  return res.json();
};

export const fetchGoogleSheetsData = async (
  type: 'products' | 'sales' | 'orders' | 'customers' | 'all' = 'all'
): Promise<ApiResponse> => {
  try {
    const qs = new URLSearchParams({
      action: "fetch",
      type,
    });

    const response = await fetch(`${API_URL}?${qs.toString()}`, {
      method: "GET",
    });

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


export const fetchProducts = async (): Promise<GoogleSheetsProduct[]> => {
  const response = await fetchGoogleSheetsData('products');
  return response.data?.products || [];
};

export const fetchSales = async (): Promise<GoogleSheetsSale[]> => {
  const response = await fetchGoogleSheetsData('sales');
  return response.data?.sales || [];
};

export const fetchOrders = async (): Promise<GoogleSheetsOrderResponse[]> => {
  const response = await fetchGoogleSheetsData('orders');
  return response.data?.orders || [];
};

export const fetchCustomers = async (): Promise<GoogleSheetsCustomer[]> => {
  const response = await fetchGoogleSheetsData('customers');
  return response.data?.customers || [];
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
