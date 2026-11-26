import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isFirebaseConfigured,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthChanges,
} from '../services/firebaseClient';
import {
  createTaskStorageProvider,
  createValidatedTask,
  removeTask,
  setTaskCompletionStatus,
  updateValidatedTask,
} from '../services/taskService';
import { AuthUser, StorageMode, Task, TaskFormInput, TaskStats, TaskStatus } from '../types/task';
import { computeTaskStats } from '../utils/taskUtils';

interface UseTasksResult {
  tasks: Task[];
  stats: TaskStats;
  loading: boolean;
  error: string | null;
  authUser: AuthUser | null;
  authLoading: boolean;
  firebaseAvailable: boolean;
  storageMode: StorageMode;
  addTask: (input: TaskFormInput) => Promise<void>;
  editTask: (id: string, input: TaskFormInput) => Promise<void>;
  toggleTaskStatus: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

function formatReadableError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  try {
    const parsed = JSON.parse(err.message) as { error?: string };
    if (parsed && typeof parsed.error === 'string') {
      if (parsed.error.toLowerCase().includes('permission')) {
        return 'Permission denied while accessing cloud tasks. Please verify you are signed in with a verified Google account.';
      }
      if (parsed.error.toLowerCase().includes('quota exceeded')) {
        return 'Firestore daily free-tier quota exceeded. Quota resets tomorrow, or sign out to use local browser storage.';
      }
      return parsed.error;
    }
  } catch {
    // Plain error message
  }
  return err.message || fallback;
}

export function useTasks(): UseTasksResult {
  const firebaseAvailable = isFirebaseConfigured();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(firebaseAvailable);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAvailable) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuthChanges((user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, [firebaseAvailable]);

  const storageProvider = useMemo(
    () => createTaskStorageProvider(authUser),
    [authUser]
  );

  useEffect(() => {
    if (authLoading) return;

    setLoading(true);
    setError(null);

    const unsubscribe = storageProvider.subscribe(
      (nextTasks) => {
        setTasks(nextTasks);
        setLoading(false);
      },
      (err) => {
        setError(formatReadableError(err, 'Unable to load tasks.'));
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [storageProvider, authLoading]);

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);

  const addTask = useCallback(
    async (input: TaskFormInput) => {
      setError(null);
      try {
        await createValidatedTask(storageProvider, input);
      } catch (err) {
        const message = formatReadableError(err, 'Failed to create task.');
        setError(message);
        throw new Error(message);
      }
    },
    [storageProvider]
  );

  const editTask = useCallback(
    async (id: string, input: TaskFormInput) => {
      setError(null);
      try {
        await updateValidatedTask(storageProvider, id, input);
      } catch (err) {
        const message = formatReadableError(err, 'Failed to update task.');
        setError(message);
        throw new Error(message);
      }
    },
    [storageProvider]
  );

  const toggleTaskStatus = useCallback(
    async (task: Task) => {
      setError(null);
      const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      try {
        await setTaskCompletionStatus(storageProvider, task.id, nextStatus);
      } catch (err) {
        setError(formatReadableError(err, 'Failed to update task status.'));
      }
    },
    [storageProvider]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await removeTask(storageProvider, id);
      } catch (err) {
        const message = formatReadableError(err, 'Failed to delete task.');
        setError(message);
        throw new Error(message);
      }
    },
    [storageProvider]
  );

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(formatReadableError(err, 'Google sign-in failed or was cancelled.'));
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await signOutUser();
    } catch (err) {
      setError(formatReadableError(err, 'Failed to sign out.'));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tasks,
    stats,
    loading: loading || authLoading,
    error,
    authUser,
    authLoading,
    firebaseAvailable,
    storageMode: storageProvider.mode,
    addTask,
    editTask,
    toggleTaskStatus,
    deleteTask,
    signIn,
    signOut,
    clearError,
  };
}
