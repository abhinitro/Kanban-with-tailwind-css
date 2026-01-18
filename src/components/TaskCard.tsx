import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import {
    AlertCircle,
    CheckCircle2,
    Circle,
    SquareStack,
    Calendar,
    Clock,

    MessageSquare,
    MoreVertical,
    Flag,
} from 'lucide-react';

interface TaskCardProps {
    task: Task;
    onTaskClick: (task: Task) => void;
}

const priorityConfig = {
    highest: { icon: Flag, color: 'text-red-600', bg: 'bg-red-50' },
    high: { icon: Flag, color: 'text-orange-500', bg: 'bg-orange-50' },
    medium: { icon: Flag, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    low: { icon: Flag, color: 'text-blue-500', bg: 'bg-blue-50' },
    lowest: { icon: Flag, color: 'text-gray-400', bg: 'bg-gray-50' },
};

const typeConfig = {
    task: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' },
    bug: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    story: { icon: SquareStack, color: 'text-green-600', bg: 'bg-green-100' },
    epic: { icon: Circle, color: 'text-purple-600', bg: 'bg-purple-100' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const TypeIcon = typeConfig[task.type].icon;
    const PriorityIcon = priorityConfig[task.priority].icon;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onTaskClick(task)}
            className={`
        bg-white rounded-lg border border-slate-200 p-4 mb-3 cursor-pointer
        transition-all duration-200 hover:shadow-lg hover:border-primary-400
        ${isDragging ? 'opacity-50 shadow-2xl scale-105' : 'opacity-100'}
        group
      `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${typeConfig[task.type].bg}`}>
                        <TypeIcon className={`w-3.5 h-3.5 ${typeConfig[task.type].color}`} />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{task.id.toUpperCase()}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                >
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-800 mb-2 line-clamp-2 leading-snug">
                {task.title}
            </h3>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Labels */}
            {task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {task.labels.map((label) => (
                        <span
                            key={label.id}
                            className={`${label.color} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
                        >
                            {label.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    {/* Priority */}
                    <div className={`flex items-center gap-1 ${priorityConfig[task.priority].bg} px-2 py-1 rounded`}>
                        <PriorityIcon className={`w-3 h-3 ${priorityConfig[task.priority].color}`} />
                        <span className={`text-xs font-medium ${priorityConfig[task.priority].color}`}>
                            {task.priority}
                        </span>
                    </div>

                    {/* Comments */}
                    {task.comments.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-500">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="text-xs">{task.comments.length}</span>
                        </div>
                    )}

                    {/* Time tracking */}
                    {task.estimate && (
                        <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">
                                {task.timeSpent || 0}/{task.estimate}h
                            </span>
                        </div>
                    )}
                </div>

                {/* Assignee */}
                {task.assignee && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                            {task.assignee.split(' ').map((n) => n[0]).join('')}
                        </div>
                    </div>
                )}
            </div>

            {/* Due date if present */}
            {task.dueDate && (
                <div className={`flex items-center gap-1.5 mt-2 text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-slate-500'
                    }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    );
};
