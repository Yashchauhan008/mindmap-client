import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    addEdge,
    Background,
    ConnectionMode,
    Controls,
    MiniMap,
    type Node,
    Panel,
    ReactFlowProvider,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type Connection,
    type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMindmapById, updateMindmap } from '../services/api/mindmaps';
import axiosInstance from '../services/http';
import axios from 'axios';
import {
    createNodeDataByType,
    getPreviewData,
    NODE_DEFINITIONS,
    nodeTypes,
    normalizeNodeDataByType,
    renderNodeInspector,
} from '../components/admin/mindmap/nodes/registry';
import type { AnyNode, SupportedNodeType } from '../components/admin/mindmap/nodes/types';
const API_ORIGIN = new URL(import.meta.env.VITE_API_URL || 'http://localhost:3010').origin;

function normalizeFileUrl(url: string) {
    if (!url) return '';
    try {
        const parsed = new URL(url);
        return `${API_ORIGIN}${parsed.pathname}`;
    } catch {
        return url;
    }
}

function areSameIds(prev: string[], next: string[]) {
    if (prev.length !== next.length) return false;
    for (let i = 0; i < prev.length; i += 1) {
        if (prev[i] !== next[i]) return false;
    }
    return true;
}

function FlowEditor({
    title,
    onTitleChange,
    isDarkMode,
    onToggleTheme,
}: {
    title: string;
    onTitleChange: (title: string) => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
}) {
    const { mindmapId } = useParams();
    const reactFlow = useReactFlow();
    const queryClient = useQueryClient();
    const [nodes, setNodes, onNodesChange] = useNodesState<AnyNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
    const [mediaUploadError, setMediaUploadError] = useState('');
    const [showInfoFor, setShowInfoFor] = useState<string | null>(null);

    const defaultEdgeOptions = useMemo(
        () => ({
            animated: true,
            style: { stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '6 6' },
        }),
        [],
    );
    const connectionLineStyle = useMemo(() => ({ stroke: '#ec4899', strokeWidth: 2 }), []);
    const deleteKeyCode = useMemo(() => ['Backspace', 'Delete'], []);
    const selectedNode = useMemo(
        () => nodes.find((node) => node.id === selectedNodeIds[0]) || null,
        [nodes, selectedNodeIds],
    );
    const renderedEdges = useMemo(() => {
        const hiddenStatusNodeIds = new Set(
            nodes
                .filter((node) => node.type === 'statusNode' && (node.data.showConnections as boolean) === false)
                .map((node) => node.id),
        );

        return edges.map((edge) => {
            const shouldHide =
                hiddenStatusNodeIds.has(edge.source) || hiddenStatusNodeIds.has(edge.target);
            if (!shouldHide) return edge;

            return {
                ...edge,
                style: {
                    ...(edge.style || {}),
                    opacity: 0,
                    strokeOpacity: 0,
                    strokeWidth: 0,
                },
                animated: false,
                interactionWidth: 0,
            };
        });
    }, [edges, nodes]);

    const { data, isLoading } = useQuery({
        queryKey: ['mindmap', mindmapId],
        queryFn: () => getMindmapById(mindmapId || ''),
        enabled: Boolean(mindmapId),
    });

    const saveMutation = useMutation({
        mutationFn: updateMindmap,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mindmaps'] });
            queryClient.invalidateQueries({ queryKey: ['mindmap', mindmapId] });
            setIsDirty(false);
        },
    });

    const uploadImageMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data: response } = await axiosInstance.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response as { data?: { url?: string }; url?: string };
        },
    });

    useEffect(() => {
        if (!data) return;
        const normalizedNodes: AnyNode[] = ((data.nodes as Node[]) || []).map((node, index) => {
            const nodeTypeRaw = String(node.type || 'ideaNode');
            const safeType = (nodeTypeRaw === 'mindNode' ? 'ideaNode' : nodeTypeRaw) as SupportedNodeType;
            const normalizedData = normalizeNodeDataByType(
                safeType,
                (node.data || {}) as Record<string, unknown>,
                index,
            );
            const mediaUrl =
                typeof normalizedData.mediaUrl === 'string'
                    ? normalizeFileUrl(normalizedData.mediaUrl)
                    : '';

            return {
                ...node,
                type: safeType,
                data: {
                    ...normalizedData,
                    mediaUrl,
                },
            } as AnyNode;
        });

        setNodes(normalizedNodes);
        setEdges(data.edges || []);
        onTitleChange(data.title || 'Untitled mind map');

        if (data.viewport?.x !== undefined && data.viewport?.y !== undefined && data.viewport?.zoom) {
            reactFlow.setViewport({
                x: data.viewport.x,
                y: data.viewport.y,
                zoom: data.viewport.zoom,
            });
        }
    }, [data, setNodes, setEdges, onTitleChange, reactFlow]);

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((currentEdges) => addEdge(connection, currentEdges));
            setIsDirty(true);
        },
        [setEdges],
    );

    const updateNodeData = useCallback(
        (nodeId: string, patch: Record<string, unknown>) => {
            setNodes((currentNodes) =>
                currentNodes.map((node) =>
                    node.id === nodeId
                        ? {
                              ...node,
                              data: {
                                  ...node.data,
                                  ...patch,
                              },
                          }
                        : node,
                ),
            );
            setIsDirty(true);
        },
        [setNodes],
    );

    const onSelectionChange = useCallback(
        ({ nodes: selectedNodes = [], edges: selectedEdges = [] }: { nodes?: Node[]; edges?: Edge[] }) => {
            const nextNodeIds = selectedNodes.map((node) => node.id);
            const nextEdgeIds = selectedEdges.map((edge) => edge.id);

            setSelectedNodeIds((prev) => (areSameIds(prev, nextNodeIds) ? prev : nextNodeIds));
            setSelectedEdgeIds((prev) => (areSameIds(prev, nextEdgeIds) ? prev : nextEdgeIds));
        },
        [],
    );

    const createNodeByType = useCallback(
        (type: SupportedNodeType, count: number): AnyNode => {
            const common = {
                id: crypto.randomUUID(),
                position: { x: 100 + (count % 5) * 110, y: 100 + Math.floor(count / 5) * 90 },
            };

            return {
                ...common,
                type,
                data: createNodeDataByType(type, count),
            };
        },
        [],
    );

    const handleQuickAdd = (type: SupportedNodeType) => {
        const newNode: AnyNode = createNodeByType(type, nodes.length);
        setNodes((currentNodes) => [...currentNodes, newNode]);
        setIsDirty(true);
    };

    const handleAutoLayout = () => {
        setNodes((currentNodes) =>
            currentNodes.map((node, index) => ({
                ...node,
                position: {
                    x: 100 + (index % 3) * 260,
                    y: 120 + Math.floor(index / 3) * 150,
                },
            })),
        );
        setIsDirty(true);
    };

    const handleSave = useCallback(() => {
        if (!mindmapId) return;
        const viewport = reactFlow.getViewport();
        saveMutation.mutate({
            mindmapId,
            title,
            nodes,
            edges,
            viewport,
        });
    }, [mindmapId, reactFlow, saveMutation, title, nodes, edges]);

    useEffect(() => {
        if (!isDirty) return;

        const timer = setTimeout(() => {
            handleSave();
        }, 1500); // 1.5 seconds debounce

        return () => clearTimeout(timer);
    }, [isDirty, handleSave]);

    const handleDeleteSelected = () => {
        if (selectedEdgeIds.length > 0) {
            setEdges((currentEdges) =>
                currentEdges.filter((edge) => !selectedEdgeIds.includes(edge.id)),
            );
        }

        if (selectedNodeIds.length > 0) {
            setNodes((currentNodes) =>
                currentNodes.filter((node) => !selectedNodeIds.includes(node.id)),
            );
            setEdges((currentEdges) =>
                currentEdges.filter(
                    (edge) =>
                        !selectedNodeIds.includes(edge.source) &&
                        !selectedNodeIds.includes(edge.target),
                ),
            );
        }

        if (selectedEdgeIds.length || selectedNodeIds.length) {
            setIsDirty(true);
            setSelectedEdgeIds([]);
            setSelectedNodeIds([]);
        }
    };

    const handleDuplicateSelectedNode = useCallback(() => {
        if (selectedNodeIds.length !== 1) return;

        const sourceNode = nodes.find((node) => node.id === selectedNodeIds[0]);
        if (!sourceNode) return;

        const duplicatedNode: AnyNode = {
            ...sourceNode,
            id: crypto.randomUUID(),
            position: {
                x: sourceNode.position.x + 40,
                y: sourceNode.position.y + 40,
            },
            // Clone node data so future edits don't accidentally share references.
            data:
                typeof structuredClone === 'function'
                    ? structuredClone(sourceNode.data)
                    : JSON.parse(JSON.stringify(sourceNode.data)),
            selected: true,
        };

        setNodes((currentNodes) => [
            ...currentNodes.map((node) => ({ ...node, selected: false })),
            duplicatedNode,
        ]);
        setSelectedNodeIds([duplicatedNode.id]);
        setSelectedEdgeIds([]);
        setIsDirty(true);
    }, [nodes, selectedNodeIds, setNodes]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isDuplicateShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd';
            if (!isDuplicateShortcut) return;

            event.preventDefault();
            handleDuplicateSelectedNode();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDuplicateSelectedNode]);

    if (isLoading) return <p>Loading editor...</p>;

    return (
        <div className="editor-layout">
            <div className="editor-toolbar">
                <input
                    value={title}
                    onChange={(e) => {
                        onTitleChange(e.target.value);
                        setIsDirty(true);
                    }}
                />
                <div className="row">
                    <button type="button" className='whitespace-nowrap' onClick={onToggleTheme}>
                        {isDarkMode ? 'Light mode' : 'Dark mode'}
                    </button>
                    <button className='whitespace-nowrap' onClick={handleSave} disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
                    </button>
                    <Link to="/mindmaps" className="button-link whitespace-nowrap">
                        Back
                    </Link>
                </div>
            </div>
            <div className="editor-content">
                <aside className="node-side-panel">
                    <h3>Custom Nodes</h3>
                    <p>Click a node item to add it to the canvas.</p>
                    <div className="quick-node-grid">
                        {NODE_DEFINITIONS.map((def) => {
                            const PreviewCard = def.Card;
                            return (
                                <button
                                    key={def.type}
                                    className="node-preview-button"
                                    onClick={() => handleQuickAdd(def.type)}
                                    title={`Add ${def.label}`}
                                >
                                    <div className="node-preview-wrapper">
                                        <PreviewCard
                                            id={`preview-${def.type}`}
                                            data={getPreviewData(def.type)}
                                            selected={false}
                                            type={def.type}
                                            zIndex={0}
                                            isConnectable={false}
                                            xPos={0}
                                            yPos={0}
                                            dragging={false}
                                            {...({} as any)}
                                        />
                                    </div>
                                    <div className="node-preview-footer">
                                        <span className="node-preview-label">{def.label}</span>
                                        <button
                                            type="button"
                                            className="info-trigger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowInfoFor(showInfoFor === def.type ? null : def.type);
                                            }}
                                            title="View Node Logic"
                                        >
                                            i
                                        </button>
                                    </div>

                                </button>
                            );
                        })}
                    </div>
                </aside>

                {showInfoFor && (() => {
                    const def = NODE_DEFINITIONS.find(d => d.type === showInfoFor);
                    if (!def) return null;
                    return (
                        <div className="node-info-floating-panel" onClick={(e) => e.stopPropagation()}>
                            <div className="info-header">
                                <h3>{def.label} Logic</h3>
                                <button className="close-btn" onClick={() => setShowInfoFor(null)}>&times;</button>
                            </div>
                            <div className="info-body">
                                <div className="info-section">
                                    <label>Inputs</label>
                                    <p>{def.info?.inputs || 'N/A'}</p>
                                </div>
                                <div className="info-section">
                                    <label>Outputs</label>
                                    <p>{def.info?.outputs || 'N/A'}</p>
                                </div>
                                <div className="info-section">
                                    <label>Data Pass-through</label>
                                    <p>{def.info?.passThrough || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="info-footer">
                                <p>This node is used for {def.label.toLowerCase()} purposes in your mind map.</p>
                            </div>
                        </div>
                    );
                })()}

                <div className="editor-canvas">
                    <ReactFlow
                    nodes={nodes}
                    edges={renderedEdges}
                    nodeTypes={nodeTypes}
                    onNodesChange={(changes) => {
                        onNodesChange(changes);
                        setIsDirty(true);
                    }}
                    onEdgesChange={(changes) => {
                        onEdgesChange(changes);
                        setIsDirty(true);
                    }}
                    onConnect={onConnect}
                    onEdgeDoubleClick={(_, edge) => {
                        setEdges((currentEdges) =>
                            currentEdges.filter((currentEdge) => currentEdge.id !== edge.id),
                        );
                        setIsDirty(true);
                    }}
                    onEdgesDelete={() => {
                        setIsDirty(true);
                    }}
                    onNodesDelete={() => {
                        setIsDirty(true);
                    }}
                    onSelectionChange={onSelectionChange}
                    connectionMode={ConnectionMode.Loose}
                    deleteKeyCode={deleteKeyCode}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionLineStyle={connectionLineStyle}
                    >
                        <Panel position="top-left">
                            <div className="flow-hint">Tip: use the left panel to add custom nodes</div>
                        </Panel>
                        <MiniMap pannable zoomable />
                        <Controls />
                        <Background gap={20} size={1.2} color="#d7d8e1" />
                    </ReactFlow>

                    <div className="floating-actions">
                        <button className="ghost" onClick={handleAutoLayout}>
                            Auto Layout
                        </button>
                        <button
                            className="ghost"
                            onClick={handleDuplicateSelectedNode}
                            disabled={selectedNodeIds.length !== 1}
                        >
                            Duplicate Selected
                        </button>
                        <button
                            className="danger"
                            onClick={handleDeleteSelected}
                            disabled={!selectedNodeIds.length && !selectedEdgeIds.length}
                        >
                            Delete Selected
                        </button>
                    </div>

                    {selectedNode ? (
                        <div className="floating-node-editor">
                            {renderNodeInspector(selectedNode.type as SupportedNodeType, {
                                node: selectedNode,
                                updateNodeData,
                                mediaUploadPending: uploadImageMutation.isPending,
                                mediaUploadError,
                                uploadMedia: async (nodeId, file) => {
                                    try {
                                        setMediaUploadError('');
                                        const response = await uploadImageMutation.mutateAsync(file);
                                        const uploadedUrl = normalizeFileUrl(
                                            response?.data?.url || response?.url || '',
                                        );
                                        if (!uploadedUrl) return;

                                        updateNodeData(nodeId, {
                                            mediaUrl: uploadedUrl,
                                            mediaType: file.type.startsWith('video/') ? 'video' : 'image',
                                            videoMuted: true,
                                            videoPaused: false,
                                        });
                                    } catch (error) {
                                        if (axios.isAxiosError(error)) {
                                            const message =
                                                (error.response?.data as { message?: string })?.message ||
                                                'Upload failed. Ensure media is under 100MB.';
                                            setMediaUploadError(message);
                                        } else {
                                            setMediaUploadError('Upload failed. Try again.');
                                        }
                                    }
                                },
                            })}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default function MindmapEditorPage({
    isDarkMode,
    onToggleTheme,
}: {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}) {
    const [title, setTitle] = useState('Untitled mind map');

    return (
        <div className="page editor-page">
            <ReactFlowProvider>
                <FlowEditor
                    title={title}
                    onTitleChange={setTitle}
                    isDarkMode={isDarkMode}
                    onToggleTheme={onToggleTheme}
                />
            </ReactFlowProvider>
        </div>
    );
}
