export interface Product {
  id: number;
  code: string;
  name: string;
  series: string;
  vendor: string;
  remark: string;
  priceDistribution: number;
  priceRetail: number;
  model: string;
  originalPrice?: number;
  state?: '啟用中' | '停用' | '預購中' | '售完停產';
  barcode?: string;
  systemCode?: string;
  tableTitle?: string;
  tableRowTitle?: string;
  tableColTitle?: string;
  isPriceModified?: boolean;
}
