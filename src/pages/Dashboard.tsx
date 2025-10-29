import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreHeader } from "@/components/StoreHeader";
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductSelect } from "@/components/ProductSelect";
import { SalesProductList } from "@/components/SalesProductList";
import { ProductList } from "./products/ProductList";
import { ProductForm } from "./products/ProductForm";
import { OrderList } from "./orders/OrderList";
import { SalesList } from "./sales/SalesList";
import { PurchaseConversion } from "./purchase/PurchaseConversion";
import { PaymentStatus } from "./payments/PaymentStatus";
import { useStore } from "@/hooks/useStore";
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  DollarSign, 
  ClipboardList,
  TrendingUp,
  X,
  Save,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type TabType = {
  id: string;
  type: string;
  label: string;
  data?: any;
};

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("sales-1");
  const [openTabs, setOpenTabs] = useState<TabType[]>([ { id: "sales-1", type: "sales", label: "新增訂單 #1" } ]);

  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [salesCounter, setSalesCounter] = useState(1);
  
  const { 
    salesItems, 
    selectedCustomer, 
    orderInfo,
    clearAll,
    setSalesItems,
    setSelectedCustomer,
    setOrderInfo,
  } = useStore();

  const menuConfig = [
    { value: "sales", label: "新增訂單", icon: ShoppingCart },
    { value: "products", label: "產品管理", icon: Package },
    { value: "orders", label: "訂單紀錄", icon: FileText },
    { value: "sales-records", label: "銷售紀錄", icon: TrendingUp },
    { value: "purchase", label: "訂單轉採購", icon: ClipboardList },
    { value: "payments", label: "貨款查詢", icon: DollarSign },
  ];

  const handleMenuClick = (value: string) => {
    if (value === "sales") {
      // 創建新的訂單 tab
      const newCounter = salesCounter + 1;
      setSalesCounter(newCounter);
      const newTab = { 
        id: `sales-${newCounter}`, 
        type: "sales", 
        label: `新增訂單 #${newCounter}` 
      };
      setOpenTabs([...openTabs, newTab]);
      setActiveTab(newTab.id);
    } else {
      // 檢查是否已開啟
      const existingTab = openTabs.find(tab => tab.type === value);
      if (existingTab) {
        setActiveTab(existingTab.id);
      } else {
        const menuItem = menuConfig.find(m => m.value === value);
        const newTab = { 
          id: value, 
          type: value, 
          label: menuItem?.label || value 
        };
        setOpenTabs([...openTabs, newTab]);
        setActiveTab(newTab.id);
      }
    }
  };

  const handleLoadOrder = (order: any) => {
    // 創建新的訂單 tab 並載入數據
    const newCounter = salesCounter + 1;
    setSalesCounter(newCounter);
    const newTab = { 
      id: `sales-${newCounter}`, 
      type: "sales", 
      label: `編輯訂單 ${order.orderInfo?.serialNumber || `#${newCounter}`}`,
      data: order
    };
    setOpenTabs([...openTabs, newTab]);
    setActiveTab(newTab.id);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOpenTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(newOpenTabs);
    if (activeTab === tabId && newOpenTabs.length > 0) {
      setActiveTab(newOpenTabs[newOpenTabs.length - 1].id);
    }
  };

  // 手機版滑動處理
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setDragCurrentX(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragCurrentX(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const diff = dragCurrentX - dragStartX;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      const currentIndex = menuConfig.findIndex(m => m.value === activeTab);
      if (diff > 0 && currentIndex > 0) {
        handleMenuClick(menuConfig[currentIndex - 1].value);
      } else if (diff < 0 && currentIndex < menuConfig.length - 1) {
        handleMenuClick(menuConfig[currentIndex + 1].value);
      }
    }
    
    setIsDragging(false);
    setDragStartX(0);
    setDragCurrentX(0);
  };

  const handleSubmitOrder = (tabId: string) => {
    if (!selectedCustomer) {
      toast.error("請先選擇客戶");
      return;
    }
    if (salesItems.length === 0) {
      toast.error("請至少添加一個產品");
      return;
    }
    if (!orderInfo.serialNumber) {
      toast.error("請填寫流水號");
      return;
    }

    const orderData = {
      id: Date.now().toString(),
      customer: selectedCustomer,
      items: salesItems,
      orderInfo: {
        ...orderInfo,
        status: orderInfo.status || "待處理"
      },
      timestamp: new Date().toISOString(),
    };
    
    const savedOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    savedOrders.push(orderData);
    localStorage.setItem('pendingOrders', JSON.stringify(savedOrders));
    
    toast.success("訂單已暫存至本地");
    clearAll();
    
    // 關閉當前 tab
    handleCloseTab(tabId, { stopPropagation: () => {} } as React.MouseEvent);
  };

  const handleClearAll = (tabId: string) => {
    if (confirm("確定要清除所有資料嗎？")) {
      clearAll();
      toast.success("已清除所有資料");
    }
  };

  const getTabComponent = (tab: TabType) => {
    switch (tab.type) {
      case "sales":
        return (
          <div className="space-y-6">
            <CustomerSelect />
            <SalesProductList />
            <ProductSelect />
            
            <div className="flex gap-3 justify-end sticky bottom-4 z-30">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleClearAll(tab.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清除全部
              </Button>
              <Button
                size="lg"
                onClick={() => handleSubmitOrder(tab.id)}
              >
                <Save className="w-4 h-4 mr-2" />
                提交訂單
              </Button>
            </div>
          </div>
        );
      case "products":
        return <ProductList />;
      case "orders":
        return <OrderList onLoadOrder={handleLoadOrder} />;
      case "sales-records":
        return <SalesList />;
      case "purchase":
        return <PurchaseConversion />;
      case "payments":
        return <PaymentStatus />;
      default:
        return null;
    }
  };

  useEffect(() => {
    // 載入訂單數據到當前 tab
    const currentTab = openTabs.find(t => t.id === activeTab);
    if (currentTab?.data) {
      setSelectedCustomer(currentTab.data.customer);
      setSalesItems(currentTab.data.items);
      setOrderInfo(currentTab.data.orderInfo);
      // 清除 data 以避免重複載入
      const updatedTabs = openTabs.map(t => 
        t.id === activeTab ? { ...t, data: undefined } : t
      );
      setOpenTabs(updatedTabs);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="container mx-auto px-4 py-6 max-w-[1920px]">
        <StoreHeader />

        {/* 桌面版 */}
        <div className="hidden md:block space-y-4">
          {/* 功能選單 - 滾輪式 */}
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-3 sticky top-4 z-30 shadow-sm">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {menuConfig.map((menu) => (
                <Button
                  key={menu.value}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap"
                  onClick={() => handleMenuClick(menu.value)}
                >
                  <menu.icon className="w-4 h-4" />
                  <span className="text-sm">{menu.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* 已開啟的 Tab */}
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-2 sticky top-20 z-20 shadow-sm">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="text-sm font-medium">{tab.label}</span>
                  {openTabs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-2 hover:bg-background/20"
                      onClick={(e) => handleCloseTab(tab.id, e)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tab 內容 */}
          <div className="mt-6">
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "space-y-6",
                  activeTab === tab.id ? "block" : "hidden"
                )}
              >
                {getTabComponent(tab)}
              </div>
            ))}
          </div>
        </div>

        {/* 手機版 - 半圓卡片滑動選擇 */}
        <div className="md:hidden space-y-4">
          {/* 功能選單 - 半圓卡片 */}
          <div className="relative h-32 mb-6 overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/10 to-transparent rounded-t-full" />
            
            <div 
              ref={carouselRef}
              className="flex items-end justify-center gap-4 px-4 pb-4 relative z-10"
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              {menuConfig.map((menu, index) => {
                const currentIndex = menuConfig.findIndex(m => m.value === activeTab);
                const distance = Math.abs(index - currentIndex);
                const isActive = openTabs.some(t => t.type === menu.value && t.id === activeTab);
                
                return (
                  <div
                    key={menu.value}
                    className={cn(
                      "flex-shrink-0 transition-all duration-300 cursor-pointer",
                      isActive 
                        ? "w-20 h-20 -translate-y-2" 
                        : distance === 1 
                          ? "w-16 h-16 opacity-70" 
                          : "w-12 h-12 opacity-40"
                    )}
                    onClick={() => handleMenuClick(menu.value)}
                  >
                    <div className={cn(
                      "w-full h-full rounded-full flex flex-col items-center justify-center gap-1 shadow-lg transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground scale-110" 
                        : "bg-card hover:bg-accent"
                    )}>
                      <menu.icon className={cn(
                        isActive ? "w-8 h-8" : "w-6 h-6"
                      )} />
                      {isActive && (
                        <span className="text-[10px] font-medium text-center px-1">{menu.label}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 已開啟的 Tab */}
          {openTabs.length > 1 && (
            <div className="bg-background/95 backdrop-blur border rounded-lg p-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {openTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all whitespace-nowrap text-sm",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span>{tab.label}</span>
                    {openTabs.length > 1 && (
                      <button
                        className="ml-1"
                        onClick={(e) => handleCloseTab(tab.id, e)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 內容 */}
          <div className="mt-6">
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "space-y-6",
                  activeTab === tab.id ? "block" : "hidden"
                )}
              >
                {getTabComponent(tab)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
