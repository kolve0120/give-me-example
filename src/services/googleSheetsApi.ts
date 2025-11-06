const API_URL = "https://script.google.com/macros/s/AKfycbz1RTDt7Xo1utAZD84Jm39g_Zb5R8YRKs5NrpgHswuYahDpfs7RM666cKzZTI13mj84/exec";

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

export interface GoogleSheetsOrder {
  itemId: number;
  productCode: any;
  series: string;
  vendor: string;
  remark: string;
  tableTitle: string;
  tableRowTitle: string;
  tableColTitle: string;
  priceRetail: number;
  state: string;
  customerId: string;
  storeName: string;
  chainStoreName: string;
  paperSerialNumber: string;
  orderInfo: any;
  priceDistribution: number;
  orderId: string;
  orderDate: string;
  customer: string;
  customerCode: string;
  brand: string;
  productId: string;
  productName: string;
  productModel: string;
  productOption: string;
  unshippedQty: number;
  rowNumber: number;
}

interface ApiResponse {
  ok: boolean;
  data?: {
    products?: GoogleSheetsProduct[];
    sales?: GoogleSheetsSale[];
    orders?: GoogleSheetsOrder[];
    customers?: GoogleSheetsCustomer[];
  };
  error?: string;
}

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

export const fetchOrders = async (): Promise<GoogleSheetsOrder[]> => {
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
