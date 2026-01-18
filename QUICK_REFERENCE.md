# Kanban Board - Quick Reference

## 📋 Table of Contents
1. [Basic Usage](#basic-usage)
2. [Props Reference](#props-reference)
3. [Callbacks](#callbacks)
4. [Common Patterns](#common-patterns)

## Basic Usage

### Minimal Setup
```tsx
import { KanbanBoard } from './components/KanbanBoard';
import { useState } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  
  return (
    <KanbanBoard 
      tasks={tasks}
      onTaskMove={(id, newStatus) => {
        setTasks(tasks.map(t => 
          t.id === id ? { ...t, status: newStatus } : t
        ));
      }}
    />
  );
}
```

### Full Setup with All Callbacks
```tsx
<KanbanBoard
  tasks={tasks}
  onTaskCreate={(task) => setTasks([...tasks, task])}
  onTaskUpdate={(task) => setTasks(tasks.map(t => t.id === task.id ? task : t))}
  onTaskDelete={(id) => setTasks(tasks.filter(t => t.id !== id))}
  onTaskMove={(id, newStatus, oldStatus) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: newStatus, updatedAt: new Date() } : t
    ));
  }}
/>
```

## Props Reference

### Required
- `tasks: Task[]` - Array of tasks

### Callbacks (all optional)
- `onTaskCreate?: (task: Task) => void | Promise<void>`
- `onTaskUpdate?: (task: Task) => void | Promise<void>` 
- `onTaskDelete?: (taskId: string) => void | Promise<void>`
- `onTaskMove?: (taskId: string, newStatus: Status, oldStatus: Status) => void | Promise<void>`

### Features (all optional, default true)
- `enableSearch?: boolean`
- `enableFilters?: boolean`
- `enableViewToggle?: boolean`
- `enableCreateTask?: boolean`

### Customization
```tsx
columns?: { id: Status; title: string }[]
style?: {
  boardTitle?: string;
  boardSubtitle?: string;
  showHeader?: boolean;
  showStats?: boolean;
}
```

## Callbacks

### onTaskCreate
Triggered when user creates a new task via the "Create Task" button
```tsx
onTaskCreate={(newTask) => {
  // API call
  fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(newTask)
  });
  // Update state
  setTasks([...tasks, newTask]);
}}
```

### onTaskUpdate
Triggered when user edits task details in the modal
```tsx
onTaskUpdate={(updatedTask) => {
  fetch(`/api/tasks/${updatedTask.id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedTask)
  });
  setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
}}
```

### onTaskDelete
Triggered when user deletes a task
```tsx
onTaskDelete={(taskId) => {
  fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
  setTasks(tasks.filter(t => t.id !== taskId));
}}
```

### onTaskMove
Triggered when user drags a task to a different column
```tsx
onTaskMove={(taskId, newStatus, oldStatus) => {
  console.log(`Task ${taskId}: ${oldStatus} → ${newStatus}`);
  fetch(`/api/tasks/${taskId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus })
  });
  setTasks(tasks.map(t => 
    t.id === taskId ? { ...t, status: newStatus } : t
  ));
}}
```

## Common Patterns

### Pattern 1: Simple State Management
```tsx
function App() {
  const [tasks, setTasks] = useState(initialTasks);

  return (
    <KanbanBoard
      tasks={tasks}
      onTaskMove={(id, newStatus) => {
        setTasks(prev => prev.map(t => 
          t.id === id ? { ...t, status: newStatus } : t
        ));
      }}
    />
  );
}
```

### Pattern 2: With API + Optimistic Updates
```tsx
const handleTaskMove = async (id, newStatus, oldStatus) => {
  // 1. Update UI immediately (optimistic)
  setTasks(prev => prev.map(t => 
    t.id === id ? { ...t, status: newStatus } : t
  ));

  try {
    // 2. Call API
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
  } catch (error) {
    // 3. Rollback on error
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: oldStatus } : t
    ));
    alert('Failed to move task');
  }
};
```

### Pattern 3: Read-Only Board
```tsx
<KanbanBoard
  tasks={tasks}
  enableCreateTask={false}
  // Don't provide any callbacks - board becomes read-only
/>
```

### Pattern 4: Custom Columns
```tsx
<KanbanBoard
  tasks={tasks}
  columns={[
    { id: 'todo', title: 'Backlog' },
    { id: 'in-progress', title: 'Sprint' },
    { id: 'in-review', title: 'Review' },
    { id: 'done', title: '✅ Done' },
  ]}
/>
```

### Pattern 5: Minimal UI
```tsx
<KanbanBoard
  tasks={tasks}
  enableSearch={false}
  enableFilters={false}
  enableViewToggle={false}
  style={{
    showHeader: false,
    showStats: false,
  }}
/>
```

## Task Data Structure

```typescript
interface Task {
  // Required fields
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  type: 'task' | 'bug' | 'story' | 'epic';
  reporter: string;
  labels: Label[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  
  // Optional fields
  assignee?: string;
  estimate?: number;     // hours
  timeSpent?: number;    // hours
  dueDate?: Date;
}
```

## Customization Examples

### Change Board Title
```tsx
<KanbanBoard
  tasks={tasks}
  style={{
    boardTitle: "My Sprint Board",
    boardSubtitle: "Sprint 24.1",
  }}
/>
```

### Disable Features
```tsx
<KanbanBoard
  tasks={tasks}
  enableSearch={false}      // Hide search bar
  enableFilters={false}     // Hide filter dropdowns
  enableViewToggle={false}  // Hide board/list toggle
  enableCreateTask={false}  // Hide "Create Task" button
/>
```

### Hide UI Elements
```tsx
<KanbanBoard
  tasks={tasks}
  style={{
    showHeader: false,  // Hide entire header
    showStats: false,   // Hide task count statistics
  }}
/>
```

## Tips

1. **Parent controls data**: The component is controlled - always pass tasks from parent state
2. **Callbacks are optional**: Only implement the callbacks you need
3. **Async callbacks supported**: Return a Promise for async operations
4. **Optimistic updates**: Update state before API call for better UX
5. **Error handling**: Rollback state on API errors
6. **TypeScript**: Full type safety with exported types

## Common Issues

### Issue: Tasks don't update when dragged
**Fix**: Implement `onTaskMove` callback
```tsx
onTaskMove={(id, newStatus) => {
  setTasks(prev => prev.map(t => 
    t.id === id ? { ...t, status: newStatus } : t
  ));
}}
```

### Issue: New tasks don't appear
**Fix**: Implement `onTaskCreate` callback
```tsx
onTaskCreate={(task) => {
  setTasks(prev => [...prev, task]);
}}
```

### Issue: Need to sync with API
**Fix**: Use async callbacks with optimistic updates
```tsx
onTaskMove={async (id, newStatus, oldStatus) => {
  setTasks(prev => prev.map(t => t.id === id ? {...t, status: newStatus} : t));
  try {
    await api.updateTask(id, { status: newStatus });
  } catch (err) {
    setTasks(prev => prev.map(t => t.id === id ? {...t, status: oldStatus} : t));
  }
}}
```
