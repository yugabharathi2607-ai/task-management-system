# Security Specification — TaskFlow

## 1. Data Invariants
1. **Strict Ownership**: Every task document at `/users/{userId}/tasks/{taskId}` must have `userId == request.auth.uid`, and `userId` in the path must equal `request.auth.uid`.
2. **Verified Identity**: All read and write operations require `request.auth != null` and `request.auth.token.email_verified == true`.
3. **Immutability**: `userId` and `createdAt` are immutable after document creation.
4. **Server Timestamps**: `createdAt` on create and `updatedAt` on create/update must strictly equal `request.time`.
5. **Bounded Payloads**: `title` (1..120), `description` (0..1000), `category` (1..40), `priority` (`Low`|`Medium`|`High`), `dueDate` (`""` or `YYYY-MM-DD`), `status` (`Pending`|`Completed`), and document IDs match `^[a-zA-Z0-9_\-]+$` with max length 128.
6. **Zero Shadow Fields**: Create operations must satisfy exact key allowlisting (`hasAll` + `hasOnly`), and updates must use action-specific `affectedKeys().hasOnly(...)` branches (`toggleStatus` or `editTask`).

## 2. Adversarial "Dirty Dozen" Payloads
1. **Unauthenticated Read/Write**: Read or write `/users/uid1/tasks/task1` with `request.auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Create task with `request.auth.token.email_verified == false` -> `PERMISSION_DENIED`.
3. **Cross-User Read/List**: User `uid2` attempts `get` or `list` on `/users/uid1/tasks` -> `PERMISSION_DENIED`.
4. **Identity Spoofing on Create**: User `uid2` creates `/users/uid2/tasks/task1` with payload `userId: "uid1"` -> `PERMISSION_DENIED`.
5. **Shadow / Ghost Field Injection**: Create or update task including extra key `isAdmin: true` -> `PERMISSION_DENIED`.
6. **Empty Title Bypass**: Create or update task with `title: ""` or whitespace-only -> `PERMISSION_DENIED` (empty string rejected by `size() >= 1`; whitespace checked in client validation).
7. **Oversized Title/Description (Resource Exhaustion)**: Create task with 5,000-char `title` or 50,000-char `description` -> `PERMISSION_DENIED`.
8. **Invalid Priority Enum**: Create task with `priority: "Critical"` -> `PERMISSION_DENIED`.
9. **Invalid Status Enum**: Create task with `status: "Archived"` -> `PERMISSION_DENIED`.
10. **Malicious Document ID**: Create `/users/uid1/tasks/../../other` or >128 char task ID -> `PERMISSION_DENIED`.
11. **Immutable Field Mutation**: Update task attempting to change `userId` or `createdAt` -> `PERMISSION_DENIED`.
12. **Client-Spoofed Timestamp**: Create or update task with client-chosen `createdAt` or `updatedAt != request.time` -> `PERMISSION_DENIED`.
