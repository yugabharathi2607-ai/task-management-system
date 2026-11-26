import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { StorageMode, Task, TaskFormInput, TaskPriority, TaskStatus } from '../types/task';
import { OperationType, getFirestoreDb, handleFirestoreError } from './firebaseClient';

export interface TaskStorageProvider {
  readonly mode: StorageMode;
  subscribe(
    onTasks: (tasks: Task[]) => void,
    onError: (error: Error) => void
  ): () => void;
  createTask(input: TaskFormInput): Promise<Task>;
  updateTask(id: string, input: TaskFormInput): Promise<void>;
  toggleTaskStatus(id: string, nextStatus: TaskStatus): Promise<void>;
  deleteTask(id: string): Promise<void>;
}

const LOCAL_STORAGE_KEY = 'taskflow_tasks_v1';

function generateLocalId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readLocalTasks(): Task[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Task =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Task).id === 'string' &&
        typeof (item as Task).title === 'string'
    );
  } catch {
    return [];
  }
}

function writeLocalTasks(tasks: Task[]): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
}

export class LocalTaskStorage implements TaskStorageProvider {
  readonly mode: StorageMode = 'local';
  private listeners = new Set<(tasks: Task[]) => void>();

  private notify(): void {
    const tasks = readLocalTasks();
    this.listeners.forEach((listener) => listener(tasks));
  }

  subscribe(
    onTasks: (tasks: Task[]) => void,
    onError: (error: Error) => void
  ): () => void {
    this.listeners.add(onTasks);
    try {
      onTasks(readLocalTasks());
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to load local tasks.'));
    }

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEY) {
        onTasks(readLocalTasks());
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      this.listeners.delete(onTasks);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }

  async createTask(input: TaskFormInput): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      id: generateLocalId(),
      userId: 'local-user',
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      dueDate: input.dueDate,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };

    const existing = readLocalTasks();
    writeLocalTasks([task, ...existing]);
    this.notify();
    return task;
  }

  async updateTask(id: string, input: TaskFormInput): Promise<void> {
    const existing = readLocalTasks();
    const index = existing.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Task not found.');
    }

    const updated: Task = {
      ...existing[index],
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      dueDate: input.dueDate,
      status: input.status,
      updatedAt: new Date().toISOString(),
    };

    const next = [...existing];
    next[index] = updated;
    writeLocalTasks(next);
    this.notify();
  }

  async toggleTaskStatus(id: string, nextStatus: TaskStatus): Promise<void> {
    const existing = readLocalTasks();
    const index = existing.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Task not found.');
    }

    const next = [...existing];
    next[index] = {
      ...existing[index],
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    writeLocalTasks(next);
    this.notify();
  }

  async deleteTask(id: string): Promise<void> {
    const existing = readLocalTasks();
    const next = existing.filter((item) => item.id !== id);
    writeLocalTasks(next);
    this.notify();
  }
}

function toIsoTimestamp(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

export class FirebaseTaskStorage implements TaskStorageProvider {
  readonly mode: StorageMode = 'firebase';
  private readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private getCollectionPath(): string {
    return `users/${this.userId}/tasks`;
  }

  subscribe(
    onTasks: (tasks: Task[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const db = getFirestoreDb();
    if (!db) {
      onError(new Error('Firestore is not initialized.'));
      return () => {};
    }

    const path = this.getCollectionPath();
    const tasksQuery = query(collection(db, path), orderBy('createdAt', 'desc'));

    return onSnapshot(
      tasksQuery,
      (snapshot) => {
        const items: Task[] = snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data({ serverTimestamps: 'estimate' });
          return {
            id: snapshotDoc.id,
            userId: String(data.userId ?? this.userId),
            title: String(data.title ?? ''),
            description: String(data.description ?? ''),
            category: String(data.category ?? 'General'),
            priority: (data.priority as TaskPriority) ?? 'Medium',
            dueDate: String(data.dueDate ?? ''),
            status: (data.status as TaskStatus) ?? 'Pending',
            createdAt: toIsoTimestamp(data.createdAt),
            updatedAt: toIsoTimestamp(data.updatedAt),
          };
        });
        onTasks(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (wrappedError) {
          onError(
            wrappedError instanceof Error
              ? wrappedError
              : new Error('Unable to load tasks from Firestore.')
          );
        }
      }
    );
  }

  async createTask(input: TaskFormInput): Promise<Task> {
    const db = getFirestoreDb();
    if (!db) {
      throw new Error('Firestore is not initialized.');
    }

    const path = this.getCollectionPath();
    const colRef = collection(db, path);
    const taskDocRef = doc(colRef);
    const docPath = `${path}/${taskDocRef.id}`;

    try {
      await setDoc(taskDocRef, {
        userId: this.userId,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        dueDate: input.dueDate,
        status: input.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const now = new Date().toISOString();
      return {
        id: taskDocRef.id,
        userId: this.userId,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        dueDate: input.dueDate,
        status: input.status,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  }

  async updateTask(id: string, input: TaskFormInput): Promise<void> {
    const db = getFirestoreDb();
    if (!db) {
      throw new Error('Firestore is not initialized.');
    }

    const docPath = `${this.getCollectionPath()}/${id}`;
    try {
      await updateDoc(doc(db, docPath), {
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        dueDate: input.dueDate,
        status: input.status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  }

  async toggleTaskStatus(id: string, nextStatus: TaskStatus): Promise<void> {
    const db = getFirestoreDb();
    if (!db) {
      throw new Error('Firestore is not initialized.');
    }

    const docPath = `${this.getCollectionPath()}/${id}`;
    try {
      await updateDoc(doc(db, docPath), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  }

  async deleteTask(id: string): Promise<void> {
    const db = getFirestoreDb();
    if (!db) {
      throw new Error('Firestore is not initialized.');
    }

    const docPath = `${this.getCollectionPath()}/${id}`;
    try {
      await deleteDoc(doc(db, docPath));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  }
}
