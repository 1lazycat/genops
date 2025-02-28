export type ItemType = 'epic' | 'story' | 'task' | 'test';

export type ItemStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export type ItemPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  status: ItemStatus;
  priority: ItemPriority;
  parentId: string | null;
  children: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo: string | null;
  customFields: Record<string, any>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AuditLog {
  id: string;
  itemId: string;
  userId: string;
  action: 'create' | 'update' | 'delete';
  timestamp: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface AIOperation {
  id: string;
  type: 'generate-children' | 'suggest-field' | 'analyze' | 'generate-tests';
  status: 'pending' | 'completed' | 'failed';
  itemId: string;
  result: any;
  timestamp: string;
}