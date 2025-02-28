"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Item } from "@/lib/types";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { aiService } from "@/lib/ai-service";

const validChildTypes: Record<string, string[]> = {
  epic: ["story"],
  story: ["task", "test"],
  task: ["test"],
  test: [],
};

export function Sidebar() {
  const { items, addItem, deleteItem } = useStore();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<string>("story");
  const [aiGenerateDialogOpen, setAiGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const validChildTypes: Record<string, string[]> = {
    epic: ["story"],
    story: ["task", "test"],
    task: ["test"],
    test: [],
  };

  // Get root items (items with no parent)
  const rootItems = Object.values(items).filter((item) => !item.parentId);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCreateItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const priority = formData.get("priority") as string;
    const parentId = formData.get("parentId") as string;

    if (!title || !description) {
      toast.error("Title and description are required");
      return;
    }

    addItem({
      type: selectedItemType as any,
      title,
      description,
      status: status as any,
      priority: priority as any,
      parentId,
      assignedTo: null,
      customFields: {},
    });

    setNewItemDialogOpen(false);
    toast.success(`${selectedItemType} created successfully`);
  };

  const handleAIGenerate = async () => {
    if (!selectedParentId) return;

    const parentItem = items[selectedParentId];
    if (!parentItem) return;

    setIsGenerating(true);

    try {
      const generatedItems = await aiService.generateChildren(
        parentItem,
        selectedItemType as any
      );

      if (generatedItems.length === 0) {
        toast.error(
          `Could not generate ${selectedItemType} items for this ${parentItem.type}`
        );
        return;
      }

      // Add each generated item
      generatedItems.forEach((item) => {
        addItem({
          ...item,
          type: item.type as any,
          title: item.title || "",
          description: item.description || "",
          status: (item.status as any) || "backlog",
          priority: (item.priority as any) || "medium",
          parentId: selectedParentId,
          assignedTo: null,
          customFields: item.customFields || {},
        });
      });

      toast.success(
        `Generated ${generatedItems.length} ${selectedItemType} items`
      );
      setAiGenerateDialogOpen(false);

      // Auto-expand the parent to show new items
      setExpandedItems((prev) => ({
        ...prev,
        [selectedParentId]: true,
      }));
    } catch (error) {
      toast.error("Failed to generate items");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderItem = (item: Item, depth = 0) => {
    const hasChildren = item.children.length > 0;
    const isExpanded = expandedItems[item.id] || false;

    // Determine which child types are valid for this item type

    const childTypes = validChildTypes[item.type] || [];

    return (
      <div key={item.id} className="w-full">
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-muted/50 rounded-md cursor-pointer",
            depth > 0 && "ml-4"
          )}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 mr-1"
              onClick={() => toggleExpand(item.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          <div
            className="flex-1 flex items-center text-sm truncate"
            onClick={() => toggleExpand(item.id)}
          >
            <span
              className={cn(
                "mr-2 px-1.5 py-0.5 text-xs rounded-md",
                item.type === "epic" &&
                  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                item.type === "story" &&
                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                item.type === "task" &&
                  "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
                item.type === "test" &&
                  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              )}
            >
              {item.type.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">{item.title}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {childTypes.length > 0 && (
                <>
                  {childTypes.map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => {
                        setSelectedParentId(item.id);
                        setSelectedItemType(type);
                        setNewItemDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedParentId(item.id);
                      setSelectedItemType(childTypes[0]);
                      setAiGenerateDialogOpen(true);
                    }}
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    Generate with AI
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (
                    confirm(
                      `Are you sure you want to delete "${item.title}"? This will also delete all child items.`
                    )
                  ) {
                    deleteItem(item.id);
                    toast.success("Item deleted");
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isExpanded && hasChildren && (
          <div className="pl-2">
            {item.children.map((childId) => {
              const childItem = items[childId];
              if (!childItem) return null;
              return renderItem(childItem, depth + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-xs border-r h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Requirements</h2>
      </div>

      <div className="space-y-1">
        {rootItems.map((item) => renderItem(item))}

        {rootItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No requirements yet</p>
            <p className="text-sm mt-2">Create an Epic to get started</p>
          </div>
        )}
      </div>

      {/* New Item Dialog */}
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New{" "}
              {selectedItemType.charAt(0).toUpperCase() +
                selectedItemType.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateItem} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Enter title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="backlog">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent</Label>
              <Select name="parentId" defaultValue={selectedParentId || ""}>
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {Object.values(items).map((parentItem) => (
                    <SelectItem key={parentItem.id} value={parentItem.id}>
                      {parentItem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Create{" "}
              {selectedItemType.charAt(0).toUpperCase() +
                selectedItemType.slice(1)}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Generate Dialog */}
      <Dialog
        open={aiGenerateDialogOpen}
        onOpenChange={setAiGenerateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Generate{" "}
              {selectedItemType.charAt(0).toUpperCase() +
                selectedItemType.slice(1)}{" "}
              Items with AI
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              AI will analyze the parent item and generate appropriate{" "}
              {selectedItemType} items based on its description.
            </p>

            <div className="space-y-2">
              <Label>Item Type</Label>
              <Select
                value={selectedItemType}
                onValueChange={setSelectedItemType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedParentId &&
                    items[selectedParentId] &&
                    (
                      validChildTypes[items[selectedParentId].type as string] ||
                      []
                    ).map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAIGenerate}
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Items"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
