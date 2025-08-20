"use client";

import { useState } from "react";
import { useItemStore, ItemType } from '@/store';
import { Item } from '@/lib/types';
import { ItemStatus } from '@/lib/types';
import { ItemCard } from "@/components/items/item-card";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export function KanbanView() {
  const { items, updateItem } = useItemStore();
  const [filterType, setFilterType] = useState<string>("all");

  const statuses: ItemStatus[] = ["backlog", "todo", "in-progress", "review", "done"];

  const filteredItems = Object.values(items).filter(item => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const getItemsByStatus = (status: ItemStatus) => {
    return filteredItems.filter(item => item.status === status);
  };

  const moveItem = (draggedId: string, targetStatus: ItemStatus) => {
    updateItem(draggedId, { status: targetStatus });
  };

  const renderItems = (status: ItemStatus) => {
    return getItemsByStatus(status).map(item => (
      <KanbanItem key={item.id} item={item} moveItem={moveItem} />
    ));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Kanban Board</h2>
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
        <div className="flex h-[calc(100vh-7.5rem)] overflow-x-auto p-4 gap-4">
          {statuses.map(status => (
            <KanbanColumn key={status} status={status} moveItem={moveItem} renderItems={renderItems} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

function KanbanColumn({ status, moveItem, renderItems }: { status: ItemStatus; moveItem: (draggedId: string, targetStatus: ItemStatus) => void; renderItems: (status: ItemStatus) => JSX.Element[] }) {
  const [, drop] = useDrop({
    accept: 'ITEM',
    drop: (draggedItem: { id: string }) => {
      moveItem(draggedItem.id, status);
    },
  });

  return (
    <div ref={drop} className="flex-shrink-0 w-80 flex flex-col h-full">
      <div className="bg-muted/50 rounded-t-lg p-3 font-medium border-b">
        <h3 className="capitalize">{status.replace('-', ' ')}</h3>
        <div className="text-xs text-muted-foreground mt-1">
          {renderItems(status).length} items
        </div>
      </div>
      <div className={cn(
        "flex-1 overflow-y-auto p-2 space-y-3 rounded-b-lg border-l border-r border-b",
        status === "backlog" && "bg-slate-50 dark:bg-slate-950",
        status === "todo" && "bg-blue-50 dark:bg-blue-950",
        status === "in-progress" && "bg-amber-50 dark:bg-amber-950",
        status === "review" && "bg-purple-50 dark:bg-purple-950",
        status === "done" && "bg-green-50 dark:bg-green-950"
      )}>
        {renderItems(status)}
        {renderItems(status).length === 0 && (
          <div className="h-20 flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
            No items
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanItem({ item, moveItem }: { item: Item; moveItem: (draggedId: string, targetStatus: ItemStatus) => void }) {
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
      "p-2 rounded-md text-sm border",
      getTypeColor(item.type)
    )}>
      <div className="font-medium truncate">{item.title}</div>
      <div className="flex items-center gap-1 mt-1">
        <Badge 
          variant="outline" 
          className={cn("text-xs", getTypeColor(item.type))}
        >
          {item.type}
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