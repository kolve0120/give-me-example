// src/components/order/BatchShipment.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText } from "lucide-react";
import { toast } from "sonner";

type BatchShipmentProps = {
  customerGroups: any[];
  shipmentInputs: Record<string, number>;
  onShipmentInput: (key: string, value: string, max: number) => void;
};

export const BatchShipment = ({
  customerGroups,
  shipmentInputs,
  onShipmentInput,
}: BatchShipmentProps) => {
  if (customerGroups.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>暫無符合條件的訂單</p>
      </div>
    );
  }

  // 🔹 全選功能：將該群組所有品項出貨量設為訂購量
  const handleSelectAll = (group: any, checked: boolean) => {
    group.items.forEach((it: any) => {
      const newVal = checked ? it.quantity : 0;
      onShipmentInput(it.inputKey, String(newVal), it.quantity);
    });
    toast.info(`${checked ? "全選" : "取消全選"}：${group.customer}`);
  };

  // 🔹 單一勾選：勾選即填滿出貨數量
  const handleItemCheck = (it: any, checked: boolean) => {
    const newVal = checked ? it.quantity : 0;
    onShipmentInput(it.inputKey, String(newVal), it.quantity);
  };

  // 🔹 檢查群組是否全選
  const isGroupAllSelected = (group: any) =>
    group.items.every((it: any) => Number(shipmentInputs[it.inputKey]) >= it.quantity);

  return (
    <Accordion type="multiple" className="space-y-2">
      {customerGroups.map((group) => {
        const groupAllSelected = isGroupAllSelected(group);
        return (
          <AccordionItem
            key={group.customer}
            value={group.customer}
            className="border-2 rounded-lg overflow-hidden shadow-sm border-amber-300 bg-amber-50/30"
          >
            <AccordionTrigger className="px-4 py-3 bg-amber-100 hover:bg-amber-200">
              <div className="flex justify-between w-full pr-4 items-center">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={groupAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(group, Boolean(checked))}
                  />
                  <span className="font-semibold text-lg">{group.customer}</span>
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <span>總數量：<strong>{group.totalQty}</strong></span>
                  <span>
                    總金額：<strong>NT$ {group.totalAmt.toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50">
                    <TableHead className="w-10"></TableHead>
                    <TableHead>訂單編號</TableHead>
                    <TableHead>產品名稱</TableHead>
                    <TableHead className="text-right">訂購數量</TableHead>
                    <TableHead className="text-center text-amber-700">
                      出貨數量
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.items.map((it: any, idx: number) => {
                    const isChecked =
                      Number(shipmentInputs[it.inputKey]) >= it.quantity;
                    return (
                      <TableRow key={`${it.orderId}-${idx}`}>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleItemCheck(it, Boolean(checked))
                            }
                          />
                        </TableCell>
                        <TableCell className="font-mono">{it.serialNumber}</TableCell>
                        <TableCell>{it.productName}</TableCell>
                        <TableCell className="text-right">{it.quantity}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            max={it.quantity}
                            value={shipmentInputs[it.inputKey] || ""}
                            onChange={(e) =>
                              onShipmentInput(it.inputKey, e.target.value, it.quantity)
                            }
                            className="w-20 text-center"
                            placeholder="0"
                          />
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
  );
};
