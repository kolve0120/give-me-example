# Stores 架構說明

## 概述
本專案使用 Zustand 進行狀態管理，並採用分離式架構以避免不同頁面間的狀態污染。

## Store 架構

### 1. 全域 Store (`useStore`)
位置：`src/hooks/useStore.ts`

職責：
- 管理全域數據（客戶列表、產品列表）
- 管理 UI 狀態（modal、sidebar 等）
- 提供 API 調用方法

包含的 Slices：
- `CustomerSlice`: 客戶列表管理
- `ProductSlice`: 產品列表管理  
- `OrderSlice`: 訂單列表管理（從 API 載入）
- `UISlice`: UI 狀態管理

### 2. 訂單表單 Store (`useOrderFormStore`)
位置：`src/stores/orderFormStore.ts`

職責：
- 管理新增訂單頁面的表單狀態
- 獨立的客戶選擇、銷售項目、訂單資訊
- 與其他頁面完全隔離

使用場景：
- `src/pages/Index.tsx` - 新增訂單頁面
- 所有新增訂單相關的組件

### 3. 訂單編輯 Store (`useOrderEditStore`)
位置：`src/stores/orderEditStore.ts`

職責：
- 管理訂單編輯頁面的狀態
- 載入現有訂單進行編輯
- 與新增訂單完全隔離

使用場景：
- `src/pages/orders/OrderList.tsx` - 當載入訂單進行編輯時
- 訂單編輯相關的組件

## 使用指南

### 新增訂單頁面組件
```tsx
import { useStore } from '@/hooks/useStore';
import { useOrderFormStore } from '@/stores/orderFormStore';

function MyComponent() {
  // 全域數據
  const { customers, products } = useStore();
  
  // 訂單表單狀態
  const { selectedCustomer, salesItems, addSalesItem } = useOrderFormStore();
  
  // ...
}
```

### 訂單編輯頁面組件
```tsx
import { useStore } from '@/hooks/useStore';
import { useOrderEditStore } from '@/stores/orderEditStore';

function EditComponent() {
  // 訂單列表
  const { orders } = useStore();
  
  // 編輯狀態
  const { loadOrder, salesItems, updateSalesItem } = useOrderEditStore();
  
  const handleEdit = (order) => {
    loadOrder(order); // 載入訂單到編輯 store
  };
  
  // ...
}
```

## 資料流

```
全域 Store (useStore)
├── 客戶列表 (所有頁面共用)
├── 產品列表 (所有頁面共用)
├── 訂單列表 (從 API 載入)
└── UI 狀態 (modal, sidebar 等)

訂單表單 Store (useOrderFormStore)
├── 選擇的客戶
├── 銷售項目
├── 訂單資訊
└── 計算方法

訂單編輯 Store (useOrderEditStore)
├── 編輯中的訂單
├── 選擇的客戶
├── 銷售項目
├── 訂單資訊
└── 計算方法
```

## 好處

1. **狀態隔離**：新增訂單和編輯訂單不會互相干擾
2. **清晰的職責**：每個 store 有明確的用途
3. **易於測試**：獨立的 store 更容易進行單元測試
4. **更好的性能**：只有相關組件會在狀態變化時重新渲染
5. **避免 bug**：清除、送出等操作只影響對應的 store

## 遷移指南

如果需要將組件從舊的 useStore 遷移到新架構：

1. 確定組件屬於哪個頁面（新增訂單 or 編輯訂單）
2. 導入對應的 store
3. 分離全域數據和頁面特定數據的調用
4. 更新清除、送出等操作的邏輯

範例：
```tsx
// 舊代碼
import { useStore } from '@/hooks/useStore';
const { customers, selectedCustomer, salesItems } = useStore();

// 新代碼（新增訂單頁面）
import { useStore } from '@/hooks/useStore';
import { useOrderFormStore } from '@/stores/orderFormStore';
const { customers } = useStore(); // 全域數據
const { selectedCustomer, salesItems } = useOrderFormStore(); // 表單數據
```
