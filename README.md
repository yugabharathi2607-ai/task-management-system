# TaskFlow – Task Management System

TaskFlow is a responsive, full-featured Task Management System (To-Do Web Application) built with React, TypeScript, Tailwind CSS, and Vite. It enables users to create, organize, edit, complete, search, filter, sort, and delete tasks with persistent storage backed by Firebase Authentication & Cloud Firestore (when configured and signed in) and a reliable browser `localStorage` fallback.

---

## Problem Statement

> "Users can create tasks, update them, delete them, and mark tasks as completed."

Students and individuals often struggle to track coursework, project milestones, and daily commitments across scattered notes. TaskFlow solves this by providing a structured, distraction-free dashboard with real-time progress metrics, priority levels, due dates, and persistent storage.

---

## Objectives

- Provide an intuitive, responsive web interface for end-to-end task lifecycle management (CRUD).
- Calculate and display live productivity statistics (Total Tasks, Pending Tasks, Completed Tasks, Completion Percentage).
- Support task categorization, urgency levels (`Low`, `Medium`, `High`), due dates, live search, filtering, and sorting.
- Implement a clean storage abstraction supporting both **Firebase Firestore** (cloud sync per authenticated user) and **`localStorage`** (zero-setup local persistence).
- Maintain clean, modular TypeScript architecture suitable for B.Tech mini-project submission and portfolio presentation.

---

## Features

- **Dashboard Overview**: Live KPI cards for Total Tasks, Pending Tasks, Completed Tasks, and Completion Percentage, plus Priority and Category breakdowns.
- **Create Task**: Validated form supporting Title (required), Description, Category, Priority (`Low`, `Medium`, `High`), Due Date, and Status (`Pending`, `Completed`).
- **Update Task**: Edit modal pre-populated with existing task fields for immediate updates.
- **Delete Task**: Confirmation dialog before permanent removal to prevent accidental deletions.
- **Completion Toggle**: One-click toggle to mark tasks as `Completed` or revert them back to `Pending`, updating all statistics automatically.
- **Dedicated Views**: Sidebar navigation for `Dashboard`, `All Tasks`, `Pending Tasks`, and `Completed Tasks`.
- **Search, Filter & Sort**: Live search by title/description, filter by Status, Priority, and Category, and sort by Recently Created, Due Date, or Priority.
- **Dual Persistence Layer**: Uses `localStorage` out of the box and upgrades seamlessly to Firebase Authentication (Google Sign-In) + Cloud Firestore when configured.

---

## Technologies Used

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Cloud Persistence (Optional / Configured)**: Firebase Authentication & Cloud Firestore
- **Local Persistence Fallback**: Browser `localStorage`

---

## Folder Structure

```text
task-management-system/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ConfirmDialog.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskFilters.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskListSection.tsx
│   │   └── TaskModal.tsx
│   ├── hooks/
│   │   └── useTasks.ts
│   ├── pages/
│   │   ├── AllTasks.tsx
│   │   ├── CompletedTasks.tsx
│   │   ├── Dashboard.tsx
│   │   └── PendingTasks.tsx
│   ├── services/
│   │   ├── firebaseClient.ts
│   │   ├── storageService.ts
│   │   └── taskService.ts
│   ├── types/
│   │   └── task.ts
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   └── taskUtils.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── firebase-blueprint.json
├── firestore.rules
├── firestore.rules.test.ts
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm installed

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Build for Production

```bash
npm run build
```

Type-check the codebase:

```bash
npm run lint
```

---

## Database & Storage Details

TaskFlow uses a clean `TaskStorageProvider` interface in `src/services/storageService.ts`:

1. **Local Browser Storage (`LocalTaskStorage`)**:
   - Active immediately with zero configuration (`localStorage` key: `taskflow_tasks_v1`).
   - Tasks persist across page refreshes and browser restarts.
2. **Firebase Authentication & Cloud Firestore (`FirebaseTaskStorage`)**:
   - Activated when `firebase-applet-config.json` is present and the user signs in with Google.
   - Stores user-scoped tasks at `users/{userId}/tasks/{taskId}` with real-time `onSnapshot` updates and strict `firestore.rules` ownership/validation enforcement.
   - If `firebase-applet-config.json` is not present (e.g., fresh clone in VS Code), the application automatically runs with `LocalTaskStorage` without build or runtime errors.

---

## Screenshots

- **Dashboard View**: Displays the TaskFlow summary header, 4 KPI metric cards, active tasks list, and priority/category breakdowns.
- **All Tasks / Pending / Completed Views**: Search bar, segmented status tabs, priority/category dropdowns, and sorting controls.
- **Create / Edit Modal & Delete Confirmation**: Validated task form and confirmation modal.

---

## GitHub Repository

Add your repository URL after pushing to GitHub:

```text
https://github.com/<your-username>/taskflow-task-management-system
```

---

## Live Website

Add your deployed URL (e.g., Vercel, Netlify, Firebase Hosting, or Google AI Studio Preview) here:

```text
https://<your-live-deployment-url>
```
