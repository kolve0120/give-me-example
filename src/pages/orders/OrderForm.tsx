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
import { updateOrder,createOrder , } from "@/services/googleSheetsApi";

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
  const handleSubmitOrder = async () => {
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

    // 從 localStorage 讀取
    const savedOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');

    try {
      let apiResult;

      if (isEditMode && serialNumber) {
        // === 更新模式 ===
        const updatedOrders = savedOrders.map((order: any) =>
          order.orderInfo?.serialNumber === serialNumber ? orderToSave : order
        );

        // 更新 localStorage
        localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));

        // 呼叫 update API
        apiResult = await updateOrder(serialNumber, orderToSave); // 使用專用函數

        toast.success(`訂單 ${serialNumber} 已更新`);
      } else {
        // === 新增模式 ===
        savedOrders.push(orderToSave);
        localStorage.setItem('pendingOrders', JSON.stringify(savedOrders));

        // 呼叫 create API
        apiResult = await createOrder(orderToSave); // 使用專用函數

        toast.success("訂單已新增");
      }

      // === 成功後印出 Google Sheets 回傳的 rowNumber ===
      apiResult.forEach(order => {
        console.log('訂單', order.serialNumber);
        order.items.forEach(item => {
          console.log(`品項 ${item.code} 在第 ${item.rowNumber} 列`);
        });
      });

      // 清除表單 + 關閉 tab
      clearOrderData(tabId);
      closeTab(tabId);

    } catch (error: any) {
      toast.error(error.message || "保存失敗");
      console.error("Submit order error:", error);
    }
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
