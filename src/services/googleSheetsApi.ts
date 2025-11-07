/* src/services/googleSheetsApi.ts */
const API_URL = "https://script.google.com/macros/s/AKfycbxBOu23aufSw47VxB-oDMi_gFZPGTp5xMTBCXJwByupSZ79qHs5mRj6xJDsT7grqYaE/exec";

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
  }>;
  orderInfo: {
    date: string;
    serialNumber: string;
    status: string;
    remark?: string;
  };
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

// 預留：送出訂單 API（新增訂單）
export const submitOrder = async (orderData: any, action: OrderActionType = 'create'): Promise<ApiResponse> => {
  try {
    // TODO: 實作送出訂單到 Google Sheets
    console.log('Submit order:', { action, orderData });
    return { ok: true, data: {} };
  } catch (error) {
    console.error('Error submitting order:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// 預留：更新訂單 API
export const updateOrder = async (serialNumber: string, orderData: any): Promise<ApiResponse> => {
  try {
    // TODO: 實作更新訂單到 Google Sheets
    console.log('Update order:', { serialNumber, orderData });
    return { ok: true, data: {} };
  } catch (error) {
    console.error('Error updating order:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// 預留：銷售出貨 API
export const submitShipment = async (shipmentData: any): Promise<ApiResponse> => {
  try {
    // TODO: 實作銷售出貨到 Google Sheets
    console.log('Submit shipment:', shipmentData);
    return { ok: true, data: {} };
  } catch (error) {
    console.error('Error submitting shipment:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const fetchGoogleSheetsData = async (type: 'products' | 'sales' | 'orders' | 'customers' | 'all' = 'all'): Promise<ApiResponse> => {
  try {
    const url = `${API_URL}?type=${type}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
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
