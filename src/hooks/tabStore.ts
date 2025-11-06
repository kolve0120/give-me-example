// @/hooks/productStore.ts
import { StateCreator } from 'zustand';
import { fetchProducts } from '@/services/googleSheetsApi';
import { Product } from '@/types';
