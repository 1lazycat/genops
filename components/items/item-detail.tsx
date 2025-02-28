"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { useStore } from "@/lib/store";
import { aiService } from "@/lib/ai-service";
import { Bot, Check, X, AlertTriangle, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ItemCard } from "./item-card";

interface ItemDetailProps {
  itemId: string;
}

export function ItemDetail({ itemId }: ItemDetailProps) {
  const { items, updateItem, addItem } = useStore();
  const item = items[itemId];
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item?.title || "");
  const [editedDescription, setEditedDescription] = useState(item?.description || "");
  const [editedStatus, setEditedStatus] = useState(item?.status || "backlog");
  const [editedPriority, setEditedPriority] = useState(item?.priority || "medium");
  const [editedParentId, setEditedParentId] = useState<string | undefined>(item.parentId || undefined);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ score: number; feedback: string[] } | null>(null);
  
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  
  const childItems = item?.children.map(childId => items[childId]).filter(Boolean) || [];
  
  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Item not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The item you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }
  
  const handleSave = () => {
    updateItem(item.id, {
      title: editedTitle,
      description: editedDescription,
      status: editedStatus,
      priority: editedPriority,
      parentId: editedParentId,
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
  
  const handleAiSuggest = async (field: 'title' | 'description') => {
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
    }
  };
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const result = await aiService.analyzeRequirements(item);
      setAnalysisResult(result);
    } catch (error) {
      toast.error("Failed to analyze requirements");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleGenerateTests = async () => {
    setIsGeneratingTests(true);
    
    try {
      const testScenarios = await aiService.generateTestScenarios(item);
      
      if (testScenarios.length === 0) {
        toast.error("Could not generate test scenarios");
        return;
      }
      
      // Add each test scenario
      testScenarios.forEach(scenario => {
        addItem({
          ...scenario,
          type: "test",
          title: scenario.title || "",
          description: scenario.description || "",
          status: scenario.status as any || "backlog",
          priority: scenario.priority as any || "medium",
          parentId: item.id,
          assignedTo: null,
          customFields: scenario.customFields || {},
        });
      });
      
      toast.success(`Generated ${testScenarios.length} test scenarios`);
    } catch (error) {
      toast.error("Failed to generate test scenarios");
    } finally {
      setIsGeneratingTests(false);
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
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleStatusChange = (value: string) => {
    setEditedStatus(value as 'backlog' | 'todo' | 'in-progress' | 'review' | 'done');
  };
  
  const handlePriorityChange = (value: string) => {
    setEditedPriority(value as 'low' | 'medium' | 'high' | 'critical');
  };
  
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge className={cn("font-normal", getTypeColor(item.type))}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Badge>
            <Badge variant="outline" className={cn(getStatusColor(item.status))}>
              {item.status.replace('-', ' ')}
            </Badge>
            <Badge variant="outline" className={cn(getPriorityColor(item.priority))}>
              {item.priority}
            </Badge>
          </div>
          
          {!isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="outline" onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <BarChart className="h-4 w-4 mr-2" />
                )}
                Analyze
              </Button>
              {(item.type === "epic" || item.type === "story" || item.type === "task") && (
                <Button 
                  variant="outline" 
                  onClick={handleGenerateTests}
                  disabled={isGeneratingTests}
                >
                  {isGeneratingTests ? (
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Bot className="h-4 w-4 mr-2" />
                  )}
                  Generate Tests
                </Button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="flex-1 text-xl font-semibold"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleAiSuggest('title')}
                  >
                    <Bot className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={6}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleAiSuggest('description')}
                    className="shrink-0"
                  >
                    <Bot className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={editedStatus}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
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
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={editedPriority}
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Parent</label>
                  <Select
                    value={editedParentId}
                    onValueChange={(value) => setEditedParentId(value as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(items).map((parentItem) => (
                        <SelectItem key={parentItem.id} value={parentItem.id}>
                          {parentItem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">{item.title}</h1>
              <div className="whitespace-pre-line text-muted-foreground">
                {item.description}
              </div>
            </>
          )}
          
          <div className="text-sm text-muted-foreground">
            Created {format(new Date(item.createdAt), 'MMM d, yyyy')} • 
            Updated {format(new Date(item.updatedAt), 'MMM d, yyyy')}
          </div>
          
          {analysisResult && (
            <div className="border rounded-lg p-4 mt-6">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Requirements Analysis
              </h3>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Quality Score</span>
                  <span className={cn("font-medium", getScoreColor(analysisResult.score))}>
                    {analysisResult.score}/100
                  </span>
                </div>
                <Progress value={analysisResult.score} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Feedback:</h4>
                <ul className="space-y-1 text-sm">
                  {analysisResult.feedback.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {childItems.length > 0 && (
            <div className="mt-8">
              <Tabs defaultValue="all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Child Items</h2>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    {item.type === "epic" && <TabsTrigger value="story">Stories</TabsTrigger>}
                    {(item.type === "epic" || item.type === "story") && (
                      <TabsTrigger value="task">Tasks</TabsTrigger>
                    )}
                    <TabsTrigger value="test">Tests</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {childItems.map(childItem => (
                      <ItemCard key={childItem.id} item={childItem} compact />
                    ))}
                  </div>
                </TabsContent>
                
                {item.type === "epic" && (
                  <TabsContent value="story" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {childItems
                        .filter(childItem => childItem.type === "story")
                        .map(childItem => (
                          <ItemCard key={childItem.id} item={childItem} compact />
                        ))}
                    </div>
                  </TabsContent>
                )}
                
                {(item.type === "epic" || item.type === "story") && (
                  <TabsContent value="task" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {childItems
                        .filter(childItem => childItem.type === "task")
                        .map(childItem => (
                          <ItemCard key={childItem.id} item={childItem} compact />
                        ))}
                    </div>
                  </TabsContent>
                )}
                
                <TabsContent value="test" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {childItems
                      .filter(childItem => childItem.type === "test")
                      .map(childItem => (
                        <ItemCard key={childItem.id} item={childItem} compact />
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}