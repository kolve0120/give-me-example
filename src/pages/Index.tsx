import { useState, useEffect } from "react";
import { StoreHeader } from "@/components/StoreHeader";
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductSelect } from "@/components/ProductSelect";
import { SalesProductList } from "@/components/SalesProductList";
import { useStore } from "@/hooks/useStore";
import { useOrderFormStore } from "@/stores/orderFormStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, ShoppingCart, Package, X } from "lucide-react";
import { NotificationModal } from "@/components/NotificationModal";

const Index = () => {
  // UI 狀態從全域 store
  const {
    expandedComponent,
    setExpandedComponent,
    showSuccessModal,
    setShowSuccessModal,
    setProductSidebarOpen,
  } = useStore();
  
  // 訂單表單狀態從專用 store
  const {
    salesItems,
    selectedCustomer,
    clearAll,
  } = useOrderFormStore();
  
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  // 檢查是否有未完成的資料
  useEffect(() => {
    const hasData = salesItems.length > 0 || selectedCustomer !== null;
    if (hasData) {
      setShowRestoreDialog(true);
    }
  }, []); // 只在初次載入時執行

  // 處理保留資料
  const handleKeepData = () => {
    setShowRestoreDialog(false);
  };

  // 處理清除資料
  const handleClearData = () => {
    clearAll();
    setShowRestoreDialog(false);
  };

  // 關閉成功模態框並清空資料
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    clearAll();
  };

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="container mx-auto px-4 py-6 max-w-[1920px]">
        {/* 頂部標題列 */}
        <StoreHeader />

        {/* 主要內容區域 */}
        <div className="space-y-6">
          </div>

 


        {/* 恢復資料對話框 */}
        <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>發現未完成的資料</AlertDialogTitle>
              <AlertDialogDescription>
                系統偵測到您有未完成的訂單資料，是否要繼續編輯？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClearData}>
                清除資料
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleKeepData}>
                繼續編輯
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 成功提交模態框（抽成元件） */}
        <NotificationModal />

        {/* 頁腳資訊 */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>店家管理系統 • 現代化響應式介面</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
