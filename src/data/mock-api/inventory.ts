import type { Item, Paged, StockMovement } from '@/types';
import { db, nextId } from './db';
import { paginate, resolve, sortRows, textMatch, type ListParams } from './transport';

export interface ItemFilters extends ListParams {
  category?: string;
  location?: string;
  stockStatus?: 'In Stock' | 'Low' | 'Out' | '';
}

export interface MovementFilters extends ListParams {
  type?: string;
  location?: string;
}

export const inventoryApi = {
  items(params: ItemFilters = {}): Promise<Paged<Item>> {
    let rows = db.items.filter(
      (it) =>
        textMatch([it.sku, it.name, it.category], params.search) &&
        (!params.category || it.category === params.category) &&
        (!params.location || it.locations.some((l) => l.location === params.location)) &&
        (!params.stockStatus ||
          (params.stockStatus === 'Out' ? it.stock === 0 : params.stockStatus === 'Low' ? it.stock > 0 && it.stock <= it.reorderLevel : it.stock > it.reorderLevel)),
    );
    rows = sortRows(rows, params, { sku: (i) => i.sku, name: (i) => i.name, stock: (i) => i.stock });
    return resolve(paginate(rows, params));
  },

  addItem(data: Partial<Item>): Promise<Item> {
    const item: Item = {
      id: nextId('item'),
      sku: data.sku ?? `SKU-${1000 + db.items.length}`,
      name: data.name ?? 'New Item',
      category: data.category ?? 'Other',
      unit: data.unit ?? 'unit',
      stock: data.stock ?? 0,
      reorderLevel: data.reorderLevel ?? 10,
      costPrice: data.costPrice ?? 0,
      salePrice: data.salePrice ?? 0,
      locations: data.locations ?? [],
    };
    db.items.unshift(item);
    return resolve(item);
  },

  movements(params: MovementFilters = {}): Promise<Paged<StockMovement>> {
    let rows = db.stockMovements.filter(
      (m) =>
        textMatch([m.sku, m.itemName, m.reference], params.search) &&
        (!params.type || m.type === params.type) &&
        (!params.location || m.fromLocation === params.location || m.toLocation === params.location),
    );
    rows = sortRows(rows, params, { date: (m) => m.date, quantity: (m) => m.quantity });
    return resolve(paginate(rows, params));
  },

  addMovement(data: Partial<StockMovement>): Promise<StockMovement> {
    const item = db.items.find((i) => i.id === data.itemId);
    const mov: StockMovement = {
      id: nextId('mov'),
      date: data.date ?? new Date().toISOString().slice(0, 10),
      type: data.type ?? 'In',
      itemId: data.itemId ?? '',
      sku: item?.sku ?? '',
      itemName: item?.name ?? '',
      quantity: data.quantity ?? 0,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      reference: data.reference,
      user: 'Faisal Malik',
    };
    db.stockMovements.unshift(mov);
    if (item) item.stock += mov.quantity;
    return resolve(mov);
  },
};
