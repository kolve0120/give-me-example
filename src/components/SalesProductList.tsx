import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/hooks/useStore";
import { useOrderFormStore } from "@/stores/orderFormStore";
import {
  ShoppingCart,
  Minus,
  Plus,
  MoreVertical,
  Copy,
  Trash2,
  Calculator,
  Package,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  item: any;
  index: number;
  onQuantityChange: (index: number, change: number) => void;
  onQuantityInput: (index: number, value: string) => void;
  onPriceChange: (index: number, price: string) => void;
  onCopyItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
  onModelsChange: (index: number, model: string) => void;
  onRemarkChange: (index: number, remark: string) => void;
  editingPrice: number | null;
  editingQuantity: number | null;
  setEditingPrice: (index: number | null) => void;
  setEditingQuantity: (index: number | null) => void;
  handleKeyDown: (e: React.KeyboardEvent, index: number, type: "quantity" | "price") => void;
  products: any[];
}

const SortableItem = ({
  id,
  item,
  index,
  onQuantityChange,
  onQuantityInput,
  onPriceChange,
  onCopyItem,
  onRemoveItem,
  onModelsChange,
  onRemarkChange,
  editingPrice,
  editingQuantity,
  setEditingPrice,
  setEditingQuantity,
  handleKeyDown,
  products,
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const modelForProduct = useMemo(() => {
    return Array.from(new Set(products.filter(p => p.vendor === item.vendor && p.series === item.series).map(p => p.model)));
  }, [products, item.vendor, item.series]);

  const remarksForSeries = useMemo(() => {
    return Array.from(new Set(products.filter(p => p.vendor === item.vendor && p.series === item.series && p.model === item.model).map(p => p.remark)));
  }, [products, item.vendor, item.model, item.series]);

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 border rounded-lg bg-surface hover:shadow-md transition-shadow touch-none">
      {/* 操作按鈕 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="icon" className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onCopyItem(index)}><Copy className="w-4 h-4 mr-2" />複製商品</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRemoveItem(index)} className="text-error"><Trash2 className="w-4 h-4 mr-2" />移除商品</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 商品資訊 */}
      <div className="flex-1 min-w-0 w-full md:w-auto">
        {/* 手機版排版 */}
        <div className="md:hidden space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{item.vendor} • {item.series}</h4>
              <Badge variant="outline" className="text-xs mt-1">{item.code}</Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            {modelForProduct.length > 0 ? (
              <Select value={item.model} onValueChange={(v) => onModelsChange(index, v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelForProduct.map(s => (
                    <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-muted-foreground">{item.series}</p>
            )}
            
            {remarksForSeries.length > 0 ? (
              <Select value={item.remark} onValueChange={(v) => onRemarkChange(index, v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {remarksForSeries.map(r => (
                    <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-muted-foreground">{item.remark}</p>
            )}
          </div>
        </div>

        {/* 桌面版排版 */}
        <div className="hidden md:block">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-2">{item.vendor} • {item.series}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {modelForProduct.length > 0 ? (
                  <Select value={item.model} onValueChange={(v) => onModelsChange(index, v)}>
                    <SelectTrigger className="h-7 text-xs w-auto min-w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelForProduct.map(s => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-muted-foreground">{item.series}</p>
                )}
                
                {remarksForSeries.length > 0 ? (
                  <Select value={item.remark} onValueChange={(v) => onRemarkChange(index, v)}>
                    <SelectTrigger className="h-7 text-xs w-auto min-w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {remarksForSeries.map(r => (
                        <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-muted-foreground">{item.remark}</p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-xs flex-shrink-0">{item.code}</Badge>
          </div>
        </div>
      </div>

      {/* 數量控制 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-xs text-muted-foreground mb-1">數量</div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onQuantityChange(index, -1)} 
          className="w-8 h-8 p-0"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Input 
          type="number" 
          min="1" 
          value={item.quantity} 
          onChange={(e) => onQuantityInput(index, e.target.value)} 
          onFocus={() => setEditingQuantity(index)} 
          onBlur={() => setEditingQuantity(null)} 
          onKeyDown={(e) => handleKeyDown(e, index, "quantity")} 
          className="quantity-input w-16 text-center text-sm" 
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onQuantityChange(index, 1)} 
          className="w-8 h-8 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* 價格和小計 */}
      <div className="flex items-center gap-4 flex-shrink-0 w-full md:w-auto justify-between md:justify-start mt-2 md:mt-0">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">單價</div>
          <Input 
            type="number" 
            min="0" 
            step="0.01" 
            value={item.priceDistribution} 
            onChange={(e) => onPriceChange(index, e.target.value)} 
            onFocus={() => setEditingPrice(index)} 
            onBlur={() => setEditingPrice(null)} 
            onKeyDown={(e) => handleKeyDown(e, index, "price")} 
            className={`price-input w-20 text-center text-sm ${item.isPriceModified ? "text-warning" : ""}`} 
          />
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">小計</div>
          <div className="font-semibold text-primary">${item.totalPrice.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export const SalesProductList = () => {
  // 產品列表從全域 store
  const { products } = useStore();
  
  // 銷售項目從訂單表單 store
  const {
    salesItems,
    updateSalesItem,
    removeSalesItem,
    setSalesItems: clearSalesItems,
    reorderSalesItems,
    getTotalQuantity,
    getTotalAmount,
    selectedCustomer,
  } = useOrderFormStore();
  
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleQuantityChange = (index: number, change: number) => {
    const item = salesItems[index];
    const newQuantity = Math.max(0, item.quantity + change);
    if (newQuantity === 0) { removeSalesItem(index); toast.success("已移除商品"); } else { updateSalesItem(index, { quantity: newQuantity }); }
  };

  const handleQuantityInput = (index: number, value: string) => {
    const quantity = parseInt(value) || 0;
    if (quantity <= 0) { removeSalesItem(index); toast.success("已移除商品"); } else { updateSalesItem(index, { quantity }); }
  };

  const handlePriceChange = (index: number, price: string) => {
    updateSalesItem(index, { priceDistribution: parseFloat(price) || 0, isPriceModified: true });
    setEditingPrice(null);
  };

  const handleModelsChange = (index: number, model: string) => {
    const item = salesItems[index];
    const matchingProduct = products.find(p => p.vendor === item.vendor && p.series === item.series && p.model === model);
    if (matchingProduct) { updateSalesItem(index, { model, remark: matchingProduct.remark, priceDistribution: matchingProduct.priceDistribution, isPriceModified: false ,code: matchingProduct.code}); toast.success("已更新型號與備註");}
  };

  const handleRemarkChange = (index: number, remark: string) => {
    const item = salesItems[index];
    const matchingProduct = products.find(p => p.vendor === item.vendor && p.series === item.series && p.remark === remark);
    if (matchingProduct) { updateSalesItem(index, { remark, priceDistribution: matchingProduct.priceDistribution, isPriceModified: false,code: matchingProduct.code}); toast.success("已更新備註"); }
  };

  const handleCopyItem = (index: number) => { const item = salesItems[index]; updateSalesItem(salesItems.length, { ...item, time: Date.now() }); toast.success(`已複製 ${item.name}`); };
  const handleRemoveItem = (index: number) => { const item = salesItems[index]; removeSalesItem(index); toast.success(`已移除 ${item.name}`); };
  
  const handleKeyDown = (e: React.KeyboardEvent, index: number, type: "quantity" | "price") => {
    if (e.key === "Enter") { e.preventDefault(); const inputs = document.querySelectorAll(`.${type}-input`); const nextInput = inputs[index + 1] as HTMLInputElement; if (nextInput) { nextInput.focus(); nextInput.select(); } else { const firstInput = inputs[0] as HTMLInputElement; if (firstInput) { firstInput.focus(); firstInput.select(); }}}
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = salesItems.findIndex(item => `${item.id}-${item.time}` === active.id);
      const newIndex = salesItems.findIndex(item => `${item.id}-${item.time}` === over.id);
      reorderSalesItems(arrayMove(salesItems, oldIndex, newIndex));
      toast.success("已調整順序");
    }
  };

  if (!selectedCustomer) {
    return <Card className="card-elegant animate-fade-in"><CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-primary"><ShoppingCart className="w-5 h-5" />銷售清單</CardTitle></CardHeader><CardContent className="py-12"><div className="text-center text-muted-foreground space-y-4"><Package className="w-16 h-16 mx-auto mb-4 opacity-50" /><div><p className="text-lg font-medium">請先選擇客戶</p><p className="text-sm mt-2">請至「客戶資訊」區域選擇或輸入客戶資料</p></div></div></CardContent></Card>;
  }

  return (
    <Card className="card-elegant animate-fade-in flex flex-col h-full">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary"><ShoppingCart className="w-5 h-5" />銷售清單{salesItems.length > 0 && <Badge variant="secondary" className="ml-2">{salesItems.length} 項商品</Badge>}</CardTitle>
          {salesItems.length > 0 && <Button variant="outline" size="sm" onClick={clearSalesItems} className="text-error hover:text-error"><Trash2 className="w-4 h-4 mr-1" />清空</Button>}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col pb-20 md:pb-6">
        {salesItems.length === 0 ? <div className="text-center py-12 text-muted-foreground"><ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" /><p className="text-lg">銷售清單為空</p><p className="text-sm">從產品選擇區域添加商品到此清單</p></div> : <div className="flex-1 overflow-auto"><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={salesItems.map(item => `${item.id}-${item.time}`)} strategy={verticalListSortingStrategy}><div className="space-y-3">{salesItems.map((item, index) => <SortableItem key={`${item.id}-${item.time}`} id={`${item.id}-${item.time}`} item={item} index={index} onQuantityChange={handleQuantityChange} onQuantityInput={handleQuantityInput} onPriceChange={handlePriceChange} onCopyItem={handleCopyItem} onRemoveItem={handleRemoveItem} onModelsChange={handleModelsChange} onRemarkChange={handleRemarkChange} editingPrice={editingPrice} editingQuantity={editingQuantity} setEditingPrice={setEditingPrice} setEditingQuantity={setEditingQuantity} handleKeyDown={handleKeyDown} products={products} />)}</div></SortableContext></DndContext></div>}
      </CardContent>
      {salesItems.length > 0 && <div className="fixed md:relative bottom-0 left-0 right-0 bg-background border-t md:border-t-0 p-4 md:p-0 z-30"><div className="bg-gradient-surface rounded-lg p-4"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2 text-muted-foreground"><Calculator className="w-4 h-4" />訂單統計</div></div><div className="grid grid-cols-2 gap-4 text-center"><div><div className="text-2xl font-bold text-primary">{getTotalQuantity()}</div><div className="text-sm text-muted-foreground">商品總數</div></div><div><div className="text-2xl font-bold text-secondary">${getTotalAmount().toLocaleString()}</div><div className="text-sm text-muted-foreground">訂單總額</div></div></div></div></div>}
    </Card>
  );
};