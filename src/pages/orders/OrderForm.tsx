// 獨立的訂單表單頁面組件
import { useEffect } from "react";
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductSelect } from "@/components/ProductSelect";
import { SalesProductList } from "@/components/SalesProductList";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTabStore } from "@/stores/tabStore";
import { useStore } from "@/hooks/useStore";
import { updateOrder } from "@/services/googleSheetsApi";

interface OrderFormProps {
  tabId: string;
}

export const OrderForm = ({ tabId }: OrderFormProps) => {
  const { getOrderData, updateOrderData, clearOrderData, closeTab, tabs } = useTabStore();
  const { enrichSalesItems } = useStore();
  const orderData = getOrderData(tabId);
  const currentTab = tabs.find(t => t.id === tabId);
  const isEditMode = currentTab?.type === 'order-edit';
  const serialNumber = currentTab?.orderSerialNumber;
  
  console.log("OrderForm 訂單數據", orderData, "編輯模式:", isEditMode); 
  
  const handleSubmitOrder = () => {
    if (!orderData?.selectedCustomer) {
      toast.error("請先選擇客戶");
      return;
    }
    if (!orderData?.salesItems || orderData.salesItems.length === 0) {
      toast.error("請至少添加一個產品");
      return;
    }
    if (!orderData?.orderInfo?.serialNumber) {
      toast.error("請填寫流水號");
      return;
    }

    // 補齊產品資料
    const enrichedItems = enrichSalesItems(orderData.salesItems);

    const orderToSave = {
      id: orderData.orderInfo.serialNumber,
      customer: orderData.selectedCustomer,
      items: enrichedItems,
      orderInfo: {
        ...orderData.orderInfo,
        status: orderData.orderInfo.status || "待處理"
      },
      timestamp: new Date().toISOString(),
    };
    
    // 從本地存儲讀取現有訂單
    const savedOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    
if (isEditMode && serialNumber) {
  const updatedOrders = savedOrders.map((order: any) => 
    order.orderInfo?.serialNumber === serialNumber ? orderToSave : order
  );

  // ✅ 更新 localStorage
  localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));

  // ✅ 同步更新 store → 這樣 UI 才會刷新
  //orderStore.orders = [...updatedOrders];
  //updateOrder(updateOrders)
  toast.success(`訂單 ${serialNumber} 已更新`);
} else {
      // 新增模式：添加新訂單
      savedOrders.push(orderToSave);
      localStorage.setItem('pendingOrders', JSON.stringify(savedOrders));
      toast.success("訂單已新增");
    }
    
    console.log("訂單已保存", orderToSave);
    // TODO: 調用 API 保存到 Google Sheets
    // await submitOrder(orderToSave, isEditMode ? 'update' : 'create');
    
    clearOrderData(tabId);
    closeTab(tabId);
  };

  const handleClearAll = () => {
    if (confirm("確定要清除所有資料嗎？")) {
      clearOrderData(tabId);
      toast.success("已清除所有資料");
    }
  };

  // 當 orderData 變化時，不需要做任何事情，因為數據已經在 tabStore 中管理
  // 組件只是讀取和顯示數據

  if (!orderData) {
    return <div>載入中...</div>;
  }

  return (
    <div className="space-y-6">
      <CustomerSelect tabId={tabId} />
      <SalesProductList tabId={tabId} />
      <ProductSelect tabId={tabId} />
      
      <div className="flex gap-3 justify-end sticky bottom-4 z-30">
        <Button
          variant="outline"
          size="lg"
          onClick={handleClearAll}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          清除全部
        </Button>
        <Button
          size="lg"
          onClick={handleSubmitOrder}
        >
          <Save className="w-4 h-4 mr-2" />
          提交訂單
        </Button>
      </div>
    </div>
  );
};
