// src/pages/orders/OrderForm.tsx
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
      customer: orderData.selectedCustomer,
      items: enrichedItems,
      orderInfo: {
        ...orderData.orderInfo,
        status: orderData.orderInfo.status || "待處理"
      }
    };
      console.log("準備送出的訂單資料:", orderToSave);
    try {
      let apiResult;

      if (isEditMode) {
        // === 更新模式 ===
        apiResult = await updateOrder(orderToSave);
        toast.success(`訂單 ${serialNumber} 已更新`);

        // updateOrder 回傳沒有 items，所以不更新 rowNumbers
        console.log('更新訂單回傳:', apiResult);
      } else {
        // === 新增模式 ===
        apiResult = await createOrder(orderToSave);
        toast.success("訂單已新增");
        // createOrder 回傳有 items 才更新 rowNumbers
        if (apiResult && apiResult.length > 0) {
          const orderResult = apiResult[0];
          console.log('新增訂單回傳:', orderResult);

          useStore.getState().updateOrderItemRowNumbers(
            orderResult.serialNumber,
            orderResult.items
          );
        }
      }

      // 重新載入訂單列表
      await useStore.getState().loadOrdersFromApi();

      // 清除表單 + 關閉 tab
      clearOrderData(tabId);
      closeTab(tabId);

    } catch (error: any) {
      toast.error(error.message || "保存失敗");
      console.error("提交訂單錯誤:", error);
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
