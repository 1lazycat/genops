"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { ItemDetail } from "@/components/items/item-detail";

export function TreeView() {
  const { items } = useStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Select the first item by default if none is selected
  if (!selectedItemId && Object.keys(items).length > 0) {
    setSelectedItemId(Object.keys(items)[0]);
  }
  
  return (
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
  );
}

// Add linking functionality
export function linkItems(parentId: string, childId: string) {
  const { items, updateItem } = useStore.getState();
  const parentItem = items[parentId];
  const childItem = items[childId];

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