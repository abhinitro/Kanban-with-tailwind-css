/**
 * API Integration Examples for Kanban Board Component
 * 
 * This file demonstrates different patterns for integrating the Kanban board
 * with various backend APIs and state management solutions.
 */

import { useState } from 'react';
import type { Task, Status } from './types';

// ============================================================================
// 1. REST API Integration with Optimistic Updates
// ============================================================================

export function useTasksWithRestAPI() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load tasks
    const loadTasks = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    // Create task with optimistic update
    const createTask = async (newTask: Task) => {
        // Optimistic update
        setTasks(prev => [...prev, newTask]);

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });

            if (!response.ok) throw new Error('Failed to create task');
            const createdTask = await response.json();

            // Update with server response
            setTasks(prev => prev.map(t => t.id === newTask.id ? createdTask : t));
        } catch (err) {
            // Rollback on error
            setTasks(prev => prev.filter(t => t.id !== newTask.id));
            setError(err instanceof Error ? err.message : 'Failed to create task');
            throw err;
        }
    };

    // Update task
    const updateTask = async (updatedTask: Task) => {
        const oldTask = tasks.find(t => t.id === updatedTask.id);

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

        try {
            const response = await fetch(`/api/tasks/${updatedTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask),
            });

            if (!response.ok) throw new Error('Failed to update task');
            const serverTask = await response.json();

            setTasks(prev => prev.map(t => t.id === serverTask.id ? serverTask : t));
        } catch (err) {
            // Rollback
            if (oldTask) {
                setTasks(prev => prev.map(t => t.id === updatedTask.id ? oldTask : t));
            }
            setError(err instanceof Error ? err.message : 'Failed to update task');
            throw err;
        }
    };

    // Delete task
    const deleteTask = async (taskId: string) => {
        const deletedTask = tasks.find(t => t.id === taskId);

        // Optimistic delete
        setTasks(prev => prev.filter(t => t.id !== taskId));

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete task');
        } catch (err) {
            // Rollback
            if (deletedTask) {
                setTasks(prev => [...prev, deletedTask]);
            }
            setError(err instanceof Error ? err.message : 'Failed to delete task');
            throw err;
        }
    };

    // Move task between columns
    const moveTask = async (taskId: string, newStatus: Status, oldStatus: Status) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTask = { ...task, status: newStatus, updatedAt: new Date() };

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

        try {
            const response = await fetch(`/api/tasks/${taskId}/move`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to move task');
        } catch (err) {
            // Rollback
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: oldStatus } : t
            ));
            setError(err instanceof Error ? err.message : 'Failed to move task');
            throw err;
        }
    };

    return {
        tasks,
        loading,
        error,
        loadTasks,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
    };
}

// ============================================================================
// 2. GraphQL Integration Example
// ============================================================================

export function useTasksWithGraphQL() {
    const [tasks, setTasks] = useState<Task[]>([]);

    const createTask = async (newTask: Task) => {
        const mutation = `
      mutation CreateTask($input: TaskInput!) {
        createTask(input: $input) {
          id
          title
          description
          status
          priority
          type
          assignee
          reporter
          createdAt
          updatedAt
        }
      }
    `;

        try {
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: mutation,
                    variables: { input: newTask },
                }),
            });

            const { data, errors } = await response.json();

            if (errors) throw new Error(errors[0].message);

            setTasks(prev => [...prev, data.createTask]);
        } catch (err) {
            console.error('GraphQL error:', err);
            throw err;
        }
    };

    const updateTask = async (updatedTask: Task) => {
        const mutation = `
      mutation UpdateTask($id: ID!, $input: TaskInput!) {
        updateTask(id: $id, input: $input) {
          id
          title
          description
          status
          updatedAt
        }
      }
    `;

        try {
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: mutation,
                    variables: {
                        id: updatedTask.id,
                        input: updatedTask
                    },
                }),
            });

            const { data } = await response.json();
            setTasks(prev => prev.map(t => t.id === data.updateTask.id ? data.updateTask : t));
        } catch (err) {
            console.error('GraphQL error:', err);
            throw err;
        }
    };

    return { tasks, createTask, updateTask };
}

// ============================================================================
// 3. Firebase/Firestore Integration
// ============================================================================

export function useTasksWithFirebase() {
    const [tasks, setTasks] = useState<Task[]>([]);

    // Example with Firestore (assuming firebase is initialized)
    const createTask = async (newTask: Task) => {
        try {
            // Uncomment when using Firebase:
            // const db = getFirestore();
            // await setDoc(doc(db, 'tasks', newTask.id), newTask);

            setTasks(prev => [...prev, newTask]);
        } catch (err) {
            console.error('Firebase error:', err);
            throw err;
        }
    };

    const updateTask = async (updatedTask: Task) => {
        try {
            // const db = getFirestore();
            // await updateDoc(doc(db, 'tasks', updatedTask.id), updatedTask);

            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        } catch (err) {
            console.error('Firebase error:', err);
            throw err;
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            // const db = getFirestore();
            // await deleteDoc(doc(db, 'tasks', taskId));

            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error('Firebase error:', err);
            throw err;
        }
    };

    // Real-time listener example
    const subscribeToTasks = () => {
        // const db = getFirestore();
        // const unsubscribe = onSnapshot(
        //   collection(db, 'tasks'),
        //   (snapshot) => {
        //     const tasksData = snapshot.docs.map(doc => ({
        //       id: doc.id,
        //       ...doc.data()
        //     })) as Task[];
        //     setTasks(tasksData);
        //   }
        // );
        // return unsubscribe;
    };

    return { tasks, createTask, updateTask, deleteTask, subscribeToTasks };
}

// ============================================================================
// 4. WebSocket Real-time Updates
// ============================================================================

export function useTasksWithWebSocket() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);

    const connect = () => {
        const socket = new WebSocket('ws://localhost:8080/tasks');

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'TASK_CREATED':
                    setTasks(prev => [...prev, message.task]);
                    break;
                case 'TASK_UPDATED':
                    setTasks(prev => prev.map(t =>
                        t.id === message.task.id ? message.task : t
                    ));
                    break;
                case 'TASK_DELETED':
                    setTasks(prev => prev.filter(t => t.id !== message.taskId));
                    break;
                case 'TASK_MOVED':
                    setTasks(prev => prev.map(t =>
                        t.id === message.taskId
                            ? { ...t, status: message.newStatus, updatedAt: new Date() }
                            : t
                    ));
                    break;
            }
        };

        setWs(socket);
        return () => socket.close();
    };

    const createTask = (newTask: Task) => {
        if (ws) {
            ws.send(JSON.stringify({
                type: 'CREATE_TASK',
                task: newTask,
            }));
        }
    };

    const updateTask = (updatedTask: Task) => {
        if (ws) {
            ws.send(JSON.stringify({
                type: 'UPDATE_TASK',
                task: updatedTask,
            }));
        }
    };

    const moveTask = (taskId: string, newStatus: Status) => {
        if (ws) {
            ws.send(JSON.stringify({
                type: 'MOVE_TASK',
                taskId,
                newStatus,
            }));
        }
    };

    return { tasks, connect, createTask, updateTask, moveTask };
}

// ============================================================================
// 5. Axios with Interceptors
// ============================================================================

export function useTasksWithAxios() {
    const [tasks, setTasks] = useState<Task[]>([]);

    // Example with axios (assuming axios is installed)
    const createTask = async (newTask: Task) => {
        try {
            // const response = await axios.post('/api/tasks', newTask);
            // setTasks(prev => [...prev, response.data]);

            setTasks(prev => [...prev, newTask]);
        } catch (err) {
            console.error('Axios error:', err);
            throw err;
        }
    };

    const updateTask = async (updatedTask: Task) => {
        try {
            // const response = await axios.put(`/api/tasks/${updatedTask.id}`, updatedTask);
            // setTasks(prev => prev.map(t => t.id === response.data.id ? response.data : t));

            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        } catch (err) {
            console.error('Axios error:', err);
            throw err;
        }
    };

    return { tasks, createTask, updateTask };
}

// ============================================================================
// 6. Local Storage Persistence
// ============================================================================

export function useTasksWithLocalStorage() {
    const STORAGE_KEY = 'kanban-tasks';

    const [tasks, setTasks] = useState<Task[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    const saveTasks = (newTasks: Task[]) => {
        setTasks(newTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    };

    const createTask = (newTask: Task) => {
        saveTasks([...tasks, newTask]);
    };

    const updateTask = (updatedTask: Task) => {
        saveTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const deleteTask = (taskId: string) => {
        saveTasks(tasks.filter(t => t.id !== taskId));
    };

    const moveTask = (taskId: string, newStatus: Status) => {
        saveTasks(tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date() } : t
        ));
    };

    return { tasks, createTask, updateTask, deleteTask, moveTask };
}
