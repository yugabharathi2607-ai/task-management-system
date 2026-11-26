import {
  TASK_CATEGORIES,
  TASK_CONSTRAINTS,
  Task,
  TaskFilterState,
  TaskFormInput,
  TaskPriority,
  TaskStats,
} from '../types/task';

const PRIORITY_RANK: Record<TaskPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export interface ValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  dueDate?: string;
}

export function validateTaskInput(input: TaskFormInput): ValidationErrors {
  const errors: ValidationErrors = {};
  const trimmedTitle = input.title.trim();

  if (!trimmedTitle) {
    errors.title = 'Task title is required.';
  } else if (trimmedTitle.length > TASK_CONSTRAINTS.MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${TASK_CONSTRAINTS.MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (input.description.trim().length > TASK_CONSTRAINTS.MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${TASK_CONSTRAINTS.MAX_DESCRIPTION_LENGTH} characters or fewer.`;
  }

  const trimmedCategory = input.category.trim();
  if (!trimmedCategory) {
    errors.category = 'Category is required.';
  } else if (trimmedCategory.length > TASK_CONSTRAINTS.MAX_CATEGORY_LENGTH) {
    errors.category = `Category must be ${TASK_CONSTRAINTS.MAX_CATEGORY_LENGTH} characters or fewer.`;
  }

  if (input.dueDate && !TASK_CONSTRAINTS.DUE_DATE_REGEX.test(input.dueDate)) {
    errors.dueDate = 'Please select a valid due date.';
  }

  return errors;
}

export function sanitizeTaskInput(input: TaskFormInput): TaskFormInput {
  return {
    title: input.title.trim().slice(0, TASK_CONSTRAINTS.MAX_TITLE_LENGTH),
    description: input.description.trim().slice(0, TASK_CONSTRAINTS.MAX_DESCRIPTION_LENGTH),
    category: (input.category.trim() || 'General').slice(0, TASK_CONSTRAINTS.MAX_CATEGORY_LENGTH),
    priority: input.priority,
    dueDate: TASK_CONSTRAINTS.DUE_DATE_REGEX.test(input.dueDate) ? input.dueDate : '',
    status: input.status,
  };
}

export function computeTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === 'Completed').length;
  const pending = total - completed;
  const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    pending,
    completed,
    completionPercentage,
  };
}

export function filterAndSortTasks(tasks: Task[], filters: TaskFilterState): Task[] {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (filters.status !== 'All' && task.status !== filters.status) {
      return false;
    }

    if (filters.priority !== 'All' && task.priority !== filters.priority) {
      return false;
    }

    if (filters.category !== 'All' && task.category !== filters.category) {
      return false;
    }

    if (normalizedQuery) {
      const matchesTitle = task.title.toLowerCase().includes(normalizedQuery);
      const matchesDescription = task.description.toLowerCase().includes(normalizedQuery);
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (filters.sortBy === 'priority') {
      const priorityDiff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return b.createdAt.localeCompare(a.createdAt);
    }

    if (filters.sortBy === 'dueDate') {
      if (a.dueDate && b.dueDate) {
        const dateDiff = a.dueDate.localeCompare(b.dueDate);
        if (dateDiff !== 0) {
          return dateDiff;
        }
      } else if (a.dueDate && !b.dueDate) {
        return -1;
      } else if (!a.dueDate && b.dueDate) {
        return 1;
      }
      return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    }

    // Default: recently created first
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function getAvailableCategories(tasks: Task[]): string[] {
  const categorySet = new Set<string>(TASK_CATEGORIES);
  for (const task of tasks) {
    if (task.category) {
      categorySet.add(task.category);
    }
  }
  return Array.from(categorySet);
}
