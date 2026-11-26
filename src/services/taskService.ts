import { AuthUser, Task, TaskFormInput, TaskStatus } from '../types/task';
import { sanitizeTaskInput, validateTaskInput } from '../utils/taskUtils';
import { isFirebaseConfigured } from './firebaseClient';
import { FirebaseTaskStorage, LocalTaskStorage, TaskStorageProvider } from './storageService';

const localStorageInstance = new LocalTaskStorage();

export function createTaskStorageProvider(authUser: AuthUser | null): TaskStorageProvider {
  if (isFirebaseConfigured() && authUser) {
    return new FirebaseTaskStorage(authUser.uid);
  }
  return localStorageInstance;
}

export async function createValidatedTask(
  provider: TaskStorageProvider,
  rawInput: TaskFormInput
): Promise<Task> {
  const errors = validateTaskInput(rawInput);
  const firstError = Object.values(errors)[0];
  if (firstError) {
    throw new Error(firstError);
  }

  const sanitized = sanitizeTaskInput(rawInput);
  return provider.createTask(sanitized);
}

export async function updateValidatedTask(
  provider: TaskStorageProvider,
  taskId: string,
  rawInput: TaskFormInput
): Promise<void> {
  const errors = validateTaskInput(rawInput);
  const firstError = Object.values(errors)[0];
  if (firstError) {
    throw new Error(firstError);
  }

  const sanitized = sanitizeTaskInput(rawInput);
  await provider.updateTask(taskId, sanitized);
}

export async function setTaskCompletionStatus(
  provider: TaskStorageProvider,
  taskId: string,
  nextStatus: TaskStatus
): Promise<void> {
  await provider.toggleTaskStatus(taskId, nextStatus);
}

export async function removeTask(
  provider: TaskStorageProvider,
  taskId: string
): Promise<void> {
  await provider.deleteTask(taskId);
}
