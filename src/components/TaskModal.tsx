import React, { useState } from 'react';
import type { Task, Priority, IssueType, Status } from '../types';
import {
    X,
    Flag,
    User,
    Calendar,
    Clock,
    Tag,
    MessageSquare,
    Send,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Circle,
    SquareStack,
} from 'lucide-react';
import { availableLabels } from '../mockData';

interface TaskModalProps {
    task: Task;
    onClose: () => void;
    onUpdate: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

const priorityOptions: Priority[] = ['lowest', 'low', 'medium', 'high', 'highest'];
const typeOptions: IssueType[] = ['task', 'bug', 'story', 'epic'];
const statusOptions: Status[] = ['todo', 'in-progress', 'in-review', 'done'];

const priorityColors = {
    highest: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-orange-500 bg-orange-50 border-orange-200',
    medium: 'text-yellow-500 bg-yellow-50 border-yellow-200',
    low: 'text-blue-500 bg-blue-50 border-blue-200',
    lowest: 'text-gray-400 bg-gray-50 border-gray-200',
};

const typeIcons = {
    task: CheckCircle2,
    bug: AlertCircle,
    story: SquareStack,
    epic: Circle,
};

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onUpdate, onDelete }) => {
    const [editedTask, setEditedTask] = useState<Task>(task);
    const [newComment, setNewComment] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdate = (updates: Partial<Task>) => {
        const updated = { ...editedTask, ...updates, updatedAt: new Date() };
        setEditedTask(updated);
        onUpdate(updated);
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const comment = {
            id: `c${Date.now()}`,
            author: 'Current User',
            content: newComment,
            timestamp: new Date(),
        };

        handleUpdate({
            comments: [...editedTask.comments, comment],
        });
        setNewComment('');
    };

    const TypeIcon = typeIcons[editedTask.type];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <TypeIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedTask.title}
                                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                        className="border border-slate-300 rounded px-2 py-1 w-full"
                                        onBlur={() => {
                                            handleUpdate({ title: editedTask.title });
                                            setIsEditing(false);
                                        }}
                                        autoFocus
                                    />
                                ) : (
                                    <span onClick={() => setIsEditing(true)} className="cursor-pointer hover:text-primary-600">
                                        {editedTask.title}
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-slate-500">{editedTask.id.toUpperCase()}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <div className="grid grid-cols-3 gap-6 p-6">
                        {/* Main Content - 2 columns */}
                        <div className="col-span-2 space-y-6">
                            {/* Description */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                    Description
                                </label>
                                <textarea
                                    value={editedTask.description}
                                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                    onBlur={() => handleUpdate({ description: editedTask.description })}
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px] resize-none"
                                    placeholder="Add a description..."
                                />
                            </div>

                            {/* Comments */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <MessageSquare className="w-5 h-5 text-slate-600" />
                                    <h3 className="text-sm font-semibold text-slate-700">
                                        Comments ({editedTask.comments.length})
                                    </h3>
                                </div>

                                {/* Comment List */}
                                <div className="space-y-3 mb-4">
                                    {editedTask.comments.map((comment) => (
                                        <div key={comment.id} className="bg-slate-50 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                    {comment.author.split(' ').map((n) => n[0]).join('')}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {comment.author}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(comment.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700">{comment.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Comment */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                        placeholder="Add a comment..."
                                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - 1 column */}
                        <div className="space-y-4">
                            {/* Status */}
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wide">
                                    Status
                                </label>
                                <select
                                    value={editedTask.status}
                                    onChange={(e) => handleUpdate({ status: e.target.value as Status })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status.replace('-', ' ').toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wide">
                                    Issue Type
                                </label>
                                <select
                                    value={editedTask.type}
                                    onChange={(e) => handleUpdate({ type: e.target.value as IssueType })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    {typeOptions.map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wide flex items-center gap-2">
                                    <Flag className="w-3.5 h-3.5" />
                                    Priority
                                </label>
                                <select
                                    value={editedTask.priority}
                                    onChange={(e) => handleUpdate({ priority: e.target.value as Priority })}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent ${priorityColors[editedTask.priority]}`}
                                >
                                    {priorityOptions.map((priority) => (
                                        <option key={priority} value={priority}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Assignee */}
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wide flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    Assignee
                                </label>
                                <input
                                    type="text"
                                    value={editedTask.assignee || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                                    onBlur={() => handleUpdate({ assignee: editedTask.assignee })}
                                    placeholder="Unassigned"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            {/* Reporter */}
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wide">
                                    Reporter
                                </label>
                                <input
                                    type="text"
                                    value={editedTask.reporter}
                                    onChange={(e) => setEditedTask({ ...editedTask, reporter: e.target.value })}
                                    onBlur={() => handleUpdate({ reporter: editedTask.reporter })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            {/* Time Tracking */}
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wide flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    Time Tracking
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1 block">Spent</label>
                                        <input
                                            type="number"
                                            value={editedTask.timeSpent || 0}
                                            onChange={(e) => handleUpdate({ timeSpent: parseFloat(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            min="0"
                                            step="0.5"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1 block">Estimate</label>
                                        <input
                                            type="number"
                                            value={editedTask.estimate || 0}
                                            onChange={(e) => handleUpdate({ estimate: parseFloat(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            min="0"
                                            step="0.5"
                                        />
                                    </div>
                                </div>
                                {editedTask.estimate && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                                            <span>Progress</span>
                                            <span>{Math.min(100, Math.round(((editedTask.timeSpent || 0) / editedTask.estimate) * 100))}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className="bg-primary-600 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(100, ((editedTask.timeSpent || 0) / editedTask.estimate) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wide flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleUpdate({ dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            {/* Labels */}
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wide flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5" />
                                    Labels
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableLabels.map((label) => {
                                        const isSelected = editedTask.labels.some((l) => l.id === label.id);
                                        return (
                                            <button
                                                key={label.id}
                                                onClick={() => {
                                                    const newLabels = isSelected
                                                        ? editedTask.labels.filter((l) => l.id !== label.id)
                                                        : [...editedTask.labels, label];
                                                    handleUpdate({ labels: newLabels });
                                                }}
                                                className={`${label.color} ${isSelected ? 'opacity-100' : 'opacity-50'
                                                    } text-white text-xs px-3 py-1 rounded-full font-medium hover:opacity-100 transition-opacity`}
                                            >
                                                {label.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this task?')) {
                                        onDelete(task.id);
                                        onClose();
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Created {new Date(editedTask.createdAt).toLocaleDateString()}</span>
                        <span>Updated {new Date(editedTask.updatedAt).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
