import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const ProductForm = () => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    vender: "",
    series: "",
    model: "",
    remark: "",
    priceDistribution: "",
    priceRetail: "",
    state: "啟用中" as "啟用中" | "停用" | "預購中" | "售完停產",
    barcode: "",
    systemCode: "",
    tableTitle: "",
    tableRowTitle: "",
    tableColTitle: "",
  });

  const [tableEntries, setTableEntries] = useState<Array<{
    title: string;
    vender: string;
    remark: string;
  }>>([{ title: "", vender: "", remark: "" }]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTableEntry = () => {
    setTableEntries(prev => [...prev, { title: "", vender: "", remark: "" }]);
  };

  const removeTableEntry = (index: number) => {
    setTableEntries(prev => prev.filter((_, i) => i !== index));
  };

  const updateTableEntry = (index: number, field: string, value: string) => {
    setTableEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const handleSubmit = () => {
    // 驗證必填欄位
    if (!formData.code || !formData.name || !formData.vender) {
      toast.error("請填寫產品代碼、名稱和廠商");
      return;
    }

    // 暫存到 localStorage
    const productData = {
      ...formData,
      tableEntries,
      timestamp: new Date().toISOString(),
    };
    
    const savedProducts = JSON.parse(localStorage.getItem('pendingProducts') || '[]');
    savedProducts.push(productData);
    localStorage.setItem('pendingProducts', JSON.stringify(savedProducts));
    
    toast.success("產品已暫存至本地");
    
    // 清空表單
    setFormData({
      code: "",
      name: "",
      vender: "",
      series: "",
      model: "",
      remark: "",
      priceDistribution: "",
      priceRetail: "",
      state: "啟用中",
      barcode: "",
      systemCode: "",
      tableTitle: "",
      tableRowTitle: "",
      tableColTitle: "",
    });
    setTableEntries([{ title: "", vender: "", remark: "" }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <h2 className="text-2xl font-bold">新增/編輯產品</h2>
        </div>
        <Button onClick={handleSubmit}>
          <Save className="w-4 h-4 mr-2" />
          儲存到本地
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>產品代碼 *</Label>
              <Input 
                placeholder="輸入產品代碼" 
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>產品名稱 *</Label>
              <Input 
                placeholder="輸入產品名稱" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>廠商 *</Label>
              <Input 
                placeholder="輸入廠商名稱" 
                value={formData.vender}
                onChange={(e) => handleInputChange('vender', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>系列</Label>
              <Input 
                placeholder="輸入系列名稱" 
                value={formData.series}
                onChange={(e) => handleInputChange('series', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>型號</Label>
              <Input 
                placeholder="輸入型號" 
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>備註/顏色</Label>
              <Input 
                placeholder="輸入備註或顏色" 
                value={formData.remark}
                onChange={(e) => handleInputChange('remark', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>經銷價</Label>
              <Input 
                type="number" 
                placeholder="0" 
                value={formData.priceDistribution}
                onChange={(e) => handleInputChange('priceDistribution', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>零售價</Label>
              <Input 
                type="number" 
                placeholder="0" 
                value={formData.priceRetail}
                onChange={(e) => handleInputChange('priceRetail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>狀態</Label>
              <Select value={formData.state} onValueChange={(value: any) => handleInputChange('state', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="啟用中">啟用中</SelectItem>
                  <SelectItem value="停用">停用</SelectItem>
                  <SelectItem value="預購中">預購中</SelectItem>
                  <SelectItem value="售完停產">售完停產</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>條碼</Label>
              <Input 
                placeholder="輸入條碼" 
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>系統代碼</Label>
              <Input 
                placeholder="輸入系統代碼" 
                value={formData.systemCode}
                onChange={(e) => handleInputChange('systemCode', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>表格定位資訊</CardTitle>
            <Button onClick={addTableEntry} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              新增表格項目
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>表格標題</Label>
              <Input 
                placeholder="輸入表格標題" 
                value={formData.tableTitle}
                onChange={(e) => handleInputChange('tableTitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>列標題</Label>
              <Input 
                placeholder="輸入列標題" 
                value={formData.tableRowTitle}
                onChange={(e) => handleInputChange('tableRowTitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>欄標題</Label>
              <Input 
                placeholder="輸入欄標題" 
                value={formData.tableColTitle}
                onChange={(e) => handleInputChange('tableColTitle', e.target.value)}
              />
            </div>
          </div>

          {/* 多個表格項目 */}
          {tableEntries.map((entry, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">表格項目 #{index + 1}</h4>
                {tableEntries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTableEntry(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>標題</Label>
                  <Input
                    placeholder="輸入標題"
                    value={entry.title}
                    onChange={(e) => updateTableEntry(index, 'title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>廠商</Label>
                  <Input
                    placeholder="輸入廠商"
                    value={entry.vender}
                    onChange={(e) => updateTableEntry(index, 'vender', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>備註</Label>
                  <Input
                    placeholder="輸入備註"
                    value={entry.remark}
                    onChange={(e) => updateTableEntry(index, 'remark', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
