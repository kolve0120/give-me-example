import { Card } from "@/components/ui/card";
import { useStore } from "@/hooks/useStore";
import { StoreControls } from "./StoreControls";

export const StoreHeader = () => {
  const { selectedCustomer, salesItems, getTotalAmount, getTotalQuantity } = useStore();

  return (
    <Card className="card-elegant p-4 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* 標題與簡短資訊 */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            店家管理系統
          </h1>
          {selectedCustomer && (
            <div className="text-sm text-muted-foreground">
              當前客戶: <span className="font-medium text-foreground">{selectedCustomer.name}</span>
            </div>
          )}
        </div>

        {/* Dashboard 占位：可以放更多圖表或快速統計 */}
        <div className="flex-1 mx-6">
          <div className="text-sm text-muted-foreground">快速統計</div>
          {salesItems.length > 0 ? (
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-muted-foreground">商品數量</div>
                <div className="font-semibold text-primary">{getTotalQuantity()}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">總金額</div>
                <div className="font-semibold text-secondary">${getTotalAmount().toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">尚無商品</div>
          )}
        </div>

        {/* 使用獨立的 StoreControls 元件來顯示操作按鈕 */}
        <StoreControls />
      </div>
    </Card>
  );
};