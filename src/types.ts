export type Priority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';
export type IssueType = 'task' | 'bug' | 'story' | 'epic';
export type Status = 'todo' | 'in-progress' | 'in-review' | 'done';

export interface Label {
    id: string;
    name: string;
    color: string;
}

export interface Comment {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
}

export interface Task {
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

export interface Column {
    id: Status;
    title: string;
    tasks: Task[];
}
