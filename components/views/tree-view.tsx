"use client";

import { useState } from "react";
import { useItemStore, ItemType, Item } from '@/store';
import { Sidebar } from "@/components/layout/sidebar";
import { ItemDetail } from "@/components/items/item-detail";
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export function TreeView() {
  const { items, selectedItemId } = useItemStore();

  const renderTree = (items: Item[], parentId: string | null = null) => {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => (
        <TreeNode key={item.id} item={item} moveItem={linkItems} />
      ));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          {selectedItemId ? (
            <ItemDetail itemId={selectedItemId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium">No item selected</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select an item from the sidebar or create a new one.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

function TreeNode({ item, moveItem }: { item: Item; moveItem: (draggedId: string, targetId: string) => void }) {
  const [, ref] = useDrag({
    type: 'ITEM',
    item: { id: item.id },
  });

  const [, drop] = useDrop({
    accept: 'ITEM',
    hover: (draggedItem: { id: string }) => {
      if (draggedItem.id !== item.id) {
        moveItem(draggedItem.id, item.id);
      }
    },
  });

  return (
    <div ref={node => ref(drop(node))} className="p-2 border rounded mb-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">{item.title}</h3>
          <p>{item.description}</p>
        </div>
      </div>
      {item.children && <div className="ml-4 mt-2">{renderTree(item.children, item.id)}</div>}
    </div>
  );
}

// Add linking functionality
export function linkItems(parentId: string, childId: string) {
  const { items, updateItem } = useItemStore.getState();
  const parentItem = items[parentId as keyof typeof items];
  const childItem = items[childId as keyof typeof items];

  if (!parentItem || !childItem) {
    throw new Error("Invalid parent or child item ID");
  }

  // Update parent item to include the child
  const updatedParent = {
    ...parentItem,
    children: [...(parentItem.children || []), childId],
  };

  // Update child item to reference the parent
  const updatedChild = {
    ...childItem,
    parentId: parentId,
  };

  updateItem(parentId, updatedParent);
  updateItem(childId, updatedChild);
}