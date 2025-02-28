"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ItemCard } from "@/components/items/item-card";
import { ItemStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export function KanbanView() {
  const { items, updateItem } = useStore();
  const [filterType, setFilterType] = useState<string>("all");
  
  const statuses: ItemStatus[] = ["backlog", "todo", "in-progress", "review", "done"];
  
  const filteredItems = Object.values(items).filter(item => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });
  
  const getItemsByStatus = (status: ItemStatus) => {
    return filteredItems.filter(item => item.status === status);
  };
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, status: ItemStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    updateItem(id, { status });
  };
  
  return (
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
          <div 
            key={status}
            className="flex-shrink-0 w-80 flex flex-col h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="bg-muted/50 rounded-t-lg p-3 font-medium border-b">
              <h3 className="capitalize">{status.replace('-', ' ')}</h3>
              <div className="text-xs text-muted-foreground mt-1">
                {getItemsByStatus(status).length} items
              </div>
            </div>
            <div 
              className={cn(
                "flex-1 overflow-y-auto p-2 space-y-3 rounded-b-lg border-l border-r border-b",
                status === "backlog" && "bg-slate-50 dark:bg-slate-950",
                status === "todo" && "bg-blue-50 dark:bg-blue-950",
                status === "in-progress" && "bg-amber-50 dark:bg-amber-950",
                status === "review" && "bg-purple-50 dark:bg-purple-950",
                status === "done" && "bg-green-50 dark:bg-green-950"
              )}
            >
              {getItemsByStatus(status).map(item => (
                <div 
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className="cursor-move"
                >
                  <ItemCard item={item} compact />
                </div>
              ))}
              
              {getItemsByStatus(status).length === 0 && (
                <div className="h-20 flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}