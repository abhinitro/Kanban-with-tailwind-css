import React, { useState } from 'react';
import type { Task, Priority, IssueType, Status, Label } from '../types';
import { X, Plus } from 'lucide-react';
import { availableLabels } from '../mockData';

interface AddTaskModalProps {
    status: Status;
    onClose: () => void;
    onAdd: (task: Task) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ status, onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [type, setType] = useState<IssueType>('task');
    const [assignee, setAssignee] = useState('');
    const [estimate, setEstimate] = useState<number>(0);
    const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Title is required');
            return;
        }

        const newTask: Task = {
            id: `task-${Date.now()}`,
            title: title.trim(),
            description: description.trim(),
            status,
            priority,
            type,
            assignee: assignee.trim() || undefined,
            reporter: 'Current User',
            labels: selectedLabels,
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            estimate: estimate > 0 ? estimate : undefined,
            timeSpent: 0,
        };

        onAdd(newTask);
        onClose();
    };

    const toggleLabel = (label: Label) => {
        setSelectedLabels((prev) =>
            prev.some((l) => l.id === label.id)
                ? prev.filter((l) => l.id !== label.id)
                : [...prev, label]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Create New Task</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin">
                    {/* Title */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title..."
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            autoFocus
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description..."
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Type and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                Type
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as IssueType)}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="task">Task</option>
                                <option value="bug">Bug</option>
                                <option value="story">Story</option>
                                <option value="epic">Epic</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="lowest">Lowest</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="highest">Highest</option>
                            </select>
                        </div>
                    </div>

                    {/* Assignee and Estimate */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                Assignee
                            </label>
                            <input
                                type="text"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                placeholder="Unassigned"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                Estimate (hours)
                            </label>
                            <input
                                type="number"
                                value={estimate}
                                onChange={(e) => setEstimate(parseFloat(e.target.value))}
                                min="0"
                                step="0.5"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Labels */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Labels
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableLabels.map((label) => {
                                const isSelected = selectedLabels.some((l) => l.id === label.id);
                                return (
                                    <button
                                        key={label.id}
                                        type="button"
                                        onClick={() => toggleLabel(label)}
                                        className={`${label.color} ${isSelected ? 'opacity-100 ring-2 ring-offset-2 ring-primary-500' : 'opacity-50'
                                            } text-white text-xs px-3 py-1.5 rounded-full font-medium hover:opacity-100 transition-all`}
                                    >
                                        {label.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Task
                    </button>
                </div>
            </div>
        </div>
    );
};
