// @/hooks/productStore.ts
import { StateCreator } from 'zustand';
import { fetchProducts } from '@/services/googleSheetsApi';
import { Product } from '@/types';

export interface ProductSlice {
  // State
  products: Product[];
  selectedProducts: Product[];
  isLoadingProducts: boolean;

  // Actions
  setProducts: (products: Product[]) => void;
  addSelectedProduct: (product: Product) => void;
  removeSelectedProduct: (productId: number) => void;
  clearProducts: () => void;
  loadProductsFromApi: () => Promise<void>;

  // 新增方法：依商品代碼取得產品
  getProductByCode: (code: string) => Product | undefined;

  // 新增方法：把 salesItems 用 product 資料補齊並計算 totalPrice
  enrichSalesItems: (items: { code: string; quantity: number; priceDistribution?: number }[]) => (Product & { quantity: number; totalPrice: number; priceDistribution: number })[];
}

export const createProductSlice: StateCreator<ProductSlice> = (set, get) => ({
  // Initial state
  products: [],
  selectedProducts: [],
  isLoadingProducts: false,

  // Actions
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

  clearProducts: () => set({ selectedProducts: [] }),

  loadProductsFromApi: async () => {
    set({ isLoadingProducts: true });
    try {
      const apiProducts = await fetchProducts();
      
      const formattedProducts: Product[] = apiProducts.map((p, index) => ({
        id: index + 1,
        code: p.productId,
        name: p.name,
        series: p.series,
        vender: p.vender,
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

  // 新增實作：依 code 取得 product（回傳 undefined 表示找不到）
  getProductByCode: (code: string) => {
    const { products } = get();
    if (!code) return undefined;
    return products.find(p => p.code === code);
  },

  // 新增實作：補齊 salesItems，計算 totalPrice
  enrichSalesItems: (items) => {
    const { products } = get();
    return items.map(item => {
      const code = (item.code || '').toString().trim();
      const quantity = Number(item.quantity || 0);
      const product = products.find(p => p.code === code);

      const basePrice = Number(item.priceDistribution ?? product?.priceDistribution ?? 0);
      const totalPrice = Number((basePrice * quantity) || 0);

      // 當找不到 product 時建立一個最小物件以避免 undefined
      const filled: Product & { quantity: number; totalPrice: number; priceDistribution: number } = {
        id: product?.id ?? -1,
        code: code,
        name: product?.name ?? '',
        series: product?.series ?? '',
        vender: product?.vender ?? '',
        remark: product?.remark ?? '',
        model: product?.model ?? '',
        tableTitle: product?.tableTitle ?? '',
        tableRowTitle: product?.tableRowTitle ?? '',
        tableColTitle: product?.tableColTitle ?? '',
        priceRetail: product?.priceRetail ?? 0,
        priceDistribution: Number(basePrice),
        state: product?.state ?? '停用',
        quantity,
        totalPrice,
      };

      return filled;
    });
  },
});