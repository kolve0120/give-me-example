import { useState, useMemo } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
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

// --- 類型定義 ---
interface Product {
  id: number;
  code: string;
  vender: string;
  name: string;
  series: string;
  remark: string;
  priceDistribution: number;
  tableTitle?: string;
  tableRowTitle?: string;
  tableColTitle?: string;
}

interface ProductTableViewProps {
  products: Product[];
  onSelectProduct: (product: Product, quantity: number) => void;
}

interface GroupedProduct {
  code: string;
  productId: number;
  tableTitle: string;
  tableRowTitle: string;
  tableColTitle: string;
  priceDistribution: number;
}

// --- 子組件：獨立的輸入格以優化效能 ---
const QuantityCell = ({ productCode }: { productCode: string }) => {
  const { register } = useFormContext();
  return (
    <Input
      type="number"
      {...register(`quantities.${productCode}`)}
      placeholder="數量"
      className="text-center w-20 mx-auto h-8"
      // 避免滾輪誤觸改變數值
      onWheel={(e) => (e.target as HTMLInputElement).blur()}
    />
  );
};

export const ProductTableView = ({
  products,
  onSelectProduct,
}: ProductTableViewProps) => {
  const [showAsButton, setShowAsButton] = useState(true);

  // 1. 初始化 React Hook Form
  const methods = useForm({
    defaultValues: {
      quantities: {} as Record<string, string>,
    },
  });

  const { handleSubmit, reset } = methods;

  // 2. 資料分組邏輯 (維持你原本的邏輯)
  const groupedProducts = useMemo(() => {
    const grouped: Record<string, GroupedProduct[]> = {};
    products.forEach((product) => {
      const titles = product.tableTitle?.split(",").map((t) => t.trim()) || [];
      const colTitles = product.tableColTitle?.split(",").map((r) => r.trim()) || [];
      if (!titles.length) return;
      
      titles.forEach((title, i) => {
        if (!grouped[title]) grouped[title] = [];
        grouped[title].push({
          code: product.code,
          productId: product.id,
          tableTitle: title,
          tableRowTitle: product.tableRowTitle || "",
          tableColTitle: colTitles[i] || "",
          priceDistribution: product.priceDistribution,
        });
      });
    });
    return grouped;
  }, [products]);

  // 3. 提交邏輯
  const onSubmit = (data: any) => {
    let count = 0;
    Object.entries(data.quantities).forEach(([productCode, value]) => {
      const qty = parseInt(value as string);
      if (value && !isNaN(qty) && qty > 0) {
        const product = products.find((item) => item.code === productCode);
        if (product) {
          onSelectProduct(product, qty);
          count++;
        }
      }
    });

    if (count > 0) {
      toast.success(`已批量添加 ${count} 項產品`);
      reset(); // 提交後清空所有輸入框
    } else {
      toast.error("請先輸入產品數量");
    }
  };

  const getUniqueCols = (list: GroupedProduct[]) =>
    [...new Set(list.map((p) => p.tableColTitle))].filter(Boolean);

  const getUniqueRows = (list: GroupedProduct[]) =>
    [...new Set(list.map((p) => p.tableRowTitle))].filter(Boolean);

  const getCellProduct = (tableTitle: string, row: string, col: string) => {
    return groupedProducts[tableTitle]?.find(
      (p) => p.tableRowTitle === row && p.tableColTitle === col
    ) || null;
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        {/* 頂部控制列 */}
        <div className="flex items-center justify-between sticky top-0 bg-background z-20 py-3 px-4 border-b shadow-sm">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAsButton}
                onChange={(e) => setShowAsButton(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-14 h-7 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
              <span className="ms-3 text-sm font-medium">
                {showAsButton ? "快速模式 (點擊即加1)" : "批次模式 (輸入數量)"}
              </span>
            </label>
          </div>

          {!showAsButton && (
            <Button onClick={handleSubmit(onSubmit)} size="sm" className="bg-green-600 hover:bg-green-700">
              確認批量加入
            </Button>
          )}
        </div>

        {/* 表格渲染區 */}
        {Object.entries(groupedProducts).map(([tableTitle, list]) => {
          const cols = getUniqueCols(list);
          const rows = getUniqueRows(list);

          return (
            <div key={tableTitle} className="mb-8 p-4 border rounded-xl bg-white shadow-sm">
              <h3 className="text-lg font-bold mb-3 text-primary">{tableTitle}</h3>
              <div className="overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="border text-center font-bold bg-muted/30">規格</TableHead>
                      {cols.map((col) => (
                        <TableHead key={col} className="border text-center font-bold">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row} className="hover:bg-muted/20">
                        <TableCell className="border font-medium text-center bg-muted/10">
                          {row}
                        </TableCell>
                        {cols.map((col) => {
                          const product = getCellProduct(tableTitle, row, col);
                          return (
                            <TableCell key={col} className="border text-center p-2">
                              {product ? (
                                showAsButton ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onSelectProduct(products.find(p => p.id === product.productId)!, 1)}
                                    className="w-full hover:bg-primary hover:text-white transition-colors"
                                  >
                                    ${product.priceDistribution}
                                  </Button>
                                ) : (
                                  <QuantityCell productCode={product.code} />
                                )
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>
    </FormProvider>
  );
};
