export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskStatus = 'Pending' | 'Completed';

export type TaskSortOption = 'recent' | 'dueDate' | 'priority';

export type TaskStatusFilter = 'All' | TaskStatus;

export type TaskPriorityFilter = 'All' | TaskPriority;

export type NavSection = 'dashboard' | 'all' | 'pending' | 'completed';

export type StorageMode = 'firebase' | 'local';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD or ''
  status: TaskStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface TaskFormInput {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
}

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  completionPercentage: number;
}

export interface TaskFilterState {
  searchQuery: string;
  status: TaskStatusFilter;
  priority: TaskPriorityFilter;
  category: string;
  sortBy: TaskSortOption;
}

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export const TASK_CATEGORIES = [
  'Academic',
  'Project',
  'Study',
  'Work',
  'Personal',
  'General',
] as const;

export const TASK_CONSTRAINTS = {
  MAX_TITLE_LENGTH: 120,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_CATEGORY_LENGTH: 40,
  DUE_DATE_REGEX: /^(|\d{4}-\d{2}-\d{2})$/,
} as const;
