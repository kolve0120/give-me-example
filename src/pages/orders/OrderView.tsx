// src/components/order/OrderView.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, FileText } from "lucide-react";
import { toast } from "sonner";

type OrderViewProps = {
  filteredOrders: any[];
  onEdit: (order: any) => void;
  onStatusChange: (orderId: string, itemIndex: number, status: string) => void;
};

export const OrderView = ({ filteredOrders, onEdit, onStatusChange }: OrderViewProps) => {
  if (filteredOrders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>暫無訂單資料</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-2">
      {filteredOrders.map((order: any) => {
        const totalQty = order.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0;
        const totalAmt = order.items?.reduce((s: number, i: any) => s + i.totalPrice, 0) || 0;

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
                    <TableHead className="text-right">狀態</TableHead>
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
                      <TableCell className="text-right">
                        <Select
                          value={item.status || "待處理"}
                          onValueChange={(v) => onStatusChange(order.id, idx, v)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="待處理">待處理</SelectItem>
                            <SelectItem value="處理中">處理中</SelectItem>
                            <SelectItem value="已出貨">已出貨</SelectItem>
                            <SelectItem value="已完成">已完成</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end gap-2 p-4 border-t">
                <Button variant="ghost" size="sm" onClick={() => onEdit(order)}>
                  <Edit className="w-4 h-4 mr-1" />
                  編輯
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};