import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Send, Trash2, ChevronDown } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { toast } from "sonner";

interface StoreControlsProps {
  submitLabel?: string;
}

export const StoreControls = ({ submitLabel = '提交訂單' }: StoreControlsProps) => {
  const {
    clearCustomer,
    clearProducts,
    clearAll,
    salesItems,
    selectedCustomer,
    orderInfo,
    getTotalAmount,
    getTotalQuantity,
    setShowSuccessModal,
  } = useStore();

  const handleSubmit = async () => {
    if (!selectedCustomer || salesItems.length === 0) {
      toast.error("請確認已選擇客戶並添加產品");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(`訂單提交成功！總金額: $${getTotalAmount().toLocaleString()}`);
      setShowSuccessModal(true);
      console.log("提交訂單資料:", {
        orderInfo,
        customer: selectedCustomer,
        items: salesItems,
        totalAmount: getTotalAmount(),
        totalQuantity: getTotalQuantity(),
      });
    } catch (error) {
      toast.error("提交失敗，請重試");
    }
  };

  const handleClear = (type: 'customer' | 'products' | 'all') => {
    switch (type) {
      case 'customer':
        clearCustomer();
        toast.success("已清除客戶資料");
        break;
      case 'products':
        clearProducts();
        toast.success("已清除產品清單");
        break;
      case 'all':
        clearAll();
        toast.success("已清除全部資料");
        break;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleSubmit}
        disabled={!selectedCustomer || salesItems.length === 0}
        className="btn-primary gap-2"
      >
        <Send className="w-4 h-4" />
        {submitLabel}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Trash2 className="w-4 h-4" />
            清除
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="animate-slide-up">
          <DropdownMenuItem onClick={() => handleClear('customer')} className="text-warning cursor-pointer">
            清除客戶資料
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleClear('products')} className="text-warning cursor-pointer">
            清除產品清單
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleClear('all')} className="text-error cursor-pointer">
            清除全部資料
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
