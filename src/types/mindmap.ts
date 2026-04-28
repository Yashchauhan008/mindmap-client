import type { Edge, Node, Viewport } from '@xyflow/react';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
}

export interface MindmapSummary {
    id: string;
    title: string;
    created_at: string;
    updated_at: string | null;
}

export interface Mindmap {
    id: string;
    user_id: string;
    title: string;
    nodes: Node[];
    edges: Edge[];
    viewport: Partial<Viewport>;
    created_at: string;
    updated_at: string | null;
}
