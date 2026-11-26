import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * Contract specification tests mirroring firestore.rules invariants
 * and the "Dirty Dozen" adversarial payloads defined in security_spec.md.
 */

interface AuthContext {
  uid: string;
  emailVerified: boolean;
}

interface TaskPayload {
  userId?: unknown;
  title?: unknown;
  description?: unknown;
  category?: unknown;
  priority?: unknown;
  dueDate?: unknown;
  status?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  [key: string]: unknown;
}

const REQUEST_TIME = 'SERVER_TIME';

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(id);
}

function canCreateTask(
  auth: AuthContext | null,
  pathUserId: string,
  taskId: string,
  data: TaskPayload
): boolean {
  if (!auth || !auth.emailVerified) return false;
  if (!isValidId(pathUserId) || !isValidId(taskId)) return false;
  if (auth.uid !== pathUserId) return false;

  const allowedKeys = [
    'userId',
    'title',
    'description',
    'category',
    'priority',
    'dueDate',
    'status',
    'createdAt',
    'updatedAt',
  ];
  const keys = Object.keys(data);
  if (!allowedKeys.every((k) => keys.includes(k))) return false;
  if (!keys.every((k) => allowedKeys.includes(k))) return false;

  if (!isValidId(data.userId) || data.userId !== pathUserId || data.userId !== auth.uid) return false;
  if (typeof data.title !== 'string' || data.title.length < 1 || data.title.length > 120) return false;
  if (typeof data.description !== 'string' || data.description.length > 1000) return false;
  if (typeof data.category !== 'string' || data.category.length < 1 || data.category.length > 40) return false;
  if (data.priority !== 'Low' && data.priority !== 'Medium' && data.priority !== 'High') return false;
  if (typeof data.dueDate !== 'string' || data.dueDate.length > 10 || !/^(|\d{4}-\d{2}-\d{2})$/.test(data.dueDate)) {
    return false;
  }
  if (data.status !== 'Pending' && data.status !== 'Completed') return false;
  if (data.createdAt !== REQUEST_TIME || data.updatedAt !== REQUEST_TIME) return false;

  return true;
}

const validPayload = (uid = 'uid1'): TaskPayload => ({
  userId: uid,
  title: 'Submit B.Tech project report',
  description: 'Finalize formatting and diagrams',
  category: 'Academic',
  priority: 'High',
  dueDate: '2026-12-01',
  status: 'Pending',
  createdAt: REQUEST_TIME,
  updatedAt: REQUEST_TIME,
});

test('Dirty Dozen security rule invariants deny all invalid payloads', () => {
  // 1. Unauthenticated create
  assert.equal(canCreateTask(null, 'uid1', 'task1', validPayload('uid1')), false);
  // 2. Unverified email
  assert.equal(canCreateTask({ uid: 'uid1', emailVerified: false }, 'uid1', 'task1', validPayload('uid1')), false);
  // 3. Cross-user write
  assert.equal(canCreateTask({ uid: 'uid2', emailVerified: true }, 'uid1', 'task1', validPayload('uid1')), false);
  // 4. Identity spoofing in payload
  assert.equal(canCreateTask({ uid: 'uid2', emailVerified: true }, 'uid2', 'task1', validPayload('uid1')), false);
  // 5. Shadow field injection
  assert.equal(
    canCreateTask({ uid: 'uid1', emailVerified: true }, 'uid1', 'task1', { ...validPayload('uid1'), isAdmin: true }),
    false
  );
  // 6. Empty title
  assert.equal(
    canCreateTask({ uid: 'uid1', emailVerified: true }, 'uid1', 'task1', { ...validPayload('uid1'), title: '' }),
    false
  );
  // 7. Oversized description
  assert.equal(
    canCreateTask({ uid: 'uid1', emailVerified: true }, 'uid1', 'task1', {
      ...validPayload('uid1'),
      description: 'x'.repeat(1001),
    }),
    false
  );
  // 8. Invalid priority
  assert.equal(
    canCreateTask({ uid: 'uid1', emailVerified: true }, 'uid1', 'task1', {
      ...validPayload('uid1'),
      priority: 'Critical',
    }),
    false
  );
  // 9. Invalid status
  assert.equal(
    canCreateTask({ uid: 'uid1', emailVerified: true }, 'uid1', 'task1', {
      ...validPayload('uid1'),
      status: 'Archived',
    }),
    false
  );
  // 10. Malicious task ID
  assert.equal(canCreateTask({ uid: 'uid1', emailVerified: true }, 'uid1', '../evil', validPayload('uid1')), false);
  // 11. Spoofed timestamp
  assert.equal(
    canCreateTask({ uid: 'uid1', emailVerified: true }, 'uid1', 'task1', {
      ...validPayload('uid1'),
      createdAt: '2020-01-01',
    }),
    false
  );
  // 12. Valid payload passes
  assert.equal(canCreateTask({ uid: 'uid1', emailVerified: true }, 'uid1', 'task-1', validPayload('uid1')), true);
});
