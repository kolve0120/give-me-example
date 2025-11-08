import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/hooks/useStore";
import { useTabStore } from "@/stores/tabStore";
import {
  Package,
  X,
  ChevronRight,
  Grid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { ProductSearchFilters } from "./ProductSearchFilters";
import { ProductGridView } from "./ProductGridView";
import { ProductTableView } from "./ProductTableView";

interface ProductSelectProps {
  tabId?: string; // 可選，用於多 tab 場景
}

export const ProductSelect = ({ tabId }: ProductSelectProps) => {
  // 產品列表從全域 store  
  const {
    products,
    loadProductsFromApi,
    isLoadingProducts,
    productSidebarOpen,
    setProductSidebarOpen,
  } = useStore();
  
  // 訂單相關從 tab store
  const { getOrderData, updateOrderData } = useTabStore();
  const orderData = tabId ? getOrderData(tabId) : null;
  const selectedCustomer = orderData?.selectedCustomer;
  const salesItems = orderData?.salesItems || [];
  
  useEffect(() => {
    if (products.length === 0 && !isLoadingProducts) {
      loadProductsFromApi();
    }
  }, [products, isLoadingProducts, loadProductsFromApi]);

  const [quickSearch, setQuickSearch] = useState("");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [selectedRemarks, setSelectedRemarks] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // 基礎過濾函數
  const getBaseFilteredProducts = useCallback((excludeField?: string) => {
    return products.filter((product) => {
      const conditions: Record<string, string[]> = {
        vendor: selectedVendors,
        model: selectedModels,
        series: selectedSeries,
        remark: selectedRemarks,
      };
      
      if (excludeField) {
        delete conditions[excludeField];
      }
      
      return Object.entries(conditions).every(([key, values]) => {
        if (!values || values.length === 0) return true;
        return values.includes(String(product[key as keyof typeof product]));
      });
    });
  }, [products, selectedVendors, selectedModels, selectedSeries, selectedRemarks]);

  // 動態唯一選項
  const uniqueVendors = useMemo(() => {
    if (isLoadingProducts) return [];
    const filtered = getBaseFilteredProducts('vendor');
    return Array.from(new Set(filtered.map(p => p.vendor || '')))
      .filter(Boolean)
      .sort((a, b) => {
        const countA = filtered.filter(p => p.vendor === a).length;
        const countB = filtered.filter(p => p.vendor === b).length;
        return countB - countA;
      });
  }, [getBaseFilteredProducts, isLoadingProducts]);

  const uniqueModels = useMemo(() => {
    if (isLoadingProducts) return [];
    const filtered = getBaseFilteredProducts('model');
    return Array.from(new Set(filtered.map(p => p.model || '')))
      .filter(Boolean)
      .sort((a, b) => {
        const countA = filtered.filter(p => p.model === a).length;
        const countB = filtered.filter(p => p.model === b).length;
        return countB - countA;
      });
  }, [getBaseFilteredProducts, isLoadingProducts]);

  const uniqueSeries = useMemo(() => {
    if (isLoadingProducts) return [];
    const filtered = getBaseFilteredProducts('series');
    return Array.from(new Set(filtered.map(p => p.series || '')))
      .filter(Boolean)
      .sort((a, b) => {
        const countA = filtered.filter(p => p.series === a).length;
        const countB = filtered.filter(p => p.series === b).length;
        return countB - countA;
      });
  }, [getBaseFilteredProducts, isLoadingProducts]);

  const uniqueRemarks = useMemo(() => {
    if (isLoadingProducts) return [];
    const filtered = getBaseFilteredProducts('remark');
    return Array.from(new Set(filtered.map(p => p.remark || '')))
      .filter(Boolean)
      .sort((a, b) => {
        const countA = filtered.filter(p => p.remark === a).length;
        const countB = filtered.filter(p => p.remark === b).length;
        return countB - countA;
      });
  }, [getBaseFilteredProducts, isLoadingProducts]);

  // 最終產品篩選
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 快速搜尋
      if (quickSearch) {
        const search = quickSearch.toLowerCase();
        const matchesQuick =
          (product.model?.toLowerCase().includes(search) ?? false) ||
          (product.vendor?.toLowerCase().includes(search) ?? false) ||
          (product.series?.toLowerCase().includes(search) ?? false) ||
          (product.remark?.toLowerCase().includes(search) ?? false) ||
          (product.code?.toLowerCase().includes(search) ?? false);
        if (!matchesQuick) return false;
      }

      // 所有篩選條件
      const conditions = [
        selectedVendors.length === 0 || selectedVendors.includes(product.vendor),
        selectedModels.length === 0 || selectedModels.includes(product.model),
        selectedSeries.length === 0 || selectedSeries.includes(product.series),
        selectedRemarks.length === 0 || selectedRemarks.includes(product.remark),
      ];
      
      return conditions.every(Boolean);
    });
  }, [
    products,
    quickSearch,
    selectedVendors,
    selectedModels,
    selectedSeries,
    selectedRemarks,
  ]);

  // 清除所有篩選
  const clearAllFilters = useCallback(() => {
    setQuickSearch("");
    setSelectedVendors([]);
    setSelectedModels([]);
    setSelectedSeries([]);
    setSelectedRemarks([]);
  }, []);

  // 處理選擇產品
  const handleSelectProduct = useCallback((product: any, quantity: number = 1) => {
    if (!tabId) {
      toast.error("無法添加產品：缺少 tabId");
      return;
    }

    if (!selectedCustomer) {
      toast.error("請先在「客戶資訊」區域選擇客戶");
      return;
    }

    const price = product.priceDistribution || product.priceRetail;
    const newItem = {
      ...product,
      quantity,
      priceDistribution: price,
      totalPrice: quantity * price,
      time: Date.now(),
    };

    updateOrderData(tabId, {
      salesItems: [...salesItems, newItem]
    });

    toast.success(`已添加 ${product.name} x ${quantity}`);
  }, [tabId, selectedCustomer, salesItems, updateOrderData]);

  // 活躍篩選數量
  const activeFilterCount = useMemo(() => 
    selectedVendors.length + selectedModels.length + 
    selectedSeries.length + selectedRemarks.length, 
    [selectedVendors, selectedModels, selectedSeries, selectedRemarks]
  );

  return (
    <>
      {/* Sidebar 切換按鈕 */}
      <Button
        onClick={() => setProductSidebarOpen(!productSidebarOpen)}
        className="fixed top-20 right-2 md:right-4 z-40 shadow-lg flex flex-col items-center justify-center py-3 px-2 md:px-4 h-auto"
        size="lg"
      >
        <Package className="w-5 h-5 mb-1" />
        <span className="hidden md:inline [writing-mode:vertical-rl] rotate-360 leading-none tracking-tight text-xs">
          產品選擇
        </span>
        <ChevronRight
          className={`w-4 h-4 mt-1 transition-transform ${
            productSidebarOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Sidebar Overlay */}
      {productSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setProductSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[85vw] md:w-[90vw] lg:w-[85vw] xl:w-[80vw] bg-background border-l shadow-2xl z-50 transform transition-transform duration-300 ${
          productSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Card className="h-full rounded-none border-0 flex flex-col">
          <CardHeader className="pb-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Package className="w-5 h-5" />
                產品選擇
                <Badge variant="secondary" className="ml-2">
                  {filteredProducts.length} 項產品
                  {activeFilterCount > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {activeFilterCount} 篩選
                    </Badge>
                  )}
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProductSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden flex flex-col p-6">
            {/* 搜尋與篩選 */}
            <div className="space-y-4 mb-4 flex-shrink-0">
              <ProductSearchFilters
                quickSearch={quickSearch}
                setQuickSearch={setQuickSearch}
                showAdvancedFilters={showAdvancedFilters}
                setShowAdvancedFilters={setShowAdvancedFilters}
                selectedVendors={selectedVendors}
                setSelectedVendors={setSelectedVendors}
                selectedModels={selectedModels}
                setSelectedModels={setSelectedModels}
                selectedSeries={selectedSeries}
                setSelectedSeries={setSelectedSeries}
                selectedRemarks={selectedRemarks}
                setSelectedRemarks={setSelectedRemarks}
                uniqueVendors={uniqueVendors}
                uniqueModels={uniqueModels}
                uniqueSeries={uniqueSeries}
                uniqueRemarks={uniqueRemarks}
                clearAllFilters={clearAllFilters}
                isLoading={isLoadingProducts}
              />

              {/* 視圖切換 */}
              <div className="flex gap-1 border rounded-md w-fit">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 產品列表 */}
            <div className="flex-1 overflow-auto">
              {isLoadingProducts ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
                  <p className="text-lg">載入中...</p>
                  <p className="text-sm">正在從資料庫獲取產品資訊</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">
                    {activeFilterCount > 0 
                      ? "沒有符合所有篩選條件的產品" 
                      : "沒有符合搜尋條件的產品"
                    }
                  </p>
                  <p className="text-sm">
                    {activeFilterCount > 0 
                      ? "請調整篩選條件或清除篩選" 
                      : "請嘗試搜尋或調整篩選條件"
                    }
                  </p>
                  {activeFilterCount > 0 && (
                    <Button onClick={clearAllFilters} variant="outline" className="mt-4">
                      清除所有篩選
                    </Button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <ProductGridView
                  products={filteredProducts}
                  onSelectProduct={handleSelectProduct}
                />
              ) : (
                <ProductTableView
                  products={filteredProducts}
                  onSelectProduct={handleSelectProduct}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};