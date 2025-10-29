import { Product } from './product';

export interface SalesItem extends Product {
  quantity: number;
  totalPrice: number;
  time: number;
}
