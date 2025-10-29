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
});