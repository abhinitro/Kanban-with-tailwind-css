# Kanban Board Component - Complete Documentation

A fully featured, reusable React Kanban board component with drag-and-drop, filtering, and full API integration support.

## 🚀 Quick Start

```tsx
import { KanbanBoard } from './components/KanbanBoard';
import type { Task } from './types';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  return (
    <KanbanBoard
      tasks={tasks}
      onTaskCreate={(task) => setTasks([...tasks, task])}
      onTaskUpdate={(task) => setTasks(tasks.map(t => t.id === task.id ? task : t))}
      onTaskDelete={(id) => setTasks(tasks.filter(t => t.id !== id))}
      onTaskMove={(id, newStatus) => setTasks(tasks.map(t => 
        t.id === id ? { ...t, status: newStatus } : t
      ))}
    />
  );
}
```

## 📦 Installation

### Dependencies
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react
npm install -D tailwindcss postcss autoprefixer
```

### Tailwind Configuration
Add to your `tailwind.config.js`:
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
```

## 🎯 Component API

### Props

#### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `tasks` | `Task[]` | Array of tasks to display |

#### Callback Props (CRUD Operations)

| Prop | Type | Description |
|------|------|-------------|
| `onTaskCreate` | `(task: Task) => void \| Promise<void>` | Called when a new task is created |
| `onTaskUpdate` | `(task: Task) => void \| Promise<void>` | Called when a task is updated |
| `onTaskDelete` | `(taskId: string) => void \| Promise<void>` | Called when a task is deleted |
| `onTaskMove` | `(taskId: string, newStatus: Status, oldStatus: Status) => void \| Promise<void>` | Called when a task is moved between columns |

#### Optional Customization Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `{ id: Status; title: string }[]` | Default columns | Custom column configuration |
| `enableSearch` | `boolean` | `true` | Enable/disable search functionality |
| `enableFilters` | `boolean` | `true` | Enable/disable filter dropdowns |
| `enableViewToggle` | `boolean` | `true` | Enable/disable board/list view toggle |
| `enableCreateTask` | `boolean` | `true` | Enable/disable task creation |
| `style` | `StyleProps` | See below | Style customization options |
| `renderTaskCard` | `(task: Task, defaultCard: ReactNode) => ReactNode` | - | Custom task card renderer |
| `renderHeader` | `(defaultHeader: ReactNode) => ReactNode` | - | Custom header renderer |

#### Style Props

```typescript
style?: {
  boardTitle?: string;        // Default: "Kanban Board"
  boardSubtitle?: string;     // Default: "Project Management Dashboard"
  showHeader?: boolean;       // Default: true
  showStats?: boolean;        // Default: true
}
```

## 📊 Data Types

### Task Interface

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  type: IssueType;
  assignee?: string;
  reporter: string;
  labels: Label[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  estimate?: number;
  timeSpent?: number;
  dueDate?: Date;
}
```

### Status Types

```typescript
type Status = 'todo' | 'in-progress' | 'in-review' | 'done';
type Priority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';
type IssueType = 'task' | 'bug' | 'story' | 'epic';
```

### Label & Comment

```typescript
interface Label {
  id: string;
  name: string;
  color: string; // Tailwind color class like 'bg-blue-500'
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}
```

## 🔌 API Integration

### Basic Example with Fetch

```typescript
const handleTaskCreate = async (newTask: Task) => {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });
    
    if (!response.ok) throw new Error('Failed to create task');
    
    const createdTask = await response.json();
    setTasks(prev => [...prev, createdTask]);
  } catch (error) {
    console.error('Error creating task:', error);
    alert('Failed to create task');
  }
};
```

### Optimistic Updates Pattern

```typescript
const handleTaskMove = async (taskId: string, newStatus: Status, oldStatus: Status) => {
  // 1. Store current state for rollback
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  // 2. Optimistically update UI immediately
  const updatedTask = { ...task, status: newStatus };
  setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
  
  try {
    // 3. Make API call
    await fetch(`/api/tasks/${taskId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (error) {
    // 4. Rollback on error
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: oldStatus } : t
    ));
    alert('Failed to move task');
  }
};
```

### Using React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function App() {
  const queryClient = useQueryClient();
  
  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      return response.json();
    }
  });
  
  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (newTask: Task) => 
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
  
  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: (task: Task) =>
      fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
  
  return (
    <KanbanBoard
      tasks={tasks}
      onTaskCreate={createMutation.mutate}
      onTaskUpdate={updateMutation.mutate}
      // ... other props
    />
  );
}
```

## 🎨 Customization Examples

### Custom Columns

```typescript
<KanbanBoard
  tasks={tasks}
  columns={[
    { id: 'todo', title: 'Backlog' },
    { id: 'in-progress', title: 'Active Sprint' },
    { id: 'in-review', title: 'Code Review' },
    { id: 'done', title: 'Completed' },
  ]}
/>
```

### Minimal Configuration

```typescript
<KanbanBoard
  tasks={tasks}
  onTaskMove={handleTaskMove}
  enableSearch={false}
  enableFilters={false}
  enableViewToggle={false}
  enableCreateTask={false}
  style={{
    showHeader: false,
    showStats: false,
  }}
/>
```

### Custom Styling

```typescript
<KanbanBoard
  tasks={tasks}
  style={{
    boardTitle: 'Sprint Planning',
    boardSubtitle: 'Q1 2024 - Team Alpha',
  }}
/>
```

## 🔧 Advanced Usage

### Custom Task Card Rendering

```typescript
<KanbanBoard
  tasks={tasks}
  renderTaskCard={(task, defaultCard) => (
    <div className="relative">
      {defaultCard}
      {task.priority === 'highest' && (
        <div className="absolute top-2 right-2">
          <span className="text-red-500">🔥</span>
        </div>
      )}
    </div>
  )}
/>
```

### Custom Header

```typescript
<KanbanBoard
  tasks={tasks}
  renderHeader={(defaultHeader) => (
    <>
      <div className="bg-blue-600 text-white p-4">
        <h1>My Custom Header</h1>
      </div>
      {defaultHeader}
    </>
  )}
/>
```

## 📱 Features

### Built-in Features
- ✅ Drag and drop tasks between columns
- ✅ Search tasks by title, description, or ID
- ✅ Filter by priority, type, and assignee
- ✅ Board and list view modes
- ✅ Task creation with full form
- ✅ Task editing with detail modal
- ✅ Task deletion with confirmation
- ✅ Comments system
- ✅ Time tracking (estimate vs. spent)
- ✅ Due dates with overdue indicators
- ✅ Labels/tags
- ✅ Priority and type icons
- ✅ Assignee avatars
- ✅ Statistics dashboard
- ✅ Responsive design

### Keyboard Support
- `ESC` - Close modals
- `Enter` - Submit forms/comments

## 🌐 State Management Examples

### Redux Toolkit

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { createTask, updateTask, deleteTask, moveTask } from './tasksSlice';

function App() {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.items);
  
  return (
    <KanbanBoard
      tasks={tasks}
      onTaskCreate={(task) => dispatch(createTask(task))}
      onTaskUpdate={(task) => dispatch(updateTask(task))}
      onTaskDelete={(id) => dispatch(deleteTask(id))}
      onTaskMove={(id, newStatus) => dispatch(moveTask({ id, newStatus }))}
    />
  );
}
```

### Zustand

```typescript
import { create } from 'zustand';

const useTaskStore = create((set) => ({
  tasks: [],
  createTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map(t => t.id === task.id ? task : t)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
}));

function App() {
  const { tasks, createTask, updateTask, deleteTask } = useTaskStore();
  
  return (
    <KanbanBoard
      tasks={tasks}
      onTaskCreate={createTask}
      onTaskUpdate={updateTask}
      onTaskDelete={deleteTask}
    />
  );
}
```

## 🐛 Troubleshooting

### Tasks not updating after drag and drop
**Solution**: Make sure your `onTaskMove` callback updates the parent state:
```typescript
const handleTaskMove = (taskId, newStatus) => {
  setTasks(prev => prev.map(t => 
    t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date() } : t
  ));
};
```

### Tailwind styles not applying
**Solution**: Ensure your `tailwind.config.js` includes the component paths:
```javascript
content: ["./src/**/*.{js,ts,jsx,tsx}"]
```

### TypeScript errors with callbacks
**Solution**: All callbacks are optional. Use them only if you need the functionality:
```typescript
<KanbanBoard
  tasks={tasks}
  // Only include callbacks you need
  onTaskMove={handleMove}
/>
```

## 📄 License

MIT

## 🤝 Contributing

Feel free to extend and modify this component for your needs!
