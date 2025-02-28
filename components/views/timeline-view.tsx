"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Item } from "@/lib/types";
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

export function TimelineView() {
  const { items } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>("all");
  
  // Get start and end of the current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Get all days in the current week
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Filter items based on type
  const filteredItems = Object.values(items).filter(item => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });
  
  // Group items by status
  const itemsByStatus: Record<string, Item[]> = {
    backlog: [],
    todo: [],
    "in-progress": [],
    review: [],
    done: [],
  };
  
  filteredItems.forEach(item => {
    if (itemsByStatus[item.status]) {
      itemsByStatus[item.status].push(item);
    }
  });
  
  const handlePreviousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };
  
  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'epic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'story': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'task': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'test': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'todo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in-progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  return (
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
                        <div 
                          key={item.id}
                          className={cn(
                            "p-2 rounded-md text-sm border",
                            getTypeColor(item.type)
                          )}
                        >
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
  );
}