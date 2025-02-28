"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu, X, FileText, LayoutDashboard, 
  List, Calendar, Settings, HelpCircle, 
  PlusCircle, Download, Upload, Activity, Rocket
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  
  const { exportData, importData: importStoreData, addItem } = useStore();
  
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `requirements-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };
  
  const handleImport = () => {
    try {
      importStoreData(importData);
      setImportDialogOpen(false);
      setImportData("");
      toast.success("Data imported successfully");
    } catch (error) {
      toast.error("Failed to import data. Please check the format.");
    }
  };
  
  const handleCreateItem = (type: string, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const priority = formData.get("priority") as string;
    
    if (!title || !description) {
      toast.error("Title and description are required");
      return;
    }
    
    addItem({
      type: type as any,
      title,
      description,
      status: status as any,
      priority: priority as any,
      parentId: null,
      assignedTo: null,
      customFields: {},
    });
    
    setNewItemDialogOpen(false);
    toast.success(`${type} created successfully`);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Rocket className="h-6 w-6 stroke-orange-200" />
            <span className="hidden font-bold sm:inline-block">
              GenOps
            </span>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/tree"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <FileText className="h-4 w-4" />
              Tree View
            </Link>
            <Link
              href="/board"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <List className="h-4 w-4" />
              Kanban Board
            </Link>
            <Link
              href="/timeline"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Calendar className="h-4 w-4" />
              Timeline
            </Link>
            <Link
              href="/activity"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Activity className="h-4 w-4" />
              Activity
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  New Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Item</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="epic">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="epic">Epic</TabsTrigger>
                    <TabsTrigger value="story">Story</TabsTrigger>
                    <TabsTrigger value="task">Task</TabsTrigger>
                    <TabsTrigger value="test">Test</TabsTrigger>
                  </TabsList>
                  {["epic", "story", "task", "test"].map((type) => (
                    <TabsContent key={type} value={type}>
                      <form onSubmit={(e) => handleCreateItem(type, e)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${type}-title`}>Title</Label>
                          <Input id={`${type}-title`} name="title" placeholder="Enter title" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${type}-description`}>Description</Label>
                          <Textarea
                            id={`${type}-description`}
                            name="description"
                            placeholder="Enter description"
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${type}-status`}>Status</Label>
                            <Select name="status" defaultValue="backlog">
                              <SelectTrigger id={`${type}-status`}>
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
                            <Label htmlFor={`${type}-priority`}>Priority</Label>
                            <Select name="priority" defaultValue="medium">
                              <SelectTrigger id={`${type}-priority`}>
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
                        <Button type="submit" className="w-full">
                          Create {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      </form>
                    </TabsContent>
                  ))}
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </DropdownMenuItem>
                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Data</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="import-data">Paste JSON Data</Label>
                        <Textarea
                          id="import-data"
                          value={importData}
                          onChange={(e) => setImportData(e.target.value)}
                          placeholder="Paste exported JSON data here"
                          rows={10}
                        />
                      </div>
                      <Button onClick={handleImport} className="w-full">
                        Import
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Documentation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <ModeToggle />
          </div>
        </nav>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-14 z-50 w-full bg-background md:hidden">
            <nav className="container grid gap-6 p-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/tree"
                className="flex items-center gap-2 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText className="h-5 w-5" />
                Tree View
              </Link>
              <Link
                href="/board"
                className="flex items-center gap-2 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <List className="h-5 w-5" />
                Kanban Board
              </Link>
              <Link
                href="/timeline"
                className="flex items-center gap-2 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                Timeline
              </Link>
              <Link
                href="/activity"
                className="flex items-center gap-2 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Activity className="h-5 w-5" />
                Activity
              </Link>
              <div className="flex flex-col gap-4 pt-4">
                <Button
                  onClick={() => {
                    setNewItemDialogOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <PlusCircle className="h-5 w-5" />
                  New Item
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="w-full justify-start gap-2"
                >
                  <Download className="h-5 w-5" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportDialogOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Upload className="h-5 w-5" />
                  Import Data
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}