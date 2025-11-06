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

interface OrderFormProps {
  tabId: string;
}

export const OrderForm = ({ tabId }: OrderFormProps) => {
  const { getOrderData, updateOrderData, clearOrderData, closeTab } = useTabStore();
  const orderData = getOrderData(tabId);

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

    const orderToSave = {
      id: Date.now().toString(),
      customer: orderData.selectedCustomer,
      items: orderData.salesItems,
      orderInfo: {
        ...orderData.orderInfo,
        status: orderData.orderInfo.status || "待處理"
      },
      timestamp: new Date().toISOString(),
    };
    
    // 保存到本地存儲
    const savedOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    savedOrders.push(orderToSave);
    localStorage.setItem('pendingOrders', JSON.stringify(savedOrders));
    
    // TODO: 這裡應該保存到數據庫
    // await saveOrderToDatabase(orderToSave);
    
    toast.success("訂單已提交");
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
