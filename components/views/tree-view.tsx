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