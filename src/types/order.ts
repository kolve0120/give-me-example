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
  items: any[];
}
