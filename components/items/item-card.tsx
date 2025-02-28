"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Bot, MoreHorizontal, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { aiService } from "@/lib/ai-service";
import { format } from "date-fns";

interface ItemCardProps {
  item: Item;
  compact?: boolean;
}

export function ItemCard({ item, compact = false }: ItemCardProps) {
  const { updateItem, deleteItem } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title);
  const [editedDescription, setEditedDescription] = useState(item.description);
  const [editedStatus, setEditedStatus] = useState(item.status);
  const [editedPriority, setEditedPriority] = useState(item.priority);
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  
  const handleSave = () => {
    updateItem(item.id, {
      title: editedTitle,
      description: editedDescription,
      status: editedStatus,
      priority: editedPriority,
    });
    setIsEditing(false);
    toast.success("Item updated");
  };
  
  const handleCancel = () => {
    setEditedTitle(item.title);
    setEditedDescription(item.description);
    setEditedStatus(item.status);
    setEditedPriority(item.priority);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${item.title}"? This will also delete all child items.`)) {
      deleteItem(item.id);
      toast.success("Item deleted");
    }
  };
  
  const handleAiSuggest = async (field: 'title' | 'description') => {
    setIsAiLoading(field);
    try {
      const suggestion = await aiService.suggestFieldImprovement(item, field);
      
      if (field === 'title') {
        setEditedTitle(suggestion);
      } else if (field === 'description') {
        setEditedDescription(suggestion);
      }
      
      toast.success(`AI suggestion applied to ${field}`);
    } catch (error) {
      toast.error(`Failed to get AI suggestion for ${field}`);
    } finally {
      setIsAiLoading(null);
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
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'high': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
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
  
  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <Badge className={cn("font-normal", getTypeColor(item.type))}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-base mt-2">{item.title}</CardTitle>
        </CardHeader>
        <CardFooter className="p-3 pt-0 flex justify-between">
          <Badge variant="outline" className={cn(getStatusColor(item.status))}>
            {item.status.replace('-', ' ')}
          </Badge>
          <Badge variant="outline" className={cn(getPriorityColor(item.priority))}>
            {item.priority}
          </Badge>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className={cn("font-normal", getTypeColor(item.type))}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Badge>
          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                disabled={isAiLoading === 'title'}
                onClick={() => handleAiSuggest('title')}
                className="shrink-0"
              >
                {isAiLoading === 'title' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <CardTitle>{item.title}</CardTitle>
        )}
        
        <div className="flex flex-wrap gap-2 mt-2">
          {isEditing ? (
            <>
              <Select
                value={editedStatus}
                onValueChange={setEditedStatus}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={editedPriority}
                onValueChange={setEditedPriority}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Badge variant="outline" className={cn(getStatusColor(item.status))}>
                {item.status.replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className={cn(getPriorityColor(item.priority))}>
                {item.priority}
              </Badge>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isEditing ? (
          <div className="flex gap-2">
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows={4}
              className="flex-1"
            />
            <Button
              size="icon"
              variant="outline"
              disabled={isAiLoading === 'description'}
              onClick={() => handleAiSuggest('description')}
              className="shrink-0"
            >
              {isAiLoading === 'description' ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <CardDescription className="whitespace-pre-line">
            {item.description}
          </CardDescription>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {isEditing ? (
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Check className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Updated {format(new Date(item.updatedAt), 'MMM d, yyyy')}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}