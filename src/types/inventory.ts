import type { ID, ISODate } from './common';

export interface StockLocation {
  location: string;
  qty: number;
}

export interface Item {
  id: ID;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  reorderLevel: number;
  costPrice: number;
  salePrice: number;
  locations: StockLocation[];
}

export type MovementType = 'In' | 'Out' | 'Adjustment' | 'Stocktake';

export interface StockMovement {
  id: ID;
  date: ISODate;
  type: MovementType;
  itemId: ID;
  sku: string;
  itemName: string;
  quantity: number; // signed
  fromLocation?: string;
  toLocation?: string;
  reference?: string;
  user: string;
}
