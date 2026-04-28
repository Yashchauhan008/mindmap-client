import type { Edge, Node, Viewport } from '@xyflow/react';
import axiosInstance from '../http';
import type { Mindmap, MindmapSummary } from '../../types/mindmap';

interface ListResponse {
    data: MindmapSummary[];
    meta: {
        offset: number;
        limit: number;
        total: number;
    };
}

export const getMindmaps = async (search = '') => {
    const { data } = await axiosInstance.get<ListResponse>('/mindmaps', {
        params: { search, offset: 0, limit: 100 },
    });
    return data;
};

export const createMindmap = async (title: string) => {
    const { data } = await axiosInstance.post<{ data: Mindmap }>('/mindmaps', {
        title,
        nodes: [],
        edges: [],
        viewport: {},
    });
    return data.data;
};

export const getMindmapById = async (mindmapId: string) => {
    const { data } = await axiosInstance.get<{ data: Mindmap }>(`/mindmaps/${mindmapId}`);
    return data.data;
};

export const updateMindmap = async ({
    mindmapId,
    title,
    nodes,
    edges,
    viewport,
}: {
    mindmapId: string;
    title?: string;
    nodes?: Node[];
    edges?: Edge[];
    viewport?: Partial<Viewport>;
}) => {
    const { data } = await axiosInstance.patch<{ data: Mindmap }>(`/mindmaps/${mindmapId}`, {
        title,
        nodes,
        edges,
        viewport,
    });
    return data.data;
};

export const deleteMindmap = async (mindmapId: string) => {
    await axiosInstance.delete(`/mindmaps/${mindmapId}`);
};
