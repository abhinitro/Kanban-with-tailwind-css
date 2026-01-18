import React, { useState, useMemo } from 'react';
import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { Task, Status, Priority, IssueType } from '../types';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { AddTaskModal } from './AddTaskModal';
import {
    Search,
    Filter,
    LayoutGrid,
    List,
    Plus,
    Settings,
    Bell,
} from 'lucide-react';

const columns: { id: Status; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'in-review', title: 'In Review' },
    { id: 'done', title: 'Done' },
];

type ViewMode = 'board' | 'list';

export interface KanbanBoardProps {
    // Required props
    tasks: Task[];

    // Callbacks for CRUD operations
    onTaskCreate?: (task: Task) => void | Promise<void>;
    onTaskUpdate?: (task: Task) => void | Promise<void>;
    onTaskDelete?: (taskId: string) => void | Promise<void>;
    onTaskMove?: (taskId: string, newStatus: Status, oldStatus: Status) => void | Promise<void>;

    // Optional customization
    columns?: { id: Status; title: string }[];
    enableSearch?: boolean;
    enableFilters?: boolean;
    enableViewToggle?: boolean;
    enableCreateTask?: boolean;
    style?: {
        boardTitle?: string;
        boardSubtitle?: string;
        showHeader?: boolean;
        showStats?: boolean;
    };

    // Advanced customization
    renderTaskCard?: (task: Task, defaultCard: React.ReactNode) => React.ReactNode;
    renderHeader?: (defaultHeader: React.ReactNode) => React.ReactNode;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    tasks,
    onTaskCreate,
    onTaskUpdate,
    onTaskDelete,
    onTaskMove,
    columns: customColumns,
    enableSearch = true,
    enableFilters = true,
    enableViewToggle = true,
    enableCreateTask = true,
    style = {},
    renderTaskCard,
    renderHeader,
}) => {
    const {
        boardTitle = 'Kanban Board',
        boardSubtitle = 'Project Management Dashboard',
        showHeader = true,
        showStats = true,
    } = style;

    const boardColumns = customColumns || columns;

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [addTaskStatus, setAddTaskStatus] = useState<Status>('todo');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
    const [filterType, setFilterType] = useState<IssueType | 'all'>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('board');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Get unique assignees for filter
    const assignees = useMemo(() => {
        const unique = new Set(tasks.map((t) => t.assignee).filter(Boolean));
        return Array.from(unique) as string[];
    }, [tasks]);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                !enableSearch ||
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesPriority = !enableFilters || filterPriority === 'all' || task.priority === filterPriority;
            const matchesType = !enableFilters || filterType === 'all' || task.type === filterType;
            const matchesAssignee =
                !enableFilters ||
                filterAssignee === 'all' ||
                (filterAssignee === 'unassigned' && !task.assignee) ||
                task.assignee === filterAssignee;

            return matchesSearch && matchesPriority && matchesType && matchesAssignee;
        });
    }, [tasks, searchQuery, filterPriority, filterType, filterAssignee, enableSearch, enableFilters]);

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        const grouped: Record<Status, Task[]> = {
            'todo': [],
            'in-progress': [],
            'in-review': [],
            'done': [],
        };

        filteredTasks.forEach((task) => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            }
        });

        return grouped;
    }, [filteredTasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find((t) => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        // Determine the new status
        // If dropped on a column, over.id will be the status
        // If dropped on a task, we need to find which column that task is in
        let newStatus: Status;

        // Check if over.id is a valid status (column)
        const validStatuses: Status[] = ['todo', 'in-progress', 'in-review', 'done'];
        if (validStatuses.includes(over.id as Status)) {
            newStatus = over.id as Status;
        } else {
            // Dropped on a task - find the task's column
            const droppedOnTask = tasks.find((t) => t.id === over.id);
            if (!droppedOnTask) return;
            newStatus = droppedOnTask.status;
        }

        // Don't do anything if dropped in same column
        if (task.status === newStatus) return;

        const oldStatus = task.status;

        // Call the callback if provided
        if (onTaskMove) {
            try {
                await onTaskMove(taskId, newStatus, oldStatus);
            } catch (error) {
                console.error('Error moving task:', error);
                // Task will remain in original position since parent controls the data
            }
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
    };

    const handleTaskUpdate = async (updatedTask: Task) => {
        if (onTaskUpdate) {
            try {
                await onTaskUpdate(updatedTask);
                setSelectedTask(updatedTask);
            } catch (error) {
                console.error('Error updating task:', error);
            }
        } else {
            setSelectedTask(updatedTask);
        }
    };

    const handleTaskDelete = async (taskId: string) => {
        if (onTaskDelete) {
            try {
                await onTaskDelete(taskId);
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    const handleAddTask = (status: Status) => {
        setAddTaskStatus(status);
        setIsAddTaskModalOpen(true);
    };

    const handleTaskAdded = async (newTask: Task) => {
        if (onTaskCreate) {
            try {
                await onTaskCreate(newTask);
            } catch (error) {
                console.error('Error creating task:', error);
            }
        }
    };

    const activeFiltersCount = [
        filterPriority !== 'all',
        filterType !== 'all',
        filterAssignee !== 'all',
    ].filter(Boolean).length;

    const headerContent = (
        <>
            {showHeader && (
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                    <div className="max-w-[1800px] mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Left Section */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                                        <LayoutGrid className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900">{boardTitle}</h1>
                                        <p className="text-sm text-slate-500">{boardSubtitle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center gap-3">
                                {/* View Mode Toggle */}
                                {enableViewToggle && (
                                    <div className="flex bg-slate-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('board')}
                                            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${viewMode === 'board'
                                                ? 'bg-white text-primary-600 shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            <LayoutGrid className="w-4 h-4" />
                                            <span className="text-sm font-medium">Board</span>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${viewMode === 'list'
                                                ? 'bg-white text-primary-600 shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            <List className="w-4 h-4" />
                                            <span className="text-sm font-medium">List</span>
                                        </button>
                                    </div>
                                )}

                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
                                    <Bell className="w-5 h-5 text-slate-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <Settings className="w-5 h-5 text-slate-600" />
                                </button>

                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:shadow-lg transition-shadow">
                                    CU
                                </div>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        {(enableSearch || enableFilters) && (
                            <div className="mt-4 flex items-center gap-3">
                                {/* Search */}
                                {enableSearch && (
                                    <div className="flex-1 max-w-md relative">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search tasks..."
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                        />
                                    </div>
                                )}

                                {/* Filters */}
                                {enableFilters && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-slate-600">
                                            <Filter className="w-4 h-4" />
                                            <span className="text-sm font-medium">Filters:</span>
                                            {activeFiltersCount > 0 && (
                                                <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                    {activeFiltersCount}
                                                </span>
                                            )}
                                        </div>

                                        <select
                                            value={filterPriority}
                                            onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                        >
                                            <option value="all">All Priorities</option>
                                            <option value="highest">Highest</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                            <option value="lowest">Lowest</option>
                                        </select>

                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value as IssueType | 'all')}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="task">Task</option>
                                            <option value="bug">Bug</option>
                                            <option value="story">Story</option>
                                            <option value="epic">Epic</option>
                                        </select>

                                        <select
                                            value={filterAssignee}
                                            onChange={(e) => setFilterAssignee(e.target.value)}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                        >
                                            <option value="all">All Assignees</option>
                                            <option value="unassigned">Unassigned</option>
                                            {assignees.map((assignee) => (
                                                <option key={assignee} value={assignee}>
                                                    {assignee}
                                                </option>
                                            ))}
                                        </select>

                                        {activeFiltersCount > 0 && (
                                            <button
                                                onClick={() => {
                                                    setFilterPriority('all');
                                                    setFilterType('all');
                                                    setFilterAssignee('all');
                                                }}
                                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                )}

                                {enableCreateTask && (
                                    <button
                                        onClick={() => handleAddTask('todo')}
                                        className="ml-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Task
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Stats */}
                        {showStats && (
                            <div className="mt-4 flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600">Total:</span>
                                    <span className="font-semibold text-slate-900">{filteredTasks.length}</span>
                                </div>
                                {boardColumns.map((col) => (
                                    <div key={col.id} className="flex items-center gap-2">
                                        <span className="text-slate-600">{col.title}:</span>
                                        <span className="font-semibold text-slate-900">
                                            {tasksByStatus[col.id]?.length || 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </header>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Header */}
            {renderHeader ? renderHeader(headerContent) : headerContent}

            {/* Board Content */}
            <main className="max-w-[1800px] mx-auto px-6 py-6">
                {viewMode === 'board' ? (
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                            {boardColumns.map((column) => (
                                <Column
                                    key={column.id}
                                    id={column.id}
                                    title={column.title}
                                    tasks={tasksByStatus[column.id] || []}
                                    onTaskClick={handleTaskClick}
                                    onAddTask={handleAddTask}
                                />
                            ))}
                        </div>

                        <DragOverlay>
                            {activeTask && (
                                <div className="rotate-3 scale-105">
                                    <TaskCard task={activeTask} onTaskClick={() => { }} />
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Task
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Assignee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredTasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-500">{task.id.toUpperCase()}</span>
                                                <span className="text-sm font-medium text-slate-900">{task.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {task.status.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-700 capitalize">{task.priority}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-700 capitalize">{task.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-700">{task.assignee || 'Unassigned'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-700">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Modals */}
            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                />
            )}

            {isAddTaskModalOpen && enableCreateTask && (
                <AddTaskModal
                    status={addTaskStatus}
                    onClose={() => setIsAddTaskModalOpen(false)}
                    onAdd={handleTaskAdded}
                />
            )}
        </div>
    );
};
