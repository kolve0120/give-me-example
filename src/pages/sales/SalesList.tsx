import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, TrendingUp, DollarSign, Package, Save } from "lucide-react";
import { toast } from "sonner";

interface SaleItem {
  id: string;
  orderId: string;
  serialNumber: string;
  date: string;
  customer: string;
  productName: string;
  productModel: string;
  quantity: number;
  priceDistribution: number;
  totalPrice: number;
  status: string;
}

interface CustomerGroup {
  customer: string;
  items: SaleItem[];
  totalQty: number;
  totalAmt: number;
}

export const SalesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  // 從 store 載入銷售資料
  const { orders, loadOrdersFromApi } = useStore();
  
  useEffect(() => {
    // 初次載入時從 API 取得訂單
    if (orders.length === 0) {
      loadOrdersFromApi();
    }
    
    // 將訂單轉換為銷售記錄格式
    const salesData: SaleItem[] = orders.flatMap((order: any) => 
      (order.items || []).map((item: any, idx: number) => ({
        id: `${order.id}-${idx}`,
        orderId: order.id,
        serialNumber: order.orderInfo?.serialNumber || order.id,
        date: order.orderInfo?.date || new Date().toLocaleDateString('zh-TW'),
        customer: order.customer?.name || order.selectedCustomer?.name || '未知客戶',
        productName: `${item.vender || ''} ${item.series || ''}`.trim() || item.name,
        productModel: item.model || '',
        quantity: item.quantity || 0,
        priceDistribution: item.priceDistribution || 0,
        totalPrice: item.totalPrice || 0,
        status: item.status || order.orderInfo?.status || '待處理',
      }))
    );
    setSales(salesData);
  }, [orders, loadOrdersFromApi]);

  // 過濾並分組
  const filteredSales = useMemo(() => {
    return sales.filter(sale => 
      sale.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sales, searchQuery]);

  const customerGroups: CustomerGroup[] = useMemo(() => {
    const groups: Record<string, CustomerGroup> = {};
    
    filteredSales.forEach(sale => {
      if (!groups[sale.customer]) {
        groups[sale.customer] = {
          customer: sale.customer,
          items: [],
          totalQty: 0,
          totalAmt: 0,
        };
      }
      
      groups[sale.customer].items.push(sale);
      groups[sale.customer].totalQty += sale.quantity;
      groups[sale.customer].totalAmt += sale.totalPrice;
    });

    return Object.values(groups);
  }, [filteredSales]);

  // 統計數據
  const stats = useMemo(() => {
    const totalSales = sales.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    }).length;

    const totalAmount = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const averageOrder = totalSales > 0 ? totalAmount / totalSales : 0;

    return {
      totalSales,
      thisMonthSales,
      totalAmount,
      averageOrder,
    };
  }, [sales]);

  // 全選功能
  const handleSelectAll = (group: CustomerGroup, checked: boolean) => {
    const newSelected = { ...selectedItems };
    group.items.forEach(item => {
      newSelected[item.id] = checked;
    });
    setSelectedItems(newSelected);
    toast.info(`${checked ? "全選" : "取消全選"}：${group.customer}`);
  };

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setSelectedItems({ ...selectedItems, [itemId]: checked });
  };

  const isGroupAllSelected = (group: CustomerGroup) =>
    group.items.every(item => selectedItems[item.id]);

  const handleSaveToDatabase = async () => {
    // TODO: 實現保存到數據庫的邏輯
    const selectedSales = sales.filter(sale => selectedItems[sale.id]);
    
    if (selectedSales.length === 0) {
      toast.error("請至少選擇一筆資料");
      return;
    }

    try {
      // await saveSalesToDatabase(selectedSales);
      toast.success(`已保存 ${selectedSales.length} 筆銷售資料到數據庫`);
      setSelectedItems({});
    } catch (error) {
      toast.error("保存失敗");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 概況卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              總銷售數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              本月銷售
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.thisMonthSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              總銷售額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${stats.totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" />
              平均訂單
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(stats.averageOrder).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 銷售列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>銷售紀錄</CardTitle>
            <Button onClick={handleSaveToDatabase} size="sm">
              <Save className="w-4 h-4 mr-2" />
              保存到數據庫
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="搜尋銷售編號、客戶名稱、產品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {customerGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暫無銷售資料</p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {customerGroups.map((group) => {
                const groupAllSelected = isGroupAllSelected(group);
                return (
                  <AccordionItem
                    key={group.customer}
                    value={group.customer}
                    className="border rounded-lg overflow-hidden shadow-sm"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                      <div className="flex justify-between w-full pr-4 items-center">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={groupAllSelected}
                            onCheckedChange={(checked) => handleSelectAll(group, Boolean(checked))}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-semibold text-base">{group.customer}</span>
                        </div>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <span>總數量：<strong className="text-foreground">{group.totalQty}</strong></span>
                          <span>
                            總金額：<strong className="text-foreground">NT$ {group.totalAmt.toLocaleString()}</strong>
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>訂單編號</TableHead>
                            <TableHead>日期</TableHead>
                            <TableHead>產品名稱</TableHead>
                            <TableHead>型號</TableHead>
                            <TableHead className="text-right">數量</TableHead>
                            <TableHead className="text-right">單價</TableHead>
                            <TableHead className="text-right">小計</TableHead>
                            <TableHead className="text-center">狀態</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.items.map((item) => {
                            const isChecked = selectedItems[item.id] || false;
                            return (
                              <TableRow key={item.id}>
                                <TableCell className="text-center">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) =>
                                      handleItemCheck(item.id, Boolean(checked))
                                    }
                                  />
                                </TableCell>
                                <TableCell className="font-mono text-sm">{item.serialNumber}</TableCell>
                                <TableCell className="text-sm">{item.date}</TableCell>
                                <TableCell className="font-medium">{item.productName}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{item.productModel}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right text-sm">
                                  ${item.priceDistribution.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  ${item.totalPrice.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="text-xs">{item.status}</Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
