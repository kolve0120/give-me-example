import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useOrderFormStore } from "@/stores/orderFormStore";

export const NotificationModal = () => {
  const { showSuccessModal, setShowSuccessModal } = useStore();
  const { clearAll } = useOrderFormStore();

  const handleClose = () => {
    setShowSuccessModal(false);
    clearAll();
  };

  return (
    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-4 py-6">
          <CheckCircle className="w-16 h-16 text-success mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-success mb-2">訂單提交成功！</h2>
            <p className="text-muted-foreground">您的訂單已成功提交，系統正在處理中...</p>
          </div>
          <Button onClick={handleClose} className="btn-primary w-full">
            確認並清空資料
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
