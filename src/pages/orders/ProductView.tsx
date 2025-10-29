// src/components/order/ProductView.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, FileText } from "lucide-react";

type ProductViewProps = {
  productMap: any[];
  searchQuery: string;
  onEditOrder: (orderId: string) => void;
};

export const ProductView = ({
  productMap,
  searchQuery,
  onEditOrder,
}: ProductViewProps) => {
  const filtered = productMap.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>暫無商品資料</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-2">
      {filtered.map((prod) => (
        <AccordionItem
          key={prod.name}
          value={prod.name}
          className="border border-accent/50 rounded-lg overflow-hidden shadow-sm bg-accent/10"
        >
          <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/80">
            <div className="flex justify-between w-full pr-4">
              <span className="font-medium">{prod.name}</span>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span>總數量：<strong>{prod.totalQty}</strong></span>
                <span>
                  總金額：<strong>NT$ {prod.totalPrice.toLocaleString()}</strong>
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
                    <TableCell className="font-mono">{d.serialNumber}</TableCell>
                    <TableCell>{d.customer}</TableCell>
                    <TableCell className="text-right">{d.qty}</TableCell>
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
                        onClick={() => onEditOrder(d.orderId)}
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
  );
};