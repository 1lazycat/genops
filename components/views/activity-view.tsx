"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { AuditLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ActivityView() {
  const { auditLogs } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    if (searchQuery && !log.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (actionFilter && log.action !== actionFilter) return false;
    if (userFilter && log.user !== userFilter) return false;
    return true;
  });

  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dateString = format(date, "yyyy-MM-dd");
    const logsForDate = auditLogs.filter(log => format(new Date(log.timestamp), "yyyy-MM-dd") === dateString);
    return {
      date: format(date, "MMM d"),
      create: logsForDate.filter(log => log.action === "create").length,
      update: logsForDate.filter(log => log.action === "update").length,
      delete: logsForDate.filter(log => log.action === "delete").length,
    };
  }).reverse();

  const clearFilters = () => {
    setSearchQuery("");
    setActionFilter(null);
    setUserFilter(null);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Activities</CardTitle>
              <CardDescription>All recorded actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{auditLogs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Created Items</CardTitle>
              <CardDescription>New items added</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {auditLogs.filter(log => log.action === "create").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Updated Items</CardTitle>
              <CardDescription>Modifications made</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {auditLogs.filter(log => log.action === "update").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Deleted Items</CardTitle>
              <CardDescription>Items removed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {auditLogs.filter(log => log.action === "delete").length}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>Last 7 days of activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="create" name="Created" stackId="a" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="update" name="Updated" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="delete" name="Deleted" stackId="a" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>Detailed history of all actions</CardDescription>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by item title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Select value={actionFilter || "all"} onValueChange={(v) => setActionFilter(v !== "all" ? v : null)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="create">Created</SelectItem>
                  <SelectItem value="update">Updated</SelectItem>
                  <SelectItem value="delete">Deleted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userFilter || "all"} onValueChange={(v) => setUserFilter(v !== "all" ? v : null)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="user1">User 1</SelectItem>
                  <SelectItem value="user2">User 2</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <div key={log.id} className="p-4 border rounded-md">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        log.action === "create" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                        log.action === "update" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                        log.action === "delete" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      )}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium capitalize", getActionColor(log.action))}>
                            {log.action}d
                          </span>
                          {log.title ? (
                            <span className="font-medium truncate">{log.title}</span>
                          ) : (
                            <span className="text-muted-foreground italic">Deleted item</span>
                          )}
                        </div>
                        {log.changes.length > 0 && log.action !== "delete" && (
                          <div className="mt-2 text-sm">
                            <div className="font-medium mb-1">Changes:</div>
                            <ul className="space-y-1">
                              {log.changes.map((change, index) => (
                                <li key={index} className="text-muted-foreground">
                                  {change.field !== "item" ? (
                                    <>
                                      Changed <span className="font-medium">{change.field}</span> from {change.oldValue} to {change.newValue}
                                    </>
                                  ) : (
                                    <>Item {log.action}d</>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.user}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(log.timestamp), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(log.timestamp), "h:mm a")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No audit logs match your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getActionIcon(action: string) {
  switch (action) {
    case "create": return <Plus className="h-4 w-4" />;
    case "update": return <Edit className="h-4 w-4" />;
    case "delete": return <Trash2 className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
}

function getActionColor(action: string) {
  switch (action) {
    case "create": return "text-green-600 dark:text-green-400";
    case "update": return "text-blue-600 dark:text-blue-400";
    case "delete": return "text-red-600 dark:text-red-400";
    default: return "";
  }
}