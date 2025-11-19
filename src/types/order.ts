/*types/order.ts*/
import { Customer } from './customer';

export interface OrderInfo {
  date: string;
  serialNumber: string;
  paperSerialNumber?: string;
  customer?: Customer;
  priceDistribution?: number;
  status?: string;
}

export interface Order {
  id: string;
  orderInfo: OrderInfo;
  customer: Customer;
  items: OrderItem[];
}

export interface OrderItem {
  name: string;
  model: string;
  series:string;
  vender: string;
  code: string;
  quantity: number;
  priceDistribution: number;
  totalPrice: number;
  remark?: string;
  status?: string; // 品項狀態：待處理、已出貨、部分出貨等
  shippedQuantity?: number; // 已出貨數量
}

