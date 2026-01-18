import { useState, useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import type { Task, Status } from './types';
import { initialTasks } from './mockData';
import './index.css';

/**
 * Example App Component demonstrating API integration with the Kanban Board
 * 
 * This shows how to:
 * - Manage task state
 * - Integrate with API calls
 * - Handle all CRUD operations
 * - Persist data changes
 */

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from API on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Simulated API call to load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
      // const response = await fetch('/api/tasks');
      // const data = await response.json();

      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setTasks(initialTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle task creation - API integration point
  const handleTaskCreate = async (newTask: Task) => {
    try {
      // API call to create task
      // const response = await fetch('/api/tasks', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTask)
      // });
      // const createdTask = await response.json();

      // Optimistic update - add task immediately
      setTasks(prev => [...prev, newTask]);

      console.log('Task created:', newTask);
    } catch (error) {
      console.error('Error creating task:', error);
      // Rollback on error
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
      alert('Failed to create task. Please try again.');
    }
  };

  // Handle task update - API integration point
  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

      // API call to update task
      // await fetch(`/api/tasks/${updatedTask.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedTask)
      // });

      console.log('Task updated:', updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  // Handle task deletion - API integration point
  const handleTaskDelete = async (taskId: string) => {
    try {
      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== taskId));

      // API call to delete task
      // await fetch(`/api/tasks/${taskId}`, {
      //   method: 'DELETE'
      // });

      console.log('Task deleted:', taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  // Handle task move between columns - API integration point
  const handleTaskMove = async (taskId: string, newStatus: Status, oldStatus: Status) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Optimistic update
      const updatedTask = { ...task, status: newStatus, updatedAt: new Date() };
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

      // API call to update task status
      // await fetch(`/api/tasks/${taskId}/move`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // });

      console.log(`Task ${taskId} moved from ${oldStatus} to ${newStatus}`);
    } catch (error) {
      console.error('Error moving task:', error);
      // Rollback on error
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: oldStatus } : t
        ));
      }
      alert('Failed to move task. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <KanbanBoard
      tasks={tasks}
      onTaskCreate={handleTaskCreate}
      onTaskUpdate={handleTaskUpdate}
      onTaskDelete={handleTaskDelete}
      onTaskMove={handleTaskMove}
      // Optional customization
      enableSearch={true}
      enableFilters={true}
      enableViewToggle={true}
      enableCreateTask={true}
      style={{
        boardTitle: 'My Project Board',
        boardSubtitle: 'Sprint 2024-Q1',
        showHeader: true,
        showStats: true,
      }}
    />
  );
}

export default App;
