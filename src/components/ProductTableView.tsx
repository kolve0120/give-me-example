import { useState, useMemo } from "react";
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
import { toast } from "sonner";

interface Product {
  id: number;
  code: string;
  vender: string;
  name: string;
  series: string;
  remark: string;
  priceDistribution: number;
  tableTitle?: string; // 表格標題，可能包含多個值以逗號分隔
  tableRowTitle?: string; // 列 (row)，可能包含多個值以逗號分隔
  tableColTitle?: string; // 欄 (column)，可能包含多個值以逗號分隔
}

interface ProductTableViewProps {
  products: Product[];
  onSelectProduct: (product: Product, quantity: number) => void;
}

interface GroupedProduct {
  code: string;
  series: string;
  vender: string;
  remark: string;
  priceDistribution: number;
  productId: number;
  tableTitle: string; // 改為陣列以儲存多個 tableTitle
  tableRowTitle: string; // 改為陣列以儲存多個 tableRowTitle
  tableColTitle: string; // 改為陣列以儲存多個 tableColTitle
}

export const ProductTableView = ({
  products,
  onSelectProduct,
}: ProductTableViewProps) => {
  const [showAsButton, setShowAsButton] = useState(true);
  const [editableData, setEditableData] = useState<Record<string, string>>({});

  // 按 tableTitle 分組產品，支援多值 tableTitle
  const groupedProducts = useMemo(() => {
    const grouped: Record<string, GroupedProduct[]> = {};

    products.forEach((product) => {
      const titles = product.tableTitle?.split(",").map((t) => t.trim()) || [];
      const colTitles = product.tableColTitle?.split(",").map((r) => r.trim()) || [];
      if (!titles.length) return;
      for (let i=0; i < titles.length; i++) {
        const title = titles[i];
        const colTitle = colTitles[i];
        if (!grouped[title]) grouped[title] = [];
        grouped[title].push({
          code: product.code,
          series: product.series,
          vender: product.vender,
          remark: product.remark,
          priceDistribution: product.priceDistribution,
          productId: product.id,
          tableTitle: title,
          tableRowTitle: product.tableRowTitle,
          tableColTitle: colTitle,
        });
      }
    });

    return grouped;
  }, [products]);7

  // 橫向欄位：表格第一列，支援多值 tableColTitle
  const getUniqueCols = (products: GroupedProduct[]) =>
    [...new Set(products.flatMap((p) => p.tableColTitle))].filter(Boolean);

  // 縱向欄位：表格第一欄，支援多值 tableRowTitle
  const getUniqueRows = (products: GroupedProduct[]) =>
    [...new Set(products.flatMap((p) => p.tableRowTitle))].filter(Boolean);

  // 取得某格對應產品，支援多值 tableRowTitle 和 tableColTitle
  const getCellProduct = (
    tableTitle: string,
    row: string,
    col: string
  ): GroupedProduct | null => {
    return (
      groupedProducts[tableTitle]?.find(
        (p) =>
          p.tableRowTitle.includes(row) &&
          (col ? p.tableColTitle.includes(col) : p.tableColTitle.length === 0)
      ) || null
    );
  };

  // 點擊按鈕加入單項
  const handleButtonClick = (productId: number) => {
    const product = products.find((item) => item.id === productId);
    if (product) {
      onSelectProduct(product, 1);
    }
  };

  // 批量確認加入
  const submitToList = () => {
    let count = 0;
    Object.entries(editableData).forEach(([productId, value]) => {
      const qty = parseInt(value);

      if (value && !isNaN(qty) && qty > 0) {
        const product = products.find((item) => item.code === productId);
        console.log(product);
        if (product) {
          onSelectProduct(product, qty);
          count++;
        }
      }
    });

    if (count > 0) {
      toast.success(`已批量添加 ${count} 項產品`);
      setEditableData({});
    } else {
      toast.error("請先輸入產品數量");
    }
  };

  // 更新輸入數量
  const handleInputChange = (productId: string, value: string) => {
    setEditableData((prev) => ({ ...prev, [productId]: value }));
  };

  return (
    <div className="space-y-4">
      {/* 模式切換 */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-20 py-3 px-4 border-b shadow-sm">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showAsButton}
            onChange={(e) => setShowAsButton(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium">
            {showAsButton ? "切換輸入" : "切換按鈕"}
          </span>
        </label>
        {!showAsButton && (
          <Button onClick={submitToList} size="sm">
            確認
          </Button>
        )}
      </div>

      {/* 各表格區塊 */}
      {Object.entries(groupedProducts).map(([tableTitle, list]) => {
        const cols = getUniqueCols(list);
        const rows = getUniqueRows(list);

        return (
          <div key={tableTitle} className="mb-8">
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="border font-bold w-32 text-center">
                      {tableTitle}
                    </TableHead>
                    {cols.map((col) => (
                      <TableHead key={col} className="border text-center">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row}>
                      <TableCell className="border font-medium text-center">
                        {row}
                      </TableCell>
                      {cols.length > 0 ? (
                        cols.map((col) => {
                          const product = getCellProduct(tableTitle, row, col);
                          return (
                            <TableCell key={col} className="border text-center">
                              {product ? (
                                showAsButton ? (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleButtonClick(product.productId)}
                                    className="w-full"
                                  >
                                    {product.priceDistribution}
                                  </Button>
                                ) : (
                                  <Input
                                    type="text"
                                    value={editableData[product.code] || ""}
                                    onChange={(e) =>
                                      handleInputChange(product.code, e.target.value)
                                    }
                                    placeholder="數量"
                                    className="text-center"
                                  />
                                )
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          );
                        })
                      ) : (
                        <TableCell className="border text-center">
                          {list.find((p) => p.tableRowTitle.includes(row)) ? (
                            showAsButton ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  handleButtonClick(
                                    list.find((p) => p.tableRowTitle.includes(row))!.productId
                                  )
                                }
                                className="w-full"
                              >
                                {list.find((p) => p.tableRowTitle.includes(row))!.priceDistribution}
                              </Button>
                            ) : (
                              <Input
                                type="text"
                                value={
                                  editableData[
                                    list.find((p) => p.tableRowTitle.includes(row))!.productId
                                  ] || ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    String(list.find((p) => p.tableRowTitle === row)!.productId),
                                    e.target.value
                                  )
                                }
                                placeholder="數量"
                                className="text-center"
                              />
                            )
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
};