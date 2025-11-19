import { useState, useRef, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import { StoreHeader } from "@/components/StoreHeader";
import { ProductList } from "./products/ProductList";
import { OrderList } from "./orders/OrderList";
import { SalesList } from "./sales/SalesList";
import { PurchaseConversion } from "./purchase/PurchaseConversion";
import { PaymentStatus } from "./payments/PaymentStatus";
import { OrderForm } from "./orders/OrderForm";
import { useTabStore, TabInfo } from "@/stores/tabStore";
import { AuthModal } from "@/components/AuthModal";

import { 
  ShoppingCart, 
  Package, 
  FileText, 
  DollarSign, 
  ClipboardList,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Dashboard = () => {
  const {
    tabs,
    activeTabId,
    addNewOrderTab,
    addEditOrderTab,
    addOrSwitchToTab,
    closeTab,
    setActiveTab,
  } = useTabStore();
  
  const { initializeApp } = useStore();

  // 統一初始化，避免重複載入
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const menuConfig = [
    { value: 'order-new' as const, label: "新增訂單", icon: ShoppingCart },
    { value: 'products' as const, label: "產品管理", icon: Package },
    { value: 'orders' as const, label: "訂單紀錄", icon: FileText },
    { value: 'sales-records' as const, label: "銷售紀錄", icon: TrendingUp },
    { value: 'purchase' as const, label: "訂單轉採購", icon: ClipboardList },
    { value: 'payments' as const, label: "貨款查詢", icon: DollarSign },
  ];

  const handleMenuClick = (value: typeof menuConfig[number]['value']) => {
    if (value === 'order-new') {
      addNewOrderTab();
    } else {
      addOrSwitchToTab(value, menuConfig.find(m => m.value === value)?.label || value);
    }
  };

  const handleLoadOrder = (order: any) => {
    const serialNumber = order.orderInfo?.serialNumber || order.id;
    const orderData = {
      selectedCustomer: order.customer,
      salesItems: order.items,
      orderInfo: order.orderInfo,
    };
    addEditOrderTab(orderData);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(tabId);
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
      const currentTabType = tabs.find(t => t.id === activeTabId)?.type;
      const currentIndex = menuConfig.findIndex(m => m.value === currentTabType);
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

  const getTabComponent = (tab: TabInfo) => {
    switch (tab.type) {
      case 'order-new':
      case 'order-edit':
        return <OrderForm tabId={tab.id} />;
      case 'products':
        return <ProductList />;
      case 'orders':
        return <OrderList onLoadOrder={handleLoadOrder} />;
      case 'sales-records':
        return <SalesList />;
      case 'purchase':
        return <PurchaseConversion />;
      case 'payments':
        return <PaymentStatus />;
      default:
        return null;
    }
  };

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
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-all whitespace-nowrap",
                    activeTabId === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="text-sm font-medium">{tab.label}</span>
                  {tabs.length > 1 && (
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
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "space-y-6",
                  activeTabId === tab.id ? "block" : "hidden"
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
                const currentTab = tabs.find(t => t.id === activeTabId);
                const currentIndex = menuConfig.findIndex(m => m.value === currentTab?.type);
                const distance = Math.abs(index - currentIndex);
                const isActive = currentTab?.type === menu.value;
                
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
          {tabs.length > 1 && (
            <div className="bg-background/95 backdrop-blur border rounded-lg p-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all whitespace-nowrap text-sm",
                      activeTabId === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span>{tab.label}</span>
                    {tabs.length > 1 && (
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
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "space-y-6",
                  activeTabId === tab.id ? "block" : "hidden"
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
