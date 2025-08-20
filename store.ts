import { create } from 'zustand';

export enum ItemType {
  Epic = 'epic',
  Story = 'story',
  Task = 'task',
  Test = 'test',
}

interface Item {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdDate: Date;
  modifiedDate: Date;
  type: ItemType;
  parentId?: string;
  children?: Item[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignedTo: string;
  customFields: Record<string, any>;
}

interface ItemState {
  items: Item[];
  addItem: (item: Item) => void;
  updateItem: (id: string, updatedItem: Partial<Item>) => void;
  deleteItem: (id: string) => void;
}

export const useItemStore = create<ItemState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updatedItem) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item
      ),
    })),
  deleteItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}));