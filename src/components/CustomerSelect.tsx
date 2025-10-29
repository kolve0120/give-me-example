import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore, Customer } from "@/hooks/useStore";
import { User, Calendar, FileText, Store } from "lucide-react";
import { toast } from "sonner";

export const CustomerSelect = () => {
  const {
    customers,
    selectedCustomer,
    setSelectedCustomer,
    orderInfo,
    updateOrderInfo,
    isLoadingCustomers,
  } = useStore();

  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [customerForm, setCustomerForm] = useState<Customer>({
    name: "",
    code: "",
    storeName: "",
    chainStoreName: "",
  });
  const [suggestions, setSuggestions] = useState<{
    name: string[];
    code: string[];
    storeName: string[];
    chainStoreName: string[];
  }>({
    name: [],
    code: [],
    storeName: [],
    chainStoreName: [],
  });
  const [activeField, setActiveField] = useState("");

  // 當選擇的客戶改變時，更新表單
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerForm({
        name: selectedCustomer.name,
        code: selectedCustomer.code,
        storeName: selectedCustomer.storeName || "",
        chainStoreName: selectedCustomer.chainStoreName || "",
      });
      setShowStoreDetails(Boolean(selectedCustomer.storeName || selectedCustomer.chainStoreName));
    } else {
      // 當 selectedCustomer 被清除時，同步重置本地表單狀態
      setCustomerForm({
        name: "",
        code: "",
        storeName: "",
        chainStoreName: "",
      });
      setShowStoreDetails(false);
    }
  }, [selectedCustomer]);

  // 生成流水號
  const generateSerialNumber = (customer?: Customer) => {
    const targetCustomer = customer || selectedCustomer;
    if (!targetCustomer || !orderInfo.date) return;

    const dateStr = orderInfo.date.slice(2, 4) + orderInfo.date.slice(5, 7)//orderInfo.date.replace(/-/g, "");
    const customerCode = targetCustomer.code.padStart(3, "0");
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const serialNumber = `SL${customerCode}${dateStr}${randomNum}`;
    
    updateOrderInfo({ serialNumber });
  };

  // 顯示建議
  const showSuggestions = (field: keyof typeof suggestions) => {
    setActiveField(field);
    
    switch (field) {
      case 'name':
        setSuggestions(prev => ({
          ...prev,
          name: customers.map(c => c.name),
        }));
        break;
      case 'code':
        setSuggestions(prev => ({
          ...prev,
          code: customers.map(c => c.code),
        }));
        break;
      case 'storeName':
        const storeNames = customerForm.chainStoreName
          ? customers
              .filter(c => c.chainStoreName === customerForm.chainStoreName)
              .map(c => c.storeName || "")
          : [...new Set(customers.map(c => c.storeName || ""))];
        setSuggestions(prev => ({
          ...prev,
          storeName: storeNames.filter(Boolean),
        }));
        break;
      case 'chainStoreName':
        setSuggestions(prev => ({
          ...prev,
          chainStoreName: [...new Set(customers.map(c => c.chainStoreName || ""))].filter(Boolean),
        }));
        break;
    }
  };

  // 篩選建議
  const filterSuggestions = (field: keyof typeof suggestions, value: string) => {
    const lowerValue = value.toLowerCase();
    
    switch (field) {
      case 'name':
        setSuggestions(prev => ({
          ...prev,
          name: customers
            .map(c => c.name)
            .filter(name => name.toLowerCase().includes(lowerValue)),
        }));
        break;
      case 'code':
        setSuggestions(prev => ({
          ...prev,
          code: customers
            .map(c => c.code)
            .filter(code => code.toLowerCase().includes(lowerValue)),
        }));
        break;
      case 'storeName':
        const filteredStoreNames = customerForm.chainStoreName
          ? customers
              .filter(c => c.chainStoreName === customerForm.chainStoreName)
              .map(c => c.storeName || "")
          : [...new Set(customers.map(c => c.storeName || ""))];
        setSuggestions(prev => ({
          ...prev,
          storeName: filteredStoreNames
            .filter(Boolean)
            .filter(name => name.toLowerCase().includes(lowerValue)),
        }));
        break;
      case 'chainStoreName':
        setSuggestions(prev => ({
          ...prev,
          chainStoreName: [...new Set(customers.map(c => c.chainStoreName || ""))]
            .filter(Boolean)
            .filter(name => name.toLowerCase().includes(lowerValue)),
        }));
        break;
    }
  };

  // 選擇建議
  const selectSuggestion = (field: keyof typeof suggestions, value: string) => {
    setCustomerForm(prev => ({ ...prev, [field]: value }));
    
    if (field === 'name' || field === 'code') {
      const customer = customers.find(c => 
        c[field] === value
      );
      if (customer) {
        selectCustomer(customer);
      }
    } else if (field === 'storeName' || field === 'chainStoreName') {
      updateCustomerNameAndCode();
    }
    
    setSuggestions(prev => ({ ...prev, [field]: [] }));
    setActiveField("");
  };

  // 更新客戶名稱和編號
  const updateCustomerNameAndCode = () => {
    const customer = customers.find(c =>
      c.storeName === customerForm.storeName && 
      c.chainStoreName === customerForm.chainStoreName
    );
    
    if (customer) {
      selectCustomer(customer);
    } else {
      setCustomerForm(prev => ({ ...prev, name: "", code: "" }));
    }
  };

  // 選擇客戶
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerForm(customer);
    generateSerialNumber(customer);
    toast.success(`已選擇客戶: ${customer.name}`);
  };

  // 處理表單輸入
  const handleInputChange = (field: keyof Customer, value: string) => {
    setCustomerForm(prev => ({ ...prev, [field]: value }));
    
    if (field === 'name' || field === 'code') {
      filterSuggestions(field, value);
    } else if (field === 'storeName' || field === 'chainStoreName') {
      filterSuggestions(field, value);
    }
  };

  return (
    <Card className="card-elegant animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <User className="w-5 h-5" />
          客戶資訊
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoadingCustomers && (
          <div className="text-center py-4 text-muted-foreground">
            載入客戶資料中...
          </div>
        )}
        
        {/* 日期和流水號 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              日期
            </Label>
            <Input
              id="date"
              type="date"
              value={orderInfo.date}
              onChange={(e) => {
                updateOrderInfo({ date: e.target.value });
                generateSerialNumber();
              }}
              className="input-elegant"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="serialNumber" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              流水號
            </Label>
            <Input
              id="serialNumber"
              value={orderInfo.serialNumber}
              onChange={(e) => updateOrderInfo({ serialNumber: e.target.value })}
              placeholder="自動生成或手動輸入"
              className="input-elegant"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paperSerialNumber">紙本流水號</Label>
            <Input
              id="paperSerialNumber"
              value={orderInfo.paperSerialNumber || ""}
              onChange={(e) => updateOrderInfo({ paperSerialNumber: e.target.value })}
              placeholder="紙本流水號"
              className="input-elegant"
            />
          </div>
        </div>

        {/* 客戶名稱和編號 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <Label htmlFor="customerName">客戶名稱</Label>
            <Input
              id="customerName"
              value={customerForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onFocus={() => showSuggestions('name')}
              placeholder="輸入客戶名稱"
              className="input-elegant"
            />
            {suggestions.name.length > 0 && activeField === 'name' && (
              <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-md z-50 max-h-40 overflow-auto animate-slide-up">
                {suggestions.name.map((name, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                    onClick={() => selectSuggestion('name', name)}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2 relative">
            <Label htmlFor="customerCode">客戶編號</Label>
            <Input
              id="customerCode"
              value={customerForm.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              onFocus={() => showSuggestions('code')}
              placeholder="輸入客戶編號"
              className="input-elegant"
            />
            {suggestions.code.length > 0 && activeField === 'code' && (
              <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-md z-50 max-h-40 overflow-auto animate-slide-up">
                {suggestions.code.map((code, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                    onClick={() => selectSuggestion('code', code)}
                  >
                    {code}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 店家詳細資訊開關 */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showStoreDetails"
            checked={showStoreDetails}
            onCheckedChange={(checked) => setShowStoreDetails(Boolean(checked))}
          />
          <Label htmlFor="showStoreDetails" className="flex items-center gap-2 cursor-pointer">
            <Store className="w-4 h-4" />
            顯示店家詳細資訊
          </Label>
        </div>

        {/* 店家詳細資訊 */}
        {showStoreDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
            <div className="space-y-2 relative">
              <Label htmlFor="chainStoreName">連鎖店名</Label>
              <Input
                id="chainStoreName"
                value={customerForm.chainStoreName || ""}
                onChange={(e) => handleInputChange('chainStoreName', e.target.value)}
                onFocus={() => showSuggestions('chainStoreName')}
                placeholder="輸入連鎖店名"
                className="input-elegant"
              />
              {suggestions.chainStoreName.length > 0 && activeField === 'chainStoreName' && (
                <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-md z-50 max-h-40 overflow-auto animate-slide-up">
                  {suggestions.chainStoreName.map((name, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                      onClick={() => selectSuggestion('chainStoreName', name)}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2 relative">
              <Label htmlFor="storeName">店家名稱</Label>
              <Input
                id="storeName"
                value={customerForm.storeName || ""}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                onFocus={() => showSuggestions('storeName')}
                placeholder="輸入店家名稱"
                className="input-elegant"
              />
              {suggestions.storeName.length > 0 && activeField === 'storeName' && (
                <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-md z-50 max-h-40 overflow-auto animate-slide-up">
                  {suggestions.storeName.map((name, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                      onClick={() => selectSuggestion('storeName', name)}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 選中的客戶資訊 
        {selectedCustomer && (
          <div className="mt-4 p-4 bg-accent/20 rounded-lg animate-fade-in">
            <h4 className="font-medium text-primary mb-2">當前選擇的客戶</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>客戶名稱: <span className="font-medium">{selectedCustomer.name}</span></div>
              <div>客戶編號: <span className="font-medium">{selectedCustomer.code}</span></div>
              {selectedCustomer.chainStoreName && (
                <div>連鎖店名: <span className="font-medium">{selectedCustomer.chainStoreName}</span></div>
              )}
              {selectedCustomer.storeName && (
                <div>店家名稱: <span className="font-medium">{selectedCustomer.storeName}</span></div>
              )}
            </div>
          </div>
        )}
        */}
      </CardContent>
    </Card>
  );
};