import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task, Status } from '../types';
import { TaskCard } from './TaskCard';
import { Plus, MoreHorizontal } from 'lucide-react';

interface ColumnProps {
    id: Status;
    title: string;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onAddTask: (status: Status) => void;
}

const statusColors = {
    'todo': 'bg-slate-500',
    'in-progress': 'bg-blue-500',
    'in-review': 'bg-yellow-500',
    'done': 'bg-green-500',
};

export const Column: React.FC<ColumnProps> = ({
    id,
    title,
    tasks,
    onTaskClick,
    onAddTask,
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
    });

    return (
        <div className="flex flex-col h-full bg-slate-100 rounded-xl p-4 min-w-[320px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[id]}`}></div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        {title}
                    </h2>
                    <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <button
                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                    onClick={() => { }}
                >
                    <MoreHorizontal className="w-4 h-4 text-slate-600" />
                </button>
            </div>

            {/* Tasks Container */}
            <div
                ref={setNodeRef}
                className={`
          flex-1 overflow-y-auto scrollbar-thin pr-1
          ${isOver ? 'bg-primary-50 rounded-lg' : ''}
          transition-colors duration-200
        `}
            >
                <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                        No tasks
                    </div>
                )}
            </div>

            {/* Add Task Button */}
            <button
                onClick={() => onAddTask(id)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-all hover:text-slate-800 border-2 border-dashed border-slate-300 hover:border-slate-400"
            >
                <Plus className="w-4 h-4" />
                Add Task
            </button>
        </div>
    );
};
