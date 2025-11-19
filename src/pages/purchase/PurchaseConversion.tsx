import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type ProductGroup = {
  productCode: string;
  series: string;
  remark: string;
  vender: string;
  totalQuantity: number;
  orders: string[];
};

export const PurchaseConversion = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<ProductGroup[]>([]);

  useEffect(() => {
   // loadOrders();
  }, []);

  useEffect(() => {
    if (selectedOrders.length > 0) {
      calculateGroupedProducts();
    } else {
      setGroupedProducts([]);
    }
  }, [selectedOrders, orders]);

  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const processingOrders = savedOrders.filter(
      (order: any) => order.orderInfo?.status === "處理中" || order.orderInfo?.status === "待處理"
    );
    setOrders(processingOrders);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const calculateGroupedProducts = () => {
    const productMap = new Map<string, ProductGroup>();

    selectedOrders.forEach(orderId => {
      const order = orders.find(o => o.id === orderId);
      if (order && order.items) {
        order.items.forEach((item: any) => {
          const key = `${item.code}-${item.list?.vender || '未知廠商'}`;
          
          if (productMap.has(key)) {
            const existing = productMap.get(key)!;
            existing.totalQuantity += item.quantity || 1;
            if (!existing.orders.includes(order.orderInfo?.serialNumber)) {
              existing.orders.push(order.orderInfo?.serialNumber);
            }
          } else {
            productMap.set(key, {
              productCode: item.code,
              series:  item.name || item.code,
              vender: item.list?.vender || '未知廠商',
              remark: item.remark || '',
              totalQuantity: item.quantity || 1,
              orders: [order.orderInfo?.serialNumber || orderId]
            });
          }
        });
      }
    });

    setGroupedProducts(Array.from(productMap.values()));
  };

  const handleGeneratePurchaseOrder = () => {
    if (selectedOrders.length === 0) {
      toast.error("請先選擇訂單");
      return;
    }

    const purchaseOrder = {
      id: Date.now().toString(),
      orderIds: selectedOrders,
      products: groupedProducts,
      createdAt: new Date().toISOString(),
      status: "待採購"
    };

    const savedPurchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
    savedPurchaseOrders.push(purchaseOrder);
    localStorage.setItem('purchaseOrders', JSON.stringify(savedPurchaseOrders));

    toast.success("採購單已產生並暫存至本地");
    setSelectedOrders([]);
  };

  const groupByvender = () => {
    const venderMap = new Map<string, ProductGroup[]>();
    groupedProducts.forEach(product => {
      if (!venderMap.has(product.vender)) {
        venderMap.set(product.vender, []);
      }
      venderMap.get(product.vender)!.push(product);
    });
    return venderMap;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>訂單轉採購</CardTitle>
            <Button onClick={handleGeneratePurchaseOrder} disabled={selectedOrders.length === 0}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              產生採購單
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              選擇訂單以產生採購單，系統會自動依廠商統計所需數量
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>訂單編號</TableHead>
                    <TableHead>客戶</TableHead>
                    <TableHead>產品數量</TableHead>
                    <TableHead>總金額</TableHead>
                    <TableHead>狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>暫無待轉換訂單</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const totalAmount = order.items?.reduce((sum: number, item: any) => {
                        const price = parseFloat(item.price) || 0;
                        const quantity = item.quantity || 1;
                        return sum + (price * quantity);
                      }, 0) || 0;

                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{order.orderInfo?.serialNumber || order.id}</TableCell>
                          <TableCell>{order.customer?.name || "未指定"}</TableCell>
                          <TableCell>{order.items?.length || 0}</TableCell>
                          <TableCell>NT$ {totalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{order.orderInfo?.status || "待處理"}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>採購單預覽（依廠商分組）</CardTitle>
        </CardHeader>
        <CardContent>
          {groupedProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              請先選擇訂單以查看採購單預覽
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(groupByvender().entries()).map(([vender, products]) => (
                <div key={vender} className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-lg">
                    <Package className="w-5 h-5" />
                    <span>{vender}</span>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>選擇</TableHead>
                          <TableHead>產品編號</TableHead>
                          <TableHead>產品名稱</TableHead>
                          <TableHead>總數量</TableHead>
                          <TableHead>相關訂單</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product, index) => (
                          <TableRow key={index}>
                            
                            <TableCell>                      <Checkbox 
                              checked={true}  
                      /></TableCell>
                            <TableCell className="font-mono">{product.productCode}</TableCell>
                            <TableCell>{product.series}</TableCell>
                            <TableCell className="font-semibold">{product.totalQuantity}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {product.orders.map((orderId, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {orderId}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
