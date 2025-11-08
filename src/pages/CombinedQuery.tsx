// src/pages/CombinedQuery.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStore } from '@/hooks/useStore';
import { Search } from 'lucide-react';

export const CombinedQuery = () => {
  const { orders, customers } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // 貨款統計（依客戶）
  const paymentStats = useMemo(() => {
    const stats = new Map();
    
    orders.forEach(order => {
      const customer = order.customer?.name || '未知客戶';
      const total = order.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
      const paid = 0; // TODO: 從 API 取得已付款金額
      
      if (!stats.has(customer)) {
        stats.set(customer, {
          customer,
          totalAmount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
          orderCount: 0,
        });
      }
      
      const stat = stats.get(customer);
      stat.totalAmount += total;
      stat.paidAmount += paid;
      stat.unpaidAmount = stat.totalAmount - stat.paidAmount;
      stat.orderCount += 1;
    });
    
    return Array.from(stats.values()).filter(s => 
      s.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  // 銷售統計（依商品）
  const salesStats = useMemo(() => {
    const stats = new Map();
    
    orders.forEach(order => {
      const orderDate = order.orderInfo?.date || '';
      const inRange = !dateRange.start || !dateRange.end || 
        (orderDate >= dateRange.start && orderDate <= dateRange.end);
      
      if (!inRange) return;
      
      order.items?.forEach(item => {
        const key = item.name;
        if (!stats.has(key)) {
          stats.set(key, {
            productName: key,
            totalQuantity: 0,
            totalAmount: 0,
            orderCount: 0,
          });
        }
        
        const stat = stats.get(key);
        stat.totalQuantity += item.quantity;
        stat.totalAmount += item.totalPrice;
        stat.orderCount += 1;
      });
    });
    
    return Array.from(stats.values()).filter(s => 
      s.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery, dateRange]);

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>綜合查詢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="搜尋客戶或商品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>開始日期</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>結束日期</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payment">貨款查詢</TabsTrigger>
          <TabsTrigger value="sales">銷售查詢</TabsTrigger>
        </TabsList>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>客戶貨款統計</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>客戶名稱</TableHead>
                    <TableHead className="text-right">訂單數量</TableHead>
                    <TableHead className="text-right">總金額</TableHead>
                    <TableHead className="text-right">已付款</TableHead>
                    <TableHead className="text-right">未付款</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentStats.map((stat, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{stat.customer}</TableCell>
                      <TableCell className="text-right">{stat.orderCount}</TableCell>
                      <TableCell className="text-right">
                        ${stat.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${stat.paidAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${stat.unpaidAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {paymentStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        無資料
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>商品銷售統計</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品名稱</TableHead>
                    <TableHead className="text-right">訂單數</TableHead>
                    <TableHead className="text-right">銷售數量</TableHead>
                    <TableHead className="text-right">銷售金額</TableHead>
                    <TableHead className="text-right">平均單價</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesStats.map((stat, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{stat.productName}</TableCell>
                      <TableCell className="text-right">{stat.orderCount}</TableCell>
                      <TableCell className="text-right">{stat.totalQuantity}</TableCell>
                      <TableCell className="text-right">
                        ${stat.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${Math.round(stat.totalAmount / stat.totalQuantity).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {salesStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        無資料
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
