"use client";

import { useState } from "react";
import { useItemStore, ItemType } from '@/store';
import { Item, ItemStatus } from '@/lib/types';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export function ListView() {
  const { items, updateItem } = useItemStore();
  const [filterType, setFilterType] = useState<string>("all");

  const filteredItems = Object.values(items).filter(item => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const moveItem = (draggedId: string, targetStatus: ItemStatus) => {
    updateItem(draggedId, { status: targetStatus });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">List View</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by type:</span>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="epic">Epics</SelectItem>
                <SelectItem value="story">Stories</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="test">Tests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {filteredItems.map(item => (
            <ListItem key={item.id} item={item} moveItem={moveItem} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

function ListItem({ item, moveItem }: { item: Item; moveItem: (draggedId: string, targetStatus: ItemStatus) => void }) {
  const [, ref] = useDrag({
    type: 'ITEM',
    item: { id: item.id },
  });

  const [, drop] = useDrop({
    accept: 'ITEM',
    hover: (draggedItem: { id: string }) => {
      if (draggedItem.id !== item.id) {
        moveItem(draggedItem.id, item.status);
      }
    },
  });

  return (
    <div ref={node => ref(drop(node))} className={cn(
      "p-4 rounded-md text-sm border flex justify-between items-center",
      getTypeColor(item.type)
    )}>
      <div>
        <div className="font-medium truncate">{item.title}</div>
        <div className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</div>
      </div>
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={cn("text-xs", getTypeColor(item.type))}
        >
          {item.type}
        </Badge>
        <Badge 
          variant="outline" 
          className={cn("text-xs", getStatusColor(item.status))}
        >
          {item.status}
        </Badge>
      </div>
    </div>
  );
}

function getTypeColor(type: ItemType) {
  switch (type) {
    case ItemType.Epic: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case ItemType.Story: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case ItemType.Task: return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    case ItemType.Test: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

function getStatusColor(status: ItemStatus) {
  switch (status) {
    case 'backlog': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    case 'todo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'in-progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}
