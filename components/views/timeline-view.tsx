"use client";

import { useState } from "react";
import { useItemStore, ItemType } from '@/store';
import { Item, ItemStatus } from '@/lib/types';
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

export function TimelineView() {
  const { items, updateItem } = useItemStore();
  const [filterType, setFilterType] = useState<string>("all");
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const weekEnd = endOfWeek(weekStart);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const filteredItems = Object.values(items).filter(item => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const itemsByStatus = filteredItems.reduce((acc, item) => {
    if (!acc[item.status]) acc[item.status] = [];
    acc[item.status].push(item);
    return acc;
  }, {} as Record<ItemStatus, Item[]>);

  const moveItem = (draggedId: string, targetStatus: ItemStatus) => {
    updateItem(draggedId, { status: targetStatus });
  };

  const handlePreviousWeek = () => {
    setWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(prev => addDays(prev, 7));
  };

  const handleToday = () => {
    setWeekStart(startOfWeek(new Date()));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold ml-2">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </h2>
          </div>
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
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-[200px_1fr] h-full">
            {/* Status column */}
            <div className="border-r">
              <div className="h-12 border-b bg-muted/50"></div>
              {Object.entries(itemsByStatus).map(([status, statusItems]) => (
                <div 
                  key={status}
                  className="p-3 border-b font-medium flex items-center justify-between"
                >
                  <div className="capitalize">{status.replace('-', ' ')}</div>
                  <Badge variant="outline">{statusItems.length}</Badge>
                </div>
              ))}
            </div>
            {/* Timeline grid */}
            <div className="overflow-x-auto">
              {/* Days header */}
              <div className="grid grid-cols-7 h-12 border-b bg-muted/50">
                {daysInWeek.map((day, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex flex-col items-center justify-center border-r text-sm",
                      format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && 
                        "bg-primary/10"
                    )}
                  >
                    <div className="font-medium">{format(day, "EEE")}</div>
                    <div className="text-muted-foreground">{format(day, "d")}</div>
                  </div>
                ))}
              </div>
              {/* Status rows */}
              {Object.entries(itemsByStatus).map(([status, statusItems]) => (
                <div 
                  key={status}
                  className="grid grid-cols-7 border-b"
                >
                  {daysInWeek.map((day, dayIndex) => (
                    <div 
                      key={dayIndex}
                      className={cn(
                        "min-h-[100px] border-r p-2",
                        format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && 
                          "bg-primary/5"
                      )}
                    >
                      <div className="space-y-2">
                        {statusItems.map(item => (
                          <TimelineItem key={item.id} item={item} moveItem={moveItem} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

function TimelineItem({ item, moveItem }: { item: Item; moveItem: (draggedId: string, targetStatus: ItemStatus) => void }) {
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