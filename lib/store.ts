"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Item, ItemType, ItemStatus, ItemPriority, AuditLog, User } from './types';

interface State {
  items: Record<string, Item>;
  users: Record<string, User>;
  auditLogs: AuditLog[];
  currentUser: string;
  
  // Item operations
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'children'>) => string;
  updateItem: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'children'>>) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, newParentId: string | null) => void;
  
  // Audit operations
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  
  // Export/Import
  exportData: () => string;
  importData: (data: string) => void;
  
  // User operations
  setCurrentUser: (userId: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      items: {},
      users: {
        'user-1': {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      auditLogs: [],
      currentUser: 'user-1',
      
      addItem: (item) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const currentUser = get().currentUser;
        
        const newItem: Item = {
          id,
          ...item,
          children: [],
          createdAt: now,
          updatedAt: now,
          createdBy: currentUser,
        };
        
        set((state) => {
          // Update parent's children array if parent exists
          const updatedItems = { ...state.items, [id]: newItem };
          
          if (item.parentId) {
            const parent = updatedItems[item.parentId];
            if (parent) {
              updatedItems[item.parentId] = {
                ...parent,
                children: [...parent.children, id],
              };
            }
          }
          
          return { items: updatedItems };
        });
        
        // Add audit log
        get().addAuditLog({
          itemId: id,
          userId: currentUser,
          action: 'create',
          changes: [
            {
              field: 'item',
              oldValue: null,
              newValue: newItem,
            },
          ],
        });
        
        return id;
      },
      
      updateItem: (id, updates) => {
        set((state) => {
          const item = state.items[id];
          if (!item) return state;
          
          const now = new Date().toISOString();
          const updatedItem = { ...item, ...updates, updatedAt: now };
          
          // Create audit log entries for changes
          const changes = Object.entries(updates).map(([field, newValue]) => ({
            field,
            oldValue: item[field as keyof Item],
            newValue,
          }));
          
          // Add audit log
          if (changes.length > 0) {
            get().addAuditLog({
              itemId: id,
              userId: state.currentUser,
              action: 'update',
              changes,
            });
          }
          
          return {
            items: {
              ...state.items,
              [id]: updatedItem,
            },
          };
        });
      },
      
      deleteItem: (id) => {
        set((state) => {
          const item = state.items[id];
          if (!item) return state;
          
          // Create a copy of items without the deleted item
          const { [id]: deletedItem, ...remainingItems } = state.items;
          
          // Remove the item from its parent's children array
          if (item.parentId && remainingItems[item.parentId]) {
            remainingItems[item.parentId] = {
              ...remainingItems[item.parentId],
              children: remainingItems[item.parentId].children.filter(
                (childId) => childId !== id
              ),
            };
          }
          
          // Recursively delete all children
          const deleteChildren = (childrenIds: string[]) => {
            childrenIds.forEach((childId) => {
              if (remainingItems[childId]) {
                const childChildren = remainingItems[childId].children;
                delete remainingItems[childId];
                deleteChildren(childChildren);
              }
            });
          };
          
          deleteChildren(item.children);
          
          // Add audit log
          get().addAuditLog({
            itemId: id,
            userId: state.currentUser,
            action: 'delete',
            changes: [
              {
                field: 'item',
                oldValue: item,
                newValue: null,
              },
            ],
          });
          
          return { items: remainingItems };
        });
      },
      
      moveItem: (id, newParentId) => {
        set((state) => {
          const item = state.items[id];
          if (!item) return state;
          
          const oldParentId = item.parentId;
          
          // Don't do anything if the parent hasn't changed
          if (oldParentId === newParentId) return state;
          
          // Create updated items object
          const updatedItems = { ...state.items };
          
          // Remove from old parent's children
          if (oldParentId && updatedItems[oldParentId]) {
            updatedItems[oldParentId] = {
              ...updatedItems[oldParentId],
              children: updatedItems[oldParentId].children.filter(
                (childId) => childId !== id
              ),
            };
          }
          
          // Add to new parent's children
          if (newParentId && updatedItems[newParentId]) {
            updatedItems[newParentId] = {
              ...updatedItems[newParentId],
              children: [...updatedItems[newParentId].children, id],
            };
          }
          
          // Update the item's parentId
          updatedItems[id] = {
            ...updatedItems[id],
            parentId: newParentId,
            updatedAt: new Date().toISOString(),
          };
          
          // Add audit log
          get().addAuditLog({
            itemId: id,
            userId: state.currentUser,
            action: 'update',
            changes: [
              {
                field: 'parentId',
                oldValue: oldParentId,
                newValue: newParentId,
              },
            ],
          });
          
          return { items: updatedItems };
        });
      },
      
      addAuditLog: (log) => {
        const id = uuidv4();
        const timestamp = new Date().toISOString();
        
        set((state) => ({
          auditLogs: [
            ...state.auditLogs,
            {
              id,
              timestamp,
              ...log,
            },
          ],
        }));
      },
      
      exportData: () => {
        const { items, auditLogs } = get();
        return JSON.stringify({ items, auditLogs }, null, 2);
      },
      
      importData: (data) => {
        try {
          const parsedData = JSON.parse(data);
          set({
            items: parsedData.items || {},
            auditLogs: parsedData.auditLogs || [],
          });
        } catch (error) {
          console.error('Failed to import data:', error);
        }
      },
      
      setCurrentUser: (userId) => {
        set({ currentUser: userId });
      },
    }),
    {
      name: 'requirements-store',
    }
  )
);