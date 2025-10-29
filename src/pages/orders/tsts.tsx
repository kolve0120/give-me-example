import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Truck,
  Package,
  ListOrdered,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type OrderListProps = {
  onLoadOrder?: (order: any) => void;
};

export const OrderList = ({ onLoadOrder }: OrderListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"order" | "product">("order");
  const [batchMode, setBatchMode] = useState(false);
  const [shipmentInputs, setShipmentInputs] = useState<Record<string, number>>(
    {}
  ); // { "orderId-itemIndex": qty }

  // ---------- 讀取本地資料 ----------
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const savedOrders = JSON.parse(
      localStorage.getItem("pendingOrders") || "[]"
    );
    setOrders(savedOrders);
  };

  // ---------- 編輯、狀態、刪除 ----------
  const handleEdit = (order: any) => {
    if (onLoadOrder) {
      onLoadOrder(order);
      toast.success("訂單已載入至編輯頁面");
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            orderInfo: { ...order.orderInfo, status: newStatus },
          }
        : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("pendingOrders", JSON.stringify(updatedOrders));
    toast.success("訂單狀態已更新");
  };

  const handleDelete = (orderId: string) => {
    if (confirm("確定要刪除此訂單嗎？")) {
      const updatedOrders = orders.filter((order) => order.id !== orderId);
      localStorage.setItem("pendingOrders", JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      toast.success("訂單已刪除");
    }
  };

  // ---------- 搜尋 ----------
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.orderInfo?.serialNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  // ---------- 統計卡 ----------
  const totalOrders = orders.length;
  const thisMonthOrders = orders.filter((o: any) => {
    const orderDate = new Date(o.orderInfo?.date);
    const now = new Date();
    return (
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const totalAmount = orders.reduce(
    (sum: number, o: any) =>
      sum +
      (o.items?.reduce(
        (s: number, item: any) => s + item.totalPrice,
        0
      ) || 0),
    0
  );

  const pendingOrders = orders.filter(
    (o) => o.orderInfo?.status === "待處理"
  ).length;

  // ---------- 商品視圖資料 ----------
  const productMap = useMemo(() => {
    const map = new Map<string, any>();
    orders.forEach((order) => {
      order.items?.forEach((item: any) => {
        const key = item.name;
        if (!map.has(key)) {
          map.set(key, {
            name: item.name,
            totalQty: 0,
            totalPrice: 0,
            details: [],
          });
        }
        const entry = map.get(key)!;
        entry.totalQty += item.quantity;
        entry.totalPrice += item.totalPrice;
        entry.details.push({
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
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [orders]);

  // ---------- 出貨輸入 ----------
  const handleShipmentInput = (key: string, value: string, max: number) => {
    const num = parseInt(value) || 0;
    if (num < 0) return;
    if (num > max) {
      toast.error(`出貨數量不可超過訂購數量 ${max}`);
      return;
    }
    setShipmentInputs((prev) => ({ ...prev, [key]: num }));
  };

  // ---------- 批次出貨 ----------
  const handleBatchShipment = () => {
    const shipments: any[] = [];

    Object.entries(shipmentInputs).forEach(([key, qty]) => {
      if (qty <= 0) return;
      const [orderId, itemIndexStr] = key.split("-");
      const itemIndex = parseInt(itemIndexStr);
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      const item = order.items?.[itemIndex];
      if (!item) return;

      shipments.push({
        shipmentId: Date.now().toString() + Math.random(),
        orderId: order.id,
        serialNumber: order.orderInfo?.serialNumber,
        customer: order.customer?.name,
        productName: item.name,
        quantity: qty,
        priceDistribution: item.priceDistribution || item.totalPrice / item.quantity,
        totalPrice: qty * (item.priceDistribution || item.totalPrice / item.quantity),
        shipmentDate: new Date().toISOString().split("T")[0],
        status: "已出貨",
      });
    });

    if (shipments.length === 0) {
      toast.error("請至少輸入一筆出貨數量");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("shippedOrders") || "[]");
    const updated = [...existing, ...shipments];
    localStorage.setItem("shippedOrders", JSON.stringify(updated));

    toast.success(`成功出貨 ${shipments.length} 筆項目`);
    setShipmentInputs({});
    setBatchMode(false);
  };

  // ---------- 批次出貨模式：以客戶分組 ----------
  const customerGroups = useMemo(() => {
    const groups: Record<
      string,
      { customer: string; totalQty: number; totalAmt: number; items: any[] }
    > = {};

    filteredOrders.forEach((order) => {
      const customer = order.customer?.name || "未命名客戶";
      if (!groups[customer]) {
        groups[customer] = {
          customer,
          totalQty: 0,
          totalAmt: 0,
          items: [],
        };
      }

      order.items?.forEach((item: any, idx: number) => {
        const inputKey = `${order.id}-${idx}`;
        groups[customer].totalQty += item.quantity;
        groups[customer].totalAmt += item.totalPrice;
        groups[customer].items.push({
          orderId: order.id,
          serialNumber: order.orderInfo?.serialNumber,
          productName: item.name,
          quantity: item.quantity,
          inputKey,
          currentInput: shipmentInputs[inputKey] ?? 0,
        });
      });
    });

    return Object.values(groups).sort((a, b) =>
      a.customer.localeCompare(b.customer)
    );
  }, [filteredOrders, shipmentInputs]);

  // ---------- 渲染 ----------
  return (
    <div className="space-y-6">
      {/* ==== 統計卡 ==== */}
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

      {/* 視圖切換 + 批次出貨 */}
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
                viewMode === "order"
                  ? "搜尋訂單編號、客戶名稱..."
                  : "搜尋商品名稱..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* ==== 訂單視圖 ==== */}
          {viewMode === "order" && !batchMode && (
            <Accordion type="multiple" className="space-y-2">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暫無訂單資料</p>
                </div>
              ) : (
                filteredOrders.map((order: any) => {
                  const totalQty =
                    order.items?.reduce(
                      (s: number, i: any) => s + i.quantity,
                      0
                    ) || 0;
                  const totalAmt =
                    order.items?.reduce(
                      (s: number, i: any) => s + i.totalPrice,
                      0
                    ) || 0;

                  return (
                    <AccordionItem
                      key={order.id}
                      value={order.id}
                      className="border-2 rounded-lg overflow-hidden shadow-sm border-muted/50 bg-white"
                    >
                      <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/80">
                        <div className="flex justify-between w-full pr-4 text-sm">
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-medium">
                              訂單編號: {order.orderInfo?.serialNumber}
                            </span>
                            <span>客戶名稱: {order.customer?.name}</span>
                            <span>訂單日期: {order.orderInfo?.date}</span>
                          </div>
                          <div className="flex gap-6 text-muted-foreground">
                            <span>數量: {totalQty}</span>
                            <span>NT$ {totalAmt.toLocaleString()}</span>
                            <Badge variant="outline">
                              {order.orderInfo?.status || "待處理"}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead>商品</TableHead>
                              <TableHead className="text-right">數量</TableHead>
                              <TableHead className="text-right">單價</TableHead>
                              <TableHead className="text-right">小計</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.items?.map((item: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">
                                  NT$ {item.priceDistribution?.toLocaleString() || "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  NT$ {item.totalPrice.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="flex justify-end gap-2 p-4 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            編輯
                          </Button>
                          <Select
                            value={order.orderInfo?.status || "待處理"}
                            onValueChange={(v) => handleStatusChange(order.id, v)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="待處理">待處理</SelectItem>
                              <SelectItem value="處理中">處理中</SelectItem>
                              <SelectItem value="已出貨">已出貨</SelectItem>
                              <SelectItem value="已完成">已完成</SelectItem>
                              <SelectItem value="已取消">已取消</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })
              )}
            </Accordion>
          )}

          {/* ==== 批次出貨模式：依客戶分組 ==== */}
          {viewMode === "order" && batchMode && (
            <Accordion type="multiple" className="space-y-2">
              {customerGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暫無符合條件的訂單</p>
                </div>
              ) : (
                customerGroups.map((group) => (
                  <AccordionItem
                    key={group.customer}
                    value={group.customer}
                    className="border-2 rounded-lg overflow-hidden shadow-sm border-amber-300 bg-amber-50/30"
                  >
                    <AccordionTrigger className="px-4 py-3 bg-amber-100 hover:bg-amber-200">
                      <div className="flex justify-between w-full pr-4">
                        <span className="font-semibold text-lg">
                          {group.customer}
                        </span>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <span>
                            總數量：<strong>{group.totalQty}</strong>
                          </span>
                          <span>
                            總金額：
                            <strong>NT$ {group.totalAmt.toLocaleString()}</strong>
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-amber-50">
                            <TableHead>訂單編號</TableHead>
                            <TableHead>產品名稱</TableHead>
                            <TableHead className="text-right">訂購數量</TableHead>
                            <TableHead className="text-center text-amber-700">
                              出貨數量
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.items.map((it: any, idx: number) => (
                            <TableRow key={`${it.orderId}-${idx}`}>
                              <TableCell className="font-mono">
                                {it.serialNumber}
                              </TableCell>
                              <TableCell>{it.productName}</TableCell>
                              <TableCell className="text-right">
                                {it.quantity}
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  min="0"
                                  max={it.quantity}
                                  value={it.currentInput}
                                  onChange={(e) =>
                                    handleShipmentInput(
                                      it.inputKey,
                                      e.target.value,
                                      it.quantity
                                    )
                                  }
                                  className="w-20 text-center"
                                  placeholder="0"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
          )}

          {/* ==== 商品視圖 ==== */}
          {viewMode === "product" && (
            <div className="space-y-4">
              {productMap.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暫無商品資料</p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {productMap
                    .filter((p) =>
                      p.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                    .map((prod) => (
                      <AccordionItem
                        key={prod.name}
                        value={prod.name}
                        className="border border-accent/50 rounded-lg overflow-hidden shadow-sm bg-accent/10"
                      >
                        <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/80">
                          <div className="flex justify-between w-full pr-4">
                            <span className="font-medium">{prod.name}</span>
                            <div className="flex gap-6 text-sm text-muted-foreground">
                              <span>
                                總數量：<strong>{prod.totalQty}</strong>
                              </span>
                              <span>
                                總金額：
                                <strong>
                                  NT$ {prod.totalPrice.toLocaleString()}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>訂單編號</TableHead>
                                <TableHead>客戶</TableHead>
                                <TableHead className="text-right">數量</TableHead>
                                <TableHead className="text-right">金額</TableHead>
                                <TableHead>狀態</TableHead>
                                <TableHead>日期</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {prod.details.map((d: any, idx: number) => (
                                <TableRow key={`${d.orderId}-${idx}`}>
                                  <TableCell className="font-mono">
                                    {d.serialNumber}
                                  </TableCell>
                                  <TableCell>{d.customer}</TableCell>
                                  <TableCell className="text-right">
                                    {d.qty}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    NT$ {d.price.toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        d.status === "待處理"
                                          ? "secondary"
                                          : d.status === "已完成"
                                          ? "default"
                                          : "outline"
                                      }
                                    >
                                      {d.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{d.date}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const fullOrder = orders.find(
                                          (o) => o.id === d.orderId
                                        );
                                        if (fullOrder) handleEdit(fullOrder);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};