// src/components/order/OrderStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrderStatsProps = {
  totalOrders: number;
  thisMonthOrders: number;
  totalAmount: number;
  pendingOrders: number;
};

export const OrderStats = ({
  totalOrders,
  thisMonthOrders,
  totalAmount,
  pendingOrders,
}: OrderStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            總訂單數
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            本月訂單
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {thisMonthOrders}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            總金額
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            NT$ {totalAmount.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            待處理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {pendingOrders}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};