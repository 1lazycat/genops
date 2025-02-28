"use client";

import { toast } from "sonner";
import { Item, ItemType } from "./types";

// Simulated AI service - in a real app, this would call an actual AI API
export const aiService = {
  // Generate child items based on parent description
  async generateChildren(
    parentItem: Item,
    childType: ItemType
  ): Promise<Partial<Item>[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Check valid child type based on parent type
    const validChildTypes: Record<ItemType, ItemType[]> = {
      epic: ["story"],
      story: ["task", "test"],
      task: ["test"],
      test: [],
    };
    
    if (!validChildTypes[parentItem.type].includes(childType)) {
      toast.error(`Cannot create ${childType} under ${parentItem.type}`);
      return [];
    }
    
    // Generate mock items based on parent description
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 items
    const items: Partial<Item>[] = [];
    
    for (let i = 1; i <= count; i++) {
      let title = "";
      let description = "";
      
      if (childType === "story" && parentItem.type === "epic") {
        title = `User Story ${i} for ${parentItem.title}`;
        description = `As a user, I want to ${parentItem.title.toLowerCase()} so that I can improve my workflow.`;
      } else if (childType === "task" && parentItem.type === "story") {
        title = `Task ${i} for ${parentItem.title}`;
        description = `Implement the functionality to ${parentItem.title.toLowerCase()}.`;
      } else if (childType === "test") {
        title = `Test Scenario ${i} for ${parentItem.title}`;
        description = `Verify that ${parentItem.title.toLowerCase()} works as expected.`;
      }
      
      items.push({
        type: childType,
        title,
        description,
        status: "backlog",
        priority: "medium",
        parentId: parentItem.id,
        assignedTo: null,
        customFields: {},
      });
    }
    
    return items;
  },
  
  // Suggest improvements for a field
  async suggestFieldImprovement(
    item: Item,
    field: keyof Item
  ): Promise<string> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const currentValue = item[field];
    
    if (field === "title") {
      return `${currentValue} - Enhanced Version`;
    } else if (field === "description") {
      return `${currentValue}\n\nAdditional context: This requirement addresses key user needs and aligns with our strategic goals. Consider implementing with a focus on performance and usability.`;
    }
    
    return String(currentValue);
  },
  
  // Analyze requirements for quality and completeness
  async analyzeRequirements(item: Item): Promise<{
    score: number;
    feedback: string[];
  }> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    const feedback = [];
    
    if (item.description.length < 50) {
      feedback.push("Description is too short. Add more details.");
    }
    
    if (!item.description.includes("so that")) {
      feedback.push(
        "Consider using 'so that' to clarify the business value."
      );
    }
    
    if (score < 70) {
      feedback.push("Requirements lack specificity. Add acceptance criteria.");
    }
    
    if (feedback.length === 0) {
      feedback.push("Great job! This requirement is well-defined.");
    }
    
    return { score, feedback };
  },
  
  // Generate test scenarios based on requirements
  async generateTestScenarios(item: Item): Promise<Partial<Item>[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1800));
    
    const count = Math.floor(Math.random() * 2) + 2; // 2-3 test scenarios
    const scenarios: Partial<Item>[] = [];
    
    for (let i = 1; i <= count; i++) {
      scenarios.push({
        type: "test",
        title: `Test Scenario ${i} for ${item.title}`,
        description: `Test Case ${i}: Verify that ${item.title.toLowerCase()} works correctly under various conditions.`,
        status: "backlog",
        priority: "medium",
        parentId: item.id,
        assignedTo: null,
        customFields: {
          testSteps: [
            "1. Setup test environment",
            "2. Execute test case",
            "3. Verify results",
          ],
          expectedResults: "The feature works as expected.",
        },
      });
    }
    
    return scenarios;
  },
};