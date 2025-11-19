// src/components/order/OrderList.tsx
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Truck, Package } from "lucide-react";
import { toast } from "sonner";

import { OrderStats } from "./OrderStats";
import { OrderView } from "./OrderView";
import { BatchShipment } from "./BatchShipment";
import { ProductView } from "./ProductView";
import { useStore } from "@/hooks/useStore";

type OrderListProps = {
  onLoadOrder?: (order: any) => void;
};

export const OrderList = ({ onLoadOrder }: OrderListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { orders, loadOrdersFromApi, setOrders } = useStore();
  const [viewMode, setViewMode] = useState<"order" | "product">("order");
  const [batchMode, setBatchMode] = useState(false);
  const [shipmentInputs, setShipmentInputs] = useState<Record<string, number>>({});

  // 移除 localStorage 處理，直接使用 store 的 orders

  const handleEdit = (order: any) => {
    onLoadOrder?.(order);
    toast.success("訂單已載入至編輯頁面");
  };

  const handleStatusChange = (orderId: string, itemIndex: number, newStatus: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const updatedItems = o.items?.map((item, idx) => 
          idx === itemIndex ? { ...item, status: newStatus } : item
        );
        return { ...o, items: updatedItems };
      }
      return o;
    });
    setOrders(updated);
    // TODO: 呼叫 API 更新狀態
    toast.success("品項狀態已更新");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.orderInfo?.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  // 統計
  const totalOrders = orders.length;
  const thisMonthOrders = orders.filter((o: any) => {
    const d = new Date(o.orderInfo?.date);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;
  const totalAmount = orders.reduce(
    (s, o) => s + (o.items?.reduce((a: number, i: any) => a + i.totalPrice, 0) || 0),
    0
  );
  const pendingOrders = orders.filter((o) => o.orderInfo?.status === "待處理").length;

  // 商品彙總
  const productMap = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      order.items?.forEach((item: any) => {
        const key = item.name;
        if (!map.has(key)) {
          map.set(key, { name: key, totalQty: 0, totalPrice: 0, details: [] });
        }
        const e = map.get(key);
        e.totalQty += item.quantity;
        e.totalPrice += item.totalPrice;
        e.details.push({
          orderId: order.id,
          serialNumber: order.orderInfo?.serialNumber,
          customer: order.customer?.name,
          qty: item.quantity,
          price: item.priceDistribution,
          status: order.orderInfo?.status,
          date: order.orderInfo?.date,
        });
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [orders]);

  // 出貨輸入
  const handleShipmentInput = (key: string, value: string, max: number) => {
    const num = parseInt(value) || 0;
    if (num < 0) return;
    if (num > max) {
      toast.error(`出貨數量不可超過訂購數量 ${max}`);
      return;
    }
    setShipmentInputs((p) => ({ ...p, [key]: num }));
  };

  // 批次出貨
  const handleBatchShipment = () => {
    const groupedShipments: Record<string, any> = {};

    Object.entries(shipmentInputs).forEach(([key, qty]) => {
      if (qty <= 0) return;
      const [orderId, itemIdx] = key.split("-");
      const order = orders.find((o) => o.id === orderId);
      const item = order?.items?.[parseInt(itemIdx)];
      if (!order || !item) return;

      const shipmentDate = new Date().toISOString().split("T")[0];
      const customer = order.customer?.name || "未知客戶";
      const serialNumber = order.orderInfo?.serialNumber || "無序號";
      const groupKey = `${customer}-${serialNumber}-${shipmentDate}`;

      const priceDistribution =
        item.priceDistribution || item.totalPrice / item.quantity;

      if (!groupedShipments[groupKey]) {
        groupedShipments[groupKey] = {
          shipmentId: Date.now() + Math.random(),
          customer,
          serialNumber,
          shipmentDate,
          productItems: [],
        };
      }

      groupedShipments[groupKey].productItems.push({
        orderId: order.id,
        productName: item.name,
        quantity: qty,
        priceDistribution,
        totalPrice: qty * priceDistribution,
      });
    });

    const shipments = Object.values(groupedShipments);

    if (shipments.length === 0) {
      toast.error("請至少輸入一筆出貨數量");
      return;
    }

    // 呼叫 API 送出出貨資料
    try {
      // 組織批次出貨資料
      const shipmentPromises = shipments.map(async (shipment) => {
        const shipmentData = {
          serialNumber: shipment.serialNumber,
          items: shipment.productItems.map((item: any) => ({
            code: item.productCode || '',
            quantity: item.quantity
          }))
        };
        
        // 這裡呼叫實際的 API
        // await submitShipmentGS(shipmentData);
        console.log("出貨資料", shipmentData);
      });
      
      await Promise.all(shipmentPromises);
      toast.success(`成功出貨 ${shipments.length} 位客戶`);
      
      setShipmentInputs({});
      setBatchMode(false);
      
      // 重新載入訂單
      loadOrdersFromApi();
    } catch (error) {
      console.error("出貨失敗:", error);
      toast.error("出貨失敗，請稍後再試");
    }
  };


  // 批次出貨：依客戶分組
  const customerGroups = useMemo(() => {
    const groups: Record<string, any> = {};
    filteredOrders.forEach((order) => {
      const cust = order.customer?.name || "未命名客戶";
      if (!groups[cust]) {
        groups[cust] = { customer: cust, totalQty: 0, totalAmt: 0, items: [] };
      }
      order.items?.forEach((item: any, idx: number) => {
        const key = `${order.id}-${idx}`;
        groups[cust].totalQty += item.quantity;
        groups[cust].totalAmt += item.totalPrice;
        groups[cust].items.push({
          orderId: order.id,
          serialNumber: order.orderInfo?.serialNumber,
          productName: item.name,
          quantity: item.quantity,
          inputKey: key,
          currentInput: shipmentInputs[key] ?? 0,
        });
      });
    });
    return Object.values(groups).sort((a, b) => a.customer.localeCompare(b.customer));
  }, [filteredOrders, shipmentInputs]);

  return (
    <div className="space-y-6">
      <OrderStats
        totalOrders={totalOrders}
        thisMonthOrders={thisMonthOrders}
        totalAmount={totalAmount}
        pendingOrders={pendingOrders}
      />

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "order" ? "default" : "outline"}
            onClick={() => setViewMode("order")}
          >
            訂單視圖
          </Button>
          <Button
            variant={viewMode === "product" ? "default" : "outline"}
            onClick={() => setViewMode("product")}
          >
            商品視圖
          </Button>
        </div>

        {viewMode === "order" && (
          <div className="flex gap-2">
            {batchMode ? (
              <>
                <Button variant="outline" onClick={() => setBatchMode(false)}>
                  取消
                </Button>
                <Button onClick={handleBatchShipment}>
                  <Truck className="w-4 h-4 mr-2" />
                  確認出貨
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                onClick={() => {
                  setBatchMode(true);
                  setShipmentInputs({});
                  console.log(customerGroups);
                  toast.info("已進入批次出貨模式，依客戶分組填寫出貨數量");
                }}
              >
                <Package className="w-4 h-4 mr-2" />
                批次出貨
              </Button>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === "order"
              ? batchMode
                ? "批次出貨（依客戶）"
                : "訂單紀錄"
              : "商品彙總"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={
                viewMode === "order" ? "搜尋訂單編號、客戶名稱..." : "搜尋商品名稱..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {viewMode === "order" && !batchMode && (
            <OrderView
              filteredOrders={filteredOrders}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
            />
          )}

          {viewMode === "order" && batchMode && (
            <BatchShipment
              customerGroups={customerGroups}
              shipmentInputs={shipmentInputs}
              onShipmentInput={handleShipmentInput}
            />
          )}

          {viewMode === "product" && (
            <ProductView
              productMap={productMap}
              searchQuery={searchQuery}
              onEditOrder={(id) => {
                const order = orders.find((o) => o.id === id);
                if (order) handleEdit(order);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};