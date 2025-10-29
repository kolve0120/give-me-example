import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchProducts, fetchCustomers, GoogleSheetsProduct, GoogleSheetsCustomer } from '@/services/googleSheetsApi';

// 類型定義
export interface Customer {
  id?: string;
  name: string;
  code: string;
  storeName?: string;
  chainStoreName?: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  series: string;
  vendor: string;
  remark: string;
  priceDistribution: number;
  priceRetail: number;
  model: string;
  originalPrice?: number;
  state?: '啟用中' | '停用' | '預購中' | '售完停產';
  barcode?: string;
  systemCode?: string;
  tableTitle?: string;
  tableRowTitle?: string;
  tableColTitle?: string;
  isPriceModified?: boolean;
  
}

export interface SalesItem extends Product {
  quantity: number;
  totalPrice: number;
  time: number;
}

export interface OrderInfo {
  date: string;
  serialNumber: string;
  paperSerialNumber?: string;
  customer?: Customer;
  status?: string;
}

interface StoreState {
  // 客戶相關
  customers: Customer[];
  selectedCustomer: Customer | null;
  
  // 產品相關
  products: Product[];
  selectedProducts: Product[];
  
  // 銷售清單
  salesItems: SalesItem[];
  
  // 訂單資訊
  orderInfo: OrderInfo;
  


  // UI 狀態
  expandedComponent: string | null;
  showSuccessModal: boolean;
  productSidebarOpen: boolean;
  
  // Actions
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setProducts: (products: Product[]) => void;
  addSelectedProduct: (product: Product) => void;
  removeSelectedProduct: (productId: number) => void;
  setSalesItems: (items: SalesItem[]) => void;
  setOrderInfo: (info: OrderInfo) => void;
  
  // 銷售清單操作
  addSalesItem: (product: Product, quantity?: number) => void;
  updateSalesItem: (index: number, updates: Partial<SalesItem>) => void;
  removeSalesItem: (index: number) => void;
  clearSalesItems: () => void;
  reorderSalesItems: (items: SalesItem[]) => void;
  
  // 訂單資訊
  updateOrderInfo: (info: Partial<OrderInfo>) => void;
  
  // UI 控制
  setExpandedComponent: (component: string | null) => void;
  setShowSuccessModal: (show: boolean) => void;
  setProductSidebarOpen: (open: boolean) => void;
  
  // 清除功能
  clearCustomer: () => void;
  clearProducts: () => void;
  clearAll: () => void;
  
  // 計算函數
  getTotalQuantity: () => number;
  getTotalAmount: () => number;
  getProductPrice: (productCode: string) => number;
  
  // API 相關
  loadProductsFromApi: () => Promise<void>;
  loadCustomersFromApi: () => Promise<void>;
  isLoadingProducts: boolean;
  isLoadingCustomers: boolean;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // 初始狀態
      customers: [],
      selectedCustomer: null,
      products: [],
      selectedProducts: [],
      salesItems: [],
      orderInfo: {
        date: new Date().toISOString().split('T')[0],
        serialNumber: '',
        paperSerialNumber: '',
      },
      expandedComponent: null,
      showSuccessModal: false,
      productSidebarOpen: false,
      isLoadingProducts: false,
      isLoadingCustomers: false,

      // Actions
      setCustomers: (customers) => set({ customers }),
      
      setSelectedCustomer: (customer) => {
        set({ selectedCustomer: customer });
        // 當選擇客戶時，清空價格緩存並重新計算
        if (customer) {
          const { salesItems } = get();
          console.log(salesItems)
          const updatedItems = salesItems.map(item => ({
            ...item,
            price: get().getProductPrice(item.code),
            totalPrice: item.quantity * get().getProductPrice(item.code),
          }));
          set({ salesItems: updatedItems });
        }
      },
      
      setProducts: (products) => set({ products }),
      
      addSelectedProduct: (product) => {
        const { selectedProducts } = get();
        const exists = selectedProducts.find(p => p.id === product.id);
        if (!exists) {
          set({ selectedProducts: [...selectedProducts, product] });
        }
      },
      
      removeSelectedProduct: (productId: number) => {
        const { selectedProducts } = get();
        set({ selectedProducts: selectedProducts.filter(p => p.id !== productId) });
      },
      
      setSalesItems: (items) => set({ salesItems: items }),
      
      setOrderInfo: (info) => set({ orderInfo: info }),

      // 銷售清單操作
      addSalesItem: (product, quantity = 1) => {
        const { salesItems } = get();
        const price = get().getProductPrice(product.code);
        const newItem: SalesItem = {
          ...product,
          quantity,
          totalPrice: quantity * price,
          time: Date.now(),
        };
        set({ salesItems: [...salesItems, newItem] });
      },
      
      updateSalesItem: (index, updates) => {
        const { salesItems } = get();
        const updatedItems = [...salesItems];
        const item = { ...updatedItems[index], ...updates };
        
        // 如果更新了數量或價格，重新計算總價
        if ('quantity' in updates || 'price' in updates) {
          item.totalPrice = item.quantity * item.priceDistribution;
        }
        
        updatedItems[index] = item;
        set({ salesItems: updatedItems });
      },
      
      removeSalesItem: (index) => {
        const { salesItems } = get();
        const updatedItems = salesItems.filter((_, i) => i !== index);
        set({ salesItems: updatedItems });
      },
      
      clearSalesItems: () => set({ salesItems: [] }),
      
      reorderSalesItems: (items) => set({ salesItems: items }),

      // 訂單資訊
      updateOrderInfo: (info) => {
        const { orderInfo } = get();
        set({ orderInfo: { ...orderInfo, ...info } });
      },

      // UI 控制
      setExpandedComponent: (component) => set({ expandedComponent: component }),
      setShowSuccessModal: (show) => set({ showSuccessModal: show }),
      setProductSidebarOpen: (open) => set({ productSidebarOpen: open }),

      // 清除功能
      clearCustomer: () => set({ 
        selectedCustomer: null,
        orderInfo: {
          date: new Date().toISOString().split('T')[0],
          serialNumber: '',
          paperSerialNumber: '',
        }
      }),
      
      clearProducts: () => set({ selectedProducts: [], salesItems: [] }),
      
      clearAll: () => set({
        selectedCustomer: null,
        selectedProducts: [],
        salesItems: [],
        orderInfo: {
          date: new Date().toISOString().split('T')[0],
          serialNumber: '',
          paperSerialNumber: '',
        }
      }),

      // 計算函數
      getTotalQuantity: () => {
        const { salesItems } = get();
        return salesItems.reduce((sum, item) => sum + item.quantity, 0);
      },
      
      getTotalAmount: () => {
        const { salesItems } = get();
        return salesItems.reduce((sum, item) => sum + item.totalPrice, 0);
      },
      
      getProductPrice: (productCode) => {
        const { products, selectedCustomer } = get();
        const product = products.find(p => p.code === productCode);
        if (!product) return 0;
        
        // 這裡可以實現客戶專屬價格邏輯
        // 目前先返回原價
        return product.priceDistribution || product.priceRetail;
      },
      
      // 從 API 載入產品
      loadProductsFromApi: async () => {
        set({ isLoadingProducts: true });
        try {
          const apiProducts = await fetchProducts();
          
          // 轉換 API 產品數據為應用產品格式
          const formattedProducts: Product[] = apiProducts.map((p, index) => ({
            id: index + 1,
            code: p.productId,
            name: p.name,
            series: p.seriesList,
            vendor: p.brand,
            remark: p.colors,
            model: p.model,
            tableTitle: p.tableTitle,
            tableRowTitle: p.tableRowTitle,
            tableColTitle: p.tableColTitle,
            priceRetail: p.priceRetail,
            priceDistribution: p.priceDistribution,
            state: p.status === '啟用中' ? '啟用中' : '停用',
          }));
          console.log("API 產品資料:", formattedProducts);
          set({ products: formattedProducts, isLoadingProducts: false });
        } catch (error) {
          console.error('Failed to load products from API:', error);
          set({ isLoadingProducts: false });
        }
      },
      
      // 從 API 載入客戶
      loadCustomersFromApi: async () => {
        set({ isLoadingCustomers: true });
        try {
          const apiCustomers = await fetchCustomers();
          console.log("API 客戶資料:", apiCustomers);
          // 轉換 API 客戶數據為應用客戶格式
          const formattedCustomers: Customer[] = apiCustomers.map((c, index) => ({
            id: `c${index + 1}`,
            name: c.customerName,
            code: c.customerCode,
            storeName: c.storeName,
            chainStoreName: c.chainStoreName,
          }));
          
          set({ customers: formattedCustomers, isLoadingCustomers: false });
        } catch (error) {
          console.error('Failed to load customers from API:', error);
          set({ isLoadingCustomers: false });
        }
      },
    }),
    {
      name: 'store-management',
      partialize: (state) => ({
        customers: state.customers,
        products: state.products,
        selectedCustomer: state.selectedCustomer,
        salesItems: state.salesItems,
        orderInfo: state.orderInfo,
      }),
    }
  )
);